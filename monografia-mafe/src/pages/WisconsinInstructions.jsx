// src/pages/WiscosinInstructions.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./WisconsinInstructions.css";


export default function WiscosinInstructions() {
  const location = useLocation();
  const navigate = useNavigate();
  const [surveyData, setSurveyData] = useState(null);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    // tenta primeiro pegar de location.state (fluxo normal)
    const incoming = location.state?.surveyData ?? location.state ?? null;

    if (incoming) {
      setSurveyData(incoming);
      // atualiza o sessionStorage para persistência entre recarregamentos
      try { sessionStorage.setItem("surveyData", JSON.stringify(incoming)); } catch (e) { /* non-fatal */ }
      return;
    }

    // fallback: tenta carregar do sessionStorage
    try {
      const fromStorage = sessionStorage.getItem("surveyData");
      if (fromStorage) {
        const parsed = JSON.parse(fromStorage);
        setSurveyData(parsed);
        return;
      }
    } catch (e) {
      console.warn("Falha ao ler surveyData do sessionStorage", e);
    }

    // se chegar aqui, não encontramos surveyData — avisamos o usuário
    setWarning(
      "Não encontramos os dados da pesquisa (surveyData). " +
      "Isso normalmente acontece se você acessou esta página diretamente. " +
      "Volte à página inicial e siga o fluxo."
    );
  }, [location.state]);

  const handleReady = () => {
    if (!surveyData) {
      // não navegar se não temos dados; mostra aviso curto
      setWarning("Dados ausentes — não é possível iniciar o teste. Volte e preencha as etapas anteriores.");
      return;
    }
    // garante persistência atualizada antes de navegar
    try { sessionStorage.setItem("surveyData", JSON.stringify(surveyData)); } catch (e) {}
    // passa SOMENTE surveyData no state para a próxima rota
    navigate("/wisconsin", { state: { surveyData } });
  };

  return (
    <main className="wisc-page" style={{ display: "flex", justifyContent: "center", padding: 20 }}>
      <div className="wisc-card" role="region" aria-labelledby="wisc-title" style={{ maxWidth: 900, width: "100%" }}>
        <h1 id="wisc-title">Instruções — Teste de Wisconsin</h1>

        <textarea
          className="wisc-text"
          readOnly
          value={
`A partir da próxima página, é necessário que siga até o final da pesquisa sem interrupções ou sem distratores ao redor, seja celular, abas abertas ou barulhos intensos ao lado de fora.

A seguir, será aplicado o teste wisconsin de cartas computadorizado. Nessa tarefa, você verá uma quatro figuras no topo da tela. Serão sempre apresentadas quatro cartas fixas. Uma outra carta será apresentadas abaixo da fileira. Você deverá associar essa carta nova a uma das quatro cartas acima.

Assim, você deve clicar com o mouse qual dessas quatro figuras você acredita que combina mais com a carta abaixo apresentada.

Não será dito *como* associar as cartas, mas você receberá um feedback se está certo ou errado a cada tentativa. 
O teste pode durar entre 6 a 10 minutos .`
          }
          aria-label="Instruções do teste de Wisconsin"
          style={{ width: "100%", height: 300, padding: 12, fontSize: 14, boxSizing: "border-box" }}
        />

        {warning && (
          <div style={{ marginTop: 12, color: "#a00", background: "#fff6f6", padding: 10, borderRadius: 8 }}>
            <strong>Atenção:</strong> {warning}
          </div>
        )}

        <div className="wisc-actions" style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
          <button
            className="btn btn-primary"
            onClick={handleReady}
            style={{ background: "#2563eb", color: "#fff", border: "none" }}
            aria-disabled={!surveyData}
          >
            Estou pronto
          </button>
        </div>
      </div>
    </main>
  );
}
