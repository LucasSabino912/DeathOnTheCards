// Archivo: src/components/PlayersList.test.jsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PlayersList from '../../components/wait/PlayersList'

describe('PlayersList', () => {
  it('funciona con lista vacía', () => {
    const { container } = render(<PlayersList players={[]} />)
    const list = container.querySelector('ul')
    expect(list).toBeInTheDocument()
    expect(list.children).toHaveLength(0)
  })

  it('renderiza un jugador host con corona', () => {
    const players = [
      {
        id: 1,
        name: 'Player Host',
        is_host: true,
      },
    ]

    render(<PlayersList players={players} />)

    expect(screen.getByText('Player Host')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'host' })).toBeInTheDocument()
    expect(screen.getByText('Host')).toBeInTheDocument()
  })

  it('renderiza un jugador no-host sin corona', () => {
    const players = [
      {
        id: 2,
        name: 'Player Regular',
        is_host: false,
      },
    ]

    render(<PlayersList players={players} />)

    expect(screen.getByText('Player Regular')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'host' })).not.toBeInTheDocument()
    expect(screen.getByText('Jugador')).toBeInTheDocument()
  })

  it('renderiza múltiples jugadores', () => {
    const players = [
      { id: 1, name: 'Host Player', is_host: true },
      { id: 2, name: 'Player 2', is_host: false },
      { id: 3, name: 'Player 3', is_host: false },
    ]

    const { container } = render(<PlayersList players={players} />)
    const list = container.querySelector('ul')

    expect(list.children).toHaveLength(3)
    expect(screen.getByText('Host Player')).toBeInTheDocument()
    expect(screen.getByText('Player 2')).toBeInTheDocument()
    expect(screen.getByText('Player 3')).toBeInTheDocument()
  })

  it('usa nombre por defecto cuando player.name es null', () => {
    const players = [{ id: 1, name: null, is_host: false }]

    render(<PlayersList players={players} />)

    expect(screen.getByText('Jugador 1')).toBeInTheDocument()
  })

  it('usa nombre por defecto cuando player.name es undefined', () => {
    const players = [{ id: 1, is_host: false }]

    render(<PlayersList players={players} />)

    expect(screen.getByText('Jugador 1')).toBeInTheDocument()
  })

  it('muestra solo una corona cuando hay un host', () => {
    const players = [
      { id: 1, name: 'Host Player', is_host: true },
      { id: 2, name: 'Player 2', is_host: false },
      { id: 3, name: 'Player 3', is_host: false },
    ]

    render(<PlayersList players={players} />)

    const crowns = screen.getAllByRole('img', { name: 'host' })
    expect(crowns).toHaveLength(1)
  })

  it('renderiza correctamente los índices en nombres por defecto', () => {
    const players = [
      { id: 1, name: null, is_host: false },
      { id: 2, name: null, is_host: false },
      { id: 3, name: null, is_host: false },
    ]

    render(<PlayersList players={players} />)

    expect(screen.getByText('Jugador 1')).toBeInTheDocument()
    expect(screen.getByText('Jugador 2')).toBeInTheDocument()
    expect(screen.getByText('Jugador 3')).toBeInTheDocument()
  })
})
