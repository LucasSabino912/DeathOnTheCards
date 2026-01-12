import { useState } from 'react'

export default function CantidadDeJugadores({
  jugadoresMin,
  setJugadoresMin,
  jugadoresMax,
  setJugadoresMax,
}) {
  const min = 2
  const max = 6
  const step = 1

  const [minValue, setMinValue] = useState(jugadoresMin)
  const [maxValue, setMaxValue] = useState(jugadoresMax)
  const [lastChanged, setLastChanged] = useState('min')

  const handleMinChange = e => {
    const value = Math.min(Number(e.target.value), maxValue)
    setMinValue(value)
    setJugadoresMin(value)
    setLastChanged('min')
  }

  const handleMaxChange = e => {
    const value = Math.max(Number(e.target.value), minValue)
    setMaxValue(value)
    setJugadoresMax(value)
    setLastChanged('max')
  }

  return (
    <div className="text-[#FFD700] font-[Limelight] w-full max-w-md">
      <label className="block mb-4">Seleccionar cantidad de jugadores:</label>
      <div className="relative h-10 flex items-center">
        <div className="absolute w-full h-2 bg-gray-700 rounded-full" />
        <div
          className="absolute h-2 bg-[#FFD700] rounded-full"
          style={{
            left: `${((minValue - min) / (max - min)) * 100}%`,
            right: `${100 - ((maxValue - min) / (max - min)) * 100}%`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={handleMinChange}
          className="absolute w-full appearance-none bg-transparent slider-thumb"
          style={{ zIndex: lastChanged === 'min' ? 5 : 3 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={handleMaxChange}
          className="absolute w-full appearance-none bg-transparent slider-thumb"
          style={{ zIndex: lastChanged === 'max' ? 5 : 3 }}
        />
      </div>
      <div className="flex justify-between text-sm mt-4">
        <span>Mínimo: {minValue}</span>
        <span>Máximo: {maxValue}</span>
      </div>
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffd700;
          cursor: pointer;
          border: 2px solid white;
          margin-top: -9px;
          position: relative;
          z-index: 10;
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffd700;
          cursor: pointer;
          border: 2px solid white;
          position: relative;
          z-index: 10;
        }
        input[type="range"] {
          pointer-events: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          pointer-events: auto;
        }
        input[type="range"]::-moz-range-thumb {
          pointer-events: auto;
        }
      `}</style>
    </div>
  )
}
