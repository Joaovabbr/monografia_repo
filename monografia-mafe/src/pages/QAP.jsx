// src/pages/QAP.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { QAP_QUESTIONS } from "../data/qapQuestions";
import "./QAP.css";

export default function QAP() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    mode: "onBlur"
  });
  const [serverError, setServerError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // recupera o dicionário que veio da página anterior (sociodemographic)
  // pode ser undefined se o usuário entrou direto — tratamos com fallback
  const incomingSurveyData = location.state?.surveyData || location.state || null;

  const onSubmit = async (formData) => {
    setServerError(null);

    try {
      // cria array simples de respostas 1..5 na ordem dos QAP_QUESTIONS
      const qapResponses = QAP_QUESTIONS.map((q, i) => {
        const key = `q${i + 1}`;
        const raw = formData[key];
        // validar: se não existir, será null — mas o form exige obrigatório então não deve acontecer
        return raw ? Number(raw) : null;
      });

      // checagem extra: garantir que temos 37 respostas numéricas
      if (!Array.isArray(qapResponses) || qapResponses.length !== QAP_QUESTIONS.length) {
        throw new Error("Número de respostas inválido. Certifique-se de responder todos os itens.");
      }
      // garantir que não há nulls
      const missed = qapResponses.some(v => v === null || Number.isNaN(v));
      if (missed) {
        throw new Error("Por favor responda a todos os itens do QAP antes de prosseguir.");
      }

      // monta (ou atualiza) o surveyData que vamos passar adiante
      const surveyData = incomingSurveyData ? { ...incomingSurveyData } : {
        // se não havia surveyData, criamos a estrutura mínima
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
        timestamp: incomingSurveyData?.timestamp || new Date().toISOString()
      };

      // atualiza a chave qap_responses como lista simples de números
      surveyData.qap_responses = qapResponses;

      // backup em sessionStorage para evitar perda no reload
      try { sessionStorage.setItem("surveyData", JSON.stringify(surveyData)); } catch (e) { /* non-fatal */ }

      // navega para a próxima página (Wisconsin), passando o surveyData atualizado
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
        <p>
          <ul>
            <li><strong> 1 = Discordo totalmente</strong></li>
            <li><strong>2 = Discordo</strong></li>
            <li><strong> 3 = Nem concordo nem discordo</strong></li>
            <li> <strong>4 = Concordo</strong></li>
            <li><strong> 5 = Concordo totalmente</strong></li>
          </ul>
        </p>
      </section>

      <form className="qap-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {QAP_QUESTIONS.map((q, index) => {
          const name = `q${index + 1}`;
          return (
            <fieldset key={q.id} className="q-item">
              <h3 className="q-legend">{index + 1}. {q.text}</h3>

              <div className="likert-row" role="radiogroup" aria-labelledby={`q-label-${name}`}>
                {[1,2,3,4,5].map(val => (
                  <label key={val} className="likert-option">
                    <input
                      type="radio"
                      value={val}
                      {...register(name, { required: `Responda o item ${index + 1}` })}
                    />
                    <span className="likert-label">{val}</span>
                  </label>
                ))}
              </div>

              {errors[name] && <p className="error">{errors[name].message}</p>}
            </fieldset>
          );
        })}

        {serverError && <p className="error" role="alert">{serverError}</p>}

        <div className="q-actions">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Prosseguir"}
          </button>
        </div>
      </form>

      <hr style={{ marginTop: 24 }} />
    </main>
  );
}
