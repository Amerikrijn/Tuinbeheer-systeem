import React from 'react'
import { render, screen } from '@testing-library/react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

describe('Tabs Components - Simplified Tests', () => {
  it('should render basic tabs structure', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )
    
    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Tab 2')).toBeInTheDocument()
  })

  it('should render tabs with proper roles', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">First Tab</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">First Content</TabsContent>
      </Tabs>
    )
    
    const tablist = screen.getByRole('tablist')
    const tab = screen.getByRole('tab')
    const tabpanel = screen.getByRole('tabpanel')
    
    expect(tablist).toBeInTheDocument()
    expect(tab).toBeInTheDocument()
    expect(tabpanel).toBeInTheDocument()
  })

  it('should handle multiple tabs', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>
    )
    
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(3)
    expect(tabs[0]).toHaveTextContent('Tab 1')
    expect(tabs[1]).toHaveTextContent('Tab 2')
    expect(tabs[2]).toHaveTextContent('Tab 3')
  })

  it('should render tab content', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <div>Custom content</div>
        </TabsContent>
      </Tabs>
    )
    
    expect(screen.getByText('Custom content')).toBeInTheDocument()
  })

  it('should maintain accessibility structure', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Accessible Tab</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Accessible Content</TabsContent>
      </Tabs>
    )
    
    const tab = screen.getByRole('tab')
    const tabpanel = screen.getByRole('tabpanel')
    
    expect(tab).toHaveAttribute('aria-selected')
    expect(tabpanel).toHaveAttribute('aria-labelledby')
  })
})