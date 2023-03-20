export interface OfflineSearchTranslations {
  button?: ButtonTranslations
  modal?: ModalTranslations
}

interface ButtonTranslations {
  buttonText?: string
  buttonAriaLabel?: string
}

interface ModalTranslations {
  displayDetails?: string
  noResultsText?: string
  footer?: FooterTranslations
}

interface FooterTranslations {
  selectText?: string
  selectKeyAriaLabel?: string
  navigateText?: string
  navigateUpKeyAriaLabel?: string
  navigateDownKeyAriaLabel?: string
}
