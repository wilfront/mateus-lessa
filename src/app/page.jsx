import './globals.css'
import Link from 'next/link'
export default function Home() {
  return (
    <>
      <div className="home">
        <video className="video-bg" autoPlay loop muted playsInline>
          <source src="/video-paper/mateus-lessa.mp4" type="video/mp4" />
        </video>
        <div className="overlay" />

        {/* Conteúdo centralizado */}
        <div className="home-content">
          <div className="btn-group">
            <Link href="/agenda">
              <button className="btn-agenda">Ver Agenda</button>
            </Link>
            <a href="https://www.youtube.com/watch?v=DOLwNOPBqOk&list=RDDOLwNOPBqOk&start_radio=1">
              <button className="btn-video">Assistir o Vídeo</button>
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
