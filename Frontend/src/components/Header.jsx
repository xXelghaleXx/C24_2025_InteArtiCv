import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";
import Slidebar from "./Slidebar";
import logo from "../assets/logo.png";
import { FaPowerOff } from "react-icons/fa";

const Header = ({ onLogout }) => {
  const navigate = useNavigate();
  
  // Obtén el nombre completo del localStorage
  const nombreCompleto = localStorage.getItem("nombre");
  
  // Extrae solo la primera palabra (primer nombre)
  const primerNombre = nombreCompleto ? nombreCompleto.split(' ')[0] : "Usuario";

  const handleLogout = () => {
    // Limpiar el localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("alumno_id");
    localStorage.removeItem("nombre");
    
    // Ejecutar la función onLogout si existe
    if (onLogout) {
      onLogout();
    }
    
    // Redirigir al login
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-content">
        {/* Lado izquierdo */}
        <div className="logo-slidebar-container">
          <img src={logo} alt="Tecsup logo" className="logo" />
          <div className="separator"></div>
          <Slidebar />
        </div>

        {/* Lado derecho */}
        <div className="user-info">
          <span className="user-name">{primerNombre}</span>
          <button 
            className="logout-button"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
          >
            <FaPowerOff className="logout-icon" />
          </button>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  onLogout: PropTypes.func,
};

export default Header;