// src/pages/Instructions.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Instructions.css";

export default function Instructions() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const handleStart = () => {
    // redireciona para a rota onde estará o questionário real
    // troque '/survey' caso você tenha outro endpoint
    navigate("/sociodemographic", { state: { email } });
  };


  return (
    <main className="instructions-page">
      <div className="instructions-card" role="region" aria-labelledby="instr-title">
        <h1 id="instr-title">Como vai funcionar a pesquisa</h1>

        <div className="instructions-body">
          <p>
            A pesquisa, apesar de anônima, contará com alguns questionários sobre informações sociodemográficas e alinhamento político. Dentro desses questionários, não existe respostas certas ou erradas, então, sinta-se confortável na hora de responder. É importante ressaltar que durante a pesquisa é possível voltar para a página anterior ou sair durante o processo e responder posteriormente, no entanto, após a aplicação do Wisconsin é necessário atenção e sem interrupções até o final da pesquisa.
          </p>
        </div>

        <div className="instructions-actions">
          <button className="btn btn-primary" onClick={handleStart}>Estou pronto</button>
        </div>
      </div>
    </main>
  );
}
