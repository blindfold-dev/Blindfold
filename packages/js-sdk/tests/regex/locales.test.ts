import { PIIScanner } from '../../src/regex'

const MIXED_TEXT = 'SSN 123-45-6789 and IBAN DE89370400440532013000'

describe('Locale Filtering', () => {
  test('US locale detects SSN but not IBAN', () => {
    const scanner = new PIIScanner({ locales: ['us'] })
    const matches = scanner.detect(MIXED_TEXT)
    expect(matches.filter((m) => m.entityType === 'Social Security Number').length).toBe(1)
    expect(matches.filter((m) => m.entityType === 'IBAN').length).toBe(0)
  })

  test('EU locale detects IBAN but not SSN', () => {
    const scanner = new PIIScanner({ locales: ['eu'] })
    const matches = scanner.detect(MIXED_TEXT)
    expect(matches.filter((m) => m.entityType === 'IBAN').length).toBe(1)
    expect(matches.filter((m) => m.entityType === 'Social Security Number').length).toBe(0)
  })

  test('US+EU locale detects both', () => {
    const scanner = new PIIScanner({ locales: ['us', 'eu'] })
    const matches = scanner.detect(MIXED_TEXT)
    expect(matches.filter((m) => m.entityType === 'Social Security Number').length).toBe(1)
    expect(matches.filter((m) => m.entityType === 'IBAN').length).toBe(1)
  })

  test('UK locale detects NI Number', () => {
    const scanner = new PIIScanner({ locales: ['uk'] })
    const ni = scanner
      .detect('NI number: AB 12 34 56 A')
      .filter((m) => m.entityType === 'NI Number')
    expect(ni.length).toBe(1)
  })

  test('UK locale does not detect SSN', () => {
    const scanner = new PIIScanner({ locales: ['uk'] })
    const ssn = scanner
      .detect('SSN 123-45-6789')
      .filter((m) => m.entityType === 'Social Security Number')
    expect(ssn.length).toBe(0)
  })

  test('DE locale detects German Tax ID', () => {
    const scanner = new PIIScanner({ locales: ['de'] })
    const matches = scanner.detect('Steuer-ID: 65929970489')
    expect(matches.filter((m) => m.entityType === 'German Tax ID').length).toBe(1)
  })

  test('DE locale does not detect SSN', () => {
    const scanner = new PIIScanner({ locales: ['de'] })
    const ssn = scanner
      .detect('SSN 123-45-6789')
      .filter((m) => m.entityType === 'Social Security Number')
    expect(ssn.length).toBe(0)
  })

  test('ES locale detects Spanish DNI', () => {
    const scanner = new PIIScanner({ locales: ['es'] })
    const matches = scanner.detect('DNI: 12345678Z')
    expect(matches.filter((m) => m.entityType === 'Spanish DNI').length).toBe(1)
  })

  test('BR locale detects Brazilian CPF', () => {
    const scanner = new PIIScanner({ locales: ['br'] })
    const matches = scanner.detect('CPF: 529.982.247-25')
    expect(matches.filter((m) => m.entityType === 'Brazilian CPF').length).toBe(1)
  })

  test('DE locale does not detect French National ID', () => {
    const scanner = new PIIScanner({ locales: ['de'] })
    const fr = scanner
      .detect('NIR: 185057800608491')
      .filter((m) => m.entityType === 'French National ID')
    expect(fr.length).toBe(0)
  })

  test('FR locale does not detect German Tax ID', () => {
    const scanner = new PIIScanner({ locales: ['fr'] })
    const de = scanner
      .detect('Steuer-ID: 65929970489')
      .filter((m) => m.entityType === 'German Tax ID')
    expect(de.length).toBe(0)
  })
})
