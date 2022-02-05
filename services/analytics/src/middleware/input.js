function inputFilesMiddleware(req, res, next) {
  // Parse fields related to input files for analytics pipelines

  const { input, inputType } = req.body;

  if (typeof input === 'undefined') {
    next();
    return;
  }

  let files;
  if (typeof input === 'string') {
    files = [input];
  } else if (Array.isArray(input)) {
    files = input;
  } else {
    const message = `Unsupported files input: ${input}`;
    return res.status(400).json({ error: { message } });
  }

  switch (inputType) {
    case 'paths': {
      req.body.files = files;
      break;
    }
    case 'measures': {
      // TODO support measures as input
      return res.status(400).json({ error: { message: `Not supported yet` } });
    }
    default:
  }

  next();
}

module.exports = {
  inputFilesMiddleware,
};
