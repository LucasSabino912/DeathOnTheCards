// src/components/LoginBox.jsx
import "../../containers/loginScreen/LoginScreen.css";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext.jsx';
import AvatarSelector from './AvatarSelector';
import { useGame } from "../../context/GameContext.jsx";

function LoginBox() {
  const navigate = useNavigate();
  const { userDispatch } = useUser();
  
  // Local form state
  const [formData, setFormData] = useState({
    nombre: '',
    fechaNacimiento: '',
    avatar: ''
  });
  const [error, setError] = useState('');
  const [usuarios, setUsuarios] = useState([]); // You might want to move this to a separate context

  //Validación del nombre
  const validarNombre = (nombre) => {
    //Verificar longitud
    if (nombre.length > 20) {
      return 'El nombre no puede tener más de 20 caracteres';
    }
    
    //Verificar caracteres especiales (solo permite letras, números, espacios y tildes)
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]*$/;
    if (!regex.test(nombre)) {
      return 'El nombre solo puede contener letras, números y espacios';
    }
    
    //Verificar que no esté vacío o solo espacios
    if (nombre.trim().length === 0 && nombre.length > 0) {
      return 'El nombre no puede estar vacío';
    }
    
    return '';
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    
    if (!formData.nombre || !formData.fechaNacimiento || !formData.avatar) {
      setError('todos los campos son obligatorios');
      return;
    }

    //Validar nombre antes de enviar
    const errorNombre = validarNombre(formData.nombre);
    if (errorNombre) {
      setError(errorNombre);
      return;
    }

    const fecha = new Date(formData.fechaNacimiento);
    const hoy = new Date();
    if (fecha > hoy) {
      setError('Fecha de nacimiento incorrecta');
      return;
    }

    const existe = usuarios.some(u => 
      u.nombre === formData.nombre && u.avatar === formData.avatar
    );
    if (existe) {
      setError('Ya existe un usuario con el mismo nombre y avatar');
      return;
    }

    // Update UserContext with the form data
    userDispatch({
      type: 'SET_USER',
      payload: {
        name: formData.nombre,
        avatarPath: formData.avatar,
        birthdate: formData.fechaNacimiento,
        isHost: false // Default to false, can be set elsewhere
      }
    });

    // Add to usuarios list (you might want to handle this differently)
    setUsuarios(prev => [...prev, {
      nombre: formData.nombre,
      fechaNacimiento: formData.fechaNacimiento,
      avatar: formData.avatar
    }]);

    // Reset form
    setFormData({
      nombre: '',
      fechaNacimiento: '',
      avatar: ''
    });
    setError('');

    navigate('/lobby');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  return (
    <div className="screen-container">
      <div className="input-container">
        <h1>Ingresa tus datos</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="nombre">Nombre:</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              placeholder="Ingresar nombre"
              required
              autoComplete="off"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="avatar">Avatar:</label>
            <AvatarSelector
              selected={formData.avatar}
              onChange={(value) => handleInputChange('avatar', value)}
              options={[
                { value: './avatar1.jpg' },
                { value: './avatar2.jpg' },
                { value: './avatar3.jpg' },
                { value: './avatar4.jpg' },
                { value: './avatar5.jpg' },
                { value: './avatar6.jpg' },
              ]}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="fechaNacimiento">Fecha de nacimiento:</label>
            <input
              type="date"
              id="fechaNacimiento"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="submit-btn">Ingresar</button>
        </form>
      </div>
    </div>
  );
}

export default LoginBox;