import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ locales: ['no'], entities: [EntityType.NO_ORGNR] })
const filterFn = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Norwegian Organisasjonsnummer')

describe('Norwegian Organisasjonsnummer Detection', () => {
  test('should detect valid organisasjonsnummer with context', () => {
    const m = filterFn(scanner.detect('Organisasjonsnummer: 923609016'))
    expect(m.length).toBe(1)
    expect(m[0].text).toBe('923609016')
  })

  test('should reject invalid checksum', () => {
    expect(filterFn(scanner.detect('Organisasjonsnummer: 923609017'))).toHaveLength(0)
  })
})
