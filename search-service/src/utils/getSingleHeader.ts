export const getSingleHeader = (
  value: string | string[] | undefined
): string | null | undefined => {
  if (!value) return null
  if (Array.isArray(value)) return value[0]
  return value
}
