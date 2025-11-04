// src/pages/Sociodemographic.jsx
import React from "react";
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
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    mode: "onBlur",
    defaultValues: {
      idade: "",
      genero: "",
      etnia: "",
      escolaridade: "",
      estado: ""
    }
  });
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email; // se você está passando email entre rotas

  const onSubmit = (data) => {
    // monta o dicionário completo com placeholders para as próximas etapas
    const surveyData = {
      // dados sociodemográficos
      idade: data.idade === "" ? "" : Number(data.idade),
      genero: data.genero || "",
      etnia: data.identidade || data.etnia || "", // aceita ambos nomes caso existam
      escolaridade: data.escolaridade || "",
      estado_origem: data.estado || "",

      // placeholders / cargas futuras (vazios por enquanto)
      qap_responses: [],          // array de 37 respostas (preenchido na página QAP)
      wisc: {                    // resumo do teste de Wisconsin
        totalAttempts: null,
        correctCount: null,
        correctPct: null,
        errorCount: null,
        errorPct: null
      },
      news_first: [],            // 12 respostas primeiras exibições
      news_second: [],           // 12 respostas segundas exibições
      game: null,                // "pacman" ou "badnews"
      game_time_seconds: null,   // tempo de jogo em segundos

      // metadados
      email: email || null,
      timestamp: new Date().toISOString()
    };

    // navega para a página QAP passando o dicionário como state
    navigate("/qap", { state: { surveyData } });
  };

  return (
    <main className="socio-page">
      <h1>Questionário Sociodemográfico</h1>

      <form className="socio-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* 1: Idade (numérico livre) */}
        <div className="field">
          <label>1. Qual a sua idade?</label>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Ex: 40"
            {...register("idade", {
              required: "Idade é obrigatória",
              valueAsNumber: true,
              min: { value: 30, message: "Idade inválida" },
              max: { value: 50, message: "Idade inválida" }
            })}
          />
          {errors.idade && <p className="error">{errors.idade.message}</p>}
        </div>

        {/* 2: Qual seu gênero? (escolha única) */}
        <fieldset className="field">
          <legend>2. Qual seu gênero?</legend>
          <label className="radio">
            <input {...register("genero", { required: "Escolha uma opção" })} type="radio" value="feminino" />
            Feminino
          </label>
          <label className="radio">
            <input {...register("genero", { required: "Escolha uma opção" })} type="radio" value="masculino" />
            Masculino
          </label>
          <label className="radio">
            <input {...register("genero", { required: "Escolha uma opção" })} type="radio" value="nao_binario" />
            Não-binário
          </label>
          <label className="radio">
            <input {...register("genero", { required: "Escolha uma opção" })} type="radio" value="prefiro_nao_dizer" />
            Prefiro não dizer
          </label>
          {errors.genero && <p className="error">{errors.genero.message}</p>}
        </fieldset>

        {/* 3: Como você se identifica (etnia) */}
        <fieldset className="field">
          <legend>3. Como você se identifica (etnia)?</legend>
          <label className="radio">
            <input {...register("identidade", { required: "Escolha uma opção" })} type="radio" value="branco" />
            Branco
          </label>
          <label className="radio">
            <input {...register("identidade", { required: "Escolha uma opção" })} type="radio" value="preto" />
            Preto
          </label>
          <label className="radio">
            <input {...register("identidade", { required: "Escolha uma opção" })} type="radio" value="pardo" />
            Pardo
          </label>
          <label className="radio">
            <input {...register("identidade", { required: "Escolha uma opção" })} type="radio" value="indigena" />
            Indígena
          </label>
          <label className="radio">
            <input {...register("identidade", { required: "Escolha uma opção" })} type="radio" value="outro" />
            Outro
          </label>
          {errors.identidade && <p className="error">{errors.identidade.message}</p>}
        </fieldset>

        {/* 4: Escolaridade (escolha única) */}
        <fieldset className="field">
          <legend>4. Qual sua escolaridade?</legend>
          <label className="radio">
            <input {...register("escolaridade", { required: "Escolha uma opção" })} type="radio" value="fundamental_incompleto" />
            Ensino Fundamental incompleto
          </label>
          <label className="radio">
            <input {...register("escolaridade", { required: "Escolha uma opção" })} type="radio" value="fundamental_completo" />
            Ensino Fundamental completo
          </label>
          <label className="radio">
            <input {...register("escolaridade", { required: "Escolha uma opção" })} type="radio" value="medio_incompleto" />
            Ensino Médio incompleto
          </label>
          <label className="radio">
            <input {...register("escolaridade", { required: "Escolha uma opção" })} type="radio" value="medio_completo" />
            Ensino Médio completo
          </label>
          <label className="radio">
            <input {...register("escolaridade", { required: "Escolha uma opção" })} type="radio" value="superior_incompleto" />
            Ensino Superior incompleto
          </label>
          <label className="radio">
            <input {...register("escolaridade", { required: "Escolha uma opção" })} type="radio" value="superior_completo" />
            Ensino Superior completo
          </label>
          <label className="radio">
            <input {...register("escolaridade", { required: "Escolha uma opção" })} type="radio" value="pos_graduacao" />
            Pós-graduação
          </label>
          {errors.escolaridade && <p className="error">{errors.escolaridade.message}</p>}
        </fieldset>

        {/* 5: Estado de origem (dropdown com 27 opções) */}
        <div className="field">
          <label>5. Qual seu estado de origem?</label>
          <select {...register("estado", { required: "Selecione um estado" })} defaultValue="">
            <option value="" disabled>-- selecione o estado --</option>
            {BR_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.estado && <p className="error">{errors.estado.message}</p>}
        </div>

        <div className="actions">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Pronto"}
          </button>
        </div>
      </form>
    </main>
  );
}
