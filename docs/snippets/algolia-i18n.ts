import { defineConfig } from 'vitepress'

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'algolia',
      options: {
        appId: '...',
        apiKey: '...',
        indices: ['...'],
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索',
                buttonAriaLabel: '搜索'
              },
              modal: {
                searchBox: {
                  clearButtonTitle: '清除',
                  clearButtonAriaLabel: '清除查询',
                  closeButtonText: '关闭',
                  closeButtonAriaLabel: '关闭',
                  placeholderText: '搜索文档或向 AI 提问',
                  placeholderTextAskAi: '再问一个问题...',
                  placeholderTextAskAiStreaming: '正在回答...',
                  searchInputLabel: '搜索',
                  backToKeywordSearchButtonText: '返回关键词搜索',
                  backToKeywordSearchButtonAriaLabel: '返回关键词搜索',
                  newConversationPlaceholder: '提问',
                  conversationHistoryTitle: '我的对话历史',
                  startNewConversationText: '开始新的对话',
                  viewConversationHistoryText: '对话历史',
                  threadDepthErrorPlaceholder: '对话已达上限'
                },
                facets: {
                  defaultValueLabel: '全部',
                  facetMenuTriggerAriaLabel: '已选择',
                  clearAllLabel: '清除全部',
                  facetsAriaLabel: '搜索筛选条件',
                  selectedFacetsAriaLabel: '已选择的搜索筛选条件',
                  clearFacetAriaLabel: '清除筛选条件：'
                },
                newConversation: {
                  newConversationTitle: '我今天能帮你什么？',
                  newConversationDescription:
                    '我会搜索你的文档，快速帮你找到设置指南、功能细节和故障排除提示。'
                },
                footer: {
                  selectText: '选择',
                  submitQuestionText: '提交问题',
                  selectKeyAriaLabel: '回车键',
                  navigateText: '导航',
                  navigateUpKeyAriaLabel: '向上箭头',
                  navigateDownKeyAriaLabel: '向下箭头',
                  closeText: '关闭',
                  backToSearchText: '返回搜索',
                  closeKeyAriaLabel: 'Esc 键',
                  poweredByText: '由…提供支持'
                },
                errorScreen: {
                  titleText: '无法获取结果',
                  helpText: '你可能需要检查网络连接。'
                },
                startScreen: {
                  recentSearchesTitle: '最近',
                  noRecentSearchesText: '暂无最近搜索',
                  saveRecentSearchButtonTitle: '保存此搜索',
                  removeRecentSearchButtonTitle: '从历史记录中移除此搜索',
                  favoriteSearchesTitle: '收藏',
                  removeFavoriteSearchButtonTitle: '从收藏中移除此搜索',
                  recentConversationsTitle: '最近对话',
                  removeRecentConversationButtonTitle: '从历史记录中移除此对话'
                },
                noResultsScreen: {
                  noResultsText: '未找到相关结果',
                  suggestedQueryText: '尝试搜索',
                  reportMissingResultsText: '认为此查询应该有结果？',
                  reportMissingResultsLinkText: '告诉我们。'
                },
                resultsScreen: {
                  askAiPlaceholder: '询问 AI：',
                  noResultsAskAiPlaceholder: '文档里没找到？让 Ask AI 帮忙：',
                  resultsSectionTitle: '搜索结果',
                  askAiResultsTitle: '询问 AI 助手',
                  recentConversationTimestampFallback: '不久前',
                  resultBadgeLabelText: '类别'
                },
                askAiScreen: {
                  disclaimerText: '回答由 AI 生成，可能会出错。请核实。',
                  relatedSourcesText: '相关来源',
                  thinkingText: '思考中...',
                  copyButtonText: '复制',
                  copyButtonCopiedText: '已复制！',
                  copyButtonTitle: '复制',
                  likeButtonTitle: '喜欢',
                  dislikeButtonTitle: '不喜欢',
                  thanksForFeedbackText: '感谢你的反馈！',
                  preToolCallText: '搜索中...',
                  duringToolCallText: '搜索中...',
                  afterToolCallText: '已搜索',
                  stoppedStreamingText: '你已停止此回复',
                  errorTitleText: '聊天错误',
                  startNewConversationButtonText: '开始新的对话',
                  relatedSourcesTextPlural: '相关来源',
                  savedMemoryToolResultText: '已保存到记忆',
                  memoryToolResultText: '已使用记忆增强结果',
                  feedbackPanelTitle: '哪里出了问题？（可选）',
                  feedbackDetailsPlaceholder: '请分享更多细节...',
                  feedbackDisclaimerText: '反馈中将包含此对话的副本。',
                  feedbackSubmitButtonText: '提交',
                  feedbackCloseButtonTitle: '关闭',
                  feedbackTagIncorrect: '不正确或不完整',
                  feedbackTagNotWhatIAsked: '不是我想问的',
                  feedbackTagSlowOrBuggy: '响应缓慢或存在故障',
                  feedbackTagStyleOrTone: '风格或语气',
                  feedbackTagSafetyOrLegal: '安全或法律问题',
                  feedbackTagOther: '其他',
                  threadDepthExceededMessage:
                    '为确保回答准确，此对话现已关闭。',
                  suggestedPromptsTitleText: '推荐问题'
                }
              }
            },
            askAi: {
              sidePanel: {
                button: {
                  translations: {
                    buttonText: '询问 AI',
                    buttonAriaLabel: '询问 AI'
                  }
                },
                panel: {
                  translations: {
                    header: {
                      title: '询问 AI',
                      conversationHistoryTitle: '我的对话历史',
                      newConversationText: '开始新的对话',
                      viewConversationHistoryText: '对话历史'
                    },
                    promptForm: {
                      promptPlaceholderText: '提问',
                      promptAnsweringText: '正在回答...',
                      promptAskAnotherQuestionText: '再问一个问题',
                      promptDisclaimerText: '回答由 AI 生成，可能会出错。',
                      promptLabelText: '按回车发送，Shift+回车换行。',
                      promptAriaLabelText: '问题输入',
                      startNewConversationButtonText: '开始新的对话',
                      blockingErrorContinueText: '以继续。',
                      blockingErrorFallbackText: '此对话无法继续。'
                    },
                    conversationScreen: {
                      preToolCallText: '搜索中...',
                      searchingText: '搜索中...',
                      toolCallResultText: '已搜索',
                      conversationDisclaimer:
                        '回答由 AI 生成，可能会出错。请核实。',
                      reasoningText: '推理中...',
                      thinkingText: '思考中...',
                      relatedSourcesText: '相关来源',
                      stoppedStreamingText: '你已停止此回复',
                      copyButtonText: '复制',
                      copyButtonCopiedText: '已复制！',
                      likeButtonTitle: '喜欢',
                      dislikeButtonTitle: '不喜欢',
                      thanksForFeedbackText: '感谢你的反馈！',
                      errorTitleText: '聊天错误',
                      relatedSourcesTextPlural: '相关来源',
                      savedMemoryToolResultText: '已保存到记忆',
                      memoryToolResultText: '已使用记忆增强结果',
                      feedbackPanelTitle: '哪里出了问题？（可选）',
                      feedbackDetailsPlaceholder: '请分享更多细节...',
                      feedbackDisclaimerText: '反馈中将包含此对话的副本。',
                      feedbackSubmitButtonText: '提交',
                      feedbackCloseButtonTitle: '关闭',
                      feedbackTagIncorrect: '不正确或不完整',
                      feedbackTagNotWhatIAsked: '不是我想问的',
                      feedbackTagSlowOrBuggy: '响应缓慢或存在故障',
                      feedbackTagStyleOrTone: '风格或语气',
                      feedbackTagSafetyOrLegal: '安全或法律问题',
                      feedbackTagOther: '其他',
                      suggestedPromptsTitleText: '推荐问题'
                    },
                    newConversationScreen: {
                      titleText: '我今天能帮你什么？',
                      introductionText:
                        '我会搜索你的文档，快速帮你找到设置指南、功能细节和故障排除提示。'
                    },
                    logo: {
                      poweredByText: '由…提供支持'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
})
