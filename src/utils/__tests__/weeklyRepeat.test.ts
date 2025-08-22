import { describe, it, expect } from 'vitest'
import { createWeeklyClasses, getDayOfWeekName } from '../weeklyRepeat'

describe('weeklyRepeat utilities', () => {
  describe('getDayOfWeekName', () => {
    it('should return correct day names', () => {
      expect(getDayOfWeekName(0)).toBe('Sunday')
      expect(getDayOfWeekName(1)).toBe('Monday')
      expect(getDayOfWeekName(2)).toBe('Tuesday')
      expect(getDayOfWeekName(3)).toBe('Wednesday')
      expect(getDayOfWeekName(4)).toBe('Thursday')
      expect(getDayOfWeekName(5)).toBe('Friday')
      expect(getDayOfWeekName(6)).toBe('Saturday')
    })

    it('should handle invalid day numbers', () => {
      expect(getDayOfWeekName(7)).toBeUndefined()
      expect(getDayOfWeekName(-1)).toBeUndefined()
    })
  })

  describe('createWeeklyClasses', () => {
    it('should create the correct number of classes', () => {
      const baseClass = {
        name: 'Test Class',
        brief_description: 'Test Description',
        full_description: 'Full Test Description',
        instructor: 'Test Instructor',
        price: 10,
      }

      const options = {
        startDate: new Date('2024-01-01T10:00:00Z'), // Monday
        weeks: 4,
        dayOfWeek: 1, // Monday
        time: '10:00',
      }

      const result = createWeeklyClasses(baseClass, options)
      expect(result).toHaveLength(4)
    })

    it('should create classes with correct dates', () => {
      const baseClass = {
        name: 'Test Class',
        brief_description: 'Test Description',
        full_description: 'Full Test Description',
        instructor: 'Test Instructor',
        price: 10,
      }

      const startDate = new Date('2024-01-01T10:00:00Z') // Monday
      const options = {
        startDate,
        weeks: 2,
        dayOfWeek: 1, // Monday
        time: '10:00',
      }

      const result = createWeeklyClasses(baseClass, options)
      
      // Check that the dates are correct (ignore timezone)
      expect(result[0].start_time).toMatch(/2024-01-01/)
      expect(result[1].start_time).toMatch(/2024-01-08/)
    })

    it('should preserve base class properties', () => {
      const baseClass = {
        name: 'Test Class',
        brief_description: 'Test Description',
        full_description: 'Full Test Description',
        instructor: 'Test Instructor',
        price: 15.50,
      }

      const options = {
        startDate: new Date('2024-01-01T10:00:00Z'),
        weeks: 1,
        dayOfWeek: 1,
        time: '10:00',
      }

      const result = createWeeklyClasses(baseClass, options)
      
      expect(result[0]).toMatchObject({
        name: baseClass.name,
        brief_description: baseClass.brief_description,
        full_description: baseClass.full_description,
        instructor: baseClass.instructor,
        price: baseClass.price,
      })
    })
  })
})
