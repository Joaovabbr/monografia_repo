import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Validation.css";


export default function Validation() {
  const location = useLocation();
  const navigate = useNavigate();
  // Pegamos o email passado da home (pode ser undefined)
  const email = location.state?.email;

  const handleProceed = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn("Nao foi possivel entrar em tela cheia:", err);
    }
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
            <li> de 30 a 60 anos.</li>
            <li> com acesso a internet e computador.</li>
            <li> exclusão de pessoas que já tiveram contato com o teste Wisconsin de classificação de cartas (WCST).</li>
        </ul>
        <p>
          Ao clicar em "faço parte desse grupo" o site ficará em tela cheia para garantir atenção plena.
          É importante ressaltar que o participante pode sair da tela cheia a qualquer momento apertando a tecla 'F11', no entanto é fundamental para a pesquisa que o participante não tenha distrações durante o procedimento.
        </p>


        <div className="actions">
          <button onClick={handleNot} className="btn btn-ghost btn-primary">Não faço parte desse grupo</button>
          <button onClick={handleProceed} className="btn btn-primary">Faço parte desse grupo</button>
        </div>
      </section>
    </main>
  );
}
