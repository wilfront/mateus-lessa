'use client';

import { useState, useEffect } from 'react';
import './dashboardFotos.css';

export default function DashboardFotos() {
  const [fotos, setFotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  const fetchFotos = async () => {
    const res = await fetch('/api/fotos');
    const data = await res.json();
    setFotos(data);
  };

  useEffect(() => {
    fetchFotos();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      // Aqui você pode salvar no seu banco se quiser manter referência
      setFotos(prev => [...prev, { id: data.public_id, url: data.secure_url }]);
      setFile(null);
    } catch (err) {
      console.error('Erro ao enviar foto:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    // opcional: integrar exclusão na Cloudinary via backend
    setFotos(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="dashboard-fotos">
      <h2>Painel de Fotos</h2>

      <div className="upload-container">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Enviando...' : 'Enviar Foto'}
        </button>
      </div>

      <div className="fotos-lista">
        {fotos.map(foto => (
          <div key={foto.id} className="foto-item">
            <img src={foto.url} alt="Foto" />
            <button className="delete-btn" onClick={() => handleDelete(foto.id)}>Excluir</button>
          </div>
        ))}
      </div>
    </div>
  );
}
