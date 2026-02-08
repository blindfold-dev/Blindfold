import { Blindfold } from '../src/client'
import { SAMPLE_ENTITY, mockFetchSuccess, restoreFetch, getFetchBody } from './helpers'

afterEach(restoreFetch)

describe('mask', () => {
  const client = new Blindfold({ apiKey: 'test-key' })

  test('should mask text', async () => {
    global.fetch = mockFetchSuccess({
      text: 'Joh***** called',
      detected_entities: [SAMPLE_ENTITY],
      entities_count: 1,
    })

    const result = await client.mask('John Doe called')

    expect(result.text).toContain('***')
    expect(result.entities_count).toBe(1)
  })

  test('should send POST to /mask', async () => {
    global.fetch = mockFetchSuccess({
      text: '',
      detected_entities: [],
      entities_count: 0,
    })

    await client.mask('test')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/mask'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  test('should pass mask config options', async () => {
    global.fetch = mockFetchSuccess({
      text: '',
      detected_entities: [],
      entities_count: 0,
    })

    await client.mask('test', {
      chars_to_show: 5,
      from_end: true,
      masking_char: '#',
    })

    const body = getFetchBody(global.fetch as jest.Mock)
    expect(body.chars_to_show).toBe(5)
    expect(body.from_end).toBe(true)
    expect(body.masking_char).toBe('#')
  })

  test('should pass score_threshold', async () => {
    global.fetch = mockFetchSuccess({
      text: '',
      detected_entities: [],
      entities_count: 0,
    })

    await client.mask('test', { score_threshold: 0.9 })

    const body = getFetchBody(global.fetch as jest.Mock)
    expect(body.score_threshold).toBe(0.9)
  })
})
