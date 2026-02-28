import { PIIScanner, EntityType } from '../../src/regex'

const scanner = new PIIScanner({ entities: [EntityType.DATE_OF_BIRTH] })
const dob = (matches: ReturnType<typeof scanner.detect>) =>
  matches.filter((m) => m.entityType === 'Date of Birth')

describe('Date of Birth Detection', () => {
  // MM/DD/YYYY formats
  test('MM/DD/YYYY with slash', () => {
    expect(dob(scanner.detect('born on 03/15/1990')).length).toBe(1)
  })

  test('MM-DD-YYYY with dash', () => {
    expect(dob(scanner.detect('dob: 03-15-1990')).length).toBe(1)
  })

  test('MM.DD.YYYY with dot', () => {
    expect(dob(scanner.detect('birthday 03.15.1990')).length).toBe(1)
  })

  test('single digit month/day', () => {
    expect(dob(scanner.detect('born 3/5/1990')).length).toBe(1)
  })

  // 2-digit year
  test('MM/DD/YY two-digit year', () => {
    expect(dob(scanner.detect('dob: 03/15/90')).length).toBe(1)
  })

  test('MM-DD-YY two-digit year', () => {
    expect(dob(scanner.detect('born on 12-25-85')).length).toBe(1)
  })

  // ISO format
  test('YYYY-MM-DD ISO', () => {
    expect(dob(scanner.detect('date of birth: 1990-03-15')).length).toBe(1)
  })

  test('YYYY/MM/DD ISO with slash', () => {
    expect(dob(scanner.detect('birthdate 1990/03/15')).length).toBe(1)
  })

  // Month DD, YYYY
  test('Month DD, YYYY', () => {
    expect(dob(scanner.detect('born March 15, 1990')).length).toBe(1)
  })

  test('abbreviated month', () => {
    expect(dob(scanner.detect('dob: Jan 5, 1985')).length).toBe(1)
  })

  test('no comma', () => {
    expect(dob(scanner.detect('birthday January 15 1990')).length).toBe(1)
  })

  // DD Month YYYY
  test('DD Month YYYY', () => {
    expect(dob(scanner.detect('born 15 March 1990')).length).toBe(1)
  })

  test('ordinal suffix', () => {
    expect(dob(scanner.detect('dob: 3rd March 1985')).length).toBe(1)
  })

  test('abbreviated DD Month', () => {
    expect(dob(scanner.detect('birthday 1st Jan 2000')).length).toBe(1)
  })

  // Context keywords
  test('multilingual French keyword', () => {
    expect(dob(scanner.detect('date de naissance: 15/03/1990')).length).toBe(1)
  })

  test('multilingual German keyword', () => {
    expect(dob(scanner.detect('Geburtsdatum: 15.03.1990')).length).toBe(1)
  })

  // Negatives
  test('no context no match', () => {
    expect(dob(scanner.detect('The event is on 03/15/1990')).length).toBe(0)
  })

  test('plain date no context', () => {
    expect(dob(scanner.detect('Meeting scheduled for 03/15/2024')).length).toBe(0)
  })

  test('year alone not detected', () => {
    expect(dob(scanner.detect('born in 1990')).length).toBe(0)
  })
})
