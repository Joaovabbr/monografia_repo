import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Validation.css";


export default function Validation() {
  const location = useLocation();
  const navigate = useNavigate();
  // Pegamos o email passado da home (pode ser undefined)
  const email = location.state?.email;

  const handleProceed = () => {
    // navega para a página de instruções antes do formulário
    navigate("/instructions", { state: { email } });
  };

  const handleNot = () => navigate("/thank-you");

  return (
    <main className="validation-page">

      <section className="validation-card">
        <h3>
          Obrigado por Participar!

        </h3>

        <p>
          Esta Pesquisa é destinada para o seguinte publico:
        </p>
        <ul>
            <li> de 30 a 50 anos</li>
            <li> com acesso a internet e computador</li>
            <li> exclusão de profissionais e alunos de Psicologia</li>
        </ul>


        <div className="actions">
          <button onClick={handleNot} className="btn btn-ghost btn-primary">Não faço parte desse grupo</button>
          <button onClick={handleProceed} className="btn btn-primary">Faço parte desse grupo</button>
        </div>
      </section>
    </main>
  );
}
