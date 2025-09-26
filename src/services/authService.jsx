import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

export const authService = {
  // Validate if email belongs to the Tecsup domain
  validateTecsupDomain: (email) => {
    return email.endsWith('@tecsup.edu.pe');
  },
  
  login: async (correo, contrasena) => {
    try {
      // Validate email domain before attempting login
      if (!authService.validateTecsupDomain(correo)) {
        throw new Error('Solo se permite el acceso con correo institucional de Tecsup');
      }
      
      const response = await axios.post(`${API_URL}login/`, {
        correo,
        contrasena
      });
      
      // Guardar tokens
      if (response.data.access && response.data.refresh) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        
        // Guardar información del usuario
        localStorage.setItem('user', JSON.stringify({
          nombre: response.data.nombre,
          correo: response.data.correo
        }));

        return response.data;
      }
      
      throw new Error('No se recibieron tokens de autenticación');
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      // Validate email domain before attempting registration
      if (!authService.validateTecsupDomain(userData.correo)) {
        throw new Error('Solo se permite el registro con correo institucional de Tecsup');
      }
      
      const response = await axios.post(`${API_URL}registro/`, userData);
      
      // Opcional: Iniciar sesión automáticamente después del registro
      if (response.data.access && response.data.refresh) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        localStorage.setItem('user', JSON.stringify({
          nombre: response.data.nombre,
          correo: response.data.correo
        }));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error en el registro:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  getCurrentUser: () => {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  },
  
  getUserEmail: () => {
    const user = authService.getCurrentUser();
    return user ? user.correo : null;
  },

  getUserName: () => {
    const user = authService.getCurrentUser();
    return user ? user.nombre : 'Usuario';
  },
  
  // Check if user has Tecsup email
  hasValidDomain: () => {
    const email = authService.getUserEmail();
    return email ? authService.validateTecsupDomain(email) : false;
  }
};

export default authService;