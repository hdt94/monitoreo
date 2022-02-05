import io
import re
import subprocess

import os

from os import defpath, path
from os.path import basename
from typing import Dict
from typing import Iterable
from typing import List
from typing import Tuple
from typing import TypeVar

import apache_beam as beam
from apache_beam import typehints
from apache_beam.io import fileio
from apache_beam.io.filesystems import FileSystems

from obspy import read as obspy_read, Stream as ObspyStream


K = TypeVar('K')
V = TypeVar('V')
T = TypeVar('T')


_UNITS_TRUE_WEIGHT = {'V': 1, 'mV': 1e-3, 'uV': 1e-6, 'nV': 1e-9}


def _adjust_true_weight_value(true_weight, true_weight_unit):
    assert true_weight_unit in _UNITS_TRUE_WEIGHT, f'Unknown true_weight_unit "{true_weight_unit}"'

    unit_factor = _UNITS_TRUE_WEIGHT[true_weight_unit]
    true_weight = float(true_weight) * unit_factor

    return true_weight


def _match_config_file_in_dir(element):
    [key, dir_path] = element
    matches = _match_files_in_dir(dir_path, 'ID*.rtl')

    if len(matches) == 0:
        return [key, None]
    if len(matches) > 1:
        pass

    config_path = matches[0].path

    return [key, config_path]


def _match_files_in_dir(dir_path, glob_pattern='*'):
    pattern = FileSystems.join(dir_path, glob_pattern)
    matches = FileSystems.match([pattern])[0].metadata_list

    return matches


def reftek_obspy_stream_to_response_dict(element):
    st = element['data']
    data = {int(tr.stats.reftek130.channel_number): tr.data.tolist() for tr in st}

    return {**element, 'data': data}


class ConvertPasscalWithMSeedUtilFn(beam.DoFn):
    """Convert each REF TEK PASSCAL file into many miniSEED files (one per sensing channel) using binary utility.

    Resulting miniSEED files are written to a directory in same source file system as PASSCAL file.

    Init parameters:
        utility_path: file path of binary utility; compatible with pas2msd.
        worker_dir_path: custom directory path in worker for file conversion; thought for using DirectRunner or InteractiveRunner with no super user privilegies.

    Processing of elements:
        Input element: FileMetadata
        Output element: (file_source_path, output_dir_path)
    """

    OUTPUT_SUFFIX = '-out'

    def __init__(self, utility_path, worker_dir_path='/reftekio-conversion-to-mseed/'):
        self.utility_path = utility_path
        self.worker_dir_path = worker_dir_path

    def setup(self):
        if not FileSystems.exists(self.worker_dir_path):
            FileSystems.mkdirs(self.worker_dir_path)

        self.worker_utility_path = FileSystems.join(
            self.worker_dir_path, basename(self.utility_path))
        FileSystems.copy([self.utility_path], [self.worker_utility_path])

    # conversion folder per bundle
    # Question: bundle ends after pipeline ends? or ends after DoFn has processed all elements?
    # Question: is there any way to get an id per bundle?

    def process(self, file_metadata):
        file_source_path = file_metadata.path
        file_local_path = FileSystems.join(
            self.worker_dir_path, basename(file_source_path))
        output_local_path = f'{file_local_path}{self.OUTPUT_SUFFIX}'
        output_source_path = f'{file_source_path}{self.OUTPUT_SUFFIX}'

        # Copy file to local directory in worker
        FileSystems.copy([file_source_path], [file_local_path])

        # Create local output directory for miniseed files
        FileSystems.mkdirs(output_local_path)

        # Execute utility locally in worker
        result = subprocess.run(
            [self.worker_utility_path, '-NI -VN', file_local_path, output_local_path])
        result.check_returncode()

        # Copy output directory in worker to a folder in source
        FileSystems.mkdirs(output_source_path)
        FileSystems.copy([output_local_path], [output_source_path])

        # Clean local worker filesystem
        FileSystems.delete([file_local_path, output_local_path])

        yield [file_source_path, output_source_path]

    def teardown(self):
        FileSystems.delete([self.worker_dir_path])


