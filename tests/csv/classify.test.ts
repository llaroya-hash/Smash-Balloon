import { describe, it, expect } from 'vitest'
import { classifyFormatType } from '@/lib/csv/classify'

describe('classifyFormatType', () => {
  it('stub: function is importable without error', () => {
    // Verifies the import resolves
    const type = typeof classifyFormatType
    if (type !== 'function') throw new Error('Expected classifyFormatType to be a function')
  })

  it("returns 'how-to' for title containing 'how to'", () => {
    expect(classifyFormatType('How to Display Your Instagram Feed on WordPress')).toBe('how-to')
  })

  it("returns 'list' for title starting with a number", () => {
    expect(classifyFormatType('5 Best Instagram Plugins for WordPress')).toBe('list')
  })

  it("returns 'comparison' for titles with 'vs'", () => {
    expect(classifyFormatType('Smash Balloon vs Smashfly: Which is Better?')).toBe('comparison')
  })

  it("returns 'other' for generic titles", () => {
    expect(classifyFormatType('Smash Balloon Plugin Review')).toBe('other')
  })

  it('is case-insensitive — HOW TO matches how-to', () => {
    expect(classifyFormatType('HOW TO Use Instagram Feed Plugin')).toBe('how-to')
  })

  it("returns 'how-to' for hyphenated 'how-to' in title", () => {
    expect(classifyFormatType('A How-To Guide for Embedding Social Feeds')).toBe('how-to')
  })

  it("returns 'list' for titles with number + 'top' keyword", () => {
    expect(classifyFormatType('10 Top WordPress Plugins for Social Media')).toBe('list')
  })

  it("returns 'comparison' for titles containing 'comparison'", () => {
    expect(classifyFormatType('Social Feed Plugin Comparison 2025')).toBe('comparison')
  })

  it("returns 'comparison' for titles containing 'versus'", () => {
    expect(classifyFormatType('Smash Balloon versus Spotlight: Full Review')).toBe('comparison')
  })

  it("returns 'comparison' for titles containing 'compared'", () => {
    expect(classifyFormatType('Best Social Plugins Compared: 2025 Edition')).toBe('comparison')
  })
})
