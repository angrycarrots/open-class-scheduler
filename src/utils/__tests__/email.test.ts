import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderTemplate } from '../email'

describe('email utilities', () => {
  describe('renderTemplate', () => {
    it('should replace template variables correctly', () => {
      const template = 'Hello {{userName}}, your class {{className}} is confirmed.'
      const data = {
        userName: 'John Doe',
        className: 'Yoga Flow',
      }

      const result = renderTemplate(template, data)
      expect(result).toBe('Hello John Doe, your class Yoga Flow is confirmed.')
    })

    it('should handle missing variables gracefully', () => {
      const template = 'Hello {{userName}}, your class {{className}} is confirmed.'
      const data = {
        userName: 'John Doe',
        // className is missing
      }

      const result = renderTemplate(template, data)
      expect(result).toBe('Hello John Doe, your class {{className}} is confirmed.')
    })

    it('should handle empty template', () => {
      const template = ''
      const data = { userName: 'John' }

      const result = renderTemplate(template, data)
      expect(result).toBe('')
    })

    it('should handle empty data', () => {
      const template = 'Hello {{userName}}'
      const data = {}

      const result = renderTemplate(template, data)
      expect(result).toBe('Hello {{userName}}')
    })

    it('should handle complex HTML templates', () => {
      const template = `
        <div>
          <h1>Welcome {{userName}}</h1>
          <p>Your class {{className}} on {{classDate}} is confirmed.</p>
          <p>Instructor: {{instructor}}</p>
        </div>
      `
      const data = {
        userName: 'Jane Smith',
        className: 'Deep Stretch',
        classDate: '2024-01-15',
        instructor: 'Michael',
      }

      const result = renderTemplate(template, data)
      expect(result).toContain('Welcome Jane Smith')
      expect(result).toContain('Your class Deep Stretch on 2024-01-15 is confirmed.')
      expect(result).toContain('Instructor: Michael')
    })
  })
})
