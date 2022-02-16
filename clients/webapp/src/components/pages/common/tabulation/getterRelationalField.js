export default function getterRelationalField({ context, ownIdField, relation }) {
  return function getRelationalField(params) {
    const { category, field } = relation;
    const id = params.row[ownIdField];
    if (!id) {
      return null;
    }

    const idText = `ID ${id}`;
    const value = context?.[category]?.entities[id]?.[field];

    return value ? `${value} - ${idText}` : idText
  };
}