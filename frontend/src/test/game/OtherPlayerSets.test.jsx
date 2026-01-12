import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import OtherPlayerSets from '../../components/game/OtherPlayerSets'
import * as GameContext from '../../context/GameContext'

describe('OtherPlayerSets component', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('returns null when no player supplied', () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({ gameState: { sets: [] } })
    const { container } = render(<OtherPlayerSets />)
    expect(container.firstChild).toBeNull()
  })

  it('shows "Sin sets jugados" when player has no sets', () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({ gameState: { sets: [], jugadores: [] } })
    render(<OtherPlayerSets player={{ player_id: 5 }} />)

    expect(screen.getByRole('heading', { name: /Sets de Detective/i })).toBeInTheDocument()
    expect(screen.getByText(/Sin sets jugados/i)).toBeInTheDocument()
  })

  it('handles undefined gameState.sets (optional chaining fallback)', () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({ gameState: { jugadores: [] } })
    render(<OtherPlayerSets player={{ player_id: 99 }} />)
    expect(screen.getByRole('heading', { name: /Sets de Detective/i })).toBeInTheDocument()
    expect(screen.getByText(/Sin sets jugados/i)).toBeInTheDocument()
  })

  it('renders a single set with one card and singular labels', () => {
    const sets = [
      {
        owner_id: 7,
        position: 1,
        set_type: 'mystery',
        count: 1,
        cards: [
          { id: 'c1', img_src: '/img/card1.png', name: 'Card One', description: 'Desc 1' }
        ]
      }
    ]

    vi.spyOn(GameContext, 'useGame').mockReturnValue({ gameState: { sets, jugadores: [] } })

    render(<OtherPlayerSets player={{ player_id: 7 }} />)

    expect(screen.getByRole('heading', { name: /Sets de Detective/i })).toBeInTheDocument()
    expect(screen.getByText(/mystery/i)).toBeInTheDocument()

    const img = screen.getByAltText('Card One')
    expect(img).toBeInTheDocument()
    expect(img.src).toContain('/img/card1.png')
    expect(screen.getByText(/Desc 1/)).toBeInTheDocument()

    expect(screen.getByText(/1 carta\b/i)).toBeInTheDocument()
    expect(screen.getByText(/1 set jugado/i)).toBeInTheDocument()
  })

  it('renders multiple sets and plural labels correctly', () => {
    const sets = [
      {
        owner_id: 11,
        position: 1,
        set_type: 'alpha',
        count: 2,
        cards: [
          { id: 'a1', img_src: '/img/a1.png', name: 'A1' },
          { id: 'a2', img_src: '/img/a2.png', name: 'A2' }
        ]
      },
      {
        owner_id: 11,
        position: 2,
        set_type: 'beta',
        count: 1,
        cards: [
          { id: 'b1', img_src: '/img/b1.png', name: 'B1' }
        ]
      }
    ]

    vi.spyOn(GameContext, 'useGame').mockReturnValue({ gameState: { sets, jugadores: [] } })

    render(<OtherPlayerSets player={{ player_id: 11 }} />)

    expect(screen.getByText(/alpha/i)).toBeInTheDocument()
    expect(screen.getByText(/beta/i)).toBeInTheDocument()

    expect(screen.getByAltText('A1')).toBeInTheDocument()
    expect(screen.getByAltText('A2')).toBeInTheDocument()
    expect(screen.getByAltText('B1')).toBeInTheDocument()

    expect(screen.getByText(/2 cartas/i)).toBeInTheDocument()
    expect(screen.getByText(/2 sets jugados/i)).toBeInTheDocument()
  })
})
