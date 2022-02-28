import logging
import os

import apache_beam as beam

from obspy import Stream as ObspyStream
from monitoreo.processing.types import matlab_double_to_float, obspy_stream_to_matlab_double


class ModalIdFn(beam.DoFn):

    def __init__(self, default_analysis={}):
        self.default_analysis = default_analysis

    def setup(self):
        logging.info("Setting up ModalIdFn")
        # logging.info(os.environ)

        import matlab_modal_id
        self._modal_id = matlab_modal_id.runtime.initialize()
        
        import matlab
        self.__matlab = matlab

    def process(self, element):
        # data = { 'c': [1,2,3], 'b': [4,5,6] }
        # datav = np.array(list(data.values())).flatten()

        # ma = self.__matlab.double(list(data.values()))
        # ma.reshape(size=(1,2*3))

        # datav = np.array(list(data.values())).transpose().flatten('F').tolist()

        # data = np.array(list(element["data"].values()))
        # logging.info(f'data shape: {data.shape}')
        # data = data.transpose()
        # logging.info(f'data shape: {data.shape}')
        # datav = data.flatten('F')
        # logging.info(f'datav shape: {datav.shape}')
        # datav = datav.tolist()
        # logging.info(f'datav sum: {sum(datav)}')

        # datav = np.array(list(element["data"].values())
        #                  ).transpose().flatten('F').tolist()

        # data = self.__matlab.double(list(element["data"].values()))
        # data.reshape(size=(1,30722*3))

        # logging.info(f'First 10 points:{datav[0:10]}')
        # logging.info(f'Last 10 points:{datav[-10::]}')

        # Data type mapping Python-MATLAB requires to use explicit `float` values: 10.0

        # data before monitoreo
        # data = self.__matlab.double(list(element["data"].values()))

        data_type = type(element['data'])
        if data_type == self.__matlab.double:
            response_matlab = element['data']
        elif data_type == ObspyStream:
            response_st = element['data']
            response_matlab = obspy_stream_to_matlab_double(
                self.__matlab.double, response_st)
        else:
            raise TypeError(f'Unsupported type of response data "{data_type}"')

        if 'modal' in element.get('analysis', {}):
            # if 'analysis' in element and 'modal' in element['analysis']:
            analysis = element['analysis']['modal']
        elif 'modal' in self.default_analysis:
            analysis = self.default_analysis['modal']
        else:
            raise ValueError("Modal analysis config not found")

        technique = analysis['technique']
        params = analysis['technique_params']
        fs = element['metadata']['sampling_rate']

        modal_matlab_dict = self._modal_id.identify({

            # 'technique': 'ssi',
            'technique': technique,
            'transposing': True,
            'data': response_matlab,
            'fs': fs,
            # 'fs': 200.0,
            # 'size': self.__matlab.double([30722,3]),
            'params': params
            # 'params': {
            #     "npoints": 1024.0,
            #     "order": 10.0,
            #     "freqtol": 0.05,
            #     "mactol": 0.95,
            #     "minfound": 5.0,
            # "npoints": self.__matlab.double([1024]),
            # "order": self.__matlab.double([10]),
            # "freqtol": self.__matlab.double([0.05]),
            # "mactol": self.__matlab.double([0.95]),
            # "minfound": self.__matlab.double([5]),
            # }
        })

        modal_dict = matlab_double_to_float(
            modal_matlab_dict,
            one_dimensional_keys=['fd', 'zt', 'rf', 'stdfd', 'stdzt'],
            # multi_dimensional_keys=['shapes']
        )

        # types = ''.join([f'{key}:{type(value)}\n' for (
        #     key, value) in modal_dict.items()])
        # logging.info(f"Types:\n{types}")

        # analytics_dict = {
        #     'analytics_config_id': 1,
        #     'analytics_config_id': 'a9fdbbc8-9e02-47e2-8d75-76a7fdcf4027',
        #     'data_chunk_id': element['_id'],
        #     'data': modal_dict,
        #     'time': element['time'],
        # }

        yield {**element, 'data': modal_dict}

    # def teardown(self):
    #     self._modal_id.terminate()
