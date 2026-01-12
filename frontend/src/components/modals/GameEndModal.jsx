import { useNavigate } from 'react-router-dom'
import { useGame } from '../../context/GameContext'

export default function GameEndModal({ ganaste, winners, finish_reason }) {
  const navigate = useNavigate()
  const { disconnectFromGame } = useGame()

  const handleClose = () => {
    // Desconectar del WebSocket antes de ir al lobby
    disconnectFromGame()
    navigate('/lobby')
  }

  // Mapear roles a español
  const getRoleText = role => {
    const roleMap = {
      murderer: 'Asesino',
      accomplice: 'Cómplice',
      detective: 'Detective',
    }
    return roleMap[role] || role
  }

  // Mapear razón a español
  const getReasonText = finish_reason => {
    const reasonMap = {
      deck_empty: 'El asesino escapó - se terminó el mazo',
      murderer_caught: 'Los detectives atraparon al asesino',
      game_completed: 'La partida ha finalizado',
      TOTAL_DISGRACE: '¡El asesino gana! Todos los detectives cayeron en desgracia social'
    }
    return reasonMap[finish_reason] || finish_reason
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-[#3D0800] border-4 border-[#825012] text-[#B49150] p-8 shadow-2xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center font-limelight">
          Partida Finalizada
        </h2>

        {/* Mensaje de victoria o derrota */}
        <div className="mb-4 text-center">
          <p
            className={`text-xl font-semibold ${ganaste ? 'text-green-400' : 'text-red-400'}`}
          >
            {ganaste ? '¡Ganaste!' : 'Perdiste'}
          </p>
        </div>

        {/* Razón de finalización */}
        {finish_reason && (
          <p className="mb-4 text-center text-sm italic opacity-80">
            {getReasonText(finish_reason)}
          </p>
        )}

        {/* Lista de ganadores */}
        {winners && winners.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-center">
              Ganadores:
            </h3>
            <div className="space-y-2">
              {winners.map((winner, index) => (
                <div
                  key={index}
                  className="bg-[#4a0a00] border-2 border-[#825012] p-3 text-center rounded"
                >
                  <p className="font-semibold text-lg">
                    {winner.name || `Jugador ${winner.player_id}`}
                  </p>
                  <p className="text-sm opacity-75">
                    {getRoleText(winner.role)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleClose}
            className="px-10 py-3 font-semibold transition border-4
              bg-[#3D0800] text-[#B49150] border-[#825012]
              hover:bg-[#4a0a00] focus:outline-none
              focus:ring-2 focus:ring-[#825012]/60"
          >
            Volver al Lobby
          </button>
        </div>
      </div>
    </div>
  )
}
