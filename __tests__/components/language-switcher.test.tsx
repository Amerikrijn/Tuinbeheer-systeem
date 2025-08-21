import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { LanguageSwitcher } from '@/components/language-switcher'

let language = 'nl'
const setLanguage = vi.fn((newLang: string) => {
  language = newLang
})

vi.mock('@/hooks/use-language', () => ({
  useLanguage: () => ({ language, setLanguage })
}))

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    language = 'nl'
    setLanguage.mockClear()
  })

  it('renders and toggles language on click', () => {
    const { rerender } = render(<LanguageSwitcher />)

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('EN')

    fireEvent.click(button)
    expect(setLanguage).toHaveBeenCalledWith('en')

    rerender(<LanguageSwitcher />)
    const buttonAfter = screen.getByRole('button')
    expect(buttonAfter).toHaveTextContent('NL')

    fireEvent.click(buttonAfter)
    expect(setLanguage).toHaveBeenLastCalledWith('nl')
  })
})
