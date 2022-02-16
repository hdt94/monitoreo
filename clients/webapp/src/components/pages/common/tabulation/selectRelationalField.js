
export default function selectRelationalField({ context, relation }) {
  const { category, id, field } = relation;

  return context?.[category]?.entities[id]?.[field]
}
