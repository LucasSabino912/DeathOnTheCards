import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card from '../components/game/Card'

describe('Card component', () => {
  it('renders title when provided', () => {
    render(
      <Card title="My Title">
        <div>content</div>
      </Card>
    )
    expect(screen.getByText('My Title')).toBeTruthy()
    expect(screen.getByText('content')).toBeTruthy()
  })

  it('does not render header when title is not provided', () => {
    render(
      <Card>
        <span>no title content</span>
      </Card>
    )
    expect(screen.queryByRole('heading')).toBeNull()
    expect(screen.getByText('no title content')).toBeTruthy()
  })

  it('applies custom className and keeps default classes', () => {
    render(
      <Card className="custom-class">child</Card>
    )
    const section = screen.getByText('child').closest('section')
    expect(section).toBeTruthy()
    expect(section.className).toContain('custom-class')
    expect(section.className).toContain('border-2')
  })
})
