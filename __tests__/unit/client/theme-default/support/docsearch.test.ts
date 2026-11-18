import {
  buildAskAiConfig,
  buildSidePanelProps,
  hasAskAi,
  hasKeywordSearch,
  mergeLangFilters,
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

  describe('mergeLangFilters', () => {
    test('adds a lang filter when none is provided', () => {
      expect(mergeLangFilters(undefined, 'en')).toBe('lang:en')
    })

    test('replaces a lang filter in an AND expression', () => {
      expect(
        mergeLangFilters('type:lvl AND lang:en-US AND content:*', 'en')
      ).toBe('(type:lvl AND lang:en AND content:*) AND lang:en')
    })

    test('replaces a lang filter in an OR group', () => {
      expect(
        mergeLangFilters('(type:lvl OR lang:en-US) AND content:*', 'en')
      ).toBe('((type:lvl OR lang:en) AND content:*) AND lang:en')
    })

    test('preserves top-level OR precedence', () => {
      expect(mergeLangFilters('tag:a OR tag:b', 'en')).toBe(
        '(tag:a OR tag:b) AND lang:en'
      )
    })

    test('preserves nested groups containing only lang filters', () => {
      expect(mergeLangFilters('type:a AND (lang:en OR lang:fr)', 'de')).toBe(
        '(type:a AND (lang:de OR lang:de)) AND lang:de'
      )
    })

    test('preserves negated lang filters', () => {
      expect(mergeLangFilters('tag:a AND NOT lang:fr', 'en')).toBe(
        '(tag:a AND NOT lang:fr) AND lang:en'
      )
    })

    test('normalizes quoted lang filter values', () => {
      expect(mergeLangFilters('lang:"en US" AND tag:a', 'en')).toBe(
        '(lang:en AND tag:a) AND lang:en'
      )
    })
  })

  describe('hasKeywordSearch', () => {
    test('returns true when all credentials are provided', () => {
      expect(
        hasKeywordSearch({
          appId: 'app',
          apiKey: 'key',
          indices: ['index']
        })
      ).toBe(true)
    })

    test('returns false when any credential is missing', () => {
      expect(
        hasKeywordSearch({
          appId: undefined,
          apiKey: 'key',
          indices: ['index']
        })
      ).toBe(false)
      expect(
        hasKeywordSearch({
          appId: 'app',
          apiKey: undefined,
          indices: ['index']
        })
      ).toBe(false)
      expect(
        hasKeywordSearch({
          appId: 'app',
          apiKey: 'key',
          indices: undefined
        })
      ).toBe(false)
      expect(
        hasKeywordSearch({
          appId: 'app',
          apiKey: 'key',
          indices: []
        })
      ).toBe(false)
    })
  })

  describe('hasAskAi', () => {
    test('returns true for valid string agentId', () => {
      expect(hasAskAi('agent123')).toBe(true)
    })

    test('returns false for empty string agentId', () => {
      expect(hasAskAi('')).toBe(false)
    })

    test('returns true for object with agentId', () => {
      expect(hasAskAi({ agentId: 'agent123' } as any)).toBe(true)
    })

    test('returns false for object without agentId', () => {
      expect(hasAskAi({ agentId: null } as any)).toBe(false)
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
        indices: ['index']
      })
      expect(result.valid).toBe(true)
      expect(result.appId).toBe('app')
      expect(result.apiKey).toBe('key')
      expect(result.indices).toEqual(['index'])
    })

    test('invalidates incomplete credentials', () => {
      expect(
        validateCredentials({
          appId: undefined,
          apiKey: 'key',
          indices: ['index']
        }).valid
      ).toBe(false)
    })
  })

  describe('buildAskAiConfig', () => {
    test('builds config from string agentId', () => {
      const result = buildAskAiConfig(
        'agent123',
        {
          appId: 'app',
          apiKey: 'key',
          indices: ['index']
        } as any,
        'en'
      )
      expect(result.agentId).toBe('agent123')
      expect(result.appId).toBe('app')
      expect(result.apiKey).toBe('key')
      expect(result.indices).toBeUndefined()
    })

    test('builds config from object with overrides', () => {
      const result = buildAskAiConfig(
        {
          agentId: 'agent123',
          appId: 'custom-app',
          apiKey: 'custom-key'
        } as any,
        {
          appId: 'default-app',
          apiKey: 'default-key',
          indices: ['default-index']
        } as any,
        'en'
      )
      expect(result.agentId).toBe('agent123')
      expect(result.appId).toBe('custom-app')
      expect(result.apiKey).toBe('custom-key')
      expect(result.indices).toBeUndefined()
    })

    test('merges filters with lang by index', () => {
      const result = buildAskAiConfig(
        {
          agentId: 'agent123',
          indices: ['ai_index'],
          searchParameters: {
            ai_index: {
              filters: 'tag:docs'
            }
          }
        },
        {
          appId: 'app',
          apiKey: 'key',
          indices: ['index']
        },
        'en'
      )
      expect(result.searchParameters?.ai_index.filters).toBe(
        '(tag:docs) AND lang:en'
      )
    })

    test('adds lang filters for indices without search parameters', () => {
      const result = buildAskAiConfig(
        {
          agentId: 'agent123',
          indices: ['ai_index']
        },
        {
          appId: 'app',
          apiKey: 'key',
          indices: ['index']
        },
        'en'
      )

      expect(result.searchParameters).toEqual({
        ai_index: {
          filters: 'lang:en'
        }
      })
    })

    test('merges configured indices with search parameter indices', () => {
      const result = buildAskAiConfig(
        {
          agentId: 'agent123',
          indices: ['configured_index'],
          searchParameters: {
            parameter_index: {
              distinct: false
            }
          }
        },
        {
          appId: 'app',
          apiKey: 'key',
          indices: ['index']
        },
        'en'
      )

      expect(result.searchParameters).toEqual({
        configured_index: {
          filters: 'lang:en'
        },
        parameter_index: {
          distinct: false,
          filters: 'lang:en'
        }
      })
    })

    test('does not create index-specific search parameters for string config', () => {
      const result = buildAskAiConfig(
        'agent123',
        {
          appId: 'app',
          apiKey: 'key',
          indices: ['index']
        } as any,
        'en'
      )
      expect(result.searchParameters).toBeUndefined()
    })

    test('adds lang filters to search parameters by index', () => {
      const result = buildAskAiConfig(
        {
          agentId: 'agent123',
          searchParameters: {
            index: {
              distinct: false
            }
          }
        } as any,
        {
          appId: 'app',
          apiKey: 'key',
          indices: ['index'],
          searchParameters: {
            facetFilters: ['tag:docs']
          }
        } as any,
        'en'
      )

      expect(result.searchParameters).toEqual({
        index: {
          distinct: false,
          filters: 'lang:en'
        }
      })
      expect(result.searchParameters).not.toHaveProperty('facetFilters')
    })

    test('does not add legacy facet filters to Agent Studio config', () => {
      const result = buildAskAiConfig(
        {
          agentId: 'agent123'
        } as any,
        {
          appId: 'app',
          apiKey: 'key',
          indices: ['index'],
          searchParameters: {
            facetFilters: ['tag:docs']
          }
        } as any,
        'en'
      )

      expect(result.searchParameters).toBeUndefined()
    })
  })

  describe('buildSidePanelProps', () => {
    test('passes resolved Ask AI options to the side panel', () => {
      const result = buildSidePanelProps(
        {
          agentId: 'agent123',
          searchParameters: {
            index: {
              facetFilters: ['lang:en']
            }
          },
          suggestedQuestions: true,
          sidePanel: {
            button: {
              variant: 'inline'
            },
            panel: {
              width: 420,
              suggestedQuestions: true
            }
          }
        } as any,
        {
          appId: 'app',
          apiKey: 'key',
          indices: ['index']
        } as any
      )

      expect(result).toEqual({
        container: '#vp-docsearch-sidepanel',
        appId: 'app',
        apiKey: 'key',
        agentId: 'agent123',
        searchParameters: {
          index: {
            facetFilters: ['lang:en']
          }
        },
        suggestedQuestions: true,
        button: {
          variant: 'inline'
        },
        panel: {
          width: 420,
          suggestedQuestions: true
        }
      })
    })
  })
})
