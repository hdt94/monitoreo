%%
load([cd '\Reftek\221800000_0002BF20.mat']);
raw_data = detrend(Response.Data);

%%
fs = 500;
frs=100;
data = resample(raw_data,frs,fs);

%%
order = 16;
freqtol = 0.05;
mactol = 0.95;
minfound = 5;
npoints = length(data) / 10; % 1800
[fd, ~, zt, rf, stdfd, stdzt] = ssiId(data, frs, npoints, order, freqtol, mactol, minfound);
display([rf fd stdfd' zt stdzt'].')