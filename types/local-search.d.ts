export interface LocalSearchTranslations {
  button?: ButtonTranslations
  modal?: ModalTranslations
}

interface ButtonTranslations {
  buttonText?: string
  buttonAriaLabel?: string
}

interface ModalTranslations {
  displayDetails?: string
  resetButtonTitle?: string
  backButtonTitle?: string
  noResultsText?: string
  footer?: FooterTranslations
}

interface FooterTranslations {
  selectText?: string
  selectKeyAriaLabel?: string
  navigateText?: string
  navigateUpKeyAriaLabel?: string
  navigateDownKeyAriaLabel?: string
  closeText?: string
  closeKeyAriaLabel?: string
}
