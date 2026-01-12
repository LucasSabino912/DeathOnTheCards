// components/game/CounterBanner.jsx
import { useGame } from "../../context/GameContext";
import { useUser } from "../../context/UserContext";
import ButtonGame from "../common/ButtonGame";

export default function NsfBanner({ handler }) {
  const { gameState } = useGame();
  const { userState } = useUser();
  const nsfWindow = gameState.nsfCounter;

  console.log( gameState );

  if (!nsfWindow.active) return null;

  const initiator = gameState.jugadores?.find(
    j => j.player_id === nsfWindow.initiatorPlayerId
  );
  const isInitiator = userState.id === nsfWindow.initiatorPlayerId;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-96">
      <div className="bg-gradient-to-br from-orange-900/95 to-amber-900/95 backdrop-blur-sm border-2 border-orange-600/80 rounded-lg shadow-2xl p-4">
        {/* Header with glow effect */}
        <div className="text-center mb-3 pb-3 border-b-2 border-orange-600/50">
          <h3 className="text-2xl font-bold text-orange-200 tracking-wider mb-1" 
              style={{ textShadow: '0 0 10px rgba(251, 146, 60, 0.5)' }}>
            ⚡ Not so Fast ⚡
          </h3>
          <p className="text-xs text-orange-300/80">
            Ventana para contrarrestar la acción
          </p>
        </div>

        {/* Time Remaining - Prominent */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-black/40 px-6 py-3 rounded-lg border border-orange-500/50">
            <span className="text-sm text-orange-300">Tiempo:</span>
            <span className="text-3xl font-bold text-orange-400 tabular-nums animate-pulse">
              {nsfWindow.timeRemaining}s
            </span>
          </div>
        </div>

        {/* Initiator Info */}
        <div className="mb-4 bg-black/30 p-3 rounded-lg border border-orange-700/40">
          <p className="text-xs text-orange-400/70 mb-1">Acción iniciada por:</p>
          <p className="text-lg font-semibold text-orange-200">
            {initiator?.name || 'Jugador desconocido'}
            {isInitiator && <span className="text-orange-400 ml-1">(Tú)</span>}
          </p>
          {nsfWindow.actionName && (
            <p className="text-xs text-orange-300/60 mt-1">
              {nsfWindow.actionName}
            </p>
          )}
        </div>

        {/* NSF Chain */}
        {nsfWindow.nsfChain && nsfWindow.nsfChain.length > 0 && (
          <div className="mb-4 bg-black/30 p-3 rounded-lg border border-orange-700/40">
            <p className="text-sm font-semibold mb-2 text-orange-300 text-center">
              Cartas jugadas ({nsfWindow.nsfChain.length}):
            </p>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {nsfWindow.nsfChain.map((nsf, index) => {
                const player = gameState.jugadores?.find(p => p.player_id === nsf.playerId);
                const isCurrentUser = userState.id === nsf.playerId;
                return (
                  <div 
                    key={`${nsf.playerId}-${nsf.timestamp}`}
                    className="bg-gradient-to-r from-orange-800/40 to-amber-800/40 px-3 py-2 rounded border border-orange-600/30 text-sm flex items-center justify-between hover:border-orange-500/50 transition-colors"
                  >
                    <span className="text-orange-200">
                      <span className="text-orange-400 font-bold mr-2">{index + 1}.</span>
                      {player?.name || 'Jugador'}
                      {isCurrentUser && <span className="text-orange-400 ml-1">(Tú)</span>}
                    </span>
                    <span className="text-xs text-orange-400/60">🃏</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-center w-full mt-4">
          <ButtonGame onClick={() => handler()}>
            Jugar Not So Fast
          </ButtonGame>
        </div>
      </div>
    </div>
  );
}