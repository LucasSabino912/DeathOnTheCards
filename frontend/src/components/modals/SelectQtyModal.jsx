import { useState } from "react"
import React from "react"

export default function SelectQtyModal({ isOpen, onConfirm }) {
  const [quantity, setQuantity] = useState(1)

  if (!isOpen) return null

  const increment = () => {
    setQuantity(prev => Math.min(5, prev + 1))
  }

  const decrement = () => {
    setQuantity(prev => Math.max(1, prev - 1))
  }

  const handleConfirm = () => {
    const finalQty = Math.min(quantity, 5)
    onConfirm(finalQty)
    setQuantity(1)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div
        className="rounded-2xl shadow-lg p-10 min-w-[400px] max-w-[700px] flex flex-col items-center"
        style={{
          backgroundImage: `url('/background.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: "4px solid #FFD700",
        }}
      >
        <h1
          className="text-2xl font-bold mb-0 text-center"
          style={{
            color: "#FFD700",
            fontFamily: "Limelight, sans-serif",
          }}
        >
          Delay the Murderer’s Escape
        </h1>

        <span
          className="text-lg text-yellow-400 block text-center mb-8"
          style={{
            fontFamily: "Limelight, sans-serif",
            marginTop: "-1.25rem",
          }}
        >
          Elegí cuántas cartas querés devolver al mazo (máx. 5)
        </span>

        <div className="flex items-center justify-center gap-6 mb-10">
          <button
            onClick={decrement}
            className="px-5 py-2 text-3xl bg-[#3D0800] text-[#FFD700] border-2 border-[#825012] rounded-xl font-[Limelight] hover:bg-[#4d1008]"
          >
            −
          </button>

          <span
            className="text-4xl text-[#FFD700] font-[Limelight] min-w-[60px] text-center"
            style={{ fontFamily: "Limelight, sans-serif" }}
          >
            {quantity}
          </span>

          <button
            onClick={increment}
            className="px-5 py-2 text-3xl bg-[#3D0800] text-[#FFD700] border-2 border-[#825012] rounded-xl font-[Limelight] hover:bg-[#4d1008]"
          >
            +
          </button>
        </div>

        <div className="flex justify-center gap-6">
          <button
            onClick={handleConfirm}
            className="px-6 py-3 text-lg rounded-xl font-[Limelight] border-2 bg-[#3D0800] text-[#FFD700] border-[#FFD700] hover:bg-[#4d1008] hover:text-yellow-400"
            style={{ fontFamily: "Limelight, sans-serif" }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

