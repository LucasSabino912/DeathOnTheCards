import { useNavigate } from 'react-router-dom'
import { useGame } from '../../context/GameContext.jsx'
import { useUser } from '../../context/UserContext.jsx'
import PlayersList from '../../components/wait/PlayersList.jsx'
import Card from '../../components/game/Card.jsx'
import Button from '../../components/common/Button.jsx'
import LobbyError from '../../components/lobby/LobbyError.jsx'
import { useEffect, useState } from 'react'
import ExitGameButton from '../../components/lobby/ExitGameButton.jsx'

export default function WaitScreen() {
  const navigate = useNavigate()
  const [error, setErrorMessage] = useState(null)
  const [notification, setNotification] = useState(null)

  // Contexts
  const { gameState, gameDispatch } = useGame()
  const { userState } = useUser()

  useEffect(() => {
      // Navigate only if user is not the host and roomId is set
      if (gameState.roomId && gameState.status == 'INGAME') {
        navigate(`/game/${gameState.roomId}`);
      }
  }, [gameState, userState])

  // Redirigir jugadores cuando el host cancela la partida y mostrar notificacion
  useEffect(() => {
    if (gameState.gameCancelled) {
      console.log('El host cancelo la partida, redirigiendo al lobby')
      setNotification('El host cancelo la partida')

      // Esperar un momento para que se vea la notificación antes de redirigir
      setTimeout(() => {
        navigate('/lobby')
      }, 3000)
    }
  }, [gameState.gameCancelled, navigate])

  // Mostrar notificacion cuando un jugador abandona
  useEffect(() => {
    if (gameState.playerLeftNotification) {
      const playerName = gameState.playerLeftNotification.playerName
      setNotification(`${playerName} abandono la partida`)

      // Limpiar notificacion despues de 3 segundos
      setTimeout(() => {
        setNotification(null)
        gameDispatch({ type: 'CLEAR_PLAYER_LEFT_NOTIFICATION' })
      }, 3000)
    }
  }, [gameState.playerLeftNotification, gameDispatch])

  const { gameId, jugadores, roomInfo } = gameState

  const handleStart = async () => {
    if (!userState.isHost) return

    console.log('🚀 Starting game, socket connected?', gameState.connected)
    console.log('🎮 Current gameId:', gameState.gameId)

    try {
      const payload = { user_id: userState.id }
      console.log('Sending payload:', payload)

      const response = await fetch(
        `http://localhost:8000/game/${gameState.roomId}/start`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.detail || "Error al iniciar partida");
      }
      
      const data = await response.json();
      console.log("Partida iniciada: la respuesta del post es:", data);
      
    } catch (error) {
      console.error('Fallo en handleStart:', error)
    }
  }

  const handleExitError = error => {
    setErrorMessage(error)
    setTimeout(() => setErrorMessage(null), 3000)
  }

  return (
    <main className="relative min-h-dvh overflow-x-hidden">
      <div
        className="fixed inset-0 bg-[url('/background.png')] bg-cover bg-center"
        aria-hidden
      />

      {/* Error display */}
      {error && (
        <div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl"
          style={{ zIndex: 9999, maxWidth: '500px' }}
        >
          {error}
        </div>
      )}

      {/* Notification display */}
      {notification && (
        <div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-4 rounded-lg shadow-2xl font-limelight"
          style={{ zIndex: 9999, maxWidth: '500px' }}
        >
          {notification}
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold text-[#F4CC6F] font-limelight">
          Partida:{' '}
          <span className="font-black">
            {roomInfo?.name || gameId || 'Sin nombre'}
          </span>
        </h1>

        <Card title="Jugadores" className="mb-8 font-limelight">
          <PlayersList players={jugadores} />
        </Card>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-row gap-4 items-center">
          <ExitGameButton
            isHost={userState?.isHost}
            roomId={gameState.roomId}
            userId={userState.id}
            onError={handleExitError}
          />

          {userState?.isHost && (
            <Button onClick={handleStart} className="font-limelight">
              Iniciar partida
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}
