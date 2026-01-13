'use client';

import { motion } from 'framer-motion';
import './biografia.css';

export default function BiografiaPage() {
  return (
    <main className="biografia-page">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Biografia
      </motion.h1>

      <div className="bio-container">
        <motion.div
          className="bio-conteudo"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p>
            <strong>Mateus Lessa</strong> é um cantor sertanejo natural de Bauru SP. Apaixonado pela música desde cedo, encontrou na viola e na canção sertaneja uma forma de expressar sua identidade e contar histórias que tocam o coração.

            Com uma voz marcante e carisma no palco, Mateus vem conquistando cada vez mais admiradores em shows, bares, eventos e plataformas digitais. Suas músicas passeiam entre a tradição do sertanejo raiz e a modernidade do sertanejo universitário, trazendo letras que falam de amor, amizade e da vida no interior.

            Sempre em busca de evoluir, Mateus Lessa dedica-se ao seu trabalho com muito empenho, levando alegria e emoção por onde passa. Em Bauru e região, já é reconhecido como uma das promessas do cenário sertanejo, com projetos que prometem alcançar cada vez mais público.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
