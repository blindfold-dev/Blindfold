// Date of birth detector (context-required)

import { RegexDetector } from '../base'
import { EntityType } from '../entities'
import { registerUniversal } from '../registry'

const MONTHS =
  '(?:january|february|march|april|may|june|july|august|' +
  'september|october|november|december|' +
  'jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)'

function validDate(text: string): boolean {
  // Word-based dates are already well-constrained by pattern
  if (/[a-zA-Z]/.test(text)) return true
  // For numeric dates, ensure we have 3 digit groups
  const groups = text.match(/\d+/g)
  return groups !== null && groups.length >= 3
}

class DateOfBirthDetector extends RegexDetector {
  entityType = EntityType.DATE_OF_BIRTH
  score = 0.75
  contextKeywords = [
    'born', 'dob', 'date of birth', 'birthday', 'birthdate', 'd.o.b',
    'birth date', 'birth', 'b-day', 'bday', 'age', 'd/o/b', 'born on',
    'date de naissance', 'geburtsdatum', 'fecha de nacimiento',
    'geboortedatum', 'data di nascita',
  ]
  contextRequired = true
  contextWindow = 100
  validator = validDate

  // Multiple date formats
  pattern = new RegExp(
    // MM/DD/YYYY (4-digit year, month 1-12)
    '\\b(?:0?[1-9]|1[0-2])[/\\-.](?:0?[1-9]|[12]\\d|3[01])[/\\-.](?:19|20)\\d{2}\\b' +
      '|' +
      // DD/MM/YYYY (4-digit year, day 13-31 first — unambiguous DD/MM)
      '\\b(?:1[3-9]|2\\d|3[01])[/\\-.](?:0?[1-9]|1[0-2])[/\\-.](?:19|20)\\d{2}\\b' +
      '|' +
      // MM/DD/YY (2-digit year, month 1-12)
      '\\b(?:0?[1-9]|1[0-2])[/\\-.](?:0?[1-9]|[12]\\d|3[01])[/\\-.]\\d{2}\\b' +
      '|' +
      // DD/MM/YY (2-digit year, day 13-31 first)
      '\\b(?:1[3-9]|2\\d|3[01])[/\\-.](?:0?[1-9]|1[0-2])[/\\-.]\\d{2}\\b' +
      '|' +
      // YYYY-MM-DD (ISO)
      '\\b(?:19|20)\\d{2}[/\\-.](?:0?[1-9]|1[0-2])[/\\-.](?:0?[1-9]|[12]\\d|3[01])\\b' +
      '|' +
      // Month DD, YYYY
      '\\b' + MONTHS + '\\s+\\d{1,2},?\\s+(?:19|20)\\d{2}\\b' +
      '|' +
      // DD Month YYYY (with optional ordinal suffix)
      '\\b\\d{1,2}(?:st|nd|rd|th)?\\s+' + MONTHS + ',?\\s+(?:19|20)\\d{2}\\b',
    'gi'
  )
}

registerUniversal(DateOfBirthDetector)

export { DateOfBirthDetector }
