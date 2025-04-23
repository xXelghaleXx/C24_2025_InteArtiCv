import { GoogleOAuthProvider } from "@react-oauth/google";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import Welcome from "./components/Welcome";
import LectorCV from "./components/LectorCV";
import HistorialCV from "./components/HistorialCV";
import ChatEntrevista from "./components/Entrevista";
import Background from "./components/Background";
import "./styles/Chat.css";
import "./index.css";

const App = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  const handleLogout = () => {
    console.log("Usuario ha cerrado sesión");
    // Lógica de logout
  };

  return (
    <GoogleOAuthProvider clientId="TU_CLIENT_ID_DE_GOOGLE">
      {/* Estructura principal mejorada */}
      <div className="app-container">
        <Background />
        
        {/* Contenido principal con gestión de espacio */}
        <main className="main-content">
          {!isLoginPage && <Header onLogout={handleLogout} />}
          
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/lector-cv" element={<LectorCV />} />
              <Route path="/entrevista" element={<ChatEntrevista />} />
              <Route path="/historialCV" element={<HistorialCV />} />
            </Routes>
          </div>
        </main>
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;