'use client';

import { motion } from 'framer-motion';
import './contato.css';

export default function ContatoPage() {
  return (
    <motion.div
      className="contato"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <h1>Contato</h1>
      <div className="contato-conteudo">
        <p>Confira os nossos canais oficiais para comunicação com a gente.</p>

        <h2>PC Shows e Eventos</h2>
        <p><strong>Telefone:</strong> (19) 99883-7134</p>
        <p><strong>Email:</strong> Contato@pcshows.com.br</p>
        <a href="https://www.facebook.com/groups/505651276730195" target="_blank" rel="noopener noreferrer">
          <img src="/imagens/logo-pcshow.png" alt="Logo PC Shows" />
        </a>
      </div>
    </motion.div>
  );
}
