'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import "./videos.css";

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const porPagina = 8;
  const [videoIndiceAmpliado, setVideoIndiceAmpliado] = useState(null);

  useEffect(() => {
    const videosQuery = query(collection(db, "videos"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(videosQuery, (snapshot) => {
      const videosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVideos(videosData);

      const totalPaginas = Math.ceil(videosData.length / porPagina);
      if (pagina > totalPaginas && totalPaginas > 0) {
        setPagina(1);
      }
    });

    return () => unsubscribe();
  }, [pagina, porPagina]);

  useEffect(() => {
    if (videoIndiceAmpliado !== null) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [videoIndiceAmpliado]);

  const navegarVideo = useCallback((direcao) => {
    if (videoIndiceAmpliado === null) return;
    const novoIndice = (videoIndiceAmpliado + direcao + videos.length) % videos.length;
    setVideoIndiceAmpliado(novoIndice);
  }, [videoIndiceAmpliado, videos.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (videoIndiceAmpliado === null) return;
      if (e.key === 'ArrowLeft') navegarVideo(-1);
      else if (e.key === 'ArrowRight') navegarVideo(1);
      else if (e.key === 'Escape') setVideoIndiceAmpliado(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [videoIndiceAmpliado, navegarVideo]);

  const videosExibidos = videos.slice(0, pagina * porPagina);

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8 },
  };

  function togglePagina() {
    if (pagina * porPagina >= videos.length) setPagina(1);
    else setPagina(pagina + 1);
  }

  return (
    <div className="videos-page">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        Vídeos
      </motion.h1>

      {videos.length === 0 ? (
        <div className="sem-videos">
          <p>Nenhum vídeo encontrado.</p>
        </div>
      ) : (
        <>
          <motion.div
            className="videos-grid"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <AnimatePresence>
              {videosExibidos.map((video, index) => (
                <motion.div
                  key={video.id}
                  className="video-item"
                  onClick={() => setVideoIndiceAmpliado(videos.findIndex(v => v.id === video.id))}
                  variants={itemVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  <motion.video 
                    src={video.url} 
                    className="video-thumb"
                    preload="metadata"
                    playsInline
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {videos.length > porPagina && (
            <div className="ver-mais-container">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="ver-mais-btn"
                onClick={togglePagina}
              >
                {pagina * porPagina >= videos.length ? 'Ver Menos' : 'Ver Mais '}
              </motion.button>
              <small className="info-paginacao">
                Mostrando {Math.min(pagina * porPagina, videos.length)} de {videos.length} vídeos
              </small>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {videoIndiceAmpliado !== null && videos[videoIndiceAmpliado] && (
          <motion.div
            className="overlay"
            onClick={() => setVideoIndiceAmpliado(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              type="button"
              className="nav-btn nav-btn-prev"
              onClick={(e) => { e.stopPropagation(); navegarVideo(-1); }}
              onTap={(e) => { e.stopPropagation(); navegarVideo(-1); }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Vídeo anterior"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </motion.button>

            <motion.video
              src={videos[videoIndiceAmpliado].url}
              controls
              autoPlay
              className="zoomed-video"
              onClick={(e) => e.stopPropagation()}
              key={videoIndiceAmpliado}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />

            <motion.button
              type="button"
              className="nav-btn nav-btn-next"
              onClick={(e) => { e.stopPropagation(); navegarVideo(1); }}
              onTap={(e) => { e.stopPropagation(); navegarVideo(1); }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Próximo vídeo"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </motion.button>

            <div className="media-counter">
              {videoIndiceAmpliado + 1} / {videos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
