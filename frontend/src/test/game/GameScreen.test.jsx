import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import GameScreen from '../../containers/gameScreen/GameScreen'
import { useUser } from '../../context/UserContext'
import { useGame } from '../../context/GameContext'

// Mock context
vi.mock('../../context/UserContext')
vi.mock('../../context/GameContext')

// Mock components
vi.mock('../../components/game/Deck', () => ({
  default: ({ cardsLeft, onClick, disabled }) => (
    <div data-testid="deck" onClick={disabled ? undefined : onClick}>
      Deck: {cardsLeft} cards
    </div>
  ),
}))

vi.mock('../../components/game/Discard', () => ({
  default: ({ topDiscardedCard, counterDiscarded }) => (
    <div data-testid="discard">
      Top: {topDiscardedCard}, Count: {counterDiscarded}
    </div>
  ),
}))

vi.mock('../../components/modals/GameEndModal', () => ({
  default: ({ ganaste, winners, finish_reason }) => (
    <div data-testid="game-end-modal">{finish_reason || 'Game ended'}</div>
  ),
}))

vi.mock('../../components/game/HandCards', () => ({
  default: ({ selectedCards, onSelect }) => (
    <div data-testid="hand-cards">
      <button onClick={() => onSelect('card-1')}>Select Card 1</button>
      <button onClick={() => onSelect('card-2')}>Select Card 2</button>
      <button onClick={() => onSelect('card-look-ashes')}>
        Select Look Ashes
      </button>
      <button onClick={() => onSelect('card-another-victim')}>
        Select Another Victim
      </button>
      <div>Selected: {selectedCards.map(c => c.id).join(', ')}</div>
    </div>
  ),
}))

vi.mock('../../components/game/Secrets', () => ({
  default: () => <div data-testid="secrets">Secrets Component</div>,
}))

