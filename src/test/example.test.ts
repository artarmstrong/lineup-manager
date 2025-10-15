import { describe, it, expect } from 'vitest'

// Example utility functions to demonstrate testing
function formatEmail(email: string): string {
  return email.toLowerCase().trim()
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
}

describe('Utility Functions', () => {
  describe('formatEmail', () => {
    it('converts email to lowercase', () => {
      expect(formatEmail('TEST@EXAMPLE.COM')).toBe('test@example.com')
    })

    it('trims whitespace from email', () => {
      expect(formatEmail('  test@example.com  ')).toBe('test@example.com')
    })

    it('handles already formatted email', () => {
      expect(formatEmail('test@example.com')).toBe('test@example.com')
    })
  })

  describe('getInitials', () => {
    it('returns initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD')
    })

    it('handles single name', () => {
      expect(getInitials('John')).toBe('J')
    })

    it('handles three names', () => {
      expect(getInitials('John Michael Doe')).toBe('JMD')
    })

    it('handles empty string', () => {
      expect(getInitials('')).toBe('')
    })
  })
})
