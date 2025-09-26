import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, Download, Search, FileText } from "lucide-react";
import '../styles/LectorCV.css';

const API_BASE_URL = "http://127.0.0.1:8000";

// Hook personalizado para el efecto de escritura tipo Gemini
const useGeminiTypewriter = () => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef(null);
  const indexRef = useRef(0);

  const typeText = (text, options = {}) => {
    const { 
      speed = 8,            // Súper rápido como Gemini
      pauseAfterPunctuation = 40,
      pauseAfterComma = 20,
      showThinkingTime = 300
    } = options;

    setDisplayedText("");
    setIsTyping(true);
    indexRef.current = 0;

    // Simular "pensando" inicial
    setTimeout(() => {
      const typeCharacter = () => {
        if (indexRef.current < text.length) {
          const char = text[indexRef.current];
          
          setDisplayedText(prev => prev + char);
          
          let delay = speed + Math.random() * 10; // Menos variación para más velocidad
          
          // Pausas más breves y naturales
          if (indexRef.current > 0) {
            const prevChar = text[indexRef.current - 1];
            if (/[.!?]/.test(prevChar)) {
              delay += pauseAfterPunctuation;
            } else if (prevChar === ',') {
              delay += pauseAfterComma;
            } else if (char === ' ') {
              delay = Math.max(5, delay * 0.3); // Espacios mucho más rápidos
            }
          }
          
          indexRef.current++;
          timeoutRef.current = setTimeout(typeCharacter, delay);
        } else {
          setIsTyping(false);
        }
      };
      
      typeCharacter();
    }, showThinkingTime);
  };

  const stopTyping = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsTyping(false);
  };

  const resetText = () => {
    stopTyping();
    setDisplayedText("");
    indexRef.current = 0;
  };

  return { displayedText, isTyping, typeText, stopTyping, resetText };
};

// Componente de puntos de "pensando"
const ThinkingDots = () => (
  <motion.div
    className="thinking-dots"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {[0, 1, 2].map((index) => (
      <motion.div
        key={index}
        className="thinking-dot"
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          delay: index * 0.2,
          ease: "easeInOut"
        }}
      />
    ))}
  </motion.div>
);

