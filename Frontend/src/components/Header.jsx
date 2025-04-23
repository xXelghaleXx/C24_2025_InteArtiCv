import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";
import Slidebar from "./Slidebar";
import logo from "../assets/logo.png";
import { FaPowerOff } from "react-icons/fa";

const Header = ({ onLogout }) => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario")) || {};

  const handleLogout = () => {
    // Limpiar el localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("usuario");
    
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
          <span className="user-name">{usuario.nombre || "Iniciar Sesión"}</span>
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