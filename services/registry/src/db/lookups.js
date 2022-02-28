const instrumentsLookupAgg = [
  {
    $lookup: {
      as: 'instruments',
      from: 'instruments',
      let: { matchId: { $toObjectId: '$instruments_id' } },
      pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$matchId'] } } }],
    },
  },
  { $unwind: { path: '$instruments' } },
  { $addFields: { 'instruments.id': '$instruments._id' } },
];
const measuresLookupAgg = [
  {
    $lookup: {
      as: 'measures',
      from: 'measures',
      let: { matchId: { $toObjectId: '$measures_id' } },
      pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$matchId'] } } }],
    },
  },
  { $unwind: { path: '$measures' } },
  { $addFields: { 'measures.id': '$measures._id' } },
];
const structureLookupAgg = [
  {
    $lookup: {
      as: 'structure',
      from: 'structures',
      let: { matchId: { $toObjectId: '$structure_id' } },
      pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$matchId'] } } }],
    },
  },
  { $unwind: { path: '$structure' } },
  { $addFields: { 'structure.id': '$structure._id' } },
];

module.exports = {
  analyses: measuresLookupAgg,
  measures: [...instrumentsLookupAgg, ...structureLookupAgg],
  reports: structureLookupAgg,
};