class PreProcessChannels(beam.PTransform):
    """Pre-process channels dictionaries into Obspy Stream data structure.

    Data is linearly adjusted with factors TrueWeight and SensorVPU.

    Data is not processed with detrend() or any similar.
            st.detrend(type='constant')

    Input element: apache_beam.io.filesystem.FileMetadata
    Output element: (apache_beam.io.filesystem.FileMetadata, stream, info?)
    """

    def expand(self, channels):
        merged_data = (
            channels
            | beam.Map(self._adjust_data)
            | beam.Map(self._merge_data_into_obspy_stream)
            | beam.Map(self._append_metadata)
        )

        return merged_data

    @staticmethod
    def _adjust_data(element):
        def adjust_channel(channel):
            channel_id = channel["channel_id"]
            st = channel['data'].copy()
            factor = channel['true_weight'] / channel['sensor_vpu']

            for trace in st:
                trace.data = trace.data * factor

            return {'channel_id': channel_id, 'data': st}

        channels = element['channels']
        adjusted_channels = [adjust_channel(ch)
                             for ch in channels]

        return {**element, 'channels': adjusted_channels}

    @staticmethod
    def _append_metadata(element):
        data_st = element["data"]

        if 'path' in element:
            message = f"Unexpected multiple stats sets: \"{element['path']}\""
        else:
            message = ''

        stats = set([(tr.stats.sampling_rate, str(tr.stats.endtime), str(tr.stats.starttime))
                    for tr in data_st])
        assert len(stats) == 1, message

        # metadata_tuple = stats.pop()
        (sampling_rate, time_end, time_start) = stats.pop()

        metadata = element['metadata'] if 'metadata' in element else {}

        return {
            **element,
            'metadata': {
                **metadata,
                'sampling_rate': sampling_rate,
                'time_end': time_end,
                'time_start': time_start
                # 'sampling_rate': metadata_tuple[0],
                # 'time_end': metadata_tuple[1],
                # 'time_start': metadata_tuple[2]
            }
        }
        # return [key, data_st, metadata_dict]

    @staticmethod
    def _merge_data_into_obspy_stream(element):
        def get_single_trace(channel):
            channel_id = channel['channel_id']
            st = channel['data']

            message = f'Unexpected st with multiple tr for {channel_id}'
            assert len(st) == 1, message

            tr = st[0]
            return tr

        channels = element['channels']

        # Asume single trace per data obspy stream
        traces = [get_single_trace(ch) for ch in channels]
        st = ObspyStream(traces=traces)

        others = {x: element[x] for x in element if x != "channels"}
        return {**others, "data": st}


class ReadAdjustmentFactorsFn(beam.DoFn):
    def setup(self):
        self._PATTERN_OF_FACTORS = re.compile(''.join([
            r'(?<=Chn)\s+',
            r'(?P<channel_id>\d+)',
            r'.*\(.*\)\s*\:\s*\d+\.*\d*\s+\w+\s+',
            r'(?P<true_weight>\d+\.*\d*)\s+(?P<true_weight_unit>\w+)',
            r'.+\s',
            r'(?P<sensor_vpu>\d+\.*\d*)',
            r'.+$'
        ]), re.MULTILINE)

    def process(self, element):
        def parse_match_tuple(match_tuple):
            (channel_id, true_weight, true_weight_unit, sensor_vpu) = match_tuple

            true_weight = _adjust_true_weight_value(
                true_weight, true_weight_unit)

            return (channel_id, {
                'channel_id': channel_id,
                'sensor_vpu': float(sensor_vpu),
                'true_weight': true_weight
            })

        # TODO change config_path for FileMetadata
        [key, config_path] = element

        with FileSystems.open(config_path) as buffer:
            text = buffer.read().decode('utf8')

        matches_tuples_set = set(self._PATTERN_OF_FACTORS.findall(text))
        # factors_dicts = [parse_match_tuple(e) for e in matches_tuples_set]
        # factors_dicts.sort(key=lambda e: e['channel_id'])
        # factors_single_dict = {f['channel_id']: f for f in factors_dicts}
        factors_dict = dict(parse_match_tuple(e) for e in matches_tuples_set)

        yield (key, factors_dict)


