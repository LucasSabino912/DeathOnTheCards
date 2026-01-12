export default function NombreDePartida({ nombre_partida, setNombrePartida, setError }) {
  return (
    <div>
      <label className="text-[#FFD700] font-[Limelight]">Nombre de la partida: </label>
      <input
        type="text"
        value={nombre_partida}
        maxLength={200}
        onChange={(e) => 
          { 
            setNombrePartida(e.target.value);
            setError("");
          }
        }
        className="nombre-partida-input"
      />
    </div>
  );
}
