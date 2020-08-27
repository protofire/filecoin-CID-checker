import { boolAtIndex } from '../../src/helpers/bitfield'

describe('boolAtIndex', () => {
  it('should be null if bitfield arg is empty', () => {
    expect(boolAtIndex([], 0)).toBeNull()
    expect(boolAtIndex([], 1)).toBeNull()
  })
  it('should be null if index arg is out of bounds', () => {
    expect(boolAtIndex([], -1)).toBeNull()
    // Out of bounds means index > sum of numbers in bitfield arg/array
    expect(boolAtIndex([1], 2)).toBeNull()
  })
  it('should be false/true if bitfield has values and index is ok', () => {
    expect(boolAtIndex([2], 0)).toBe(false)
    expect(boolAtIndex([2], 1)).toBe(false)

    expect(boolAtIndex([2, 2], 0)).toBe(false)
    expect(boolAtIndex([2, 2], 1)).toBe(false)

    expect(boolAtIndex([2, 2], 2)).toBe(true)
    expect(boolAtIndex([2, 2], 3)).toBe(true)
    expect(boolAtIndex([2, 2], 4)).toBeNull()

    expect(boolAtIndex([2, 2, 1], 2)).toBe(true)
    expect(boolAtIndex([2, 2, 1], 3)).toBe(true)

    expect(boolAtIndex([2, 2, 1], 4)).toBe(false)
    expect(boolAtIndex([2, 2, 1], 5)).toBeNull()
  })
})
