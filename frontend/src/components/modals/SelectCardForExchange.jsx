import { useState } from "react"
import getCardsImage from "../../helpers/HelperImageCards"

export default function SelectCardForExchange({ isOpen, hand = [], onConfirm }) {
  const [selectedCardId, setSelectedCardId] = useState(null)

  if (!isOpen) return null

  const handleConfirm = () => {
    if (!selectedCardId) return
    onConfirm(selectedCardId)
    setSelectedCardId(null)
  }

  const handleCardClick = (cardId) => {
    setSelectedCardId(prev => (prev === cardId ? null : cardId))
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div
        className="rounded-2xl shadow-lg p-8 min-w-[600px] max-w-[1200px]"
        style={{
          backgroundImage: `url('/background.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: "4px solid #FFD700",
        }}
      >
        <h2 className="text-2xl font-bold text-center text-yellow-400 mb-4 font-[Limelight]">
          Elegí una carta de tu mano
        </h2>

        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {hand.length > 0 ? (
            hand.map((card) => {
              const imgSrc = getCardsImage(card)
              const isSelected = selectedCardId === card.id
              return (
                <div
                  key={card.id}
                  className={`border-4 rounded-xl cursor-pointer transition-all duration-150 bg-[#3D0800] ${
                    isSelected ? "border-[#FFD700]" : "border-[#825012]"
                  }`}
                  onClick={() => handleCardClick(card.id)}
                  style={{ width: 120, height: 180 }}
                >
                  <img
                    src={imgSrc}
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )
            })
          ) : (
            <p className="text-white text-center">No tenés cartas en tu mano</p>
          )}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleConfirm}
            disabled={!selectedCardId}
            className={`px-6 py-3 text-lg rounded-xl font-[Limelight] border-2 ${
              selectedCardId
                ? "bg-[#3D0800] text-[#FFD700] border-[#FFD700] hover:bg-[#4d1008]"
                : "bg-[#3D0800] text-[#B49150] border-[#825012] opacity-50 cursor-not-allowed"
            }`}
          >
            Confirmar selección
          </button>
        </div>
      </div>
    </div>
  )
}
