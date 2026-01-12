import { useGame } from "../../context/GameContext";
import getCardsImage from "../../helpers/HelperImageCards";

export default function HandCards({ selectedCards, onSelect }) {
  const { gameState } = useGame()
  const hand = gameState.mano

  return (
    <div style={{
      display: "flex",
      gap: "16px",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
      maxWidth: "1200px"
    }}>
      {hand.map((card) => {
        const src = getCardsImage(card);
        const isSelected = selectedCards.some(selected => selected.id === card.id);
        
        return (
          <button
            key={card.id + " " + card.name }
            type="button"
            onClick={() => onSelect(card.id)}
            style={{
              border: isSelected ? "3px solid #FFD700" : "none",
              background: "transparent",
              borderRadius: "8px",
              cursor: "pointer",
              padding: 0
            }}
          >
            {src ? (
              <img
                src={src}
                alt={card.name}
                style={{ 
                  width: "120px", 
                  height: "160px", 
                  objectFit: "cover", 
                  display: "block", 
                  borderRadius: "8px" 
                }}
              />
            ) : (
              <div style={{
                width: "120px",
                height: "160px",
                background: "#333",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "12px",
                textAlign: "center",
                padding: "8px"
              }}>
                {card.name}
              </div>
            )}
          </button>
        )
      })}
    </div>
  );
}