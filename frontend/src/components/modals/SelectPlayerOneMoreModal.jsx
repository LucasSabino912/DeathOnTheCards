import React, { useState } from "react";
import { useGame } from "../../context/GameContext.jsx";
import { useUser } from "../../context/UserContext.jsx";
import ButtonGame from "../common/ButtonGame.jsx";

const SelectPlayerOneMoreModal = ({ isOpen, onConfirm }) => {
  const { gameState } = useGame();
  const { userState } = useUser();
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);

  if (!isOpen) return null;

  const playersToShow = gameState.jugadores || [];

  const modalLayout =
    "fixed inset-0 z-50 flex items-center justify-center bg-black/60";
  const modalContainer =
    "bg-[#1D0000] border-4 border-[#825012] rounded-2xl w-[90%] max-w-3xl p-8 flex flex-col items-center gap-6";
  const playersContainer =
    "grid grid-cols-2 sm:grid-cols-3 gap-6 justify-center w-full";
  const cardStyle =
    "bg-black/40 border border-[#825012] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all";
  const selectedStyle = "outline outline-4 outline-[#FFD700]";
  const nameStyle = "text-[#B49150] font-semibold mt-2";

  return (
    <div className={modalLayout}>
      <div className={modalContainer}>
        <h2 className="text-2xl font-bold text-[#FFE0B2] mb-2">
          Elegí un jugador para enviarle el secreto oculto
        </h2>
        <div className={playersContainer}>
          {playersToShow.map((jugador) => {
            const avatar =
              jugador.avatar_src?.replace("./", "/") || "/default-avatar.png";
            return (
              <div
                key={jugador.player_id}
                className={`${cardStyle} ${
                  selectedPlayerId === jugador.player_id ? selectedStyle : ""
                }`}
                onClick={() => setSelectedPlayerId(jugador.player_id)}
              >
                <img
                  src={avatar}
                  alt={jugador.name}
                  className="w-32 h-32 rounded-full border-4 border-[#825012]"
                  onError={(e) => (e.target.src = "/default-avatar.png")}
                />
                <p className={nameStyle}>{jugador.name}</p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 justify-center mt-4">
          <ButtonGame
            disabled={!selectedPlayerId}
            onClick={() => onConfirm(selectedPlayerId)}
          >
            Confirmar
          </ButtonGame>
        </div>
      </div>
    </div>
  );
};

export default SelectPlayerOneMoreModal;
