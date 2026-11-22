import { createSearchTranslate } from 'client/theme-default/support/translation'
import { ref } from 'vue'

const mockTheme = ref<any>({})
const mockLocaleIndex = ref('root')

vi.mock('client/theme-default/composables/data', () => ({
  useData: () => ({
    theme: mockTheme,
    localeIndex: mockLocaleIndex
  })
}))

describe('client/theme-default/support/translation', () => {
  const defaultTranslations = {
    button: {
      buttonText: 'Search'
    },
    modal: {
      displayDetails: 'Display detailed list',
      resetButtonTitle: 'Reset search',
      backButtonTitle: 'Close search',
      noResultsText: 'No results for',
      loadingText: 'Loading search results'
    }
  }

  beforeEach(() => {
    mockTheme.value = {}
    mockLocaleIndex.value = 'root'
  })

  test('returns default translation when no options configured', () => {
    const translate = createSearchTranslate(defaultTranslations)
    expect(translate('modal.loadingText')).toBe('Loading search results')
    expect(translate('button.buttonText')).toBe('Search')
  })

  test('respects top-level translations', () => {
    mockTheme.value = {
      search: {
        provider: 'local',
        options: {
          translations: {
            modal: {
              loadingText: 'Custom loading text'
            }
          }
        }
      }
    }
    const translate = createSearchTranslate(defaultTranslations)
    expect(translate('modal.loadingText')).toBe('Custom loading text')
    expect(translate('modal.displayDetails')).toBe('Display detailed list')
  })

  test('respects locale-specific translations', () => {
    mockLocaleIndex.value = 'zh'
    mockTheme.value = {
      search: {
        provider: 'local',
        options: {
          translations: {
            modal: {
              loadingText: 'Global custom'
            }
          },
          locales: {
            zh: {
              translations: {
                modal: {
                  loadingText: '正在加载结果'
                }
              }
            }
          }
        }
      }
    }
    const translate = createSearchTranslate(defaultTranslations)
    expect(translate('modal.loadingText')).toBe('正在加载结果')
  })
})
