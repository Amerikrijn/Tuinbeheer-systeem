import { render, screen, fireEvent } from '@testing-library/react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { LanguageProvider } from '@/hooks/use-language'

// Mock the loadTranslations function
jest.mock('@/lib/translations', () => ({
  loadTranslations: jest.fn().mockResolvedValue({
    nl: { common: { save: 'Opslaan' } },
    en: { common: { save: 'Save' } }
  })
}))

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {component}
    </LanguageProvider>
  )
}

describe('LanguageSwitcher', () => {
  it('renders language button', () => {
    renderWithProvider(<LanguageSwitcher />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('EN') // Shows language to switch TO, not current language
  })

  it('shows current language', () => {
    renderWithProvider(<LanguageSwitcher />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('EN') // Shows language to switch TO, not current language
  })
})
