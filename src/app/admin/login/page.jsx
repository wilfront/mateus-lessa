"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebaseConfig";
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import './login.css';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // Verifica se o usuário clicou no link de login
  useEffect(() => {
    if (typeof window !== "undefined" && isSignInWithEmailLink(auth, window.location.href)) {
      let emailForSignIn = window.localStorage.getItem("emailForSignIn");
      if (!emailForSignIn) {
        emailForSignIn = window.prompt("Digite seu email para confirmar login");
      }
      signInWithEmailLink(auth, emailForSignIn, window.location.href)
        .then(() => {
          window.localStorage.removeItem("emailForSignIn");
          setMessage("✅ Login efetuado com sucesso!");
          setIsError(false);
          // redireciona para o dashboard
          window.location.href = "/admin/dashboard";
        })
        .catch((error) => {
          setMessage("❌ Erro ao logar: " + error.message);
          setIsError(true);
        });
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    const allowedEmail = "carvalhononi@gmail.com"; // email autorizado

    if (email !== allowedEmail) {
      setMessage("Este email não está autorizado.");
      setIsError(true);
      return;
    }

    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/dashboard`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      setMessage("✅ Link enviado! Verifique seu email.");
      setIsError(false);
    } catch (error) {
      setMessage("❌ Erro: " + error.message);
      setIsError(true);
    }
  };

  return (
    <div className="center-wrapper">
      <div className="container">
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Enviar link</button>
        </form>
        {message && (
          <p className={isError ? "message error" : "message success"}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
