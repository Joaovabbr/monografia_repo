  import React, { useState, useRef, useEffect } from "react";
  import { useNavigate, useLocation } from "react-router-dom";
  // A linha 'import "./GameWrapper.css";' foi removida para corrigir o erro de compilação,
  // já que o arquivo CSS não estava disponível.

  /*
  Props:
  - title: título da página
  - src: URL do jogo (iframe src)
  - instructions: texto com instruções a mostrar no popup
  - recommendedMinutes: número (ex.: 5)
  - nextRoute: rota para onde navegar ao terminar (opcional)
  - nextState: state a ser enviado ao navegar
  */

  export default function GameWrapper({
    title,
    src,
    instructions,
    nextState,
    recommendedMinutes = 5,
    nextRoute = "/news",
  }) {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const [showModal, setShowModal] = useState(true);
    const [startedAt, setStartedAt] = useState(null);
    const [endedAt, setEndedAt] = useState(null);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [iframeBlocked, setIframeBlocked] = useState(false);
    const [finishWarning, setFinishWarning] = useState(false);
    const [remainingMs, setRemainingMs] = useState(0);
    const [retryCount, setRetryCount] = useState(0); // <-- NOVO: Contador de tentativas
    const iframeRef = useRef(null);
    const remainingIntervalRef = useRef(null);

    // ajusta aqui caso queira outro mínimo (em ms). Por padrão definido abaixo.
    const MIN_MS = 1 * 60 * 1000; // atualmente 1 minuto (para teste). Ajuste para 10*60*1000 para 10 min.

    // --- LÓGICA DE RECARGA AUTOMÁTICA ---
    const LOAD_TIMEOUT_MS = 5000; // 5 segundos de timeout (aumentado para cold starts)
    const MAX_RETRIES = 1; // 1 tentativa de recarga (total 2 tentativas de carregamento)
    // ------------------------------------

    // tenta detectar bloqueio/falha de iframe e recarregar
    useEffect(() => {
      // Só roda se o modal foi fechado, se o iframe ainda não carregou
      // e se ainda não desistimos (excedeu MAX_RETRIES)
      if (!startedAt || iframeLoaded || retryCount > MAX_RETRIES) {
        return;
      }

      const t = setTimeout(() => {
        // Se o tempo esgotou e o iframe ainda não carregou...
        if (!iframeLoaded) {
          if (retryCount < MAX_RETRIES) {
            // Tenta recarregar
            console.warn(
              `Iframe não carregou em ${LOAD_TIMEOUT_MS}ms. Tentando recarregar (Tentativa ${
                retryCount + 1
              })...`
            );
            setRetryCount((prev) => prev + 1);
            if (iframeRef.current) {
              // Força o recarregamento do iframe re-atribuindo o src
              // Isso vai disparar um novo 'onLoad' se funcionar
              iframeRef.current.src = src;
            }
          } else {
            // Excedeu as tentativas, agora sim marca como bloqueado
            console.error(
              `Iframe falhou ao carregar após ${MAX_RETRIES} tentativa(s) de recarga.`
            );
            setIframeBlocked(true);
          }
        }
      }, LOAD_TIMEOUT_MS);

      return () => clearTimeout(t);
    }, [startedAt, iframeLoaded, retryCount, src]); // <-- MODIFICADO: Dependências atualizadas

    // limpa interval se componente desmontar
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
      const nowIso = new Date().toISOString();
      setStartedAt(nowIso);
      setEndedAt(null);
      setFinishWarning(false);
      setRemainingMs(0);
      setRetryCount(0); // <-- NOVO: Reseta a contagem de tentativas
      setIframeLoaded(false); // <-- NOVO: Garante que o estado de carregado seja resetado
      setIframeBlocked(false); // <-- NOVO: Garante que o estado de bloqueio seja resetado
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleIframeLoad = () => {
      console.log("Iframe carregado com sucesso."); // Bom para debug
      setIframeLoaded(true);
      setIframeBlocked(false);
    };

    // helper: calcula ms restantes para atingir MIN_MS
    function msRemainingForMin() {
      if (!startedAt) return MIN_MS;
      const started = Date.parse(startedAt);
      const elapsed = Date.now() - started;
      return Math.max(0, MIN_MS - elapsed);
    }

    // inicia/atualiza o interval que decrementa remainingMs
    function startRemainingInterval() {
      if (remainingIntervalRef.current) return;
      setRemainingMs(msRemainingForMin());
      remainingIntervalRef.current = setInterval(() => {
        const rem = msRemainingForMin();
        setRemainingMs(rem);
        if (rem <= 0) {
          clearInterval(remainingIntervalRef.current);
          remainingIntervalRef.current = null;
          setFinishWarning(false);
        }
      }, 1000);
    }

    // tenta recuperar surveyData do location.state ou sessionStorage
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

    // salva surveyData no sessionStorage (merge simples)
    function persistSurveyData(sd) {
      try {
        sessionStorage.setItem("surveyData", JSON.stringify(sd));
      } catch (e) {
        console.warn("Falha ao gravar surveyData:", e);
      }
    }

    // tenta extrair um nome simples do jogo a partir do location.state ou src (ex: "pacman" ou "badnews")
    function deriveGameName() {
      // prioridade: location.state.game, location.state.group (se for identificador), nextState.game
      const s = location.state || {};
      if (s.game) return s.game;
      if (s.group) return s.group;
      // heurística: procurar palavras conhecidas na URL
      const lower = (src || "").toLowerCase();
      if (lower.includes("pacman")) return "pacman";
      if (lower.includes("badnews")) return "badnews";
      // fallback: domínio ou caminho
      try {
        const u = new URL(src);
        return u.hostname + u.pathname;
      } catch (e) {
        return src;
      }
    }

    const handleFinish = () => {
      // se não começou, mostra aviso
      if (!startedAt) {
        setFinishWarning(true);
        setRemainingMs(MIN_MS);
        startRemainingInterval();
        return;
      }

      const rem = msRemainingForMin();
      if (rem > 0) {
        setFinishWarning(true);
        setRemainingMs(rem);
        startRemainingInterval();
        return;
      }

      // ok: tempo atingido -> grava end, envia evento e navega
      const end = new Date().toISOString();
      setEndedAt(end);
      setFinishWarning(false);
      if (remainingIntervalRef.current) {
        clearInterval(remainingIntervalRef.current);
        remainingIntervalRef.current = null;
      }

      // calcula tempo em segundos
      const startMs = Date.parse(startedAt);
      const endMs = Date.parse(end);
      const gameTimeSeconds = Math.max(0, Math.round((endMs - startMs) / 1000));

      const gameName = deriveGameName();

      const payload = {
        email: email || null,
        game: gameName,
        startedAt,
        endedAt: end,
        timestamp: new Date().toISOString(),
      };

      // atualizar surveyData: popular campos 'game' e 'game_time_seconds'
      try {
        let surveyData = loadSurveyData();
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
            timestamp: new Date().toISOString(),
          };
        }

        // setar os campos
        surveyData.game = gameName;
        surveyData.game_time_seconds = gameTimeSeconds;

        // persistir
        persistSurveyData(surveyData);

        // anexar surveyData ao nextState enviado ao navegar
        const outgoingState = nextState || { ...location.state };
        outgoingState.surveyData = surveyData;
        outgoingState.gameSession = payload;

        // navega para rota final, passando surveyData atualizado
        navigate(nextRoute, { state: outgoingState });
      } catch (err) {
        console.error(
          "Erro ao atualizar surveyData com informações de jogo:",
          err
        );
        // mesmo em erro, tentar navegar com payload mínimo para não travar a experiência
        const fallbackState = nextState || {
          ...location.state,
          gameSession: payload,
        };
        navigate(nextRoute, { state: fallbackState });
      }
    };

    // util: formata ms em mm:ss
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
                  <button className="btn btn-primary" onClick={handleConfirm}>
                    Confirmar e começar
                  </button>
                </div>
              </div>
            </div>
          )}

          {!showModal && (
            <>
              <div className="game-frame-wrapper">
                {!iframeBlocked ? (
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
                          handleConfirm(); // Usa o handleConfirm para resetar tudo
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
                <p className="game-timer-note">
                  Início: {startedAt ? new Date(startedAt).toLocaleString() : "—"}
                </p>
                <button className="btn btn-primary" onClick={handleFinish}>
                  Terminei
                </button>

                {finishWarning && (
                  <div style={{ marginTop: 10 }}>
                    <p style={{ color: "crimson", fontWeight: 600 }}>
                      Você precisa jogar pelo menos {Math.round(MIN_MS / 60000)}{" "}
                      minutos antes de prosseguir.
                    </p>
                    <p style={{ color: "crimson" }}>
                      Tempo restante: {formatMsToMMSS(remainingMs)}
                    </p>
                  </div>
                )}

                {endedAt && (
                  <p style={{ marginTop: 8, color: "#333" }}>
                    Término registrado: {new Date(endedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    );
  }