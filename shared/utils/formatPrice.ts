const priceFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
})

export const formatPrice = (price: number) => priceFormatter.format(price)
