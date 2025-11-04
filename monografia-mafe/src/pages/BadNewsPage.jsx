// BadNewsPage.jsx
import React, { useState } from "react";
import GameWrapper from "./GameWrapper";
import "./BadNewsPage.css";
import { useLocation } from "react-router-dom";


export default function BadNewsPage() {
  const src = "https://www.getbadnews.com/pt";
  const instructions = `Agora, você jogará um jogo por volta de 15 a 30 minutos. Novamente, é importante que não tenha interrupções durante a jogatina. Abaixo, é mostrado o jogo e para prosseguir é necessário somente o clique do mouse. Em caso de dúvidas em relação ao vocabulário de português de Portugal, à direita é possível acessar um glossário com palavras que possam causar estranhamento.

Ao final, será mostrado no canto inferior um botão “Terminei” para prosseguir.`;

  // estado local do glossário (aberto/fechado)
  const [glossOpen, setGlossOpen] = useState(false);

  const toggleGloss = () => setGlossOpen(v => !v);
  const location = useLocation();

  return (
    <>
      <GameWrapper
    title="Jogo: BadNews"
    src={src}
    instructions={instructions}
    nextRoute="/news" 
    nextState={{ ...location.state, round: 2 }} 
  />

      {/* Painel de glossário flutuante (fixo à direita) */}
      <aside className={`glossary-panel ${glossOpen ? "open" : ""}`} aria-hidden={!glossOpen}>
        <button
          className={`gloss-toggle ${glossOpen ? "rotated" : ""}`}
          onClick={toggleGloss}
          aria-expanded={glossOpen}
          aria-controls="glossary-content"
          title={glossOpen ? "Fechar glossário" : "Abrir glossário"}
        >
          {/* setinha; pode ser estilizada via CSS */}
          <span className="chev">❯</span>
        </button>

        <div id="glossary-content" className="glossary-content" role="region" aria-label="Glossário">
        <h3>Glossário — Termos usados no jogo</h3>
            <ul>
                <li><strong>“Gostos” no inicio do jogo</strong> → Refere-se aos seus <em>seguidores</em> ou pessoas que curtiram suas postagens.</li>
                <li><strong>“Equipa”</strong> → Significa <em>equipe</em>.</li>
                <li><strong>Expressão “Bolas!”</strong> → Equivale à nossa expressão <em>“Que droga!”</em>.</li>
                <li><strong>“Videojogos”</strong> → Quer dizer <em>videogames</em> ou <em>jogos digitais</em>.</li>
                <li><strong>“Que seca”</strong> → Equivale a <em>“Que chatice!”</em> ou “Que tédio!”.</li>
                <li><strong>“Organismos Geneticamente Modificados (OGM)”</strong> → São <em>transgênicos</em> ou <em>alimentos geneticamente modificados</em>.</li>
                <li><strong>“Partilhar”</strong> → Significa <em>compartilhar</em>.</li>
                <li><strong>“Batota”</strong> → Significa <em>trapaça</em> ou <em>roubo no jogo</em>.</li>
                <li><strong>“Olhadela”</strong> → Quer dizer <em>espiada</em> ou <em>olhada rápida</em>.</li>
                <li><strong>“LOL”</strong> → Tipo de <em>risada</em>, equivalente a <em>“kkk”</em> no português do Brasil.</li>
            </ul>

            <p className="gloss-note">Clique no ícone à esquerda para esconder o glossário.</p>
        </div>

      </aside>
    </>
  );
}
