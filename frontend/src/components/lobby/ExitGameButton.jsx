import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../common/Button.jsx'

export default function ExitGameButton({ isHost, roomId, userId, onError }) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleExit = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(
        `http://localhost:8000/game_join/${roomId}/leave`,
        {
          method: 'DELETE',
          headers: {
            HTTP_USER_ID: userId.toString(),
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        // Manejo de errores
        if (response.status === 409) {
          onError?.('La partida ya ha iniciado')
        } else if (response.status === 404) {
          onError?.('Sala no encontrada')
        } else if (response.status === 403) {
          onError?.('El jugador no pertence a esta sala')
        } else {
          onError?.(errorData.detail || 'Error al abandonar la partida')
        }
        return
      }

      // Caso exitoso -> partida cancelada o jugador abandona sala
      console.log(isHost ? 'Partida cancelada' : 'Jugador abandonó la partida')
      // Redirigir al lobby
      navigate('/lobby')

      // Caso error al abandonar - cancelar
    } catch (error) {
      console.error('Error al abandonar/cancelar partida:', error)
      onError?.('Error de conexión. Por favor, intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleExit}
      disabled={isLoading}
      className="font-limelight hover:bg-red-800"
    >
      {isLoading
        ? 'Saliendo...'
        : isHost
          ? 'Cancelar partida'
          : 'Abandonar partida'}
    </Button>
  )
}
