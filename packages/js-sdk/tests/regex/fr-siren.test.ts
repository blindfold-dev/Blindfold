import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['fr'], entities: [EntityType.FR_SIREN] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'French SIREN')

describe('French SIREN Detection', () => {
  test('should detect valid SIREN with context', () => {
    const m = filterFn(scanner.detect('SIREN: 443061841'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('443061841')
  })

  test('should reject invalid checksum', () => {
    expect(filterFn(scanner.detect('SIREN: 443061842'))).toHaveLength(0)
  })
})
