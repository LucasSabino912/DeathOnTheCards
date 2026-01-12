import Button from "../common/Button.jsx";
import { useState } from "react";
import { useUser } from '../../context/UserContext.jsx';
import { useGame } from '../../context/GameContext.jsx';

const SelectPlayerModal = ({ onPlayerSelect }) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const { userState } = useUser();
  const { gameState } = useGame();

  const modalLayout = "fixed inset-0 flex z-50 items-center justify-center bg-black bg-opacity-60";
  const modalContainer =
    "bg-[#1D0000] border-4 border-[#825012] rounded-2xl w-[90%] max-w-3xl p-6 flex flex-col items-center gap-6";
  const playersContainer = "grid grid-cols-2 md:grid-cols-3 gap-4 w-full justify-center";
  const actionMessage = "text-[#FFE0B2] text-xl font-semibold text-center";
  const buttonContainer = "flex gap-4 justify-center w-full";
  
  const cardColors = 'border-[#825012]';
  const cardSize = 'w-64 h-64';
  const cardPosition = 'flex flex-col items-center justify-center p-6 gap-2';
  const cardStyle = 'bg-black/40 rounded-xl border';
  
  const avatarSize = 'w-40 h-40';
  const avatarStyle = 'rounded-full border-4';
  const avatarColor = 'border-[#825012]';

  const nameStyle = 'text-lg font-bold text-[#B49150]';

  let playersToShow;

  if (gameState.detectiveAction?.actionInProgress?.setType === "pyne") {
    const playerIdsWithRevealedSecrets = new Set(
      gameState.secretsFromAllPlayers
        .filter(s => !s.hidden)          
        .map(s => s.player_id)            
    );

    playersToShow = gameState.jugadores.filter(j => {
      return playerIdsWithRevealedSecrets.has(j.player_id);
    });

  } else {
    playersToShow = gameState.jugadores.filter(j => {
      return j.player_id !== userState.id;
    });
  }
  
  
  const confirmSelection = () => {
    if (selectedPlayerId) onPlayerSelect(selectedPlayerId);
  };

  return (
    <div className={modalLayout}>
      <div className={modalContainer}>

        {/* Lista de jugadores */}
        <div className={playersContainer}>
          {playersToShow.map((jugador) => {
            // Normalizar la ruta del avatar
            const avatarPath = jugador.avatar_src?.startsWith('./') 
              ? jugador.avatar_src.substring(1) 
              : jugador.avatar_src || '/default-avatar.png';
            
            return (
              <div
                key={jugador.player_id}
                onClick={() => setSelectedPlayerId(jugador.player_id)}
                className="cursor-pointer hover:scale-105 transition-all"
              >
                <div
                  className={`${cardSize} ${cardPosition} ${cardStyle} ${cardColors} ${
                    selectedPlayerId === jugador.player_id
                      ? "outline outline-4 outline-[#FFD700]"
                      : ""
                  }`}
                >
                  <img
                    src={avatarPath}
                    alt={jugador.name || 'Jugador'}
                    className={`${avatarSize} ${avatarStyle} ${avatarColor}`}
                    onError={(e) => (e.target.src = '/default-avatar.png')}
                  />
                  <h2 className={nameStyle}>{jugador.name || 'Jugador'}</h2>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mensaje de acción */}
        <div className={actionMessage}>
          <h2>Selecciona un jugador</h2>
        </div>

        {/* Botón de confirmación */}
        <div className={buttonContainer}>
          <Button 
            onClick={confirmSelection} 
            title="Confirmar"
            disabled={!selectedPlayerId}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectPlayerModal;