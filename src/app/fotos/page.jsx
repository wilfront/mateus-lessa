'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import "./fotos.css";


export default function FotosPage() {
  const [fotos, setFotos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const porPagina = 8;
  const [fotoIndiceAmpliado, setFotoIndiceAmpliado] = useState(null);

  useEffect(() => {
    const fotosQuery = query(collection(db, "fotos"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(fotosQuery, (snapshot) => {
      const fotosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFotos(fotosData);

      const totalPaginas = Math.ceil(fotosData.length / porPagina);
      if (pagina > totalPaginas && totalPaginas > 0) {
        setPagina(1);
      }
    });

    return () => unsubscribe();
  }, [pagina, porPagina]);

  useEffect(() => {
    if (fotoIndiceAmpliado !== null) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [fotoIndiceAmpliado]);

  const navegarFoto = useCallback((direcao) => {
    if (fotoIndiceAmpliado === null) return;
    const novoIndice = (fotoIndiceAmpliado + direcao + fotos.length) % fotos.length;
    setFotoIndiceAmpliado(novoIndice);
  }, [fotoIndiceAmpliado, fotos.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (fotoIndiceAmpliado === null) return;
      if (e.key === 'ArrowLeft') navegarFoto(-1);
      else if (e.key === 'ArrowRight') navegarFoto(1);
      else if (e.key === 'Escape') setFotoIndiceAmpliado(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fotoIndiceAmpliado, navegarFoto]);

  const fotosExibidas = fotos.slice(0, pagina * porPagina);

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
    if (pagina * porPagina >= fotos.length) setPagina(1);
    else setPagina(pagina + 1);
  }

  return (
    <div className="fotos-page">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        Fotos
      </motion.h1>

      {fotos.length === 0 ? (
        <div className="sem-fotos">
          <p>Nenhuma foto encontrada.</p>
        </div>
      ) : (
        <>
          <motion.div
            className="fotos-grid"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <AnimatePresence>
              {fotosExibidas.map((foto, index) => (
                <motion.div
                  key={foto.id}
                  className="foto-item"
                  onClick={() => setFotoIndiceAmpliado(fotos.findIndex(f => f.id === foto.id))}
                  variants={itemVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  <motion.img 
                    src={foto.url} 
                    alt="Foto" 
                    className="foto-img"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {fotos.length > porPagina && (
            <div className="ver-mais-container">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="ver-mais-btn"
                onClick={togglePagina}
              >
                {pagina * porPagina >= fotos.length ? 'Ver Menos' : 'Ver Mais '}
              </motion.button>
              <small className="info-paginacao">
                Mostrando {Math.min(pagina * porPagina, fotos.length)} de {fotos.length} fotos
              </small>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {fotoIndiceAmpliado !== null && fotos[fotoIndiceAmpliado] && (
          <motion.div
            className="overlay"
            onClick={() => setFotoIndiceAmpliado(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              type="button"
              className="nav-btn nav-btn-prev"
              onClick={(e) => { e.stopPropagation(); navegarFoto(-1); }}
              onTap={(e) => { e.stopPropagation(); navegarFoto(-1); }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Foto anterior"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </motion.button>

            <motion.img
              src={fotos[fotoIndiceAmpliado].url}
              alt="Foto Ampliada"
              className="zoomed-foto"
              onClick={(e) => e.stopPropagation()}
              key={fotoIndiceAmpliado}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />

            <motion.button
              type="button"
              className="nav-btn nav-btn-next"
              onClick={(e) => { e.stopPropagation(); navegarFoto(1); }}
              onTap={(e) => { e.stopPropagation(); navegarFoto(1); }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Próxima foto"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </motion.button>

            <div className="media-counter">
              {fotoIndiceAmpliado + 1} / {fotos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
