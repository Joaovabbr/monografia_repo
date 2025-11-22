// src/pages/Wisconsin.jsx
import React, { useEffect, useRef } from "react";
import { initJsPsych } from "jspsych";
import PreloadPlugin from "@jspsych/plugin-preload";
import ImageButtonResponse from "@jspsych/plugin-image-button-response";
import HtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import "jspsych/css/jspsych.css";
import { useNavigate, useLocation } from "react-router-dom";


export default function Wisconsin() {
  const jsPsychRef = useRef(null);
  const startedRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (startedRef.current) {
      console.info("[WISC] experimento já iniciado (guard).");
      return;
    }
    startedRef.current = true;

    (async () => {
      try {
        const fixedCards = [
          "/assets/wisconsin/main_cards/images_1redTriangle.png",
          "/assets/wisconsin/main_cards/images_2greenStars.png",
          "/assets/wisconsin/main_cards/images_3yellowCrosses.png",
          "/assets/wisconsin/main_cards/images_4blueDots.png",
        ];

        const stimuli = [
        "/assets/wisconsin/trial_cards/images_1blueCrosses.png",
        "/assets/wisconsin/trial_cards/images_1blueDots.png",
        "/assets/wisconsin/trial_cards/images_1blueStars.png",
        "/assets/wisconsin/trial_cards/images_1blueTriangles.png",
        "/assets/wisconsin/trial_cards/images_1greenCrosses.png",
        "/assets/wisconsin/trial_cards/images_1greenDots.png",
        "/assets/wisconsin/trial_cards/images_1greenStars.png",
        "/assets/wisconsin/trial_cards/images_1greenTriangles.png",
        "/assets/wisconsin/trial_cards/images_1redCrosses.png",
        "/assets/wisconsin/trial_cards/images_1redDots.png",
        "/assets/wisconsin/trial_cards/images_1redStars.png",
        "/assets/wisconsin/trial_cards/images_1redTriangles.png",
        "/assets/wisconsin/trial_cards/images_1yellowCrosses.png",
        "/assets/wisconsin/trial_cards/images_1yellowDots.png",
        "/assets/wisconsin/trial_cards/images_1yellowStars.png",
        "/assets/wisconsin/trial_cards/images_1yellowTriangles.png",
        "/assets/wisconsin/trial_cards/images_2blueCrosses.png",
        "/assets/wisconsin/trial_cards/images_2blueDots.png",
        "/assets/wisconsin/trial_cards/images_2blueStars.png",
        "/assets/wisconsin/trial_cards/images_2blueTriangles.png",
        "/assets/wisconsin/trial_cards/images_2greenCrosses.png",
        "/assets/wisconsin/trial_cards/images_2greenDots.png",
        "/assets/wisconsin/trial_cards/images_2greenStars.png",
        "/assets/wisconsin/trial_cards/images_2greenTriangles.png",
        "/assets/wisconsin/trial_cards/images_2redCrosses.png",
        "/assets/wisconsin/trial_cards/images_2redDots.png",
        "/assets/wisconsin/trial_cards/images_2redStars.png",
        "/assets/wisconsin/trial_cards/images_2redTriangles.png",
        "/assets/wisconsin/trial_cards/images_2yellowCrosses.png",
        "/assets/wisconsin/trial_cards/images_2yellowDots.png",
        "/assets/wisconsin/trial_cards/images_2yellowStars.png",
        "/assets/wisconsin/trial_cards/images_2yellowTriangles.png",
        "/assets/wisconsin/trial_cards/images_3blueCrosses.png",
        "/assets/wisconsin/trial_cards/images_3blueDots.png",
        "/assets/wisconsin/trial_cards/images_3blueStars.png",
        "/assets/wisconsin/trial_cards/images_3blueTriangles.png",
        "/assets/wisconsin/trial_cards/images_3greenCrosses.png",
        "/assets/wisconsin/trial_cards/images_3greenDots.png",
        "/assets/wisconsin/trial_cards/images_3greenStars.png",
        "/assets/wisconsin/trial_cards/images_3greenTriangles.png",
        "/assets/wisconsin/trial_cards/images_3redCrosses.png",
        "/assets/wisconsin/trial_cards/images_3redDots.png",
        "/assets/wisconsin/trial_cards/images_3redStars.png",
        "/assets/wisconsin/trial_cards/images_3redTriangles.png",
        "/assets/wisconsin/trial_cards/images_3yellowCrosses.png",
        "/assets/wisconsin/trial_cards/images_3yellowDots.png",
        "/assets/wisconsin/trial_cards/images_3yellowStars.png",
        "/assets/wisconsin/trial_cards/images_3yellowTriangles.png",
        "/assets/wisconsin/trial_cards/images_4blueCrosses.png",
        "/assets/wisconsin/trial_cards/images_4blueDots.png",
        "/assets/wisconsin/trial_cards/images_4blueStars.png",
        "/assets/wisconsin/trial_cards/images_4blueTriangles.png",
        "/assets/wisconsin/trial_cards/images_4greenCrosses.png",
        "/assets/wisconsin/trial_cards/images_4greenDots.png",
        "/assets/wisconsin/trial_cards/images_4greenStars.png",
        "/assets/wisconsin/trial_cards/images_4greenTriangles.png",
        "/assets/wisconsin/trial_cards/images_4redCrosses.png",
        "/assets/wisconsin/trial_cards/images_4redDots.png",
        "/assets/wisconsin/trial_cards/images_4redStars.png",
        "/assets/wisconsin/trial_cards/images_4redTriangles.png",
        "/assets/wisconsin/trial_cards/images_4yellowCrosses.png",
        "/assets/wisconsin/trial_cards/images_4yellowDots.png",
        "/assets/wisconsin/trial_cards/images_4yellowStars.png",
        "/assets/wisconsin/trial_cards/images_4yellowTriangles.png",
      ];

        function shuffle(array) {
          const arr = array.slice();
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
          return arr;
        }

        const stimuliShuffled = shuffle(stimuli);

        // ----------------------------------------
        // parseAttrsFromUrl robusta para o padrão images_{num}{color}{shape}.png
        // ----------------------------------------
        function parseAttrsFromUrl(url) {
          const filename = url.split("/").pop().replace(/\.[^/.]+$/, "").toLowerCase();
          const numMatch = filename.match(/\d+/);
          const number = numMatch ? parseInt(numMatch[0], 10) : null;

          const colors = ["blue", "green", "red", "yellow", "orange", "purple", "brown", "black", "white", "pink"];
          let color = null;
          for (const c of colors) {
            if (filename.includes(c)) { color = c; break; }
          }

          const shapeMap = {
            crosses: "cross",
            cross: "cross",
            dots: "dot",
            dot: "dot",
            stars: "star",
            star: "star",
            triangles: "triangle",
            triangle: "triangle",
            circles: "circle",
            circle: "circle",
            squares: "square",
            square: "square"
          };
          let shape = null;
          const shapeKeys = Object.keys(shapeMap).sort((a,b) => b.length - a.length);
          for (const key of shapeKeys) {
            if (filename.includes(key)) { shape = shapeMap[key]; break; }
          }

          return { number, color, shape };
        }

        // pré-calcula metadados para fixed + stimuli
        const fixedMeta = {};
        fixedCards.forEach(u => fixedMeta[u] = parseAttrsFromUrl(u));
        const stimMeta = {};
        stimuliShuffled.forEach(u => stimMeta[u] = parseAttrsFromUrl(u));

        // --- regras e contadores
        const ruleSequence = ["color", "shape", "number"];
        const ruleThreshold = 10; 
        let currentRuleIndex = 0;
        let currentRule = ruleSequence[currentRuleIndex];
        let consecutiveCorrect = 0;
        let previousRule = null;
        const lastCorrectValueByRule = { color: null, shape: null, number: null };

        function computeCorrect(targetUrl, chosenUrl, rule = null) {
          const tmeta = stimMeta[targetUrl] || parseAttrsFromUrl(targetUrl);
          const cmeta = fixedMeta[chosenUrl] || parseAttrsFromUrl(chosenUrl);
          if (!rule) rule = currentRule;
          if (!tmeta || !cmeta) return null;
          if (rule === "color") return tmeta.color && cmeta.color ? tmeta.color === cmeta.color : null;
          if (rule === "shape") return tmeta.shape && cmeta.shape ? tmeta.shape === cmeta.shape : null;
          if (rule === "number") return (tmeta.number != null && cmeta.number != null) ? tmeta.number === cmeta.number : null;
          return null;
        }

        function detectPerseverative(chosenUrl) {
          if (!previousRule) return false;
          const cmeta = fixedMeta[chosenUrl] || parseAttrsFromUrl(chosenUrl);
          const lastVal = lastCorrectValueByRule[previousRule];
          if (lastVal == null) return false;
          if (previousRule === "color") return cmeta.color === lastVal;
          if (previousRule === "shape") return cmeta.shape === lastVal;
          if (previousRule === "number") return cmeta.number === lastVal;
          return false;
        }

        function onCorrectUpdate(targetUrl) {
          const tmeta = stimMeta[targetUrl] || parseAttrsFromUrl(targetUrl);
          if (currentRule === "color") lastCorrectValueByRule.color = tmeta.color;
          if (currentRule === "shape") lastCorrectValueByRule.shape = tmeta.shape;
          if (currentRule === "number") lastCorrectValueByRule.number = tmeta.number;
          consecutiveCorrect += 1;
          if (consecutiveCorrect >= ruleThreshold) {
            previousRule = currentRule;
            currentRuleIndex = (currentRuleIndex + 1) % ruleSequence.length;
            currentRule = ruleSequence[currentRuleIndex];
            console.info(`[WISC] Regra alterada -> ${currentRule} (anterior ${previousRule})`);
            consecutiveCorrect = 0;
          }
        }

        function onIncorrectUpdate() {
          consecutiveCorrect = 0;
        }

        // quick check assets (console)
        async function checkUrl(u) {
          try {
            const r = await fetch(u, { method: "GET" });
            console.log(`[WISC] fetch ${u} -> ${r.status} ${r.ok}`);
            return r.ok;
          } catch (e) { console.warn("[WISC] fetch erro", u, e); return false; }
        }
        if (fixedCards.length) await checkUrl(fixedCards[0]);
        if (stimuliShuffled.length) await checkUrl(stimuliShuffled[0]);

        // -----------------------
        // init jsPsych
        // -----------------------
        const targetEl = document.getElementById("jspsych-target") || document.body;
        const jsPsych = initJsPsych({
          display_element: targetEl,
          on_start: () => console.info("[jsPsych] start"),
          on_finish: () => {
            // pega todos os dados
            const allData = jsPsych.data.get().values();

            // filtra apenas os trials do WCST que definimos como task: "wcst_trial"
            const trials = allData.filter(d => d.task === "wcst_trial");

            // total de tentativas
            const totalAttempts = trials.length;

            // número de acertos (campo `correct` é booleano no on_finish de cada trial)
            const correctCount = trials.filter(t => !!t.correct).length;

            // número de erros
            const errorCount = totalAttempts - correctCount;

            // porcentagens (evitar divisão por zero)
            const correctPct = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 10000) / 100 : 0; // 2 casas decimais
            const errorPct = totalAttempts > 0 ? Math.round((errorCount / totalAttempts) * 10000) / 100 : 0;

            // resumo (ordem requisitada)
            const wiscSummaryList = [
              totalAttempts,
              correctCount,
              correctPct,
              errorCount,
              errorPct
            ];

            // tenta recuperar surveyData que veio via location.state ou sessionStorage
            let incoming = null;
            try {
              incoming = location.state?.surveyData ?? location.state ?? null;
              if (!incoming) {
                const raw = sessionStorage.getItem("surveyData");
                incoming = raw ? JSON.parse(raw) : null;
              }
            } catch (e) {
              console.warn("Falha ao recuperar surveyData (parsing):", e);
              incoming = null;
            }

            // se não existir surveyData, cria uma estrutura mínima
            const surveyData = incoming ? { ...incoming } : {
              idade: "",
              genero: "",
              etnia: "",
              escolaridade: "",
              estado_origem: "",
              qap_responses: [],
              wisc: null,
              news_first: [],
              news_second: [],
              game: null,
              game_time_seconds: null,
              email: null,
              timestamp: new Date().toISOString()
            };

            // injeta o resumo do Wisc como lista na ordem solicitada
            surveyData.wisc = wiscSummaryList;

            // grava em sessionStorage como backup (stringified)
            try { sessionStorage.setItem("surveyData", JSON.stringify(surveyData)); } catch (e) { console.warn("Falha ao gravar surveyData no storage:", e); }

            // navega para a página de notícias passando SURVEY DATA completo
            navigate("/news", { state: { surveyData } });
          }
        });
        jsPsychRef.current = jsPsych;

        // fixedChoicesHtml (HTML com <img>)
        const fixedChoicesHtml = fixedCards.map(url =>
          `<div style="display:flex;align-items:center;justify-content:center;width:160px;height:160px;">
             <img src="${url}" style="max-width:140px;height:auto;display:block;" alt="option" />
           </div>`
        );

        // build timeline
        const timeline = [];

        timeline.push({
          type: PreloadPlugin,
          images: [...fixedCards, ...stimuliShuffled],
          on_load: (u) => console.info("[Preload] loaded:", u),
          on_error: (u) => console.warn("[Preload] erro:", u),
        });

        // instruções
        timeline.push({
          type: HtmlKeyboardResponse,
          stimulus: `
            <div width=100%, heigth=100%>
            <h2>Clique aqui e pressione qualquer tecla para começar!</h2>
            <div/>
            `,
          choices: [" "],
        });

        if (!fixedCards || fixedCards.length !== 4) {
          throw new Error("fixedCards deve conter exatamente 4 imagens (verifique caminhos).");
        }
        if (!stimuliShuffled || stimuliShuffled.length === 0) {
          throw new Error("stimuli está vazio — adicione suas imagens de estímulo.");
        }

        // trials: usar stimuliShuffled
        stimuliShuffled.forEach((targetUrl, i) => {
          timeline.push({
            type: ImageButtonResponse,
            stimulus: "",
            prompt: `<div style="text-align:center;">
                       <div style="margin-bottom:12px;"></div>
                       <img src="${targetUrl}" alt="target"
                            style="max-width:150px;display:block;margin:0 auto 18px auto;border:2px solid #eee;border-radius:8px;" />
                     </div>`,
            choices: fixedChoicesHtml,
            response_ends_trial: true,
            data: { task: "wcst_trial", trial_index: i, target: targetUrl, options: fixedCards },
            on_finish: (data) => {
              try {
                const resp = data.response;
                data.chosen_index = (typeof resp === "number") ? resp : null;
                data.chosen_image = (data.chosen_index != null) ? fixedCards[data.chosen_index] : null;
                data.rt = data.rt ?? null;

                const ruleSnapshot = currentRule;
                const isCorrect = (data.chosen_image != null) ? computeCorrect(data.target, data.chosen_image, ruleSnapshot) : false;
                data.correct = isCorrect === null ? false : !!isCorrect;

                data.perseverative = false;
                if (!data.correct) {
                  data.perseverative = detectPerseverative(data.chosen_image);
                }

                if (data.correct) onCorrectUpdate(data.target);
                else onIncorrectUpdate();

                data.rule = ruleSnapshot;
                data.consecutiveCorrectAfter = consecutiveCorrect;
              } catch (err) {
                console.error("[trial on_finish] erro", err, data);
                data.chosen_index = null;
                data.chosen_image = null;
                data.rt = null;
                data.correct = false;
                data.perseverative = false;
                data.rule = currentRule;
              }
            },
          });

          // feedback curto (600ms)
          timeline.push({
            type: HtmlKeyboardResponse,
            stimulus: function() {
              const last = jsPsych.data.get().last(1).values()[0] || {};
              const correct = last.correct;
              if (correct) return `<div style="font-size:22px;color:green;"><strong>Correto</strong></div>`;
              return `<div style="font-size:22px;color:#c00;"><strong>Incorreto</strong></div>`;
            },
            choices: [],
            trial_duration: 450,
          });
        });

        // final
        timeline.push({
          type: HtmlKeyboardResponse,
          stimulus: `<h2>Fim do teste</h2><p>Obrigado — clique aqui e pressione qualquer tecla para continuar.</p>`,
          choices: [" "],
        });

        // run
        if (!timeline || timeline.length === 0) throw new Error("Timeline vazia — abortando.");
        try {
          console.info("[WISC] iniciando jsPsych.run (timeline size=", timeline.length, ")");
          await jsPsych.run(timeline);
          console.info("[WISC] run finalizado.");
        } catch (runErr) {
          console.error("[WISC] erro durante jsPsych.run:", runErr);
          const el = document.getElementById("jspsych-target");
          if (el) el.innerHTML = `<div style="padding:28px;color:#900"><h3>Erro ao rodar o experimento</h3><pre>${String(runErr).slice(0,1000)}</pre></div>`;
        }

      } catch (outerErr) {
        console.error("[WISC] erro geral:", outerErr);
        const el = document.getElementById("jspsych-target");
        if (el) el.innerHTML = `<div style="padding:28px;color:#900"><h3>Erro inesperado</h3><pre>${String(outerErr)}</pre></div>`;
      }
    })();

    // cleanup on unmount
    return () => {
      try { jsPsychRef.current?.endExperiment("ended"); } catch (e) {}
    };
  }, [navigate, location]);

  return (
    <div style={{ width: 1100, margin: "20px auto", padding: 12 }}>
      <h1 style={{ textAlign: "center", fontWeight: 700 }}>Teste de Wisconsin</h1>
      <p style={{ textAlign: "center", color: "#666" }}>
        
      </p>
      <div id="jspsych-target" />
    </div>
  );
}
