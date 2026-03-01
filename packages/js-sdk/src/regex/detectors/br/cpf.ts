// Brazilian CPF (Cadastro de Pessoa Fisica) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { brCpfChecksum } from '../../validators'

class BrCpfDetector extends RegexDetector {
  entityType = EntityType.BR_CPF
  score = 0.9
  contextKeywords = ['cpf', 'cadastro de pessoa']
  contextRequired = false

  pattern = /\b\d{3}\.?\d{3}\.?\d{3}[-.]?\d{2}\b/g
  validator = brCpfChecksum
}

registerRegion('br', BrCpfDetector)

export { BrCpfDetector }
