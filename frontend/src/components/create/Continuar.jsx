export default function Continuar({ nombre, onContinue, setError }) {
  const validar = () => {
    if (!nombre.trim()) {
      setError("El nombre de la partida no puede estar vacío");
      return;
    }
    if (nombre.length > 200) {
      setError("El nombre de la partida no puede tener más de 200 caracteres");
      return;
    }
    
    //Verificar caracteres especiales (solo permite letras, números, espacios y tildes)
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]*$/;
    if (!regex.test(nombre)) {
      setError("El nombre de la partida solo puede contener letras, números y espacios");
      return;
    }
    onContinue();
  };

  return (
    <div className="flex flex-col items-start">
      <button onClick={validar} className="btn-continuar">
        Crear Partida
      </button>
    </div>
  );
}
