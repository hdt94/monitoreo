const { decodeToken } = require('../external/firebase');

async function verifyAccessToken(req, res) {
  const { accessToken } = req.params;
  const { auth, error } = await decodeToken({ accessToken });

  if (error) {
    res.status(401).json({ error });
    return;
  }

  return res.json(auth);
}

module.exports = { verifyAccessToken };
