function [structOut] = process_response(structIn)
%{
Examples:

structIn = struct( ...
    'data', Response.Data, ...
    'detrend', true);

structIn = struct( ...
    'data', Response.Data, ...
    'detrend', true, ...
    'fs', 500, ...
    'frs', 100);
%}

fields = fieldnames(structIn);
detrending = ismember('detrend', fields) && structIn.detrend;
resampling = ismember('frs', fields);
transposing = ismember('transposing', fields) && structIn.transposing;

if transposing
   data_input = structIn.data.';
else
   data_input = structIn.data;
end

data_output = data_input;

if detrending
   data_output = detrend(data_output);
end

if resampling
    fs = structIn.fs;
    frs = structIn.frs;
    data_output = resample(data_output, frs, fs);
end

if transposing
   data_output = data_output.';
end

structOut = struct('data', data_output);
end