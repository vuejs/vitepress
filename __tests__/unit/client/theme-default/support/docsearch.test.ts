import {
  buildAskAiConfig,
  hasAskAi,
  hasKeywordSearch,
  mergeLangFacetFilters,
  validateCredentials
} from 'client/theme-default/support/docsearch'

describe('client/theme-default/support/docsearch', () => {
  describe('mergeLangFacetFilters', () => {
    test('adds a lang facet filter when none is provided', () => {
      expect(mergeLangFacetFilters(undefined, 'en')).toEqual(['lang:en'])
    })

    test('replaces existing lang facet filters', () => {
      expect(mergeLangFacetFilters('lang:fr', 'en')).toEqual(['lang:en'])
      expect(mergeLangFacetFilters(['foo', 'lang:fr'], 'en')).toEqual([
        'foo',
        'lang:en'
      ])
    })

    test('handles nested facet filters (OR conditions)', () => {
      expect(
        mergeLangFacetFilters([['tag:foo', 'tag:bar'], 'lang:fr'], 'en')
      ).toEqual([['tag:foo', 'tag:bar'], 'lang:en'])
    })

    test('removes empty nested arrays', () => {
      expect(mergeLangFacetFilters([['lang:fr'], 'other'], 'en')).toEqual([
        'other',
        'lang:en'
      ])
    })

    test('handles multiple lang filters in nested arrays', () => {
      expect(
        mergeLangFacetFilters([['lang:fr', 'tag:foo'], 'bar'], 'en')
      ).toEqual([['tag:foo'], 'bar', 'lang:en'])
    })
  })

  describe('hasKeywordSearch', () => {
    test('returns true when all credentials are provided', () => {
      expect(
        hasKeywordSearch({
          appId: 'app',
          apiKey: 'key',
          indexName: 'index'
        })
      ).toBe(true)
    })

    test('returns false when any credential is missing', () => {
      expect(
        hasKeywordSearch({
          appId: undefined,
          apiKey: 'key',
          indexName: 'index'
        })
      ).toBe(false)
      expect(
        hasKeywordSearch({
          appId: 'app',
          apiKey: undefined,
          indexName: 'index'
        })
      ).toBe(false)
      expect(
        hasKeywordSearch({
          appId: 'app',
          apiKey: 'key',
          indexName: undefined
        })
      ).toBe(false)
    })
  })

  describe('hasAskAi', () => {
    test('returns true for valid string assistantId', () => {
      expect(hasAskAi('assistant123')).toBe(true)
    })

    test('returns false for empty string assistantId', () => {
      expect(hasAskAi('')).toBe(false)
    })

    test('returns true for object with assistantId', () => {
      expect(hasAskAi({ assistantId: 'assistant123' } as any)).toBe(true)
    })

    test('returns false for object without assistantId', () => {
      expect(hasAskAi({ assistantId: null } as any)).toBe(false)
      expect(hasAskAi({} as any)).toBe(false)
    })

    test('returns false for undefined', () => {
      expect(hasAskAi(undefined)).toBe(false)
    })
  })

  describe('validateCredentials', () => {
    test('validates complete credentials', () => {
      const result = validateCredentials({
        appId: 'app',
        apiKey: 'key',
        indexName: 'index'
      })
      expect(result.valid).toBe(true)
      expect(result.appId).toBe('app')
      expect(result.apiKey).toBe('key')
      expect(result.indexName).toBe('index')
    })

    test('invalidates incomplete credentials', () => {
      expect(
        validateCredentials({
          appId: undefined,
          apiKey: 'key',
          indexName: 'index'
        }).valid
      ).toBe(false)
    })
  })

  describe('buildAskAiConfig', () => {
    test('builds config from string assistantId', () => {
      const result = buildAskAiConfig(
        'assistant123',
        {
          appId: 'app',
          apiKey: 'key',
          indexName: 'index'
        } as any,
        'en'
      )
      expect(result.assistantId).toBe('assistant123')
      expect(result.appId).toBe('app')
      expect(result.apiKey).toBe('key')
      expect(result.indexName).toBe('index')
    })

    test('builds config from object with overrides', () => {
      const result = buildAskAiConfig(
        {
          assistantId: 'assistant123',
          appId: 'custom-app',
          apiKey: 'custom-key',
          indexName: 'custom-index'
        } as any,
        {
          appId: 'default-app',
          apiKey: 'default-key',
          indexName: 'default-index'
        } as any,
        'en'
      )
      expect(result.assistantId).toBe('assistant123')
      expect(result.appId).toBe('custom-app')
      expect(result.apiKey).toBe('custom-key')
      expect(result.indexName).toBe('custom-index')
    })

    test('merges facet filters with lang', () => {
      const result = buildAskAiConfig(
        {
          assistantId: 'assistant123',
          searchParameters: {
            facetFilters: ['tag:docs']
          }
        } as any,
        {
          appId: 'app',
          apiKey: 'key',
          indexName: 'index'
        } as any,
        'en'
      )
      expect(result.searchParameters?.facetFilters).toContain('tag:docs')
      expect(result.searchParameters?.facetFilters).toContain('lang:en')
    })

    test('always adds lang facet filter to searchParameters', () => {
      const result = buildAskAiConfig(
        'assistant123',
        {
          appId: 'app',
          apiKey: 'key',
          indexName: 'index'
        } as any,
        'en'
      )
      expect(result.searchParameters?.facetFilters).toEqual(['lang:en'])
    })
  })
})
