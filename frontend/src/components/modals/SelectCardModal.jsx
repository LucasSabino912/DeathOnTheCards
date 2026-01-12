import { useState } from 'react'
import getCardsImage from '../../helpers/HelperImageCards'

export default function SelectCard({
  isOpen,
  availableCards,
  onSelectCard,
}) {
  // ⚠️ ESTADO LOCAL del modal - NO usar selectedCards de GameScreen
  const [selectedCardId, setSelectedCardId] = useState(null)

  if (!isOpen) return null

  const handleConfirm = () => {
    console.log("🎯 SelectCard: handleConfirm llamado")
    console.log("selectedCardId:", selectedCardId)
    
    if (selectedCardId) {
      console.log("✅ Llamando onSelectCard con:", selectedCardId)
      onSelectCard(selectedCardId)
      setSelectedCardId(null)
    } else {
      console.log("No hay carta seleccionada")
    }
  }

  // Handler para seleccionar carta
  const handleCardClick = (cardId) => {
    console.log("arta clickeada:", cardId)
    console.log("Antes selectedCardId:", selectedCardId)
    
    // Toggle: si la carta ya está seleccionada, deseleccionar
    if (selectedCardId === cardId) {
      setSelectedCardId(null)
      console.log("Carta deseleccionada")
    } else {
      setSelectedCardId(cardId)
      console.log("✅ Carta seleccionada:", cardId)
    }
  }

  console.log("🔍 SelectCard render:", {
    isOpen,
    availableCards: availableCards?.length || 0,
    selectedCardId
  })

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div
        className="rounded-2xl shadow-lg p-10 min-w-[600px] max-w-[1200px]"
        style={{
          backgroundImage: `url('/background.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '4px solid #FFD700',
        }}
      >
        <div className="text-center">
          <h1
            className="text-2xl font-bold mb-0"
            style={{
              color: '#FFD700',
              fontFamily: 'Limelight, sans-serif',
              marginBottom: 0,
            }}
          >
            Card trade
          </h1>

          <span
            className="text-lg text-yellow-400 block mb-6"
            style={{
              fontFamily: 'Limelight, sans-serif',
              marginTop: '-1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            Elegir carta
          </span>
        </div>

        <div className="flex flex-row gap-8 justify-center mb-10">
          {availableCards && availableCards.length > 0 ? (
            availableCards.map(card => {
              const imgSrc = getCardsImage(card)
              const isSelected = selectedCardId === card.id

              console.log(`Renderizando carta ${card.id}:`, {
                isSelected,
                selectedCardId,
                cardId: card.id
              })

              return (
                <div
                  key={card.id}
                  className={
                    `border-4 rounded-xl cursor-pointer transition-all duration-150 flex p-0 m-0 bg-[#3D0800] overflow-hidden` +
                    (isSelected ? ' border-[#FFD700]' : ' border-[#825012]')
                  }
                  onClick={() => handleCardClick(card.id)}
                  style={{
                    minWidth: 120,
                    minHeight: 180,
                    width: 120,
                    height: 180,
                  }}
                >
                  {imgSrc && (
                    <img
                      src={imgSrc}
                      alt={card.name}
                      className="w-full h-full object-cover"
                      style={{ display: 'block', width: '100%', height: '100%' }}
                    />
                  )}
                </div>
              )
            })
          ) : (
            <p className="text-white">No hay cartas disponibles</p>
          )}
        </div>

        <div className="flex justify-center">
          <button
            className={
              `px-6 py-3 text-lg rounded-xl font-[Limelight] border-2 cursor-pointer` +
              (selectedCardId
                ? ' bg-[#3D0800] text-[#FFD700] border-[#FFD700] hover:bg-[#4d1008] hover:text-yellow-400'
                : ' bg-[#3D0800] text-[#B49150] border-[#825012] opacity-50 cursor-not-allowed')
            }
            onClick={handleConfirm}
            disabled={!selectedCardId}
            style={{ fontFamily: 'Limelight, sans-serif' }}
          >
            Seleccionar
          </button>
        </div>
      </div>
    </div>
  )
}