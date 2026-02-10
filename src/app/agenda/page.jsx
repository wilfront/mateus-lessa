'use client';
import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";
import "./agenda.css";

export default function AgendaPage() {
  const [eventos, setEventos] = useState([]);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [detalhesVisiveis, setDetalhesVisiveis] = useState({});
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "agenda"), orderBy("data", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const shows = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEventos(shows);
      setCarregando(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleDetalhes = (id) => {
    setDetalhesVisiveis(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const eventosExibidos = mostrarTodos ? eventos : eventos.slice(0, 6);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <main className="agenda-page">
      <div className="agenda-container">
        <motion.h1
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Agenda de Shows
        </motion.h1>

        {carregando ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Carregando eventos...</p>
          </div>
        ) : (
          <>
            <motion.div
              className="agenda-cards"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {eventos.length === 0 && (
                <motion.div
                  className="empty-state"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <p>📅 Nenhum evento agendado no momento.</p>
                  <p className="empty-subtitle">Novos shows serão divulgados em breve!</p>
                </motion.div>
              )}

              <AnimatePresence mode="popLayout">
                {eventosExibidos.map((ev) => {
                  const dataEvento = ev.data?.toDate?.() || null;
                  const dia = dataEvento?.getDate();
                  const mes = dataEvento?.toLocaleString("pt-BR", { month: "short" }).toUpperCase().replace('.', '');
                  const horario = dataEvento?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                  return (
                    <motion.div
                      key={ev.id}
                      className="card-horizontal"
                      variants={cardVariants}
                      layout
                    >
                      <div className="card-data">
                        <span className="dia">{dia}</span>
                        <span className="mes">{mes}</span>
                      </div>
                      <div className="card-conteudo">
                        <h3>{ev.local || "Local não informado"}</h3>
                        <p>{ev.descricao || "Sem descrição"}</p>

                        <AnimatePresence>
                          {detalhesVisiveis[ev.id] && horario && (
                            <motion.div
                              className="horario-evento"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              🕐 Horário: {horario}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <button
                          className="btn-detalhes"
                          onClick={() => toggleDetalhes(ev.id)}
                          aria-expanded={detalhesVisiveis[ev.id]}
                          aria-label={detalhesVisiveis[ev.id] ? "Esconder horário do evento" : "Mostrar horário do evento"}
                        >
                          {detalhesVisiveis[ev.id] ? "ESCONDER HORÁRIO" : "MAIS DETALHES"}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {eventos.length > 6 && !mostrarTodos && (
              <motion.div
                className="btn-wrapper"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <button
                  className="btn-toggle"
                  onClick={() => setMostrarTodos(true)}
                  aria-label="Ver todos os eventos"
                >
                  Ver Todos os Eventos ({eventos.length})
                </button>
              </motion.div>
            )}

            {mostrarTodos && eventos.length > 6 && (
              <motion.div
                className="btn-wrapper"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  className="btn-toggle"
                  onClick={() => {
                    setMostrarTodos(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  aria-label="Ver menos eventos"
                >
                  Ver Menos
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
