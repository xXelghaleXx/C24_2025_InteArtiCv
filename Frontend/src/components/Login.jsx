import { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import '../styles/Login.css';

const TecsupLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const responseGoogle = async (response) => {
    console.log(response);
    if (response.credential) {
      // Decodificar el token para obtener la información del usuario
      const decodedToken = JSON.parse(atob(response.credential.split('.')[1]));
      const googleId = decodedToken.sub;
      const nombre = decodedToken.name;
      const correo = decodedToken.email;

      try {
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
          // En tu implementación real aquí irían:
          // localStorage.setItem('access_token', data.access);
          // localStorage.setItem('refresh_token', data.refresh);
          // localStorage.setItem('alumno_id', data.alumno_id);
          // localStorage.setItem('nombre', data.nombre);
          
          // navigate('/welcome', { state: { username: nombre } });
          console.log('Login exitoso:', nombre);
          alert(`¡Bienvenido ${nombre}! Login exitoso.`);
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

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Login normal:', { email, password });
    // navigate('/welcome');
  };

  const handleGoogleLogin = () => {
    console.log('Iniciar sesión con Google');
    // Aquí iría la lógica de Google Login
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <div className="tecsup-login-container">
        {/* Gran cuadro unificado */}
        <div className="tecsup-unified-card">
          {/* Lado izquierdo - Formulario */}
          <div className="tecsup-form-side">
            <div className="tecsup-form-container">
              {/* Header y Logo */}
              <div className="tecsup-header">
                <div className="tecsup-logo">
                  <span className="tecsup-logo-text">Tecsup</span>
                  <span className="tecsup-tagline">TECNOLOGÍA CON SENTIDO</span>
                </div>
                <h1 className="tecsup-system-title">Sistema Académico CPE</h1>
              </div>

              {/* Formulario */}
              <div className="tecsup-form">
                <div className="tecsup-input-group">
                  <input
                    type="text"
                    id="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Usuario (DNI)"
                    className="tecsup-input"
                    required
                  />
                </div>

                <div className="tecsup-input-group">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="tecsup-input"
                    required
                  />
                </div>

                <div className="tecsup-forgot-password">
                  <a href="#" className="tecsup-forgot-link">¿Olvidó la contraseña?</a>
                </div>

                <button type="button" onClick={handleLogin} className="tecsup-login-btn">
                  Iniciar Sesión
                </button>

                <div className="tecsup-divider">
                  <span>o</span>
                </div>

                <div className="tecsup-google-container">
                  <GoogleLogin
                    onSuccess={responseGoogle}
                    onError={() => {
                      console.log('Login Failed');
                      alert('Error al iniciar sesión con Google. Por favor, inténtalo de nuevo.');
                    }}
                    theme="outline"
                    text="signin_with"
                    shape="rectangular"
                    width="100%"
                  />
                </div>

                <div className="tecsup-register">
                  <span>¿No tienes una cuenta? </span>
                  <a href="#" className="tecsup-register-link">Crear una cuenta</a>
                </div>
              </div>
            </div>
          </div>

          {/* Lado derecho - Imagen */}
          <div className="tecsup-image-side">
            <div className="tecsup-image-overlay">
              {/* Imagen central */}
              <div className="tecsup-center-image">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
                  alt="Estudiantes de TECSUP"
                  className="tecsup-main-image"
                />
                <div className="tecsup-image-caption">
                  Tecnología con Sentido
                </div>
                <div className="tecsup-image-subcaption">
                  Formando profesionales del futuro
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default TecsupLogin;