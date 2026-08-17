// src/pages/Instructions.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Instructions.css";

function formatBrazilTime() {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

export default function Instructions() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const handleStart = () => {
    const start_time = formatBrazilTime();

    try {
      let surveyData = JSON.parse(sessionStorage.getItem("surveyData") || "{}");
      surveyData.start_time = start_time;
      if (email) surveyData.email = email;
      sessionStorage.setItem("surveyData", JSON.stringify(surveyData));
    } catch (e) {
      console.warn("Erro ao salvar start_time no sessionStorage:", e);
    }

    // redireciona para a rota onde estará o questionário real
    // troque '/survey' caso você tenha outro endpoint
    navigate("/sociodemographic", { state: { email, start_time } });
  };


  return (
    <main className="instructions-page">
      <div className="instructions-card" role="region" aria-labelledby="instr-title">
        <h1 id="instr-title">Como vai funcionar a pesquisa</h1>

        <div className="instructions-body">
          <p>
            A pesquisa contará com alguns questionários sobre informações sociodemográficas e alinhamento político. Dentro desses questionários, não existe respostas certas ou erradas, então, sinta-se confortável na hora de responder. É importante ressaltar que durante a pesquisa é possível voltar para a página anterior ou sair durante o processo e responder posteriormente, no entanto, após a aplicação do Wisconsin é necessário atenção e sem interrupções até o final da pesquisa. Essa pesquisa é anônima.
          </p>
        </div>

        <div className="instructions-actions">
          <button className="btn btn-primary" onClick={handleStart}>Estou pronto</button>
        </div>
      </div>
    </main>
  );
}
