function valuesPlaceholders(columnsLength, rowsLength = 1, conversions = {}) {
  /*
    valuesPlaceholders(3) 
      -> '($1,$2,$3)'
    valuesPlaceholders(3, 2)
      -> '($1,$2,$3),($4,$5,$6)'
    valuesPlaceholders(3, 2, { '1': 'job_state' })
      -> '($1,$2::job_state,$3),($4,$5::job_state,$6)'
  */

  const columns = Array(columnsLength).fill();

  function rowValuesPlaceholders(rowIndex) {
    const placeholders = columns.map((_, columnIndex) => {
      const placeholder = `$${rowIndex * columnsLength + columnIndex + 1}`;
      const pgType = conversions[columnIndex];

      return pgType ? `${placeholder}::${pgType}` : placeholder;
    });

    return `(${placeholders.join(',')})`;
  }

  return Array(rowsLength)
    .fill()
    .map((_, rowIndex) => rowValuesPlaceholders(rowIndex))
    .join(',');
}

module.exports = {
  valuesPlaceholders,
};
