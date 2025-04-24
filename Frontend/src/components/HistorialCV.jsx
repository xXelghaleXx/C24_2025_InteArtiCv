import { useState, useEffect } from 'react';
import { AlertCircle, FileText, Trash2, Eye, Clock } from 'lucide-react';
import '../styles/HistorialCV.css';

const HistorialCVs = () => {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchCVs();
  }, []);

  const fetchCVs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/historial-cvs/1/');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setCvs(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching CV history:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Modifica la función handleDeleteCV para verificar el token
const handleDeleteCV = async (cvId) => {
  if (!window.confirm('¿Estás seguro de que deseas eliminar este CV?')) {
    return;
  }

  const token = localStorage.getItem('access_token');
  if (!token) {
    alert('No hay sesión activa. Por favor, inicia sesión nuevamente.');
    return;
  }

  try {
    setDeletingId(cvId);
    const response = await fetch(`http://127.0.0.1:8000/api/eliminar-cv/${cvId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response:', errorData);
      throw new Error(errorData.error || 'Error al eliminar el CV');
    }

    // Actualizar la lista de CVs después de eliminar
    setCvs(cvs.filter(cv => cv.id !== cvId));
  } catch (err) {
    console.error('Error deleting CV:', err);
    alert('No se pudo eliminar el CV. Por favor, inténtalo de nuevo.');
  } finally {
    setDeletingId(null);
  }
};

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader-content">
          <div className="spinner"></div>
          <p className="loader-text">Cargando historial de CVs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <AlertCircle className="error-icon" />
          <h3 className="error-title">Error al cargar los datos</h3>
        </div>
        <p className="error-message">{error}</p>
        <p className="error-message">Verifica que el servidor esté funcionando y vuelve a intentarlo.</p>
      </div>
    );
  }

  if (!cvs || cvs.length === 0) {
    return (
      <div className="empty-container">
        <div className="empty-content">
          <FileText className="empty-icon" />
          <h3 className="empty-title">No hay CVs registrados</h3>
          <p className="empty-message">Aún no se ha subido ningún CV al sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="historial-container">
      <div className="historial-header">
        <h2 className="historial-title">
          <Clock className="header-icon" />
          Historial de CVs
        </h2>
      </div>
      
      <div className="table-container">
        <table className="cvs-table">
          <thead>
            <tr>
              <th className="table-header">Nombre del Archivo</th>
              <th className="table-header">Fecha de Subida</th>
              <th className="table-header">Estado</th>
              <th className="table-header">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cvs.map((cv) => (
              <tr key={cv.id} className="table-row">
                <td className="table-cell">
                  <div className="file-info">
                    <FileText className="file-icon" />
                    <div className="file-name">{cv.nombre_archivo || 'CV sin nombre'}</div>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="date-info">{formatDate(cv.fecha_subida)}</div>
                </td>
                <td className="table-cell">
                  <span className={`status-badge ${cv.procesado ? 'status-processed' : 'status-pending'}`}>
                    {cv.procesado ? 'Procesado' : 'Pendiente'}
                  </span>
                </td>
                <td className="table-cell">
                  <div className="action-buttons">
                    <button 
                      className="view-button"
                      onClick={() => window.open(cv.url_archivo, '_blank')}
                    >
                      <Eye className="action-icon" />
                      Ver
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => handleDeleteCV(cv.id)}
                      disabled={deletingId === cv.id}
                    >
                      <Trash2 className="action-icon" />
                      {deletingId === cv.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistorialCVs;