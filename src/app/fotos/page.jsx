'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import "./fotos.css";


export default function FotosPage() {
  const [fotos, setFotos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const porPagina = 8;
  const [fotoAmpliada, setFotoAmpliada] = useState(null);

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
              {fotosExibidas.map((foto) => (
                <motion.div
                  key={foto.id}
                  className="foto-item"
                  onClick={() => setFotoAmpliada(foto.url)}
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
        {fotoAmpliada && (
          <motion.div
            className="overlay"
            onClick={() => setFotoAmpliada(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.img
              src={fotoAmpliada}
              alt="Foto Ampliada"
              className="zoomed-foto"
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
