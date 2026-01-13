'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import "./videos.css";

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const porPagina = 8;
  const [videoAmpliado, setVideoAmpliado] = useState(null);

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
              {videosExibidos.map((video) => (
                <motion.div
                  key={video.id}
                  className="video-item"
                  onClick={() => setVideoAmpliado(video.url)}
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
        {videoAmpliado && (
          <motion.div
            className="overlay"
            onClick={() => setVideoAmpliado(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.video
              src={videoAmpliado}
              controls
              autoPlay
              className="zoomed-video"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
