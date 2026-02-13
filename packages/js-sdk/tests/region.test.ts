import { Blindfold } from '../src/client'
import { mockFetchSuccess, restoreFetch } from './helpers'

afterEach(restoreFetch)

describe('Region support', () => {
  test('should use default URL when no region specified', () => {
    const client = new Blindfold({ apiKey: 'test-key' })
    expect(client).toBeDefined()
  })

  test('should resolve EU region to eu-api URL', async () => {
    const client = new Blindfold({ apiKey: 'test-key', region: 'eu' })
    global.fetch = mockFetchSuccess({
      text: '',
      mapping: {},
      detected_entities: [],
      entities_count: 0,
    })

    await client.tokenize('test')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('eu-api.blindfold.dev'),
      expect.anything()
    )
  })

  test('should resolve US region to us-api URL', async () => {
    const client = new Blindfold({ apiKey: 'test-key', region: 'us' })
    global.fetch = mockFetchSuccess({
      text: '',
      mapping: {},
      detected_entities: [],
      entities_count: 0,
    })

    await client.tokenize('test')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('us-api.blindfold.dev'),
      expect.anything()
    )
  })

  test('should throw on invalid region', () => {
    expect(() => {
      // @ts-expect-error testing invalid region
      new Blindfold({ apiKey: 'test-key', region: 'ap' })
    }).toThrow("Invalid region 'ap'")
  })

  test('should use explicit baseUrl over region', async () => {
    const client = new Blindfold({
      apiKey: 'test-key',
      baseUrl: 'https://custom.api.dev/v1',
      region: 'us',
    })
    global.fetch = mockFetchSuccess({
      text: '',
      mapping: {},
      detected_entities: [],
      entities_count: 0,
    })

    await client.tokenize('test')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('custom.api.dev'),
      expect.anything()
    )
  })
})
