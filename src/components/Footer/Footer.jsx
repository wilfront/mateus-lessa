'use client';
import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Links extras opcionais */}
        <div className="footer-links">
          <a href="/biografia">Biografia</a>
          <a href="/agenda">Agenda</a>
          <a href="/fotos">Fotos</a>
          <a href="/videos">Vídeos</a>
          <a href="/contato">Contato</a>
        </div>

        <div className="footer-divider"></div>
        <a href="https://github.com/wilfront" target="_blank" rel="noopener noreferrer">
          <p className="footer-text">
            © {new Date().getFullYear()} <strong>@wilfront</strong> - Todos os direitos reservados.
          </p>
        </a>
      </div>
    </footer>
  );
}
