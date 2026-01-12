import { useState } from 'react'
import ButtonGame from '../common/ButtonGame'
import { FiArchive } from 'react-icons/fi'

const SelectOtherPlayerSet = ({
  player, // jugador que se muestran los sets 
  sets = [], // lista de sets jugados
  onSelectSet, // callback para crear un nuevo set
}) => {
  
  const [selectedSet, setSelectedSet] = useState(null);

  // ========== ESTILOS ==========
  const modalOverlay = 'fixed inset-0 flex z-50'
  const modalContainer =
    'bg-[#1D0000] border-4 border-[#825012] rounded-2xl w-full h-screen flex flex-col'

  const headerStyle =
    'bg-[#640B01] text-[#B49150] border-b-4 border-[#825012] px-6 py-3'
  const headerText = 'text-2xl font-bold'

  const setsContainer = 'p-6 overflow-y-auto'
  const setsGrid = 'grid grid-cols-1 md:grid-cols-2 gap-4'

  const emptyContainer = 'flex items-center justify-center h-full'
  const emptyIcon = 'w-20 h-20 mx-auto mb-3 text-[#825012]'
  const emptyTitle = 'text-xl font-bold text-[#B49150]'
  const emptyText = 'text-base mt-2 text-[#B49150]/60'

  const setCardBase =
    'border-4 rounded-2xl p-4 cursor-pointer transition-all transform hover:scale-[1.02]'
  const setHeader = 'flex items-center justify-between mb-2'
  const setTitle = 'text-lg font-bold text-[#B49150]'
  const setType = 'text-base text-[#B49150]/70'
  const setBadge =
    'px-3 py-1 bg-[#640B01] text-[#B49150] border border-[#825012] rounded-full text-xs font-semibold'
  const setCards = 'flex gap-2 flex-wrap'

  const miniCard =
    'w-16 h-24 bg-[#640B01] border-2 border-[#825012] rounded flex items-center justify-center overflow-hidden'
  const sidebar =
    'w-40 bg-[#3D0800]/30 border-l-4 border-[#825012] p-4 flex flex-col gap-3'

  const filteredSetsPerPlayer = sets.filter(set => set.owner_id === player)

  const getSetTypeName = setType => {
    const typeNames = {
      poirot: 'Poirot',
      marple: 'Miss Marple',
      satterthwaite: 'Satterthwaite',
      eileenbrent: 'Eileen Brent',
      beresford: 'Hermanos Beresford',
      pyne: 'Parker Pyne',
    }
    return typeNames[setType] || 'Detective'
  }

  // ========== RENDER ==========
  return (
    <div className={modalOverlay}>
      <div className={modalContainer}>
        <div className="flex flex-1 overflow-hidden">
          {/* Left section */}
          <div className="flex-1 flex flex-col">
            <div className={headerStyle}>
              <h2 className={headerText}>Sets del jugador</h2>
            </div>

            <div className={setsContainer}>
              {filteredSetsPerPlayer.length === 0 ? (
                <div className={emptyContainer}>
                  <div className="text-center max-w-md">
                    <FiArchive className={emptyIcon} />
                    <p className={emptyTitle}>No hay sets disponibles</p>
                    <p className={emptyText}>
                      Ningún jugador tiene sets de detective para seleccionar
                    </p>
                  </div>
                </div>
              ) : (
                <div className={setsGrid}>
                  {filteredSetsPerPlayer.map((set, index) => {
                    const isSelected =
                      selectedSet?.owner_id === set.owner_id &&
                      selectedSet?.position === set.position;
                    
                    return (
                      <div
                        key={`${set.owner_id}-${set.position}-${index}`}
                        onClick={() => setSelectedSet({ owner_id: set.owner_id, position: set.position })}
                        className={`border-4 rounded-2xl p-4 cursor-pointer transform transition-all duration-200 hover:scale-105 ${
                          isSelected
                            ? 'border-[#FFD700] ring-2 ring-[#FFD700] shadow-[0_0_10px_#FFD700]'
                            : 'border-[#825012] bg-[#3D0800]/40'
                        }`}
                      >

                        <div className={setHeader}>
                          <div>
                            <h3 className={setTitle}>
                              {set.setName || `Set ${set.position}`}
                            </h3>
                            {set.set_type && (
                              <p className={setType}>
                                {getSetTypeName(set.set_type)}
                              </p>
                            )}
                          </div>
                          <span className={setBadge}>Jugado</span>
                        </div>

                        {/* Render de cartas */}
                        <div className={setCards}>
                          {set.cards?.map((card, cardIndex) => (
                            <div key={cardIndex} className={miniCard}>
                              <img
                                src={
                                  card.img_src || '/cards/01-card_back.png'
                                }
                                alt={card.name || 'Card'}
                                className="w-full h-full object-cover"
                                onError={e => {
                                  e.target.src = '/cards/01-card_back.png'
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Actions */}
          <div className={sidebar}>
            <ButtonGame
              onClick={() => onSelectSet(selectedSet)}
              disabled={!selectedSet}
            >
              Seleccionar Set
            </ButtonGame>

          </div>
        </div>
      </div>
    </div>
  )
}

export default SelectOtherPlayerSet
