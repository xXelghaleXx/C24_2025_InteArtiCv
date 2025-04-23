import { useState } from "react";
import { Send } from "lucide-react";
import "../styles/Chat.css";

const API_BASE_URL = "http://127.0.0.1:8000";

const EntrevistaUnificada = () => {
  const [chat, setChat] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [entrevistaId, setEntrevistaId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alumnoId, setAlumnoId] = useState("");

  // Función para iniciar la entrevista
  const iniciarEntrevista = async () => {
    const id = parseInt(alumnoId);
    if (isNaN(id)) {
      setError("Por favor, ingresa un ID de alumno válido");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/chat/iniciar/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ alumno_id: id }),
      });

      if (!response.ok) {
        throw new Error("Error al iniciar la entrevista");
      }

      const data = await response.json();
      setEntrevistaId(data.entrevista_id);
      setChat([{ tipo: "ia", texto: data.pregunta_texto }]);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para enviar la respuesta del usuario
  const handleEnviarMensaje = async () => {
    if (mensaje.trim() === "") {
      setError("Por favor, escribe una respuesta.");
      return;
    }

    if (!entrevistaId) {
      setError("No se ha iniciado una entrevista.");
      return;
    }

    try {
      setLoading(true);

      // Enviar la respuesta al backend
      const respuestaResponse = await fetch(`${API_BASE_URL}/api/chat/responder/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entrevista_id: entrevistaId,
          respuesta: mensaje,
        }),
      });

      if (!respuestaResponse.ok) {
        throw new Error("Error al enviar la respuesta");
      }

      const respuestaData = await respuestaResponse.json();

      // Actualizar el chat con la respuesta del usuario y la retroalimentación de la IA
      const nuevoChat = [...chat, { tipo: "usuario", texto: mensaje }];

      if (respuestaData.retroalimentacion) {
        nuevoChat.push({ tipo: "ia", texto: respuestaData.retroalimentacion });
      }

      setChat(nuevoChat);
      setMensaje(""); // Limpiar el input después de enviar

      // Si hay una siguiente pregunta, agregarla al chat
      if (respuestaData.siguiente_pregunta_texto) {
        setChat([...nuevoChat, { tipo: "ia", texto: respuestaData.siguiente_pregunta_texto }]);
      } else {
        // Si no hay más preguntas, finalizar la entrevista
        const textoIA = "¡La entrevista ha finalizado! Calificación: Aprobada.";
        setChat([...nuevoChat, { tipo: "ia", texto: textoIA }]);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      {!entrevistaId ? (
        // Pantalla de inicio (ingresar ID del alumno)
        <div className="inicio-entrevista">
          <input
            type="number"
            value={alumnoId}
            onChange={(e) => setAlumnoId(e.target.value)}
            placeholder="ID del alumno"
            className="input-alumno"
          />
          <button onClick={iniciarEntrevista} disabled={loading} className="btn-iniciar">
            {loading ? "Iniciando entrevista..." : "Iniciar Entrevista"}
          </button>
          {error && <p className="error-message">{error}</p>}
        </div>
      ) : (
        // Pantalla de chat (preguntas y respuestas)
        <>
          <div className="chat-box">
            {chat.map((mensaje, index) => (
              <div key={index} className={`mensaje ${mensaje.tipo}`}>
                {mensaje.tipo === "ia" ? (
                  <strong>Entrevistador:</strong>
                ) : (
                  <strong>Tú:</strong>
                )}{" "}
                {mensaje.texto}
              </div>
            ))}
          </div>

          {/* Input para enviar respuestas */}
          <div className="chat-input">
            <input
              type="text"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe tu respuesta..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleEnviarMensaje();
                }
              }}
            />
            <button onClick={handleEnviarMensaje} disabled={loading}>
              <Send size={20} />
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}
        </>
      )}
    </div>
  );
};

export default EntrevistaUnificada;