"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseConfig";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { addShow, deleteShow } from "@/lib/agendaService";
import { addFoto, deleteFoto, addVideo, deleteVideo } from "@/lib/mediaService";
import "./dashboard.css";

export default function DashboardPage() {
  const [message, setMessage] = useState("Carregando...");
  const [uploading, setUploading] = useState(false);

  // Agenda
  const [local, setLocal] = useState("");
  const [data, setData] = useState("");
  const [descricao, setDescricao] = useState("");
  const [agenda, setAgenda] = useState([]);

  // Fotos/Vídeos
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("image");
  const [fotos, setFotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [brokenImages, setBrokenImages] = useState(new Set());

  // Login mágico
  useEffect(() => {
    const email = window.localStorage.getItem("emailForSignIn");
    if (email && isSignInWithEmailLink(auth, window.location.href)) {
      signInWithEmailLink(auth, email, window.location.href)
        .then(() => {
          setMessage("Login efetuado com sucesso!");
          window.localStorage.removeItem("emailForSignIn");
        })
        .catch((error) => setMessage("Erro no login: " + error.message));
    } else {
      setMessage("Nenhum link de login válido encontrado.");
    }
  }, []);

  // Agenda em tempo real
  useEffect(() => {
    const q = query(collection(db, "agenda"), orderBy("data", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAgenda(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Fotos e vídeos em tempo real
  useEffect(() => {
    const fotosQuery = query(collection(db, "fotos"), orderBy("createdAt", "desc"));
    const videosQuery = query(collection(db, "videos"), orderBy("createdAt", "desc"));

    const unsubFotos = onSnapshot(fotosQuery, (snapshot) => {
      setFotos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubVideos = onSnapshot(videosQuery, (snapshot) => {
      setVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubFotos();
      unsubVideos();
    };
  }, []);

  // Marcar arquivos como quebrados
  const handleImageError = (id) => {
    setBrokenImages(prev => new Set([...prev, id]));
  };

  // Limpeza de arquivos órfãos
  const cleanupBrokenImages = async () => {
    setMessage("Verificando arquivos quebrados...");
    let cleanedCount = 0;

    for (const foto of fotos) {
      try {
        const res = await fetch(foto.url, { method: "HEAD" });
        if (!res.ok) {
          await deleteFoto(foto.id);
          cleanedCount++;
        }
      } catch {
        await deleteFoto(foto.id);
        cleanedCount++;
      }
    }

    for (const video of videos) {
      try {
        const res = await fetch(video.url, { method: "HEAD" });
        if (!res.ok) {
          await deleteVideo(video.id);
          cleanedCount++;
        }
      } catch {
        await deleteVideo(video.id);
        cleanedCount++;
      }
    }

    setMessage(`Limpeza concluída! ${cleanedCount} arquivos removidos.`);
    setBrokenImages(new Set());
  };

  // Funções Agenda
  const handleAddShow = async () => {
    if (!local || !data || !descricao) return;
    try {
      await addShow({ local, data: new Date(data), descricao });
      setLocal("");
      setData("");
      setDescricao("");
      setMessage("Show adicionado com sucesso!");
    } catch (error) {
      setMessage("Erro ao adicionar show: " + error.message);
    }
  };

  const handleDeleteShow = async (id) => {
    try {
      await deleteShow(id);
      setMessage("Show excluído com sucesso!");
    } catch (error) {
      setMessage("Erro ao excluir show: " + error.message);
    }
  };

  // Upload de fotos/vídeos
  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setMessage("Fazendo upload...");

    try {
      const endpoint = fileType === "image" ? "image/upload" : "video/upload";
      const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${endpoint}`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

      // 🔹 Garantir que seja tratado como vídeo com áudio
      if (fileType === "video") {
        formData.append("resource_type", "video");
        formData.append("audio_codec", "aac");   // 🔹 força salvar áudio em AAC
        formData.append("video_codec", "auto");
      }


      const res = await fetch(url, { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Erro no upload: ${res.status}`);

      const dataRes = await res.json();

      if (fileType === "image") {
        await addFoto(dataRes.secure_url);
        setMessage("Foto adicionada com sucesso!");
      } else {
        await addVideo(dataRes.secure_url);
        setMessage("Vídeo adicionado com sucesso!");
      }

      setFile(null);
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error("Erro no upload:", error);
      setMessage("Erro no upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFoto = async (id) => {
    try {
      await deleteFoto(id);
      setMessage("Foto excluída com sucesso!");
    } catch (error) {
      setMessage("Erro ao excluir foto: " + error.message);
    }
  };

  const handleDeleteVideo = async (id) => {
    try {
      await deleteVideo(id);
      setMessage("Vídeo excluído com sucesso!");
    } catch (error) {
      setMessage("Erro ao excluir vídeo: " + error.message);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <h1>Painel Admin</h1>
        <p>{message}</p>

        {/* Botão de limpeza */}
        <div className="cleanup-panel" style={{ marginBottom: '20px' }}>
          <button onClick={cleanupBrokenImages}>🧹 Limpar Arquivos Órfãos</button>
        </div>

        {/* Painel Agenda */}
        <div className="agenda-panel">
          <h2>Painel Agenda</h2>
          <input placeholder="Local" value={local} onChange={e => setLocal(e.target.value)} />
          <input type="datetime-local" value={data} onChange={e => setData(e.target.value)} />
          <input placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} />
          <button onClick={handleAddShow}>Adicionar Show</button>
          <ul>
            {agenda.map(ev => (
              <li key={ev.id}>
                {ev.local} - {ev.data?.toDate ? ev.data.toDate().toLocaleString() : new Date(ev.data).toLocaleString()} - {ev.descricao}
                <button onClick={() => handleDeleteShow(ev.id)}>Excluir</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Painel Fotos/Vídeos */}
        <div className="media-panel">
          <h2>Painel Fotos & Vídeos</h2>
          <select value={fileType} onChange={e => setFileType(e.target.value)}>
            <option value="image">Foto</option>
            <option value="video">Vídeo</option>
          </select>
          <input
            type="file"
            onChange={e => setFile(e.target.files[0])}
            accept={fileType === "image" ? "image/*" : "video/*"}
          />
          <button onClick={handleUpload} disabled={uploading || !file}>
            {uploading ? "Enviando..." : "Enviar"}
          </button>

          <h3>Fotos ({fotos.length})</h3>
          <div className="media-grid">
            {fotos.map(f => (
              <div key={f.id} style={{ margin: "10px", display: "inline-block" }}>
                <img src={f.url} alt="foto" style={{ maxWidth: "200px", maxHeight: "200px" }} onError={() => handleImageError(f.id)} />
                <button onClick={() => handleDeleteFoto(f.id)}>Excluir</button>
              </div>
            ))}
          </div>

          <h3>Vídeos ({videos.length})</h3>
          <div className="media-grid">
            {videos.map(v => (
              <div key={v.id} style={{ margin: "10px", display: "inline-block" }}>
                <video
                  src={v.url}
                  controls
                  muted={false}
                  playsInline
                  style={{ width: "100%", height: "auto" }}
                  onError={() => handleImageError(v.id)}
                >
                  Desculpe, seu navegador não suporta vídeo.
                </video>


                <button onClick={() => handleDeleteVideo(v.id)}>Excluir</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
