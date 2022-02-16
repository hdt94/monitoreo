import { isAfter, isEqual, isValid } from 'date-fns';
import * as yup from 'yup';


function validateAsJSON(value) {
  if (value === '') {
    return true;
  }

  try {
    JSON.parse(value);
    return true;
  } catch (err) {
    if (err instanceof SyntaxError) {
      return false;
    }
    throw err;
  }
}

export const analysisSchema = yup.object().shape({
  title: yup.string().required(),
  measures_id: yup.string().required('Associated measures are required'),
  params: yup
    .string()
    .required()
    .test('parameters', 'Parameters must be JSON-compatible', validateAsJSON),
});

export const instrumentsSchema = yup.object().shape({
  manufacturer: yup.string().required(),
  name: yup.string().required(),
  type: yup.string().required(),
});


export const measuresSchema = yup.object().shape({
  // Not assigned is equal to error?
  // data_source_config: yup
  //   .string()
  //   .optional()
  //   .test(
  //     "data_source_config",
  //     "Data source config must be JSON-compatible",
  //     validateAsJSON
  //   ),
  // data_source: yup.object().shape({
  //   type: yup.string().required().test("", "", (value) => ['files', 'monitoring'].includes(value)),
  //   files: yup.array().test("files", "Attach files as defined as data source", (value, context) => {
  //     if (context.parent?.data_source?.type !== "files") {
  //       return true;
  //     }

  //     const isValid = Array.isArray(value) || value?.length > 0;
  //     return isValid;
  //   }),
  // }),
  data_source_type: yup
    .string()
    .required()
    .test('', '', (value) => ['files', 'monitoring'].includes(value)),
  files: yup
    .array()
    .test(
      'files',
      'Attach files as defined as data source',
      (value, context) => {
        if (context.parent?.data_source_type !== 'files') {
          return true;
        }

        const isValid = Array.isArray(value) || value?.length > 0;
        return isValid;
      }
    ),
  structure_id: yup.string().required('Associated structure is required'),
  time_start: yup.date().default(() => new Date()),
  time_end: yup
    .date()
    .default(() => new Date())
    .test(
      'time_end',
      'Ending time must be equal or greater than starting time',
      (value, context) => {
        const end = new Date(value);
        const start = new Date(context.parent?.time_start);

        if (!isValid(end)) return false;

        if (isValid(start)) {
          const isValid = isAfter(end, start) || isEqual(end, start);
          return isValid;
        }

        return true;
      }
    ),
  title: yup.string().required(),
});

export const reportSchema = yup.object().shape({
  data_json: yup
    .string()
    .test('data', 'Data must be JSON-compatible', validateAsJSON),
  date: yup.date('INvalid hd date').required('date HD is required'),
  description: yup.string(),
  structure_id: yup.string().required('Associated structure is required'),
  title: yup.string().required(),
  type: yup.string().required(),
});

export const structureSchema = yup.object().shape({
  description: yup.string(),
  materials: yup.array().of(yup.string()),
  name: yup.string().required(),
  type: yup.string().required(),
});
