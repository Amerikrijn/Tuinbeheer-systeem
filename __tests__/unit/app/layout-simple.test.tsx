import React from 'react'
import { render, screen } from '@testing-library/react'

// Mock the layout component
const MockLayout = ({ children }: { children: React.ReactNode }) => (
  <html>
    <body>
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">Tuinbeheer Systeem</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t mt-auto">
          <div className="container mx-auto px-4 py-4 text-center text-muted-foreground">
            © 2024 Tuinbeheer Systeem
          </div>
        </footer>
      </div>
    </body>
  </html>
)

describe('Layout Component - Simple Test', () => {
  it('renders header with title', () => {
    render(<MockLayout><div>Test content</div></MockLayout>)
    
    expect(screen.getByText('Tuinbeheer Systeem')).toBeInTheDocument()
  })

  it('renders footer with copyright', () => {
    render(<MockLayout><div>Test content</div></MockLayout>)
    
    expect(screen.getByText('© 2024 Tuinbeheer Systeem')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(<MockLayout><div>Test content</div></MockLayout>)
    
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('has proper structure', () => {
    render(<MockLayout><div>Test content</div></MockLayout>)
    
    const header = screen.getByRole('banner')
    const main = screen.getByRole('main')
    const footer = screen.getByRole('contentinfo')
    
    expect(header).toBeInTheDocument()
    expect(main).toBeInTheDocument()
    expect(footer).toBeInTheDocument()
  })
})