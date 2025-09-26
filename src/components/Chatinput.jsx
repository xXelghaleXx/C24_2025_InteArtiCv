import { Send } from "lucide-react";
import PropTypes from "prop-types"; // Importa PropTypes

const ChatInput = ({ mensaje, setMensaje, onEnviar }) => {
  return (
    <div className="chat-input">
      <input
        type="text"
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        placeholder="Escribe tu respuesta..."
      />
      <button onClick={onEnviar}>
        <Send size={20} />
      </button>
    </div>
  );
};

// Validación de PropTypes
ChatInput.propTypes = {
  mensaje: PropTypes.string.isRequired,
  setMensaje: PropTypes.func.isRequired,
  onEnviar: PropTypes.func.isRequired,
};

export default ChatInput;
