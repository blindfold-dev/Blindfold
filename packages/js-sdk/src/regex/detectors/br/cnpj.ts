// Brazilian CNPJ (Cadastro Nacional de Pessoa Juridica) detector

import { RegexDetector } from '../../base'
import { EntityType } from '../../entities'
import { registerRegion } from '../../registry'
import { brCnpjChecksum } from '../../validators'

class BrCnpjDetector extends RegexDetector {
  entityType = EntityType.BR_CNPJ
  score = 0.90
  contextKeywords = [
    'cnpj', 'cadastro nacional',
  ]
  contextRequired = false

  pattern = /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}[-.]?\d{2}\b/g
  validator = brCnpjChecksum
}

registerRegion('br', BrCnpjDetector)

export { BrCnpjDetector }
