export const formatCurrency = (amount: number, currency = "EUR") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};
