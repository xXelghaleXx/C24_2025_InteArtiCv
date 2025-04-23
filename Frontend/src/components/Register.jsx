import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import "../styles/Login.css";

const Registro = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: ''
  });

  useEffect(() => {
    // Ocultar el header cuando se monta el componente
    document.body.classList.add('hide-header');
    
    // Restaurar el header cuando se desmonta el componente
    return () => {
      document.body.classList.remove('hide-header');
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await authService.registro(formData);
      navigate('/login');
    } catch (err) {
      const errorMsg = err.response?.data?.detail 
        || err.response?.data?.message 
        || 'Error al registrar el usuario';
      
      setError(errorMsg);
      console.error('Registro error:', err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>REGISTRO DE NUEVO ALUMNO</h2>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="input-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              placeholder="Ingrese su nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="apellido">Apellido</label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              placeholder="Ingrese su apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="correo">Correo Electrónico</label>
            <input
              type="email"
              id="correo"
              name="correo"
              placeholder="Ingrese su correo"
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="contrasena">Contraseña</label>
            <input
              type="password"
              id="contrasena"
              name="contrasena"
              placeholder="Ingrese su contraseña"
              value={formData.contrasena}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          
          <button type="submit" className="login-button">
            Registrarse
          </button>

          <div className="login-link">
            ¿Ya tienes cuenta? <span onClick={() => navigate('/login')}>Inicia sesión aquí</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registro;