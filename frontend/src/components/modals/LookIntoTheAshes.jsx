import { useState } from 'react'
import getCardsImage from '../../helpers/HelperImageCards'

export default function LookIntoTheAshes({
  isOpen,
  availableCards,
  onSelectCard,
}) {
  const [selectedCardId, setSelectedCardId] = useState(null)

  if (!isOpen) return null

  const handleConfirm = () => {
    if (selectedCardId) {
      onSelectCard(selectedCardId)
    }
  }

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
            Look Into The Ashes
          </h1>

          <span
            className="text-lg text-yellow-400 block mb-6"
            style={{
              fontFamily: 'Limelight, sans-serif',
              marginTop: '-1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            Agrega una carta a tu mano
          </span>
        </div>

        <div className="flex flex-row gap-8 justify-center mb-10">
          {availableCards.map(card => {
            const imgSrc = getCardsImage(card)
            const isSelected = selectedCardId === card.entryId

            return (
              <div
                key={card.entryId}
                className={
                  `border-4 rounded-xl cursor-pointer transition-all duration-150 flex p-0 m-0 bg-[#3D0800] overflow-hidden` +
                  (isSelected ? ' border-[#FFD700]' : ' border-[#825012]')
                }
                onClick={() => setSelectedCardId(card.entryId)}
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
          })}
        </div>

        <div className="flex justify-center">
          <button
            className={
              `px-6 py-3 text-lg rounded-xl font-[Limelight] border-2 cursor-pointer` +
              (selectedCardId
                ? ' bg-[#3D0800] text-[#FFD700] border-[#FFD700] hover:bg-[#4d1008] hover:text-yellow-400'
                : ' bg-[#3D0800] text-[#B49150] border-[#825012]')
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
