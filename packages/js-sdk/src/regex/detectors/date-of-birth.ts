// Date of birth detector (context-required)

import { RegexDetector } from '../base'
import { EntityType } from '../entities'
import { registerUniversal } from '../registry'

const MONTHS =
  '(?:january|february|march|april|may|june|july|august|'
  + 'september|october|november|december|'
  + 'jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)'

class DateOfBirthDetector extends RegexDetector {
  entityType = EntityType.DATE_OF_BIRTH
  score = 0.75
  contextKeywords = [
    'born', 'dob', 'date of birth', 'birthday', 'birthdate', 'd.o.b',
    'birth date',
  ]
  contextRequired = true
  contextWindow = 50

  // Multiple date formats
  pattern = new RegExp(
    // MM/DD/YYYY or DD/MM/YYYY or MM-DD-YYYY
    '\\b(?:0?[1-9]|1[0-2])[/\\-.](?:0?[1-9]|[12]\\d|3[01])[/\\-.](?:19|20)\\d{2}\\b'
    + '|'
    // YYYY-MM-DD (ISO)
    + '\\b(?:19|20)\\d{2}[/\\-.](?:0?[1-9]|1[0-2])[/\\-.](?:0?[1-9]|[12]\\d|3[01])\\b'
    + '|'
    // Month DD, YYYY
    + '\\b' + MONTHS + '\\s+\\d{1,2},?\\s+(?:19|20)\\d{2}\\b',
    'gi'
  )
}

registerUniversal(DateOfBirthDetector)

export { DateOfBirthDetector }
