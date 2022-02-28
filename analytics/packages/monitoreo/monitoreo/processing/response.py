import logging
import os

import apache_beam as beam

from obspy import Stream as ObspyStream
from monitoreo.processing.types import matlab_double_into_obspy_stream, obspy_stream_to_matlab_double


def detrend_response(element):
    decimate_ratio = 20

    st = element['data'].copy()
    st.detrend(type='constant')
    st.decimate(decimate_ratio, no_filter=True)

    metadata = element['metadata']
    sampling_rate = metadata['sampling_rate'] / decimate_ratio
    metadata = {**metadata, 'sampling_rate': sampling_rate}

    return {**element, 'data': st, 'metadata': metadata}


class ProcessResponseFn(beam.DoFn):
    def __init__(self, default_analysis={}, enforce_default_analysis=False):
        self.default_analysis = default_analysis
        self.enforce_default_analysis = enforce_default_analysis

    def setup(self):
        logging.info("Setting up ProcessResponseFn")

        import matlab_modal_id
        self._modal_id = matlab_modal_id.runtime.initialize()

        import matlab
        self.__matlab = matlab
        # import matlab_modal_id

        # try:
        #     import matlab
        # except ModuleNotFoundError as exc:
        #     print('ModuleNotFoundError', exc)
        #     # self._modal_id = matlab_modal_id.runtime.initialize()
        # except Exception as exc:
        #     print('Exception', exc)

    def process(self, element):
        """Notes:
        - Resulting response data in `element` may be of type `matlab.double`
        or `obspy.Stream` according to analysis config. Any subsequent
        transformation should support both of these types.
        """

        if self.enforce_default_analysis and 'response' in self.default_analysis:
            analysis = self.default_analysis['response']
        elif 'response' in element.get('analysis', {}):
            analysis = element['analysis']['response']
        elif 'response' in self.default_analysis:
            analysis = self.default_analysis['response']
        else:
            raise ValueError("Response analysis config not found")

        response_st = element['data']
        metadata = element['metadata']
        sampling_rate = metadata['sampling_rate']

        data_type = type(response_st)
        assert data_type == ObspyStream, f'Expected response obspy stream insted of "{data_type}"'

        args = (response_st, sampling_rate, analysis)
        if analysis.get('use_matlab', False):
            (new_response_st, resampling_rate) = self._process_with_matlab(*args)
            # TODO update sampling_rate in new_response_st
        elif analysis.get('use_obspy', False):
            (new_response_st, resampling_rate) = self._process_with_obspy(*args)
        else:
            raise ValueError("Invalid response analysis")

        yield {
            **element,
            'data': new_response_st,
            'metadata': {**metadata, 'sampling_rate': resampling_rate}
        }

    # def teardown(self):
    #     self._modal_id.terminate()

    def _process_with_matlab(self, response_st, sampling_rate, analysis):
        st = response_st.copy()
        response_matlab = obspy_stream_to_matlab_double(
            self.__matlab.double, st)
        resampling_rate = analysis['resampling_rate']
        data_matlab_dict = self._modal_id.process_response({
            'data': response_matlab,
            'detrend': analysis.get('detrend', False),
            'fs': sampling_rate,
            'frs': resampling_rate,
            'transposing': True
        })
        matlab_double_into_obspy_stream(
            data_matlab_dict['data'], st)

        return (st, resampling_rate)

    def _process_with_obspy(self, response_st, sampling_rate, analysis):
        st = response_st.copy()

        if analysis.get('detrend', False):
            st.detrend(type='constant')

        resampling_rate = None
        if 'decimate_ratio' in analysis:
            decimate_ratio = analysis['decimate_ratio']
            if type(decimate_ratio) == float:
                decimate_ratio_int = int(decimate_ratio)
                if (decimate_ratio != decimate_ratio_int):
                    raise ValueError('Decimation ratio must be an integer')
                decimate_ratio = decimate_ratio_int

            st.decimate(decimate_ratio, no_filter=True)
            resampling_rate = sampling_rate / decimate_ratio

        return (st, resampling_rate or sampling_rate)
