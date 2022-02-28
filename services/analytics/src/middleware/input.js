const { getMeasuresMetadata } = require('../external/measures');

async function inputFilesMiddleware(req, res, next) {
  // Parse fields related to input files for analytics pipelines

  const { input, inputType } = req.body;

  if (typeof input === 'undefined') {
    next();
    return;
  }

  switch (inputType) {
    case 'measures': {
      const measuresId = input;
      const { data, error } = await getMeasuresMetadata({ measuresId });

      if (error) {
        res.status(error.status).json({ error });
        return;
      }

      req.body.files = data.files;
      break;
    }
    case 'paths': {
      let files;
      if (typeof input === 'string') {
        files = [input];
      } else if (Array.isArray(input)) {
        files = input;
      } else {
        const message = `Unsupported files input: ${input}`;
        return res.status(400).json({ error: { message } });
      }

      req.body.files = files;
      break;
    }
    default:
  }

  next();
}

module.exports = {
  inputFilesMiddleware,
};
