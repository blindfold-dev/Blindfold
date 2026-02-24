import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['se'], entities: [EntityType.SE_PERSONNUMMER] })
const sePersonnummer = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Swedish Personnummer')

describe('Swedish Personnummer Detection', () => {
  test('should detect valid Swedish Personnummer', () => {
    const m = sePersonnummer(scanner.detect('811228-9874'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('811228-9874')
    expect(m[0].score).toBe(1.0)
  })

  test('should reject invalid checksum', () => {
    expect(sePersonnummer(scanner.detect('811228-9875')).length).toBe(0)
  })
})
