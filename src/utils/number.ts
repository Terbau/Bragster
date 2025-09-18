export const fixedDecimal = (num: number, decimalPlaces: number) => {
  const factor = decimalPlaces >= 0 ? 10 ** decimalPlaces : 1;
  const result = Math.round(num * factor) / factor;
  return Number.isNaN(result) ? 0 : result;
};
