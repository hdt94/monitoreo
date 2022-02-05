const instrumentsId = ObjectId();
const measuresIds = [ObjectId(), ObjectId(), ObjectId(), ObjectId()];
const structuresIds = [ObjectId(), ObjectId()];

db.instruments.insertMany([
  {
    _id: instrumentsId,
    name: 'SHMA-130 UV 1',
    manufacturer: 'REF TEK',
    type: 'accelerometer',
    createdAt: new Date(),
  },
]);

db.structures.insertMany([
  {
    _id: structuresIds[0],
    name: 'Bridge 4000',
    type: 'bridge-vehicular',
    materials: ['concrete-reinforced'],
  },
  {
    _id: structuresIds[1],
    name: 'Building 7',
    type: 'building-residential',
    materials: ['steel', 'concrete-reinforced'],
  },
]);

db.measures.insertMany([
  {
    _id: measuresIds[0],
    title: 'Load test - stage 1',
    data_source_type: 'files',
    instruments_id: instrumentsId,
    structure_id: structuresIds[0],
    time_start: '2021-08-25T15:00:00.000Z',
    time_duration_in_seconds: '2021-08-25T15:20:00.000Z',
  },
  {
    _id: measuresIds[1],
    title: 'Load test - stage 2',
    data_source_type: 'files',
    instruments_id: instrumentsId,
    structure_id: structuresIds[0],
    time_start: '2021-08-25T15:20:00.000Z',
    time_duration_in_seconds: '2021-08-25T15:40:00.000Z',
  },
  {
    _id: measuresIds[2],
    title: 'Earthquake Mexico',
    data_source_type: 'monitoring',
    instruments_id: instrumentsId,
    structure_id: structuresIds[0],
    time_start: '2021-09-08T01:47:00.000Z',
    time_duration_in_seconds: '2021-09-08T01:47:00.000Z',
  },
  {
    _id: measuresIds[3],
    title: 'Earthquake Mexico',
    data_source_type: 'monitoring',
    instruments_id: instrumentsId,
    structure_id: structuresIds[1],
    time_start: '2021-09-08T01:47:00.000Z',
    time_duration_in_seconds: '2021-09-08T01:47:00.000Z',
  },
]);

db.analyses.insertMany([
  {
    title: 'title 2',
    params: {
      response: {
        decimate_ratio: 20,
        detrend: true,
      },
      modal: {
        technique: 'ssi',
        technique_params: {
          npoints: 1024,
          order: 10,
          freqtol: 0.05,
          mactol: 0.95,
          minfound: 5,
        },
      },
    },
    measures_id: measuresIds[0],
    type: 'modal-identification',
    meta: {
      created_at: new Date(),
      author_id: 3,
    },
  },
]);

db.reports.insertMany([
  {
    title: 'Visual inspection',
    description: '',
    data_json: '',
    type: 'inspection',
    structure_id: structuresIds[0],
    date: '2021-08-24T15:00:00.000Z',
  },
  {
    data_json: '',
    date: '2021-08-28T15:20:00.000Z',
    description: '',
    structure_id: structuresIds[0],
    title: 'Pillars retrofitting',
    type: 'maintenance',
  },
  {
    title: 'Medición 1',
    description: '',
    data_json: '',
    type: 'maintenance',
    structure_id: structuresIds[1],
    date: '2021-09-10T15:20:00.000Z',
  },
  {
    title: 'Earthquake Mexico',
    description: '',
    data_json: '',
    type: 'earthquake',
    structure_id: structuresIds[1],
    date: '2021-09-08',
  },
]);
