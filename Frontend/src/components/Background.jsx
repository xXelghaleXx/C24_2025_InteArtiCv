import "../styles/background.css"; // Asegurar que los estilos están importados

const Background = () => {
  return (
    <div className="background-wrapper">
      <svg
        version="1.1"
        id="home-anim"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 1820 1080"
        className="background-svg"
      >
        <g id="home">
          <defs>
            <rect id="masque" y="0.4" width="1820" height="1080" />
          </defs>
          <clipPath id="cache">
            <use xlinkHref="#masque" style={{ overflow: "visible" }} />
          </clipPath>
          <g id="light-blue">
            {/* Líneas originales */}
            <line x1="630.8" y1="894.3" x2="476.3" y2="1048.8" />
            <line x1="858.2" y1="823.9" x2="1012.7" y2="669.4" />
            <line x1="1066.9" y1="458.2" x2="912.4" y2="612.7" />
            <line x1="1294.3" y1="387.8" x2="1448.8" y2="233.3" />
            <line x1="1503" y1="22.1" x2="1348.5" y2="176.6" />
            <line x1="895.6" y1="1166.6" x2="1050.1" y2="1012.1" />
            <line x1="1104.3" y1="800.9" x2="949.8" y2="955.4" />

            {/* Líneas adicionales para los costados */}
            <line x1="50" y1="100" x2="200" y2="250" />
            <line x1="50" y1="300" x2="200" y2="450" />
            <line x1="50" y1="500" x2="200" y2="650" />
            <line x1="50" y1="700" x2="200" y2="850" />
            <line x1="50" y1="900" x2="200" y2="1050" />

            <line x1="1620" y1="100" x2="1770" y2="250" />
            <line x1="1620" y1="300" x2="1770" y2="450" />
            <line x1="1620" y1="500" x2="1770" y2="650" />
            <line x1="1620" y1="700" x2="1770" y2="850" />
            <line x1="1620" y1="900" x2="1770" y2="1050" />
          </g>
          <g id="red">
            {/* Líneas originales */}
            <line x1="794.4" y1="883.4" x2="639.8" y2="1037.9" />
            <line x1="694.6" y1="834.8" x2="849.2" y2="680.3" />
            <line x1="1230.4" y1="447.3" x2="1075.9" y2="601.8" />

            {/* Líneas adicionales para los costados */}
            <line x1="100" y1="150" x2="250" y2="300" />
            <line x1="100" y1="350" x2="250" y2="500" />
            <line x1="100" y1="550" x2="250" y2="700" />
            <line x1="100" y1="750" x2="250" y2="900" />
            <line x1="100" y1="950" x2="250" y2="1100" />

            <line x1="1670" y1="150" x2="1820" y2="300" />
            <line x1="1670" y1="350" x2="1820" y2="500" />
            <line x1="1670" y1="550" x2="1820" y2="700" />
            <line x1="1670" y1="750" x2="1820" y2="900" />
            <line x1="1670" y1="950" x2="1820" y2="1100" />
          </g>
          <g id="blue">
            {/* Líneas originales */}
            <line x1="225.8" y1="1151" x2="534.9" y2="841.9" />
            <line x1="827.1" y1="1003.3" x2="518" y2="1312.3" />
            <line x1="661.9" y1="714.9" x2="971" y2="405.9" />

            {/* Líneas adicionales para los costados */}
            <line x1="150" y1="200" x2="300" y2="350" />
            <line x1="150" y1="400" x2="300" y2="550" />
            <line x1="150" y1="600" x2="300" y2="750" />
            <line x1="150" y1="800" x2="300" y2="950" />
            <line x1="150" y1="1000" x2="300" y2="1150" />

            <line x1="1570" y1="200" x2="1720" y2="350" />
            <line x1="1570" y1="400" x2="1720" y2="550" />
            <line x1="1570" y1="600" x2="1720" y2="750" />
            <line x1="1570" y1="800" x2="1720" y2="950" />
            <line x1="1570" y1="1000" x2="1720" y2="1150" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default Background;