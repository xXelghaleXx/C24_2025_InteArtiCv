import PropTypes from "prop-types"; // Importa PropTypes

const ChatBox = ({ chat, preguntaInicial }) => {
  return (
    <div className="chat-box">
      {/* Si no hay mensajes del usuario, muestra la primera pregunta */}
      {chat.length === 0 && <p className="pregunta-inicial">{preguntaInicial}</p>}

      {/* Itera y muestra cada mensaje */}
      {chat.map((mensaje, index) => (
        <div key={index} className={`mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      ))}
    </div>
  );
};

// Validación de PropTypes
ChatBox.propTypes = {
  chat: PropTypes.arrayOf(
    PropTypes.shape({
      tipo: PropTypes.string.isRequired,
      texto: PropTypes.string.isRequired,
    })
  ).isRequired,
  preguntaInicial: PropTypes.string.isRequired,
};

export default ChatBox;
