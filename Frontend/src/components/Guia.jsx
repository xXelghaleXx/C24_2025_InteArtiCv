import "../styles/Guia.css"; // Verifica que la ruta y el nombre del archivo CSS sean correctos
import Header from "./Header";
import Footer from "./Footer";

const Guide = () => {
  return (
    <>
      <Header />
      <div className="terms-container">
        <div className="terms-box">
          <h2 className="terms-title">Términos y Condiciones de Uso</h2>
          <h3 className="terms-subtitle">
            Lector de Currículums con IA y Simulación de Entrevistas
          </h3>
          <p className="terms-date">
            Fecha de última actualización: [Coloca la fecha]
          </p>

          <h3 className="terms-subtitle">1. Introducción</h3>
          <p className="terms-text">
            Bienvenido/a al{" "}
            <strong>
              Lector de Currículums con IA y Simulación de Entrevistas
            </strong>
            . Al utilizar este software, usted acepta cumplir con estos términos
            y condiciones. Si no está de acuerdo con alguna disposición, le
            recomendamos no utilizar la plataforma.
          </p>

          <h3 className="terms-subtitle">2. Objetivo del Software</h3>
          <p className="terms-text">
            Este software facilita el análisis de currículums y la simulación de
            entrevistas con IA, ayudando en la selección de candidatos mediante
            informes automatizados.
          </p>

          <h3 className="terms-subtitle">3. Uso Permitido</h3>
          <ul className="terms-list">
            <li>
              Utilizar el software de manera ética y legal en procesos de
              selección.
            </li>
            <li>
              No emplearlo para decisiones discriminatorias o injustas.
            </li>
            <li>
              Proteger la privacidad y confidencialidad de los datos procesados.
            </li>
          </ul>

          <h3 className="terms-subtitle">4. Transparencia y Explicabilidad</h3>
          <p className="terms-text">
            El software proporciona sugerencias basadas en IA, pero las
            decisiones finales deben ser humanas.
          </p>

          <h3 className="terms-subtitle">5. Privacidad y Protección de Datos</h3>
          <p className="terms-text">
            Cumplimos con la{" "}
            <strong>
              Ley de Protección de Datos Personales (Ley N° 29733)
            </strong>
            . La información proporcionada solo se utilizará con fines de
            evaluación y no será compartida sin autorización.
          </p>

          <h3 className="terms-subtitle">6. No Discriminación y Equidad</h3>
          <p className="terms-text">
            Se prohíbe el uso del software para prácticas discriminatorias basadas
            en género, raza, religión, orientación sexual, discapacidad u otros
            criterios protegidos por ley.
          </p>

          <h3 className="terms-subtitle">7. Seguridad y Confiabilidad</h3>
          <p className="terms-text">
            Implementamos medidas de seguridad para evitar accesos no autorizados
            y garantizar la integridad de los datos.
          </p>

          <h3 className="terms-subtitle">8. Responsabilidad del Usuario</h3>
          <p className="terms-text">
            Los usuarios deben proporcionar información veraz y no manipular los
            resultados generados por la IA.
          </p>

          <h3 className="terms-subtitle">9. Limitación de Responsabilidad</h3>
          <p className="terms-text">
            El software no garantiza precisión absoluta y debe ser usado como una
            herramienta complementaria en la evaluación de candidatos.
          </p>

          <h3 className="terms-subtitle">10. Cumplimiento de Normativas</h3>
          <p className="terms-text">
            Se rige por leyes locales e internacionales sobre protección de datos y
            ética en IA.
          </p>

          <h3 className="terms-subtitle">11. Modificaciones a los Términos</h3>
          <p className="terms-text">
            Nos reservamos el derecho de modificar estos términos en cualquier
            momento. Se notificará a los usuarios sobre cualquier cambio.
          </p>

          <h3 className="terms-subtitle">12. Contacto</h3>
          <p className="terms-text">
            Para dudas o consultas, comuníquese con nuestro equipo de soporte en
            [correo o sitio web].
          </p>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Guide;
