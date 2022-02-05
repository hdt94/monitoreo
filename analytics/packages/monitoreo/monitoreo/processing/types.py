import numpy as np


def matlab_double_into_obspy_stream(matlab_double, obspy_st):
    l1 = len(matlab_double)
    l2 = len(obspy_st)
    assert l1 == l2, "Lengths of matlab_double and obspy_st mismatch"

    for index in range(l1):
        obspy_st[index].data = np.array(matlab_double[index])

    return obspy_st


def matlab_double_to_float(data_matlab_dict, one_dimensional_keys=[], multi_dimensional_keys=[]):
    data_dict = {}

    # Convert one-dimensional `matlab.double` arrays (column or row) into lists of `float` values
    for key in one_dimensional_keys:
        data_dict[key] = list(data_matlab_dict[key]._data)

    # Convert multi-dimensional `matlab.double` arrays into lists of lists of `float` values
    for key in multi_dimensional_keys:
        data_dict[key] = np.array(data_dict[key]).tolist()

    return data_dict


def obspy_stream_to_matlab_double(matlab_double_type, st):
    # type(tr.data): numpy.ndarray
    # type(my_list[0][1]): 'int'
    return matlab_double_type(np.vstack([tr.data for tr in st]).tolist())
