import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./GameWrapper.css";

export default function GameWrapper({
  title,
  src,
  instructions,
  nextState,
  minimoMinutos = 5,
  nextRoute = "/news",
  children,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [started, setStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [endedAt, setEndedAt] = useState(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef(null);
  const remainingIntervalRef = useRef(null);


  const MIN_MS = minimoMinutos * 60 * 1000;

  const LOAD_TIMEOUT_MS = 5000;
  const MAX_RETRIES = 1;

  useEffect(() => {
    if (!startedAt || iframeLoaded || retryCount > MAX_RETRIES || children) {
      return;
    }

    const t = setTimeout(() => {
      if (!iframeLoaded) {
        if (retryCount < MAX_RETRIES) {
          console.warn(
            `Iframe não carregou em ${LOAD_TIMEOUT_MS}ms. Tentando recarregar (Tentativa ${retryCount + 1
            })...`
          );
          setRetryCount((prev) => prev + 1);
          if (iframeRef.current) {
            iframeRef.current.src = src;
          }
        } else {
          console.error(
            `Iframe falhou ao carregar após ${MAX_RETRIES} tentativa(s) de recarga.`
          );
          setIframeBlocked(true);
        }
      }
    }, LOAD_TIMEOUT_MS);

    return () => clearTimeout(t);
  }, [startedAt, iframeLoaded, retryCount, src]); 

  useEffect(() => {
    return () => {
      if (remainingIntervalRef.current) {
        clearInterval(remainingIntervalRef.current);
        remainingIntervalRef.current = null;
      }
    };
  }, []);

  const handleConfirm = () => {
    setShowModal(false);
    setStarted(true);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setEndedAt(null);
    setRemainingMs(0);
    setRetryCount(0);
    setIframeLoaded(!!children);
    setIframeBlocked(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleIframeLoad = () => {
    console.log("Iframe carregado com sucesso.");
    setIframeLoaded(true);
    setIframeBlocked(false);
  };

  function msRemainingForMin() {
    if (!startedAt) return MIN_MS;
    const started = Date.parse(startedAt);
    const elapsed = Date.now() - started;
    return Math.max(0, MIN_MS - elapsed);
  }

  useEffect(() => {
    if (startedAt && !endedAt) {
      setRemainingMs(msRemainingForMin());
      remainingIntervalRef.current = setInterval(() => {
        const rem = msRemainingForMin();
        setRemainingMs(rem);
        if (rem <= 0) {
          clearInterval(remainingIntervalRef.current);
          remainingIntervalRef.current = null;
        }
      }, 1000);
    }
    return () => {
      if (remainingIntervalRef.current) {
        clearInterval(remainingIntervalRef.current);
        remainingIntervalRef.current = null;
      }
    };
  }, [startedAt, endedAt, MIN_MS]);

  function loadSurveyData() {
    try {
      const fromState = location.state?.surveyData;
      if (fromState) return fromState;
      const raw = sessionStorage.getItem("surveyData");
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("Erro ao carregar surveyData:", e);
    }
    return null;
  }

  function persistSurveyData(sd) {
    try {
      sessionStorage.setItem("surveyData", JSON.stringify(sd));
    } catch (e) {
      console.warn("Falha ao gravar surveyData:", e);
    }
  }

  function deriveGameName() {
    const s = location.state || {};
    if (s.game) return s.game;
    if (s.group) return s.group === "par" ? "badnews" : "tetris";
    const fromStorage = sessionStorage.getItem("assignedGame");
    if (fromStorage) return fromStorage;
    const lower = (src || "").toLowerCase();
    if (lower.includes("tetris")) return "tetris";
    if (lower.includes("badnews")) return "badnews";
    try {
      const u = new URL(src);
      return u.hostname + u.pathname;
    } catch (e) {
      return src;
    }
  }

  const handleFinish = () => {
    if (!startedAt) return;
    const rem = msRemainingForMin();
    if (rem > 0) return;

    const end = new Date().toISOString();
    setEndedAt(end);
    if (remainingIntervalRef.current) {
      clearInterval(remainingIntervalRef.current);
      remainingIntervalRef.current = null;
    }

    const startMs = Date.parse(startedAt);
    const endMs = Date.parse(end);
    const gameTimeSeconds = Math.max(0, Math.round((endMs - startMs) / 1000));

    const gameName = deriveGameName();

    const payload = {
      email: email || null,
      game: gameName,
      startedAt,
      endedAt: end,
    };

    try {
      let surveyData = loadSurveyData();
      let storedStartTime = null;
      try {
        storedStartTime = JSON.parse(sessionStorage.getItem("surveyData") || "{}").start_time;
      } catch (e) {}

      if (!surveyData) {
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
          game: "",
          game_time_seconds: "",
          email: email || null,
          start_time: storedStartTime || null,
        };
      }

      if (!surveyData.start_time && storedStartTime) {
        surveyData.start_time = storedStartTime;
      }

      surveyData.game = gameName;
      surveyData.game_time_seconds = gameTimeSeconds;

      persistSurveyData(surveyData);

      const outgoingState = nextState || { ...location.state };
      outgoingState.surveyData = surveyData;
      outgoingState.gameSession = payload;
      navigate(nextRoute, { state: outgoingState });
    } catch (err) {
      console.error(
        "Erro ao atualizar surveyData com informações de jogo:",
        err
      );
      const fallbackState = nextState || {
        ...location.state,
        gameSession: payload,
      };
      navigate(nextRoute, { state: fallbackState });
    }
  };

  function formatMsToMMSS(ms) {
    const totalSec = Math.ceil(ms / 1000);
    const mm = Math.floor(totalSec / 60);
    const ss = totalSec % 60;
    return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  }

  return (
    <main className="game-page">
      <div className="game-card">
        <h1>{title}</h1>

        {showModal && (
          <div className="game-modal-overlay" role="dialog" aria-modal="true">
            <div className="game-modal">
              <h2>Instruções</h2>
              <p>{instructions}</p>

              <div className="game-modal-actions">
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Fechar
                </button>
                {!started && (
                  <button className="btn btn-primary" onClick={handleConfirm}>
                    Confirmar e começar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {!started && (
          <div className="game-start-screen">
            <h2>Pronto para jogar?</h2>
            <p>Para o próximo teste, preparamos este jogo. Certifique-se de compreender as regras antes de começar, lendo as instruções no botão abaixo.</p>
            <div className="game-start-actions">
              <button className="btn btn-ghost" onClick={() => setShowModal(true)}>
                Ver Instruções
              </button>
              <button className="btn btn-primary" onClick={handleConfirm}>
                Iniciar Jogo
              </button>
            </div>
          </div>
        )}

        {started && (
          <>
            <div className={`game-frame-wrapper ${children ? "has-children" : ""}`}>
              {children ? (
                <div className="custom-game-container">
                  {children}
                </div>
              ) : !iframeBlocked ? (
                <iframe
                  ref={iframeRef}
                  title={title}
                  src={src}
                  onLoad={handleIframeLoad}
                  sandbox="allow-scripts allow-forms allow-same-origin"
                  frameBorder="0"
                />
              ) : (
                <div className="iframe-blocked">
                  <p>
                    Ocorreu um problema ao carregar o jogo. Isso pode ser
                    causado por um bloqueio do site de origem ou uma falha de
                    conexão.
                  </p>
                  <p>
                    Tente{" "}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleConfirm();
                      }}
                    >
                      recarregar o jogo
                    </a>
                    .
                  </p>
                </div>
              )}
            </div>

            <div className="game-controls">
              <div className="game-timer-info" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <p className="game-timer-note">
                  Início: {startedAt ? new Date(startedAt).toLocaleString() : "—"}
                </p>
                {startedAt && remainingMs > 0 && (
                  <p style={{ color: "crimson", fontWeight: 600, margin: 0 }}>
                    Você poderá avançar em: {formatMsToMMSS(remainingMs)}
                  </p>
                )}
                {startedAt && remainingMs <= 0 && !endedAt && (
                  <p style={{ color: "green", fontWeight: 600, margin: 0 }}>
                    Você já pode prosseguir!
                  </p>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button 
                  className="btn btn-primary" 
                  onClick={handleFinish}
                  disabled={remainingMs > 0}
                  style={remainingMs > 0 ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                >
                  Terminei
                </button>

                {endedAt && (
                  <p style={{ margin: 0, color: "#333" }}>
                    Término registrado: {new Date(endedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}