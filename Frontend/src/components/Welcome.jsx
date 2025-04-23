import "../styles/Welcome.css";
import Header from "./Header";
import Footer from "./Footer";
import cvReaderImage from "../assets/cv-reader.png";
import interviewSimulationImage from "../assets/interview-simulation.png";

const Welcome = () => {
  return (
    <div className="welcome-container">
      <Header />

      <div className="options-container">
        <div className="option-card">
          <img src={cvReaderImage} alt="Lector de C.V." />
          <h3>Lector de C.V.</h3>
          <button>
            <a href="/lector-cv">Pruebalo ahora</a>
          </button>
        </div>

        <div className="option-card">
          <img src={interviewSimulationImage} alt="Simulación de Entrevista" />
          <h3>Simulación de Entrevista</h3>
          <button>
            <a href="/entrevista">Pruebalo ahora</a>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Welcome;
