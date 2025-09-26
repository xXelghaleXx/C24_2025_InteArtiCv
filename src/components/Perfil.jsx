import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Importamos useNavigate
import PropTypes from "prop-types";
import "../styles/Perfil.css";

const Perfil = ({ onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate(); // ✅ Hook para redireccionar

  const handleLogout = () => {
    onLogout(); // Llamamos la función de logout
    navigate("/"); // ✅ Redirigimos al login
  };

  return (
    <div className="perfil-container">
      {/* Botón de perfil */}
      <button className="perfil-button" onClick={() => setMenuOpen(!menuOpen)}>
        <span className="perfil-icon">👤</span>
      </button>

      {/* Menú desplegable con animación */}
      {menuOpen && (
        <div className="perfil-menu show">
          <button className="logout-button" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
};

/* ✅ Validar las props con PropTypes */
Perfil.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

export default Perfil;
