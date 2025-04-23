import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();

  const responseGoogle = async (response) => {
    console.log(response);
    if (response.credential) {
      // Decodificar el token para obtener la información del usuario
      const decodedToken = JSON.parse(atob(response.credential.split('.')[1]));
      const googleId = decodedToken.sub; // ID único de Google
      const nombre = decodedToken.name; // Nombre del usuario
      const correo = decodedToken.email; // Correo del usuario

      try {
        // Enviar los datos al backend de Django
        const res = await fetch('http://localhost:8000/api/google-login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            google_id: googleId,
            nombre: nombre,
            correo: correo,
          }),
        });

        if (!res.ok) {
          console.error('Error HTTP:', res.status);
          throw new Error(`Error HTTP: ${res.status}`);
        }

        const data = await res.json();
        console.log('Respuesta del servidor:', data);
        
        if (data.status === 'success') {
          // Guardar los tokens en localStorage para mantener la sesión
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          localStorage.setItem('alumno_id', data.alumno_id);
          localStorage.setItem('nombre', data.nombre);
          
          // Redirigir al usuario a la página de bienvenida
          navigate('/welcome', { state: { username: nombre } });
        } else {
          console.error('Error en la autenticación:', data.error || 'Error desconocido');
          alert('Error al iniciar sesión con Google. Por favor, inténtalo de nuevo.');
        }
      } catch (error) {
        console.error('Error al procesar la autenticación:', error);
        alert('Error en el proceso de autenticación. Por favor, inténtalo de nuevo.');
      }
    }
  };

  // Función para manejar el login normal
  const handleLogin = (e) => {
    e.preventDefault();
    // Aquí iría el código para el login normal
    navigate('/welcome');
  };

  return (
    <GoogleOAuthProvider clientId="258181987281-jd71k4f6k0no7e61qk34mpvc6i7nh2sp.apps.googleusercontent.com">
      <div className="login-container">
        <div className="login-box">
          <h2>¡BIENVENIDO, POR FAVOR INICIA SESIÓN!</h2>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input type="email" id="email" placeholder="Ingrese su correo" />
            </div>
            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <input type="password" id="password" placeholder="Ingrese su contraseña" />
            </div>
            <br />
            <button type="submit">
              Iniciar Sesión
            </button>
            <br />
            <GoogleLogin
              onSuccess={responseGoogle}
              onError={(error) => {
                console.error('Login Failed:', error);
                alert('Error al iniciar sesión con Google');
              }}
              useOneTap
            />
          </form>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;