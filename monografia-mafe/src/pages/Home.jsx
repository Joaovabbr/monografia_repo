// src/pages/Home.jsx
import React, { useState, useEffect} from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { API_BASE } from "../config";

import tclePath from "../../public/text/TCLE.txt";
import aceitePath from "../../public/text/termo_de_aceite.txt"

export default function Home() {
  const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onBlur" });
  const navigate = useNavigate();

  // 1. Criar estado para o texto do TCLE
  const [tcleTexto, setTcleTexto] = useState("Carregando termo...");
  const [aceiteTexto, setAceiteTexto] = useState("Carregando aceite...")
  useEffect(() => {
  // Promise.all executa as duas requisições ao mesmo tempo
  Promise.all([
    fetch(tclePath).then(res => {
      if (!res.ok) throw new Error("Erro ao carregar TCLE");
      return res.text();
    }),
    fetch(aceitePath).then(res => {
      if (!res.ok) throw new Error("Erro ao carregar Aceite");
      return res.text();
    })
  ])
  .then(([textoTcle, textoAceite]) => {
    // Aqui recebemos os resultados na mesma ordem do array acima
    setTcleTexto(textoTcle);
    setAceiteTexto(textoAceite);
  })
  .catch((err) => {
    console.error("Erro na carga dos arquivos:", err);
    setTcleTexto("Erro ao carregar o termo de consentimento.");
    setAceiteTexto("Erro ao carregar o texto de aceite.");
  });
}, []);

  

  // Função genérica para validar email antes de navegar
  const validarEmail = (data) => {
    const email = data.email?.trim();
    if (!email) return "O email é obrigatório.";
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return "Digite um email válido.";
    return null;
  };

  // envia o termo via backend (/api/tcle) — retorna promise, pode ser chamada "fire-and-forget"
  async function sendConsentEmail(destinatario) {
    try {
      const res = await fetch(`${API_BASE}/api/tcle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinatario }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("Erro /api/tcle:", res.status, text);
        // não lançar para não interromper fluxo, apenas logar
        return { ok: false, error: text || `status ${res.status}` };
      }
      const data = await res.json();
      console.log("Envio TCLE ok:", data);
      return { ok: true, data };
    } catch (err) {
      console.error("Falha ao enviar TCLE:", err);
      return { ok: false, error: String(err) };
    }
  }

  // Clique em "Participar" — tenta enviar o email em background e navega imediatamente
  const onParticipar = (data) => {
    const erro = validarEmail(data);
    if (erro) return alert(erro);
    const email = data.email.trim();

    // dispara envio em background (não await)
    sendConsentEmail(email).catch((e) => console.error("sendConsentEmail error:", e));

    // navega sem aguardar
    navigate("/validation", { state: { email } });
  };

  // Clique em "Não participar" — mesma lógica: dispara envio e segue
  const onNaoParticipar = (data) => {
    const erro = validarEmail(data);
    if (erro) return alert(erro);
    const email = data.email.trim();

    // dispara envio em background (não await)
    sendConsentEmail(email).catch((e) => console.error("sendConsentEmail error:", e));

    // navega sem aguardar
    navigate("/thank-you", { state: { email } });
  };

  return (
    <main className="home-page">
      <h1>Do jogo à realidade: A relação da metacognição no reconhecimento de fake news com o uso da gamificação</h1>

      <section className="info-boxes">
        <div className="info-card small">
          <h2>Convite para pesquisa</h2>
          <p>
            Bem vindo a pesquisa com o título “Do jogo à realidade: a relação da metacognição no reconhecimento de fake news com o uso da gamificação”. 
            A seguir será apresentado o Termo de Consentimento Livre e Esclarecido (TCLE) e é muito importante a leitura desse texto com atenção, pois é apresentado todas as informações sobre a pesquisa como: objetivos, riscos e benefícios. Após ele, será iniciado o processo da pesquisa.
          </p>
        </div>

        <div className="info-card large">
          <h2>TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO</h2>
          <div 
            className="tcle-display"
            dangerouslySetInnerHTML={{ __html: tcleTexto }} 
          />
          <div className="info-card contact-card">
            <h2>Contato das Pesquisadoras</h2>

            <div className="contact-group">
              <h3>Pesquisadora principal:</h3>
              <p>Maria Fernanda de Lemos Salicioni</p>
              <p>Email: <a href="mailto:maria.salicioni@estudante.ufscar.br">maria.salicioni@estudante.ufscar.br</a></p>
              <p>Telefone: (21) 99929-8412</p>
            </div>

            <div className="contact-group">
              <h3>Pesquisadora responsável:</h3>
              <p>Patrícia Waltz Schelini</p>
              <p>Email: <a href="mailto:pws@ufscar.br">pws@ufscar.br</a></p>
              <p>Telefone: (16) 98190-5220</p>
            </div>
          </div>
        </div>
        <div className="info-card small">
          <div 
            className="termo_aceite"
            dangerouslySetInnerHTML={{ __html: aceiteTexto }} 
          />
        </div>
      </section>

      <form className="email-form" onSubmit={handleSubmit(onParticipar)} noValidate>
        <label className="email-label">
          Seu email:
          <input
            type="email"
            placeholder="seu@email.com"
            {...register("email", {
              required: "O email é obrigatório",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Digite um email válido",
              },
            })}
            aria-invalid={errors.email ? "true" : "false"}
          />
        </label>
        {errors.email && <p className="error">{errors.email.message}</p>}

        <div className="button-row">
          <button
            type="button"
            className="btn btn-ghost btn-primary"
            onClick={handleSubmit(onNaoParticipar)}
          >
            Li e não quero participar da pesquisa
          </button>

          <button type="submit" className="btn btn-primary">
           Li e estou de acordo para participar da pesquisa
          </button>
        </div>
      </form>
    </main>
  );
}
