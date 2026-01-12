import React, { useState } from "react";
import { useGame } from "../../context/GameContext.jsx";
import ButtonGame from "../common/ButtonGame.jsx";

const OneMoreSecretsModal = ({ isOpen, onConfirm }) => {
  const { gameState } = useGame();
  const [selectedSecret, setSelectedSecret] = useState(null);

  if (!isOpen) return null;

  const availableSecrets = gameState.eventCards?.oneMore?.availableSecrets || [];

  const secretsByPlayer = availableSecrets.reduce((acc, secret) => {
    if (!acc[secret.owner_id]) {
      const player = gameState.jugadores.find((p) => p.player_id === secret.owner_id);

      acc[secret.owner_id] = {
        playerName: player ? player.name : `Jugador ${secret.owner_id}`,
        secrets: [],
      };
    }
    acc[secret.owner_id].secrets.push(secret);
    return acc;
  }, {});

  const overlay =
    "fixed inset-0 flex items-center justify-center z-50 bg-black/60";
  const container =
    "bg-[#1D0000] border-4 border-[#825012] rounded-2xl w-[720px] flex flex-col p-8 max-h-[80vh] overflow-y-auto";
  const headerStyle =
    "bg-[#640B01] text-[#B49150] border-b-4 border-[#825012] px-6 py-4 rounded-t-xl text-center";
  const headerTitle = "text-3xl font-bold";
  const playerSection = "mt-6";
  const playerName =
    "text-2xl font-semibold text-[#B49150] mb-3 text-center underline";
  const secretsContainer = "flex flex-wrap justify-center gap-4 mb-8";
  const secretCard =
    "w-24 h-36 border-2 border-[#825012] bg-[#3D0800]/40 rounded-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-105";
  const selectedCard = "border-[#B49150] scale-105";

  return (
    <div className={overlay}>
      <div className={container}>
        {/* HEADER */}
        <div className={headerStyle}>
          <h2 className={headerTitle}>Secretos Revelados</h2>
        </div>

    {/* CONTENIDO */}
    {Object.keys(secretsByPlayer).length > 0 ? (
      Object.values(secretsByPlayer).map((playerData) => (
        <div key={playerData.playerName} className={playerSection}>
          <p className={playerName}>{playerData.playerName}</p>
          <div className={secretsContainer}>
            {playerData.secrets.map((secret) => (
              <div
                key={secret.id}
                className={`${secretCard} ${
                  selectedSecret?.id === secret.id ? selectedCard : ""
                }`}
                onClick={() => setSelectedSecret(secret)}
              >
                <img
                  src="/cards/secret_back.png"
                  alt={`Secreto revelado ${secret.id}`}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            ))}
          </div>
        </div>
      ))
    ) : (
      <div className="flex flex-col items-center justify-center mt-8 gap-4">
        <p className="text-[#B49150]/70 text-center">
          No hay secretos revelados disponibles.
        </p>
        <ButtonGame onClick={() => onConfirm(null)}>
          Cerrar
        </ButtonGame>
      </div>
    )}


        {/* BOTÓN CONFIRMAR */}
        <div className="flex justify-center mt-4">
          <ButtonGame
            disabled={!selectedSecret}
            onClick={() => onConfirm(selectedSecret)}
          >
            Confirmar
          </ButtonGame>
        </div>
      </div>
    </div>
  );
};

export default OneMoreSecretsModal;
