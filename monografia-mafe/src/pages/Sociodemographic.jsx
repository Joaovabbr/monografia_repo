// src/pages/Sociodemographic.jsx
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import "./Sociodemographic.css";

const BR_STATES = [
  "Acre (AC)","Alagoas (AL)","Amapá (AP)","Amazonas (AM)","Bahia (BA)",
  "Ceará (CE)","Espírito Santo (ES)","Goiás (GO)","Maranhão (MA)","Mato Grosso (MT)",
  "Mato Grosso do Sul (MS)","Minas Gerais (MG)","Pará (PA)","Paraíba (PB)","Paraná (PR)",
  "Pernambuco (PE)","Piauí (PI)","Rio de Janeiro (RJ)","Rio Grande do Norte (RN)","Rio Grande do Sul (RS)",
  "Rondônia (RO)","Roraima (RR)","Santa Catarina (SC)","São Paulo (SP)","Sergipe (SE)",
  "Tocantins (TO)","Distrito Federal (DF)"
];

export default function Sociodemographic() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    mode: "onBlur",
    defaultValues: {
      idade: "",
      genero: "",
      identidade: "",
      escolaridade: "",
      estado: ""
    }
  });

  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [podeProsseguir, setPodeProsseguir] = useState(false);
  const timerRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  // Limpa o timer se o usuário sair da página antes dos 5 segundos
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onSubmit = (data) => {
    // Verifica se algum campo está vazio
    const camposVazios = [
      data.idade, 
      data.genero, 
      data.identidade, 
      data.escolaridade, 
      data.estado
    ].some(valor => valor === "" || valor === undefined || (typeof valor === 'number' && isNaN(valor)));

    // Se houver campos vazios e a trava de 5s ainda estiver ativa
    if (camposVazios && !podeProsseguir) {
      setMostrarAviso(true);
      
      // Inicia a contagem de 5 segundos se ainda não foi iniciada
      if (!timerRef.current) {
        timerRef.current = setTimeout(() => {
          setPodeProsseguir(true);
        }, 3000);
      }
      return; 
    }

    // Executa se os campos estiverem cheios OU se já passou os 5 segundos de espera
    const surveyData = {
      idade: data.idade === "" ? "" : Number(data.idade),
      genero: data.genero || "",
      etnia: data.identidade || "",
      escolaridade: data.escolaridade || "",
      estado_origem: data.estado || "",

      // Estrutura de dados para as próximas etapas
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
      email: email || null,
      timestamp: new Date().toISOString()
    };

    navigate("/qap", { state: { surveyData } });
  };

  return (
    <main className="socio-page">
      <h1>Questionário Sociodemográfico</h1>

      <form className="socio-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        
        <div className="field">
          <label>1. Qual a sua idade?</label>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Ex: 40"
            {...register("idade", { valueAsNumber: true })}
          />
        </div>

        <fieldset className="field">
          <legend>2. Qual seu gênero?</legend>
          <label className="radio">
            <input {...register("genero")} type="radio" value="feminino" /> Feminino
          </label>
          <label className="radio">
            <input {...register("genero")} type="radio" value="masculino" /> Masculino
          </label>
          <label className="radio">
            <input {...register("genero")} type="radio" value="nao_binario" /> Não-binário
          </label>
          <label className="radio">
            <input {...register("genero")} type="radio" value="prefiro_nao_dizer" /> Prefiro não dizer
          </label>
        </fieldset>

        <fieldset className="field">
          <legend>3. Como você se identifica (etnia)?</legend>
          <label className="radio">
            <input {...register("identidade")} type="radio" value="branco" /> Branco
          </label>
          <label className="radio">
            <input {...register("identidade")} type="radio" value="preto" /> Preto
          </label>
          <label className="radio">
            <input {...register("identidade")} type="radio" value="pardo" /> Pardo
          </label>
          <label className="radio">
            <input {...register("identidade")} type="radio" value="indigena" /> Indígena
          </label>
          <label className="radio">
            <input {...register("identidade")} type="radio" value="amarelo" /> Amarelo
          </label>
        </fieldset>

        <fieldset className="field">
          <legend>4. Qual sua escolaridade?</legend>
          <label className="radio">
            <input {...register("escolaridade")} type="radio" value="fundamental_incompleto" /> Ensino Fundamental incompleto
          </label>
          <label className="radio">
            <input {...register("escolaridade")} type="radio" value="fundamental_completo" /> Ensino Fundamental completo
          </label>
          <label className="radio">
            <input {...register("escolaridade")} type="radio" value="medio_incompleto" /> Ensino Médio incompleto
          </label>
          <label className="radio">
            <input {...register("escolaridade")} type="radio" value="medio_completo" /> Ensino Médio completo
          </label>
          <label className="radio">
            <input {...register("escolaridade")} type="radio" value="superior_incompleto" /> Ensino Superior incompleto
          </label>
          <label className="radio">
            <input {...register("escolaridade")} type="radio" value="superior_completo" /> Ensino Superior completo
          </label>
          <label className="radio">
            <input {...register("escolaridade")} type="radio" value="pos_graduacao" /> Pós-graduação
          </label>
        </fieldset>

        <div className="field">
          <label>5. Qual seu estado de origem?</label>
          <select {...register("estado")} defaultValue="">
            <option value="" disabled>-- selecione o estado --</option>
            {BR_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="actions">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Pronto"}
          </button>
          
          {mostrarAviso && (
            <p className="warning-text" style={{ color: "red", marginTop: "15px", fontWeight: "bold" }}>
              Atenção: Você deixou perguntas sem resposta, caso deseje prosseguir, clique novamente no botão 'Pronto'
            </p>
          )}
        </div>
      </form>
    </main>
  );
}