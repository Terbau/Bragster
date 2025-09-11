export const fixedDecimal = (num: number, decimalPlaces: number) => {
  const factor = decimalPlaces >= 0 ? 10 ** decimalPlaces : 1;
  return Math.round(num * factor) / factor;
};