# @typehints.with_output_types(Tuple[K, Dict])
# @typehints.with_input_types(Tuple[K, Iterable[beam.io.filesystem.FileMetadata]])
class ReadMSeedFilesFn(beam.DoFn):
    _PATTERN_CHANNEL = re.compile(r'(\d+)(?=\.msd$)')

    def process(self, element):
        pattern = ReadMSeedFilesFn._PATTERN_CHANNEL

        def read_mseed_file(file_path):
            channel_id = pattern.search(file_path).group()

            return (channel_id, {
                'channel_id': channel_id,
                'data': obspy_read(FileSystems.open(file_path))
            })

        [key, files_metadata] = element
        results_dict = dict(read_mseed_file(f.path) for f in files_metadata)

        yield (key, results_dict)


# @typehints.with_input_types(K)
# @typehints.with_output_types(Tuple[K, V])
class ReadMSeedFromOutputDir(beam.PTransform):
    """REF TEK PASSCAL files from output directories to Obspy stream data
    """

    def expand(self, output_dirs):
        # Read miniseed data
        data = (
            output_dirs
            | beam.Map(self._match_mseed_files_in_dir)
            | beam.ParDo(ReadMSeedFilesFn())
        )

        # Read adjustment factors: `TrueBitWeight` and `SensorVPU`
        factors = (
            output_dirs
            | beam.Map(_match_config_file_in_dir)
            | beam.ParDo(ReadAdjustmentFactorsFn())
        )

        channels = (
            (data, factors)
            | beam.Flatten()
            | beam.GroupByKey()
            | beam.Map(self._join_data_and_factors)
        )

        return channels

    @staticmethod
    def _match_mseed_files_in_dir(element):
        """Match miniseed files in a directory path

        Input element: [key, source_dir_path]
        Output element: [key, [FileMetadata]]
        """

        [key, dir_path] = element
        matches = _match_files_in_dir(dir_path, glob_pattern='*.msd')

        if len(matches) == 0:
            return [key, None]

        return [key, matches]

    @staticmethod
    def _join_data_and_factors(element):
        [key, data_and_factors] = element

        assert len(data_and_factors) == 2, 'Unexpected length of data_and_factors'

        # Whether x0 or x1 corresponds to data or factors is irrelevant
        [x0, x1] = data_and_factors

        channels_keys = x0.keys()
        assert channels_keys == x1.keys(), "data_and_factors are not consistent"

        channels = [{**x0[k], **x1[k]} for k in channels_keys]

        return (key, channels)


class ReadPasscalFiles(beam.PTransform):
    _PATTERN_OF_TRUE_WEIGHT = re.compile(
        r'(?P<true_weight>\d+\.*\d*)\s+(?P<true_weight_unit>\w+)')

    def __init__(self, include_others=False):
        self.include_others = include_others

    def expand(self, files):
        channels = (
            files
            | beam.Map(self._read_passcal_into_reftek_obspy_stream)
            | beam.Map(self._reftek_obspy_stream_to_channels_dicts)
        )

        return channels

    @staticmethod
    def _read_passcal_into_reftek_obspy_stream(element):
        reftek_st = obspy_read(FileSystems.open(element["path"]))

        return {**element, "reftek_st": reftek_st}

    @staticmethod
    def _reftek_obspy_stream_to_channels_dicts(element):
        def parse_true_weight_string(string):
            """Parse TrueWeight factor string with value and unit

            Example:
                true_weight = parse_true_weight_string('1.62 uV')
                print(true_weight) # 1.62e-06
            """

            match = ReadPasscalFiles._PATTERN_OF_TRUE_WEIGHT.match(string)
            assert match, f'Not compatible string "{string}"'
            (true_weight, true_weight_unit) = match.groups()

            true_weight = _adjust_true_weight_value(
                true_weight, true_weight_unit)

            return true_weight

        def trace_to_channel_dict(tr):
            index = tr.stats.reftek130.channel_number
            true_weight_string = tr.stats.reftek130.channel_true_bit_weights[index]
            true_weight = parse_true_weight_string(true_weight_string)
            sensor_vpu = tr.stats.reftek130.channel_sensor_vpu[index]

            return {
                'channel_id': index,
                'data': ObspyStream(traces=[tr]),
                'sensor_vpu': sensor_vpu,
                'true_weight': true_weight,
            }

        st = element["reftek_st"]
        channels = [trace_to_channel_dict(tr) for tr in st]
        others = {x: element[x] for x in element if x != "reftek_st"}

        return {**others, "channels": channels}
