import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ThankYou.css";


export default function ThankYou() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.warn(err));
      }
    } catch (e) {
      console.warn("Erro ao sair da tela cheia", e);
    }
  }, []);

  return (
    <main className="thank-page">
      <div className="thank-card">
        <h1>Muito obrigada pela participação na pesquisa!</h1>
        <p>Em caso de dúvidas ou interesse nos resultados obtidos por essa pesquisa é só entrar em contato com a pesquisadora via email: maria.salicioni@estudante.ufscar.br

Obrigada pela atenção!</p>

        <div style={{ marginTop: 16 }}>
          <button className="btn" onClick={() => navigate("/")}>Voltar à página inicial</button>
        </div>
      </div>
    </main>
  );
}
