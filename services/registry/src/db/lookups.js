const instrumentsLookupAgg = [
  {
    $lookup: {
      as: 'instruments',
      from: 'instruments',
      foreignField: '_id',
      localField: 'instruments_id',
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
      foreignField: '_id',
      localField: 'measures_id',
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
      foreignField: '_id',
      localField: 'structure_id',
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
