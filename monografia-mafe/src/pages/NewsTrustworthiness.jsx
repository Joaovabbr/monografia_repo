// src/pages/NewsTrustworthiness.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./NewsTrustworthiness.css";
import { API_BASE } from "../config.js";

const ORIGINAL_IMAGES = [
  { id: "news01", src: "/assets/news1.png" },
  { id: "news02", src: "/assets/news2.png" },
  { id: "news03", src: "/assets/news3.png" },
  { id: "news04", src: "/assets/news4.png" },
  { id: "news05", src: "/assets/news5.png" },
  { id: "news06", src: "/assets/news6.png" },
  { id: "news07", src: "/assets/news7.png" },
  { id: "news08", src: "/assets/news8.png" },
  { id: "news09", src: "/assets/news9.png" },
  { id: "news10", src: "/assets/news10.png" },
  { id: "news11", src: "/assets/news11.png" },
  { id: "news12", src: "/assets/news12.png" },
];

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Persistência:
 * - key: news_state_round_<round>  => { shuffledImages, responses, index, group, timestamp }
 * - key: surveyData (já usado em outras partes) is unchanged
 */

export default function NewsTrustworthiness() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.surveyData?.email || location.state?.email || null;
  const round = location.state?.round ?? 1; // 1 = pré-jogo, 2 = pós-jogo (retest)

  // Proteção contra loop: se segunda rodada já foi feita por esta sessão, redireciona ao thank-you
  useEffect(() => {
    if (round === 2 && sessionStorage.getItem("news_second_round_done") === "true") {
      navigate("/thank-you", { replace: true });
    }
  }, [round, navigate]);

  const stateKey = `news_state_round_${round}`;

  const [shuffledImages, setShuffledImages] = useState([]);
  const [index, setIndex] = useState(0);
  // responses is an array length 12 with null or { imageId, rating, timestamp, round }
  const [responses, setResponses] = useState([]);
  const [rating, setRating] = useState(null);

  const [sending, setSending] = useState(false);
  const [group, setGroup] = useState(null);
  const [loadingGroup, setLoadingGroup] = useState(false);
  const [error, setError] = useState(null);

  const isMounted = useRef(true);

  // UTIL: persist state snapshot to sessionStorage
  function persistState(snap) {
    try {
      sessionStorage.setItem(stateKey, JSON.stringify(snap));
    } catch (e) {
      console.warn("Falha ao gravar news state no sessionStorage:", e);
    }
  }

  // UTIL: load saved state if exists
  function loadSavedState() {
    try {
      const raw = sessionStorage.getItem(stateKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn("Falha ao ler news state:", e);
      return null;
    }
  }

  useEffect(() => {
    isMounted.current = true;

    // tenta restaurar estado salvo
    const saved = loadSavedState();
    if (saved && Array.isArray(saved.shuffledImages) && saved.shuffledImages.length === ORIGINAL_IMAGES.length) {
      // restaurar
      setShuffledImages(saved.shuffledImages);
      setResponses(saved.responses ?? Array(saved.shuffledImages.length).fill(null));
      setIndex(typeof saved.index === "number" ? saved.index : 0);
      setGroup(saved.group ?? null);
      // restaurar rating atual se houve resposta para esse index
      const existing = (saved.responses && saved.responses[saved.index]) || null;
      setRating(existing ? existing.rating : null);
    } else {
      // sem estado salvo => embaralhar e inicializar respostas vazias
      const shuffled = shuffleArray(ORIGINAL_IMAGES);
      setShuffledImages(shuffled);
      const emptyResp = Array(shuffled.length).fill(null);
      setResponses(emptyResp);
      setIndex(0);
      setRating(null);
      // salvar inicial
      persistState({ shuffledImages: shuffled, responses: emptyResp, index: 0, group: null, timestamp: new Date().toISOString() });
    }

    return () => { isMounted.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, round]); // recria apenas se round mudar ou location.state explicitamente mudar

  // GET group endpoint (no headers to avoid preflight)
  async function getUserGroupFromServer() {
    setLoadingGroup(true);
    try {
      const res = await fetch(`${API_BASE}/api/get-group`);
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      setLoadingGroup(false);

      if (data && data.group) {
        setGroup(data.group);
        // salva imediatamente para prevenir mudanças futuras
        const saved = loadSavedState() || {};
        saved.group = data.group;
        persistState(saved);
        return data.group;
      }
      throw new Error("Resposta do servidor sem campo 'group'");
    } catch (err) {
      console.error("Erro ao obter grupo do servidor (/api/get-group):", err);
      setLoadingGroup(false);
      // fallback determinístico (garante fluxo mesmo se backend falhar)
      const fallback = email ? (([...email].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 2 === 0) ? "par" : "impar") : (Math.random() > 0.5 ? "par" : "impar");
      setGroup(fallback);
      const saved = loadSavedState() || {};
      saved.group = fallback;
      persistState(saved);
      return fallback;
    }
  }

  // envia o surveyData completo ao endpoint final (round 2)
  async function sendFinalSurveyData(surveyData) {
    const payload = {
      idade: surveyData.idade ?? "",
      genero: surveyData.genero ?? "",
      etnia: surveyData.etnia ?? "",
      escolaridade: surveyData.escolaridade ?? "",
      estado: surveyData.estado_origem ?? surveyData.estado ?? "",
      qap_responses: surveyData.qap_responses ?? [],
      qap_sum: 0,
      wisconsin: surveyData.wisc ?? [],
      news_first: surveyData.news_first ?? [],
      news_second: surveyData.news_second ?? [],
      game: surveyData.game ?? "",
      game_time_seconds: surveyData.game_time_seconds ?? "",
      timestamp: surveyData.timestamp ?? new Date().toISOString(),
    };

    try {
      console.log(JSON.stringify(payload))
      const res = await fetch(`${API_BASE}/api/finaliza-pesquisa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        console.error("Erro ao enviar surveyData final:", txt);
        return false;
      }
      console.log("✅ Dados finais enviados com sucesso para o backend.");
      return true;
    } catch (err) {
      console.error("Falha ao enviar surveyData final:", err);
      return false;
    }
  }

  // confirmar resposta atual
  const handleConfirm = async () => {
    // --- CORREÇÃO 1: Impede execução se já estiver enviando ---
    if (sending) return; 

    // se já existe resposta para este índice, não permitir sobrescrever
    if (!shuffledImages || shuffledImages.length === 0) return;
    if (responses[index] && responses[index].rating != null) {
      // se já respondeu, apenas avança
      if (index < shuffledImages.length - 1) {
        const nextIndex = index + 1;
        setIndex(nextIndex);
        persistState({ shuffledImages, responses, index: nextIndex, group, timestamp: new Date().toISOString() });
        // set rating to next response's value (if any)
        setRating(responses[nextIndex] ? responses[nextIndex].rating : null);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    if (rating == null) return; // nada selecionado

    // Bloqueia o botão
    setSending(true);
    setError(null);

    const currentImage = shuffledImages[index];
    const resp = {
      imageId: currentImage.id,
      imageSrc: currentImage.src,
      rating, // 1..4
      email,
      round, // registra se foi pré ou pós
      timestamp: new Date().toISOString(),
    };

    // save locally into responses array at position index
    // NOTA: Usamos uma variável local 'updatedResponses' para garantir consistência na lógica abaixo
    let updatedResponses = [];
    setResponses(prev => {
      const copy = prev.slice();
      copy[index] = resp;
      updatedResponses = copy; 
      // persist immediately
      persistState({ shuffledImages, responses: copy, index, group, timestamp: new Date().toISOString() });
      return copy;
    });

    // --- CORREÇÃO 2: Lógica de avançar ou finalizar ---

    // Se houver próxima imagem, avança e LIBERA o botão
    if (index < shuffledImages.length - 1) {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      
      // update rating for next index from saved responses if present
      const nextRating = (responses && responses[nextIndex]) ? responses[nextIndex].rating : null;
      setRating(nextRating);
      
      persistState({ 
        shuffledImages, 
        responses: updatedResponses.length > 0 ? updatedResponses : (responses.slice(0, index).concat([{ imageId: currentImage.id, rating }]).concat(responses.slice(index + 1))), 
        index: nextIndex, 
        group, 
        timestamp: new Date().toISOString() 
      });
      
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      // LIBERA O BOTÃO PARA A PRÓXIMA PERGUNTA
      setSending(false); 
      return;
    }

    // --- SE CHEGOU AQUI, É A ÚLTIMA PERGUNTA ---
    // NÃO damos setSending(false) aqui, pois vamos iniciar operações assíncronas de finalização.
    // Manter sending = true impede cliques extras enquanto o backend processa ou a página muda.

    const allResponses = updatedResponses.length > 0 ? updatedResponses : (() => {
      const tmp = responses.slice();
      tmp[index] = resp;
      return tmp;
    })();

    // retrieve surveyData from location or sessionStorage
    let surveyData = null;
    try {
      surveyData = location.state?.surveyData ?? (JSON.parse(sessionStorage.getItem("surveyData")) || null);
    } catch (e) {
      surveyData = location.state?.surveyData ?? null;
    }

    if (!surveyData) {
      // if not found, fallback to minimal and continue
      surveyData = {
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
        email: email || null,
        timestamp: new Date().toISOString()
      };
    }

    // set news_first / news_second
    if (round === 1) {
      surveyData.news_first = allResponses.map(r => r ? r.rating : null);
    } else {
      surveyData.news_second = allResponses.map(r => r ? r.rating : null);
    }

    // persist surveyData too
    try { sessionStorage.setItem("surveyData", JSON.stringify(surveyData)); } catch (e) { console.warn("save fail", e); }

    // round 1 -> get group (if not already saved) and navigate to game
    if (round === 1) {
      let resolvedGroup = group;
      if (!resolvedGroup) {
        try {
          resolvedGroup = await getUserGroupFromServer();
        } catch (e) {
          resolvedGroup = group || (email ? (([...email].reduce((a,b)=>a+b.charCodeAt(0),0) % 2 === 0) ? "par" : "impar") : (Math.random()>0.5 ? "par":"impar"));
          setGroup(resolvedGroup);
          const saved = loadSavedState() || {};
          saved.group = resolvedGroup;
          persistState(saved);
        }
      }

      // build state to pass to game
      const targetState = {
        ...location.state,
        surveyData,
        imageOrder: shuffledImages,
        newsResponses: allResponses,
        group: resolvedGroup,
        nextRound: 2
      };

      if (resolvedGroup === "par") {
        navigate("/game/badnews", { state: targetState });
      } else {
        navigate("/game/pacman", { state: targetState });
      }
      return;
    }

    // round 2 -> send final surveyData and finish
    if (round === 2) {
      sessionStorage.setItem("news_second_round_done", "true");

      // send final survey data
      try {
        await sendFinalSurveyData(surveyData);
      } catch (err) {
        console.error("Erro ao enviar surveyData final:", err);
      }

      // navigate to thank-you
      navigate("/thank-you", {
        state: { ...location.state, surveyData, newsResponses: allResponses, round: 2 },
      });
    }
  }; // handleConfirm

  if (!shuffledImages || shuffledImages.length === 0) {
    return (
      <main className="news-page">
        <div className="news-card">
          <h1>Confiabilidade de notícias</h1>
          <p>Carregando as notícias...</p>
        </div>
      </main>
    );
  }

  const current = shuffledImages[index];
  // determine if this index already has a saved response: if so, don't allow changing it
  const existingResponse = responses[index] || null;
  const inputsDisabled = !!(existingResponse && existingResponse.rating != null);

  return (
    <main className="news-page">
      <div className="news-card">
        <h1>Avaliação de confiabilidade de notícias</h1>

        <p className="news-instr">
          A seguir serão apresentadas imagens de notícias criadas pela própria pesquisadora com o intuito de avaliar a confiabilidade dessas notícias. Dentro disso, você deve responder com o que acredita em uma escala de 1 a 4:
          <ul>
          <li><strong>1: Nada confiável</strong></li> 
          <li><strong>2: Pouco Confiável</strong></li>
          <li><strong>3: Confiável</strong></li>
          <li><strong>4: Muito confiável</strong></li>
          </ul> 

          No total serão doze notícias, apresentadas uma de cada vez.
        </p>

        <div className="progress">Imagem {index + 1} de {shuffledImages.length} — Rodada {round}</div>

        <div className="image-wrapper" role="img" aria-label={`Notícia ${index + 1}`}>
          <img src={current.src} alt={`Notícia ${index + 1}`} />
        </div>

        <form className="likert-form" onSubmit={(e) => { e.preventDefault(); handleConfirm(); }} noValidate>
          <div className="likert-row">
            {[1,2,3,4].map((val) => (
              <label key={val} className={`likert-option ${rating === val ? "selected" : ""} ${inputsDisabled ? "disabled" : ""}`}>
                <input
                  type="radio"
                  name="rating"
                  value={val}
                  checked={existingResponse ? existingResponse.rating === val : rating === val}
                  onChange={() => { if (!inputsDisabled) setRating(val); }}
                  disabled={inputsDisabled}
                />
                <span className="likert-num">{val}</span>
                <span className="likert-desc">
                  {val === 1 ? "Nada Confíavel" : val === 2 ? "Pouco Confíavel" : val === 3 ? "Confíavel" : "Muito Confíavel"}
                </span>
              </label>
            ))}
          </div>

          <div className="confirm-row">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={(existingResponse && existingResponse.rating != null) ? false : (!rating || sending || loadingGroup)}
            >
              {sending ? "Enviando..." : index < shuffledImages.length - 1 ? "Confirmar" : (round === 1 ? (loadingGroup ? "Aguarde" : "Finalizar e ir ao jogo") : "Finalizar")}
            </button>
          </div>
        </form>

      </div>
    </main>
  );
}