export function boolAtIndex(bitfield: number[], index: number): boolean | null {
  if (bitfield.length === 0 || index < 0) return null

  // First value indicates number of falses (or zeros)
  let res = false
  let sum = 0
  for (let i = 0; i < bitfield.length; i++) {
    sum += bitfield[i]
    if (index < sum) {
      return res
    }
    res = !res
  }

  // Traversed the whole bitfield, but index > sum of values
  return null
}
