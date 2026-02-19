export const buildAddressString = (
  countryCode: string,
  city: string,
  region: string | undefined,
  addressLine1: string | undefined,
  addressLine2: string | undefined,
  postalCode: string | undefined,
) => {
  const country = countries.find(country => country.value === countryCode)?.label
  return [
    country,
    city,
    region,
    addressLine1,
    addressLine2,
    postalCode
  ].filter(Boolean).join(', ')
}
