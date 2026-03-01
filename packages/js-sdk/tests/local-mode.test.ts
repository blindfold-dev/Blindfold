import { Blindfold } from '../src/client'

describe('Blindfold local mode - policy resolution', () => {
  const client = new Blindfold()

  test('policy resolves to correct entities', async () => {
    const result = await client.detect('Email john@acme.com, SSN 123-45-6789', {
      policy: 'basic',
    })
    const types = result.detected_entities.map((e) => e.type)
    expect(types).toContain('Email Address')
    // basic policy includes Email Address but not Social Security Number
    expect(types).not.toContain('Social Security Number')
  })

  test('explicit entities override policy', async () => {
    const result = await client.detect('Email john@acme.com, SSN 123-45-6789', {
      policy: 'basic',
      entities: ['Social Security Number'],
    })
    const types = result.detected_entities.map((e) => e.type)
    expect(types).toContain('Social Security Number')
    expect(types).not.toContain('Email Address')
  })

  test('unknown policy warns and detects all entities', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation()
    const result = await client.detect('Email john@acme.com, SSN 123-45-6789', {
      policy: 'nonexistent_policy',
    })
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Unknown policy 'nonexistent_policy'")
    )
    expect(result.entities_count).toBeGreaterThanOrEqual(2)
    warnSpy.mockRestore()
  })

  test('gdpr_eu policy includes IP Address', async () => {
    const result = await client.detect('Server at 192.168.1.100', {
      policy: 'gdpr_eu',
    })
    const types = result.detected_entities.map((e) => e.type)
    expect(types).toContain('IP Address')
  })

  test('policy threshold applies when no explicit threshold', async () => {
    // basic policy has threshold 0.30 - high-confidence matches should pass
    const result = await client.detect('Email john@acme.com', { policy: 'basic' })
    expect(result.entities_count).toBeGreaterThanOrEqual(1)
  })

  test('explicit score_threshold overrides policy threshold', async () => {
    const result = await client.detect('Email john@acme.com', {
      policy: 'basic',
      score_threshold: 0.99,
    })
    // With 0.99 threshold, most regex matches should be filtered
    expect(result.entities_count).toBe(0)
  })
})

describe('Blindfold local mode - method-level entities', () => {
  const client = new Blindfold()

  test('detect filters by entities', async () => {
    const result = await client.detect('Email john@acme.com, SSN 123-45-6789', {
      entities: ['Email Address'],
    })
    expect(result.entities_count).toBe(1)
    expect(result.detected_entities[0].type).toBe('Email Address')
  })

  test('tokenize filters by entities', async () => {
    const result = await client.tokenize('Email john@acme.com, SSN 123-45-6789', {
      entities: ['Email Address'],
    })
    expect(result.text).toContain('<Email Address_1>')
    expect(result.text).toContain('123-45-6789')
  })

  test('redact filters by entities', async () => {
    const result = await client.redact('Email john@acme.com, SSN 123-45-6789', {
      entities: ['Email Address'],
    })
    expect(result.text).not.toContain('john@acme.com')
    expect(result.text).toContain('123-45-6789')
  })

  test('mask filters by entities', async () => {
    const result = await client.mask('Email john@acme.com, SSN 123-45-6789', {
      entities: ['Email Address'],
    })
    expect(result.text).toContain('*')
    expect(result.text).toContain('123-45-6789')
  })

  test('hash filters by entities', async () => {
    const result = await client.hash('Email john@acme.com, SSN 123-45-6789', {
      entities: ['Email Address'],
    })
    expect(result.text).toContain('HASH_')
    expect(result.text).toContain('123-45-6789')
  })
})

describe('Blindfold local mode - region warning', () => {
  test('warns when region is set in local mode', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation()
    new Blindfold({ region: 'eu' })
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("region='eu' has no effect"))
    warnSpy.mockRestore()
  })

  test('does not warn when API key is set', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation()
    new Blindfold({ apiKey: 'bf_test_key', region: 'eu' })
    expect(warnSpy).not.toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})
