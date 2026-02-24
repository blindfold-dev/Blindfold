import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['ro'], entities: [EntityType.RO_CNP] })
const roCnp = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Romanian CNP')

describe('Romanian CNP Detection', () => {
  test('should detect valid Romanian CNP', () => {
    const m = roCnp(scanner.detect('1850501350013'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('1850501350013')
    expect(m[0].score).toBe(1.0)
  })

  test('should reject invalid checksum', () => {
    expect(roCnp(scanner.detect('1850501350011')).length).toBe(0)
  })
})
