// src/pages/QAP.jsx
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { QAP_QUESTIONS } from "../data/qapQuestions";
import "./QAP.css";

export default function QAP() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    mode: "onBlur"
  });

  const [serverError, setServerError] = useState(null);
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [podeProsseguir, setPodeProsseguir] = useState(false);
  
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Limpa o timer ao desmontar o componente
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const incomingSurveyData = location.state?.surveyData || location.state || null;

  const onSubmit = async (formData) => {
    setServerError(null);

    try {
      // Cria array de respostas. Se não houver resposta, o valor será null
      const qapResponses = QAP_QUESTIONS.map((_, i) => {
        const key = `q${i + 1}`;
        const raw = formData[key];
        return raw ? Number(raw) : null;
      });

      // Verifica se há alguma pergunta sem resposta
      const temCamposVazios = qapResponses.some(v => v === null || Number.isNaN(v));

      // Lógica da trava de 5 segundos se houver campos vazios
      if (temCamposVazios && !podeProsseguir) {
        setMostrarAviso(true);
        
        if (!timerRef.current) {
          timerRef.current = setTimeout(() => {
            setPodeProsseguir(true);
          }, 5000);
        }
        return; // Interrompe o envio na primeira tentativa incompleta
      }

      // Monta ou atualiza o surveyData
      const surveyData = incomingSurveyData ? { ...incomingSurveyData } : {
        idade: "",
        genero: "",
        etnia: "",
        escolaridade: "",
        estado_origem: "",
        qap_responses: [],
        wisc: {
          totalAttempts: null,
          correctCount: null,
          correctPct: null,
          errorCount: null,
          errorPct: null
        },
        news_first: [],
        news_second: [],
        game: null,
        game_time_seconds: null,
        email: location.state?.email || null,
        timestamp: new Date().toISOString()
      };

      surveyData.qap_responses = qapResponses;

      // Backup em sessionStorage
      try { 
        sessionStorage.setItem("surveyData", JSON.stringify(surveyData)); 
      } catch (e) { /* non-fatal */ }

      navigate("/wisconsin-instructions", { state: { surveyData } });

    } catch (err) {
      console.error("Erro ao processar QAP localmente:", err);
      setServerError(err.message || "Erro ao processar respostas. Tente novamente.");
    }
  };

  return (
    <main className="qap-page">
      <h1>Questionário de Alinhamento Político (QAP)</h1>

      <section className="qap-intro">
        <p>
          Abaixo há {QAP_QUESTIONS.length} afirmações. Para cada uma, selecione em uma escala de 1 a 5:
        </p>
        <ul className="likert-legend">
          <li><strong>1 = Discordo totalmente</strong></li>
          <li><strong>2 = Discordo</strong></li>
          <li><strong>3 = Nem concordo nem discordo</strong></li>
          <li><strong>4 = Concordo</strong></li>
          <li><strong>5 = Concordo totalmente</strong></li>
        </ul>
      </section>

      <form className="qap-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {QAP_QUESTIONS.map((q, index) => {
          const name = `q${index + 1}`;
          return (
            <fieldset key={q.id} className="q-item">
              <h3 className="q-legend">{index + 1}. {q.text}</h3>

              <div className="likert-row" role="radiogroup">
                {[1, 2, 3, 4, 5].map(val => (
                  <label key={val} className="likert-option">
                    <input
                      type="radio"
                      value={val}
                      {...register(name)} // Removido o required
                    />
                    <span className="likert-label">{val}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          );
        })}

        <div className="q-actions" style={{ textAlign: "center", paddingBottom: "40px" }}>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Prosseguir"}
          </button>

          {mostrarAviso && (
            <p className="warning-text" style={{ color: "red", marginTop: "15px", fontWeight: "bold" }}>
              Atenção: Você deixou perguntas sem resposta, caso deseje prosseguir, clique novamente no botão 'Prosseguir'
            </p>
          )}

          {serverError && <p className="error" role="alert" style={{ color: "red", marginTop: "10px" }}>{serverError}</p>}
        </div>
      </form>
    </main>
  );
}