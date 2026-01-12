import React from 'react';
import { useGame } from '../../context/GameContext';

const OtherPlayerSets = ({ player }) => {
  const { gameState } = useGame();

  if (!player) return null;

  const playerSets = gameState.sets?.filter(set => set.owner_id === player.player_id) || [];
  
  if (playerSets.length === 0) {
    return (
      <div className="w-full">
        <h2 className="text-white text-xl font-bold mb-3 text-center">
          Sets de Detective
        </h2>
        <p className="text-gray-400 text-sm text-center italic">
          Sin sets jugados
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-white text-xl font-bold mb-3 text-center">
        Sets de Detective
      </h2>
      
      <div className="flex flex-col gap-4">
        {playerSets.map((set, index) => (
          <div 
            key={`${set.owner_id}-${set.position}-${index}`}
            className="bg-[#1D0000]/50 border-2 border-[#825012] rounded-lg p-4"
          >
            {/* Set Header */}
            <div className="mb-3 text-center">
              <h3 className="text-[#B49150] font-bold text-lg capitalize">
                {set.set_type}
              </h3>
              <p className="text-gray-400 text-xs">
                {set.count} carta{set.count !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Set Cards */}
            <div className="flex gap-2 flex-wrap justify-center">
              {set.cards.map((card) => (
                <div 
                  key={card.id} 
                  className="relative group"
                >
                  <img
                    src={card.img_src}
                    alt={card.name}
                    className="w-20 h-32 object-cover rounded-md border border-[#B49150]/50 shadow-md transition-transform hover:scale-105"
                  />
                  
                  {/* Card tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap max-w-xs">
                    <div className="font-bold mb-1">{card.name}</div>
                    {card.description && (
                      <div className="text-gray-300 text-xs">
                        {card.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sets Summary */}
      <div className="mt-3 text-center text-sm text-gray-400">
        {playerSets.length} set{playerSets.length !== 1 ? 's' : ''} jugado{playerSets.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default OtherPlayerSets;