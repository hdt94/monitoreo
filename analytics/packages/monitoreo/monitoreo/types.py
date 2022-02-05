def obspy_stream_to_response(element):
    st = element['data']
    response = [tr.data for tr in st]

    return {**element, 'data': response}
