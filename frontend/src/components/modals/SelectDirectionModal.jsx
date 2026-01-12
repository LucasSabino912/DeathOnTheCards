import Button from "../common/Button.jsx";
import { useState } from "react";

const SelectDirectionModal = ({ isOpen, onConfirm }) => {
  const [selectedDirection, setSelectedDirection] = useState(null);

  const modalLayout =
    "fixed inset-0 flex z-50 items-center justify-center bg-black bg-opacity-60";
  const modalContainer =
    "bg-[#1D0000] border-4 border-[#825012] rounded-2xl w-[90%] max-w-2xl p-6 flex flex-col items-center gap-8";
  const titleStyle = "text-[#FFE0B2] text-2xl font-semibold text-center";
  const directionsContainer =
    "flex justify-center items-center gap-8 w-full";
  const cardBase =
    "cursor-pointer bg-black/40 rounded-xl border border-[#825012] w-52 h-52 flex flex-col items-center justify-center gap-3 transition-all hover:scale-105";
  const selectedOutline = "outline outline-4 outline-[#FFD700]";
  const arrowStyle = "text-6xl text-[#FFD700]";
  const labelStyle = "text-lg font-bold text-[#B49150]";

  const buttonContainer = "flex gap-6 justify-center w-full";
  if (!isOpen) return null;
  const confirmSelection = () => {
    if (selectedDirection) onConfirm(selectedDirection);
  };

  return (
    <div className={modalLayout}>
      <div className={modalContainer}>
        <h2 className={titleStyle}>Elige la dirección de rotación</h2>

        {/* Opciones LEFT / RIGHT */}
        <div className={directionsContainer}>
          <div
            className={`${cardBase} ${
              selectedDirection === "LEFT" ? selectedOutline : ""
            }`}
            onClick={() => setSelectedDirection("LEFT")}
          >
            <span className={arrowStyle}>⬅️</span>
            <p className={labelStyle}>IZQUIERDA</p>
          </div>

          <div
            className={`${cardBase} ${
              selectedDirection === "RIGHT" ? selectedOutline : ""
            }`}
            onClick={() => setSelectedDirection("RIGHT")}
          >
            <span className={arrowStyle}>➡️</span>
            <p className={labelStyle}>DERECHA</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className={buttonContainer}>
          <Button
            onClick={confirmSelection}
            title="Confirmar"
            disabled={!selectedDirection}
          >
            Confirmar
          </Button>

        </div>
      </div>
    </div>
  );
};

export default SelectDirectionModal;
