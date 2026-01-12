import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import OtherPlayerSecrets from '../../components/game/OtherPLayerSecrets'
import * as GameContext from '../../context/GameContext'

describe('OtherPlayerSecrets component', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('returns null when no player prop is provided', () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({ gameState: { secretsFromAllPlayers: [] } })

    const { container } = render(<OtherPlayerSecrets />)
    expect(container.firstChild).toBeNull()
  })

  it('shows "Sin secretos" when the player has no secrets', () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      gameState: { secretsFromAllPlayers: [], jugadores: [] }
    })

    render(<OtherPlayerSecrets player={{ player_id: 5 }} />)

    expect(screen.getByRole('heading', { name: /Secretos/i })).toBeInTheDocument()
    expect(screen.getByText(/Sin secretos/i)).toBeInTheDocument()
  })

  it('renders secrets images, indicators and summary for hidden and revealed secrets', () => {
    const secrets = [
      { id: 's1', player_id: 10, name: 'You are the murderer', hidden: false },
      { id: 's2', player_id: 10, name: 'Unknown Secret', hidden: false },
      { id: 's3', player_id: 10, name: 'Secreto con tilde áé', hidden: true },
      { id: 's4', player_id: 99, name: 'Other', hidden: false }
    ]

    const gameState = {
      secretsFromAllPlayers: secrets,
      jugadores: [{ id: 10, name: 'PlayerTen' }]
    }

    vi.spyOn(GameContext, 'useGame').mockReturnValue({ gameState })

    render(<OtherPlayerSecrets player={{ player_id: 10 }} />)

    const img1 = screen.getByAltText('You are the murderer')
    expect(img1).toBeInTheDocument()
    expect(img1.src).toContain('/cards/secret_murderer.png')
    expect(img1.className).toContain('border-green-500')

    const img2 = screen.getByAltText('Unknown Secret')
    expect(img2).toBeInTheDocument()
    expect(img2.src).toContain('/cards/secret_back.png')

    const img3 = screen.getByAltText('Secreto oculto')
    expect(img3).toBeInTheDocument()
    expect(img3.src).toContain('/cards/secret_front.png')
    expect(img3.className).toContain('border-[#825012]')

    expect(screen.getByText(/2 revelados?/i)).toBeInTheDocument()
    expect(screen.getByText(/1 oculto/i)).toBeInTheDocument()

    expect(screen.getAllByText(/Revelado|Oculto/).length).toBeGreaterThanOrEqual(2)
  })

  it('handles missing secretsFromAllPlayers gracefully (fallback to empty array)', () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({ gameState: { jugadores: [] } })

    render(<OtherPlayerSecrets player={{ player_id: 1 }} />)

    expect(screen.getByRole('heading', { name: /Secretos/i })).toBeInTheDocument()
    expect(screen.getByText(/Sin secretos/i)).toBeInTheDocument()
  })

  it('shows correct singular/plural summary text for 1 revealed and 2 hidden', () => {
    const secrets = [
      { id: 'r1', player_id: 30, name: 'You are the murderer', hidden: false },
      { id: 'h1', player_id: 30, name: 'Hidden 1', hidden: true },
      { id: 'h2', player_id: 30, name: 'Hidden 2', hidden: true }
    ]

    vi.spyOn(GameContext, 'useGame').mockReturnValue({ gameState: { secretsFromAllPlayers: secrets, jugadores: [] } })

    render(<OtherPlayerSecrets player={{ player_id: 30 }} />)

    expect(screen.getByText(/1 revelado\b/i)).toBeInTheDocument()
    expect(screen.getByText(/2 ocultos/i)).toBeInTheDocument()
    expect(screen.getByText('•')).toBeInTheDocument()
  })
})
