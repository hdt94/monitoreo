const { verifyAccessToken } = require('../external/auth');

async function authenticationMiddleware(req, res, next) {
  const accessToken = req.headers['x-access-token'];
  if (typeof accessToken !== 'string') {
    res.status(400).json({ error: { message: 'Missing access token' } });
    return;
  }

  const { error } = await verifyAccessToken({ accessToken });
  if (error) {
    const status = error?.status || 401;

    res.status(status).json({ error });
    return;
  }

  next();
}

module.exports = {
  authenticationMiddleware,
};