// Componente de Empty State
const EmptyStateIllustration = () => (
  <motion.svg
    className="empty-state-svg"
    width="200"
    height="150"
    viewBox="0 0 200 150"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <motion.rect
      x="30"
      y="60"
      width="140"
      height="80"
      rx="8"
      fill="#f8fafc"
      stroke="#e2e8f0"
      strokeWidth="2"
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    />
    
    <motion.path
      d="M30 60 L30 52 Q30 48 34 48 L80 48 Q84 48 86 52 L94 60 Z"
      fill="#e2e8f0"
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.3 }}
    />
    
    <motion.g
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.4 }}
    >
      <path
        d="M85 85 Q75 75 90 75 Q95 70 105 75 Q115 70 125 75 Q135 75 125 85 Z"
        fill="#6c757d"
        opacity="0.8"
      />
      <circle cx="100" cy="82" r="8" fill="#6c757d" opacity="0.6" />
    </motion.g>
    
    <motion.g
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.3 }}
    >
      <path
        d="M100 95 L100 105 M95 100 L100 95 L105 100"
        stroke="#6c757d"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </motion.g>
    
    <motion.g
      animate={{ y: [-2, 2, -2] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <rect x="45" y="30" width="20" height="25" rx="2" fill="#10b981" opacity="0.7" />
      <rect x="48" y="33" width="14" height="2" rx="1" fill="white" />
      <rect x="48" y="37" width="10" height="2" rx="1" fill="white" />
      <rect x="48" y="41" width="12" height="2" rx="1" fill="white" />
    </motion.g>
    
    <motion.g
      animate={{ y: [2, -2, 2] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
    >
      <rect x="135" y="35" width="20" height="25" rx="2" fill="#f59e0b" opacity="0.7" />
      <rect x="138" y="38" width="14" height="2" rx="1" fill="white" />
      <rect x="138" y="42" width="10" height="2" rx="1" fill="white" />
      <rect x="138" y="46" width="12" height="2" rx="1" fill="white" />
    </motion.g>
  </motion.svg>
);

// Componente de Loading con esferas
const LoadingSpheresAnimation = ({ text = "Procesando..." }) => (
  <motion.div
    className="loading-container"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="loading-spheres">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="loading-sphere"
          animate={{
            y: [-8, 8, -8],
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
    <motion.p
      className="loading-text"
      animate={{ opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      {text}
    </motion.p>
  </motion.div>
);

// Componente principal
const LectorCV = () => {
  const [cvUploaded, setCvUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [cvId, setCvId] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [analysisText, setAnalysisText] = useState("");
  const [loadingText, setLoadingText] = useState("Procesando...");

  // Usar nuestro hook personalizado de escritura
  const { displayedText, isTyping, typeText, resetText } = useGeminiTypewriter();

  // Ejecutar efecto de escritura cuando el análisis esté listo
  useEffect(() => {
    if (reportReady && analysisText) {
      typeText(analysisText, {
        speed: 8,               // Súper rápido como Gemini
        pauseAfterPunctuation: 40,
        pauseAfterComma: 20,
        showThinkingTime: 400   // Menos tiempo de "pensando"
      });
    }
  }, [reportReady, analysisText]);

  const uploadCVToAPI = async (file) => {
    const formData = new FormData();
    formData.append("archivo", file);
    formData.append("alumno_id", 1);

    try {
      setLoading(true);
      setLoadingText("Subiendo archivo...");
      
      const response = await fetch(`${API_BASE_URL}/api/subir-cv/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al subir el CV");
      }

      const data = await response.json();
      console.log("✅ CV subido con éxito:", data);

      setCvId(data.cv.id);
      setCvUploaded(true);
      setFileName(file.name);
      setUploadError(null);
    } catch (error) {
      console.error("❌ Error:", error);
      setUploadError(error.message || "Error al subir el CV. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const analyzeCV = async () => {
    if (!cvId) {
      setUploadError("Primero sube un CV antes de analizarlo.");
      return;
    }

    setLoading(true);
    setLoadingText("Analizando con IA...");
    resetText(); // Limpiar texto anterior
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/analizar-cv/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv_id: cvId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al analizar el CV");
      }

      const data = await response.json();
      console.log("✅ Análisis completado:", data);

      setAnalysisText(data.informe.resumen);
      setReportReady(true);
      setReportId(data.informe.id);
      setUploadError(null);
    } catch (error) {
      console.error("❌ Error:", error);
      setUploadError(error.message || "Error al analizar el CV. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    if (!reportId) {
      setUploadError("No hay informe disponible para descargar.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/descargar-informe/${reportId}/`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Error al descargar el informe");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Informe_CV.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("❌ Error:", error);
      setUploadError("Error al descargar el informe.");
    }
  };

  const handleCancel = async () => {
    if (!cvId) {
      setUploadError("No hay un CV para cancelar.");
      return;
    }

    setLoading(true);
    setLoadingText("Cancelando...");
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/eliminar-cv/${cvId}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al cancelar el CV");
      }

      console.log("✅ CV cancelado con éxito");

      setCvUploaded(false);
      setFileName("");
      setCvId(null);
      setReportReady(false);
      setReportId(null);
      setAnalysisText("");
      resetText();
      setUploadError(null);
    } catch (error) {
      console.error("❌ Error:", error);
      setUploadError("Error al cancelar el CV. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ["application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        setUploadError("Solo se permiten archivos PDF.");
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setUploadError("El archivo no puede ser mayor a 5MB.");
        return;
      }

      setUploadError(null);
      uploadCVToAPI(file);
    }
  };

  return (
      <div className="lector-cv-content">
        {/* Lector de CV (Izquierda) */}
        <motion.div
          className="cv-panel"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {loading ? (
            <LoadingSpheresAnimation text={loadingText} />
          ) : cvUploaded ? (
            <motion.div
              className="uploaded-file"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <FileText size={24} className="file-icon" />
              <span className="file-name">{fileName}</span>
              <CheckCircle size={24} className="file-success" />
            </motion.div>
          ) : (
            <label className="upload-label">
              <input
                type="file"
                accept=".pdf"
                onChange={handleUpload}
                hidden
              />
              <EmptyStateIllustration />
              <motion.span
                className="upload-text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.3 }}
              >
                Arrastra tu CV aquí o haz clic para subir
              </motion.span>
              <motion.span
                className="upload-subtext"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.3 }}
              >
                Formatos soportados: PDF (máx. 5MB)
              </motion.span>
            </label>
          )}

          {uploadError && (
            <motion.p
              className="error-message"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {uploadError}
            </motion.p>
          )}

          {/* Barra de revisión */}
          {cvUploaded && !loading && (
            <motion.div
              className="review-bar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.button
                className="btn-analyze"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={analyzeCV}
                disabled={loading}
              >
                <Search size={20} /> Analizar CV
              </motion.button>
              
              <motion.button
                className="btn-cancel"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                disabled={loading}
              >
                <X size={20} /> Cancelar
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Panel de Análisis (Derecha) */}
        <AnimatePresence>
          {reportReady && (
            <motion.div
              className="analysis-panel"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <h3 className="analysis-title">
                Análisis del CV
                {isTyping && <ThinkingDots />}
              </h3>
              
              <div className="analysis-content">
                {displayedText}
                {/* Cursor parpadeante tipo Gemini */}
                {isTyping && (
                  <motion.span
                    className="typing-cursor"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </div>
              
              <motion.button
                className="download-btn"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadReport}
              >
                <Download size={18} /> Descargar el informe
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
};

export default LectorCV;