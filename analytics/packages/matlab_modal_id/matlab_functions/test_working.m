function [status, out_message] = test_working(in_message)

status = 0; % zero means correct working

if (nargin == 1)
    out_message = sprintf('You message is "%s"', in_message);
else
    out_message = '';
end

end