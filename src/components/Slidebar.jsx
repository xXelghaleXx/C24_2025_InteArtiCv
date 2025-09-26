import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/Slidebar.css"; 
import logo from "../assets/logo.png"; // Importamos la imagen correctamente

const Slidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const slidebarRef = useRef(null);

  const toggleSlidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    if (slidebarRef.current && !slidebarRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="slidebar-container" ref={slidebarRef}>
      <input className="slidebar-toggle" type="checkbox" checked={isOpen} onChange={toggleSlidebar} />
      <div className={`slidebar-icon ${isOpen ? "hide" : ""}`} onClick={toggleSlidebar}>
        <span className="top-bar common-bar"></span>
        <span className="middle-bar common-bar"></span>
        <span className="bottom-bar common-bar"></span>
      </div>
      <div className={`slidebar-menu ${isOpen ? "open" : ""}`}>
        <div className="menu-header">
          <img src={logo} alt="Tecsup logo" className="logo-slidebar" />
        </div>
        <ul className="menu-list">
          <li className="menu-item"><Link className="menu-link" to="/welcome" onClick={toggleSlidebar}>Inicio</Link></li>
          <li className="menu-item"><Link className="menu-link" to="/lector-cv" onClick={toggleSlidebar}>Lector de C.V.</Link></li>
          <li className="menu-item"><Link className="menu-link" to="/entrevista" onClick={toggleSlidebar}>Simulacion de entrevista</Link></li>
          <li className="menu-item"><Link className="menu-link" to="/historialCV" onClick={toggleSlidebar}>Historial CV</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default Slidebar;