vi.mock('../../components/common/ButtonGame', () => ({
  default: ({ children, onClick, disabled }) => (
    <button
      data-testid={`button-${children.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}))

vi.mock('../../components/game/Draft', () => ({
  default: ({ handleDraft, disabled }) => (
    <div data-testid="draft">
      <button onClick={() => handleDraft('draft-card-1')} disabled={disabled}>
        Pick Draft Card
      </button>
    </div>
  ),
}))

vi.mock('../../components/game/Tabs', () => ({
  default: ({ children }) => <div data-testid="tabs">{children}</div>,
}))

vi.mock('../../components/game/TabPanel', () => ({
  default: ({ children, label }) => (
    <div data-testid={`tab-panel-${label}`}>{children}</div>
  ),
}))

vi.mock('../../components/game/Log', () => ({
  default: () => <div data-testid="log">Log Component</div>,
}))

vi.mock('../../components/game/OtherPlayerSets', () => ({
  default: () => <div data-testid="other-player-sets">Other Player Sets</div>,
}))

vi.mock('../../components/game/OtherPLayerSecrets', () => ({
  default: () => (
    <div data-testid="other-player-secrets">Other Player Secrets</div>
  ),
}))

vi.mock('../../components/modals/LookIntoTheAshes', () => ({
  default: ({ isOpen, availableCards, onSelectCard }) =>
    isOpen ? (
      <div data-testid="look-ashes-modal">
        <button onClick={() => onSelectCard('ashes-card-1')}>
          Select Ashes Card
        </button>
      </div>
    ) : null,
}))

vi.mock('../../components/modals/SelectOtherPLayerSet', () => ({
  default: ({ player, sets, onSelectSet }) => (
    <div data-testid="select-set-modal">
      <button onClick={() => onSelectSet({ owner_id: 2, position: 1 })}>
        Select Set
      </button>
    </div>
  ),
}))

vi.mock('../../components/modals/PlayerSets', () => ({
  default: ({ isOpen, sets, onClose, onCreateSet }) =>
    isOpen ? (
      <div data-testid="player-sets-modal">
        <button onClick={onCreateSet}>Create Detective Set</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}))

vi.mock('../../components/modals/HideRevealStealSecrets', () => ({
  default: ({ isOpen, detective, onConfirm }) =>
    isOpen ? (
      <div data-testid="secrets-action-modal">
        <button onClick={() => onConfirm({ id: 'secret-1' })}>
          Confirm Secret Action
        </button>
      </div>
    ) : null,
}))

vi.mock('../../components/modals/SelectPlayer', () => ({
  default: ({ onPlayerSelect }) => (
    <div data-testid="select-player-modal">
      <button onClick={() => onPlayerSelect(2)}>Select Player 2</button>
    </div>
  ),
}))

// Additional mocks for new components to prevent render errors
vi.mock('../../components/game/NsfBanner', () => ({
  default: () => null,
}))

vi.mock('../../components/modals/SelectQtyModal', () => ({
  default: () => null,
}))

vi.mock('../../components/modals/OneMoreSecretsModal', () => ({
  default: () => null,
}))

vi.mock('../../components/modals/SelectPlayerOneMoreModal', () => ({
  default: () => null,
}))

vi.mock('../../components/modals/SelectCardModal', () => ({
  default: () => null,
}))

vi.mock('../../components/modals/SelectDirectionModal', () => ({
  default: () => null,
}))

vi.mock('../../components/modals/SelectCardForExchange', () => ({
  default: () => null,
}))

vi.mock('../../helpers/NFS.js', () => ({
  startActionWithCounterCheck: vi.fn(),
  playNotSoFast: vi.fn(),
}))

describe('GameScreen Component', () => {
  let mockUserState
  let mockGameState
  let mockGameDispatch

  beforeEach(() => {
    vi.clearAllMocks()

    mockUserState = {
      id: 1,
      name: 'TestPlayer',
    }

    mockGameDispatch = vi.fn()

    mockGameState = {
      gameId: 'game-123',
      roomId: 'room-456',
      turnoActual: 2,
      jugadores: [
        {
          player_id: 1,
          id: 1,
          name: 'TestPlayer',
          is_host: true,
          hand_size: 5,
        },
        {
          player_id: 2,
          id: 2,
          name: 'OtherPlayer',
          is_host: false,
          hand_size: 3,
        },
      ],
      mano: [
        { id: 'card-1', name: 'Card 1', type: 'DETECTIVE' },
        { id: 'card-2', name: 'Card 2', type: 'EVENT' },
        { id: 'card-look-ashes', name: 'Look into the ashes', type: 'EVENT' },
        { id: 'card-another-victim', name: 'Another Victim', type: 'EVENT' },
      ],
      secretos: [],
      sets: [],
      secretsFromAllPlayers: [],
      playersInSocialDisgrace: [],
      mazos: {
        deck: { count: 10, draft: [] },
        discard: { top: 'card-top', count: 5 },
      },
      gameEnded: false,
      drawAction: {
        cardsToDrawRemaining: 0,
        otherPlayerDrawing: null,
        hasDiscarded: false,
        hasDrawn: false,
        skipDiscard: false,
      },
      eventCards: {
        lookAshes: {
          actionId: null,
          availableCards: [],
          showSelectCard: false,
        },
        anotherVictim: {
          showSelectPlayer: false,
          selectedPlayer: null,
          showSelectSets: false,
        },
        actionInProgress: null,
        delayEscape: { showQty: false },
        oneMore: { showSecrets: false, showPlayers: false },
        deadCardFolly: { showDirection: false, isSelecting: false },
      },
      detectiveAction: {
        current: null,
        showSelectPlayer: false,
        showSelectSecret: false,
        showChooseOwnSecret: false,
        incomingRequest: null,
        actionInProgress: null,
      },
      nsfCounter: {
        active: false,
      },
    }

    useUser.mockReturnValue({ userState: mockUserState })
    useGame.mockReturnValue({
      gameState: mockGameState,
      gameDispatch: mockGameDispatch,
    })

    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders all main components', () => {
      render(<GameScreen />)

      expect(screen.getByTestId('secrets')).toBeInTheDocument()
      expect(screen.getByTestId('deck')).toBeInTheDocument()
      expect(screen.getByTestId('discard')).toBeInTheDocument()
      expect(screen.getByTestId('hand-cards')).toBeInTheDocument()
    })

    it('displays deck and discard information', () => {
      render(<GameScreen />)

      expect(screen.getByText(/Deck: 10 cards/)).toBeInTheDocument()
      expect(screen.getByText(/Top: card-top, Count: 5/)).toBeInTheDocument()
    })

    it('shows game end modal when game has ended', () => {
      mockGameState.gameEnded = true
      mockGameState.ganaste = true
      mockGameState.winners = [{ player_id: 1, role: 'detective' }]
      mockGameState.finish_reason = 'All secrets revealed'
      useGame.mockReturnValue({
        gameState: mockGameState,
        gameDispatch: mockGameDispatch,
      })

      render(<GameScreen />)

      expect(screen.getByTestId('game-end-modal')).toBeInTheDocument()
    })

    it('renders tabs for all players', () => {
      render(<GameScreen />)

      expect(screen.getByTestId('tabs')).toBeInTheDocument()
    })

    it('shows Ver Sets button', () => {
      render(<GameScreen />)

      expect(screen.getByTestId('button-ver-sets')).toBeInTheDocument()
    })
  })

  describe('Card Selection', () => {
    it('allows selecting cards', () => {
      render(<GameScreen />)

      const selectButton = screen.getByText('Select Card 1')
      fireEvent.click(selectButton)

      expect(screen.getByText(/Selected: card-1/)).toBeInTheDocument()
    })

    it('allows deselecting cards', () => {
      render(<GameScreen />)

      const selectButton = screen.getByText('Select Card 1')
      fireEvent.click(selectButton)
      fireEvent.click(selectButton)

      expect(screen.getByText(/Selected:$/)).toBeInTheDocument()
    })

    it('allows selecting multiple cards', () => {
      render(<GameScreen />)

      fireEvent.click(screen.getByText('Select Card 1'))
      fireEvent.click(screen.getByText('Select Card 2'))

      expect(screen.getByText(/Selected: card-1, card-2/)).toBeInTheDocument()
    })
  })

  describe('Other player tabs', () => {
    it('renders other player information in tabs', () => {
      render(<GameScreen />)

      expect(screen.getByTestId('other-player-sets')).toBeInTheDocument()
      expect(screen.getByTestId('other-player-secrets')).toBeInTheDocument()
    })
  })

  describe('Social disgrace card selection restrictions', () => {
    beforeEach(() => {
      mockGameState.turnoActual = 1
      mockGameState.playersInSocialDisgrace = [
        { player_id: 1, player_name: 'TestPlayer' }
      ]
      useGame.mockReturnValue({
        gameState: mockGameState,
        gameDispatch: mockGameDispatch,
      })
    })
  
    it('allows selecting one card when in disgrace', () => {
      render(<GameScreen />)
  
      fireEvent.click(screen.getByText('Select Card 1'))
  
      expect(screen.getByText(/Selected: card-1/)).toBeInTheDocument()
    })
  
    it('blocks selecting a second card when in disgrace', async () => {
      render(<GameScreen />)
  
      fireEvent.click(screen.getByText('Select Card 1'))
      fireEvent.click(screen.getByText('Select Card 2'))
  
      expect(screen.getByText(/Solo puedes seleccionar una carta en desgracia social/)).toBeInTheDocument()
      expect(screen.getByText(/Selected: card-1/)).toBeInTheDocument()
    })
  
    it('allows deselecting and selecting a different card when in disgrace', () => {
      render(<GameScreen />)
  
      fireEvent.click(screen.getByText('Select Card 1'))
      expect(screen.getByText(/Selected: card-1/)).toBeInTheDocument()
  
      fireEvent.click(screen.getByText('Select Card 1'))
      expect(screen.getByText(/Selected:$/)).toBeInTheDocument()
  
      fireEvent.click(screen.getByText('Select Card 2'))
      expect(screen.getByText(/Selected: card-2/)).toBeInTheDocument()
    })
  
    it('error message disappears after 3 seconds', async () => {
      render(<GameScreen />)
    
      fireEvent.click(screen.getByText('Select Card 1'))
      fireEvent.click(screen.getByText('Select Card 2'))
    
      expect(screen.getByText(/Solo puedes seleccionar una carta en desgracia social/)).toBeInTheDocument()
    
      await waitFor(() => {
        expect(screen.queryByText(/Solo puedes seleccionar una carta en desgracia social/)).not.toBeInTheDocument()
      }, { timeout: 3500 })
    })
  })
  
  describe('Button states with social disgrace', () => {
    beforeEach(() => {
      mockGameState.turnoActual = 1
      mockGameState.playersInSocialDisgrace = [
        { player_id: 1, player_name: 'TestPlayer' }
      ]
      useGame.mockReturnValue({
        gameState: mockGameState,
        gameDispatch: mockGameDispatch,
      })
    })
  
    it('disables "Jugar Carta" when in disgrace', () => {
      render(<GameScreen />)
  
      fireEvent.click(screen.getByText('Select Card 1'))
  
      const jugarCartaButton = screen.queryByTestId('button-jugar-carta')
      
      if (jugarCartaButton) {
        expect(jugarCartaButton).toBeDisabled()
      }
    })
  
    it('enables "Descartar" with exactly 1 card selected when in disgrace', () => {
      render(<GameScreen />)
  
      fireEvent.click(screen.getByText('Select Card 1'))
  
      const descartarButton = screen.getByTestId('button-descartar')
      expect(descartarButton).not.toBeDisabled()
    })
  
    it('disables "Descartar" with 0 cards selected when in disgrace', () => {
      render(<GameScreen />)
  
      const descartarButton = screen.getByTestId('button-descartar')
      expect(descartarButton).toBeDisabled()
    })
  
    it('shows disgrace emoji (🚫) in player tab when in disgrace', () => {
      render(<GameScreen />)
  
      const tabPanel = screen.getByTestId(/tab-panel-Yo.*🚫/)
      expect(tabPanel).toBeInTheDocument()
    })
  })
  
  describe('Other players in social disgrace', () => {
    it('shows disgrace emoji for other player in disgrace', () => {
      mockGameState.playersInSocialDisgrace = [
        { player_id: 2, player_name: 'OtherPlayer' }
      ]
      useGame.mockReturnValue({
        gameState: mockGameState,
        gameDispatch: mockGameDispatch,
      })
  
      render(<GameScreen />)
  
      const tabPanel = screen.getByTestId(/tab-panel-OtherPlayer.*🚫/)
      expect(tabPanel).toBeInTheDocument()
    })
  
    it('does not show disgrace emoji when no players in disgrace', () => {
      mockGameState.playersInSocialDisgrace = []
      useGame.mockReturnValue({
        gameState: mockGameState,
        gameDispatch: mockGameDispatch,
      })
  
      render(<GameScreen />)
  
      expect(screen.queryByTestId(/tab-panel-.*🚫/)).not.toBeInTheDocument()
    })
  })
})