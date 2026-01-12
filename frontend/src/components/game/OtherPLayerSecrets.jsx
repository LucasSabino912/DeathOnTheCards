import React from 'react';
import { useGame } from '../../context/GameContext';

const OtherPlayerSecrets = ({ player }) => {
  const { gameState } = useGame();
  
  if (!player) return null;

  // Get secrets for this player from secretsFromAllPlayers
  const playerSecrets = gameState.secretsFromAllPlayers?.filter(
    secret => secret.player_id === player.player_id
  ) || [];

  if (playerSecrets.length === 0) {
    return (
      <div className="w-full">
        <h2 className="text-white text-xl font-bold mb-3 text-center">
          Secretos
        </h2>
        <p className="text-gray-400 text-sm text-center italic">
          Sin secretos
        </p>
      </div>
    );
  }

  // Normalize name function
  const normalizeName = (name = '') =>
    name
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, ' ');

  // Image mapping
  const IMAGE_MAP = {
    "you are the murderer": "/cards/secret_murderer.png",
    "you are the accomplice": "/cards/secret_accomplice.png"
  };

  // Get secret image based on revealed state only
  const getSecretImage = (secret) => {
    // If secret is revealed, show the actual image
    if (!secret.hidden) {
      const key = normalizeName(secret.name);
      return IMAGE_MAP[key] ?? "/cards/secret_back.png";
    }
    
    // If secret is hidden, show front
    return "/cards/secret_front.png";
  };

  const revealedCount = playerSecrets.filter(s => !s.hidden).length;
  const hiddenCount = playerSecrets.filter(s => s.hidden).length;

  return (
    <div className="w-full">
      
      <div className="flex gap-3 flex-wrap justify-center items-end">
        {playerSecrets.map((secret) => (
          <div
            key={secret.id}
            className="relative group"
          >
            <img
              src={getSecretImage(secret)}
              alt={secret.hidden ? "Secreto oculto" : secret.name}
              className={`w-[120px] h-[160px] object-cover rounded-lg border-2 shadow-lg transition-transform hover:scale-105 ${
                secret.hidden 
                  ? 'border-[#825012] opacity-90' 
                  : 'border-green-500'
              }`}
            />
            
            {/* Indicator */}
            <div className={`absolute -top-2 -right-2 rounded-full p-1.5 shadow-md ${
              secret.hidden ? 'bg-gray-600' : 'bg-green-500'
            }`}>
              {secret.hidden ? (
                <svg 
                  className="w-4 h-4 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" 
                  />
                </svg>
              ) : (
                <svg 
                  className="w-4 h-4 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                  />
                </svg>
              )}
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {secret.hidden ? 'Oculto' : 'Revelado'}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-3 text-center text-sm text-gray-400">
        {revealedCount > 0 && (
          <span className="text-green-400">
            {revealedCount} revelado{revealedCount !== 1 ? 's' : ''}
          </span>
        )}
        {revealedCount > 0 && hiddenCount > 0 && (
          <span className="mx-2">•</span>
        )}
        {hiddenCount > 0 && (
          <span className="text-gray-400">
            {hiddenCount} oculto{hiddenCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
};

export default OtherPlayerSecrets;