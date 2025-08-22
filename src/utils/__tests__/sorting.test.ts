import { describe, it, expect } from 'vitest'

// Mock class data for testing
const mockClasses = [
  {
    id: '1',
    name: 'Alpha Class',
    instructor: 'Alice',
    start_time: '2024-01-01T10:00:00Z',
    price: 15,
    is_cancelled: false,
  },
  {
    id: '2',
    name: 'Beta Class',
    instructor: 'Bob',
    start_time: '2024-01-02T10:00:00Z',
    price: 10,
    is_cancelled: false,
  },
  {
    id: '3',
    name: 'Charlie Class',
    instructor: 'Charlie',
    start_time: '2024-01-03T10:00:00Z',
    price: 20,
    is_cancelled: false,
  },
]

describe('Sorting functionality', () => {
  it('should sort by date in ascending order', () => {
    const sorted = [...mockClasses].sort((a, b) => {
      const comparison = new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      return comparison
    })

    expect(sorted[0].name).toBe('Alpha Class')
    expect(sorted[1].name).toBe('Beta Class')
    expect(sorted[2].name).toBe('Charlie Class')
  })

  it('should sort by date in descending order', () => {
    const sorted = [...mockClasses].sort((a, b) => {
      const comparison = new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      return -comparison
    })

    expect(sorted[0].name).toBe('Charlie Class')
    expect(sorted[1].name).toBe('Beta Class')
    expect(sorted[2].name).toBe('Alpha Class')
  })

  it('should sort by name in ascending order', () => {
    const sorted = [...mockClasses].sort((a, b) => {
      const comparison = a.name.localeCompare(b.name)
      return comparison
    })

    expect(sorted[0].name).toBe('Alpha Class')
    expect(sorted[1].name).toBe('Beta Class')
    expect(sorted[2].name).toBe('Charlie Class')
  })

  it('should sort by name in descending order', () => {
    const sorted = [...mockClasses].sort((a, b) => {
      const comparison = a.name.localeCompare(b.name)
      return -comparison
    })

    expect(sorted[0].name).toBe('Charlie Class')
    expect(sorted[1].name).toBe('Beta Class')
    expect(sorted[2].name).toBe('Alpha Class')
  })

  it('should sort by instructor in ascending order', () => {
    const sorted = [...mockClasses].sort((a, b) => {
      const comparison = a.instructor.localeCompare(b.instructor)
      return comparison
    })

    expect(sorted[0].instructor).toBe('Alice')
    expect(sorted[1].instructor).toBe('Bob')
    expect(sorted[2].instructor).toBe('Charlie')
  })

  it('should sort by price in ascending order', () => {
    const sorted = [...mockClasses].sort((a, b) => {
      const comparison = a.price - b.price
      return comparison
    })

    expect(sorted[0].price).toBe(10)
    expect(sorted[1].price).toBe(15)
    expect(sorted[2].price).toBe(20)
  })

  it('should sort by price in descending order', () => {
    const sorted = [...mockClasses].sort((a, b) => {
      const comparison = a.price - b.price
      return -comparison
    })

    expect(sorted[0].price).toBe(20)
    expect(sorted[1].price).toBe(15)
    expect(sorted[2].price).toBe(10)
  })
})
