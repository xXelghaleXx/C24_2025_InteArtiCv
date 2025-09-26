import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import "../styles/Chat.css";

const API_BASE_URL = "http://127.0.0.1:8000";

const EntrevistaChat = () => {
  const [chat, setChat] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [entrevistaId, setEntrevistaId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [entrevistaFinalizada, setEntrevistaFinalizada] = useState(false);

  // Iniciar entrevista automáticamente al cargar el componente
  useEffect(() => {
    // Verificar si hay una entrevista guardada
    const entrevistaGuardada = localStorage.getItem("entrevistaActual");
    
    if (entrevistaGuardada) {
      try {
        const { id, chatHistory } = JSON.parse(entrevistaGuardada);
        setEntrevistaId(id);
        setChat(chatHistory || []);
      } catch (e) {
        console.error("Error al recuperar la entrevista guardada:", e);
        localStorage.removeItem("entrevistaActual");
        iniciarNuevaEntrevista();
      }
    } else {
      // Iniciar automáticamente una nueva entrevista
      iniciarNuevaEntrevista();
    }
  }, []);

  // Guardar el estado de la entrevista actual
  useEffect(() => {
    if (entrevistaId && chat.length > 0) {
      localStorage.setItem("entrevistaActual", JSON.stringify({
        id: entrevistaId,
        chatHistory: chat
      }));
    }
  }, [entrevistaId, chat]);

  // Función para iniciar una nueva entrevista
  const iniciarNuevaEntrevista = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/chat/iniciar/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // Usuario ya autenticado
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar la entrevista");
      }

      setEntrevistaId(data.entrevista_id);
      setChat([{ tipo: "ia", texto: data.pregunta_texto }]);
      setEntrevistaFinalizada(false);
    } catch (error) {
      setError("No se pudo iniciar la entrevista");
      console.error("Error al iniciar entrevista:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para enviar la respuesta del usuario
  const handleEnviarMensaje = async () => {
    if (mensaje.trim() === "") {
      return;
    }

    if (!entrevistaId) {
      setError("No se ha iniciado una entrevista");
      return;
    }

    if (entrevistaFinalizada) {
      setError("La entrevista ya ha finalizado");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Añadir el mensaje del usuario al chat inmediatamente
      const mensajeUsuario = { tipo: "usuario", texto: mensaje };
      setChat(prevChat => [...prevChat, mensajeUsuario]);
      
      // Limpiar el input después de enviar
      setMensaje("");

      // Enviar la respuesta al backend
      const respuestaResponse = await fetch(`${API_BASE_URL}/api/chat/responder/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entrevista_id: entrevistaId,
          respuesta: mensajeUsuario.texto,
        }),
      });

      const respuestaData = await respuestaResponse.json();
      
      if (!respuestaResponse.ok) {
        throw new Error(respuestaData.error || "Error al enviar la respuesta");
      }

      // Actualizar el chat con la retroalimentación de la IA
      let nuevoChat = [...chat, mensajeUsuario];

      if (respuestaData.retroalimentacion) {
        nuevoChat.push({ tipo: "ia", texto: respuestaData.retroalimentacion });
        setChat(nuevoChat);
      }

      // Si hay una siguiente pregunta, agregarla al chat
      if (respuestaData.siguiente_pregunta_texto) {
        setTimeout(() => {
          setChat(prevChat => [...prevChat, { tipo: "ia", texto: respuestaData.siguiente_pregunta_texto }]);
        }, 500); // Pequeño retraso para simular tipeo
      } else {
        // Si no hay más preguntas, finalizar la entrevista
        const textoFinal = respuestaData.mensaje_final || "¡La entrevista ha finalizado!";
        setTimeout(() => {
          setChat(prevChat => [...prevChat, { tipo: "ia", texto: textoFinal }]);
          setEntrevistaFinalizada(true);
          localStorage.removeItem("entrevistaActual");
        }, 500);
      }
    } catch (error) {
      setError("Error al enviar tu respuesta");
      console.error("Error al responder:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hacer scroll al final del chat cuando se añaden nuevos mensajes
  useEffect(() => {
    const chatBox = document.querySelector('.chat-box');
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }, [chat]);

  return (
    <div className="chat-container">
      <div className="chat-box">
        {chat.map((mensaje, index) => (
          <div key={index} className={`mensaje ${mensaje.tipo}`}>
            {mensaje.tipo === "ia" ? (
              <div className="mensaje-content">
                <div className="avatar-ia"></div>
                <div className="texto-mensaje">{mensaje.texto}</div>
              </div>
            ) : (
              <div className="mensaje-content">
                <div className="texto-mensaje">{mensaje.texto}</div>
                <div className="avatar-usuario"></div>
              </div>
            )}
          </div>
        ))}
        {loading && 
          <div className="mensaje ia">
            <div className="mensaje-content">
              <div className="avatar-ia"></div>
              <div className="texto-mensaje loading">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          </div>
        }
      </div>

      {/* Input para enviar respuestas */}
      <div className="chat-input-container">
        <input
          type="text"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Escribe una pregunta"
          disabled={loading || entrevistaFinalizada || !entrevistaId}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading && !entrevistaFinalizada && mensaje.trim() !== "") {
              handleEnviarMensaje();
            }
          }}
        />
        <button 
          onClick={handleEnviarMensaje} 
          disabled={loading || mensaje.trim() === "" || entrevistaFinalizada || !entrevistaId}
        >
          <Send size={20} />
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default EntrevistaChat;