// TetrisPage.jsx
import React, { useEffect } from "react";
import GameWrapper from "./GameWrapper";
import { useLocation } from "react-router-dom";
import Tetris from "react-tetris";
import "./TetrisGame.css";

export default function TetrisPage() {
  const instructions = `Bem-vindo ao Tetris!\n

Objetivo: Encaixar as peças que caem para formar linhas horizontais completas. Cada linha completa desaparecerá, dando pontos a você.

Teclas do Jogo:
- Seta para Esquerda: Move a peça para a esquerda.
- Seta para Direita: Move a peça para a direita.
- Seta para Baixo: Acelera a queda da peça.
- Seta para Cima: Gira a peça.
- Espaço: Derruba a peça instantaneamente.
- Tecla 'C' ou 'Shift': Guarda uma peça para usar depois.

Sobreviva pelo tempo necessário empilhando as peças com cuidado. O contador abaixo do jogo mostrará o tempo restante.`;
  const location = useLocation();

  useEffect(() => {
    sessionStorage.setItem("assignedGroup", "impar");
    sessionStorage.setItem("assignedGame", "tetris");
    try {
      const sd = JSON.parse(sessionStorage.getItem("surveyData") || "{}");
      sd.group = "impar";
      sd.game = "tetris";
      sessionStorage.setItem("surveyData", JSON.stringify(sd));
    } catch (e) {}

    const handleKeyDown = (e) => {
      // Impede o scroll da tela ao apertar Espaço ou Setas
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const savedSurveyData = (() => {
    try {
      return location.state?.surveyData || JSON.parse(sessionStorage.getItem("surveyData") || "{}");
    } catch (e) {
      return location.state?.surveyData || null;
    }
  })();

  return (
    <GameWrapper
      title="Jogo: Tetris"
      instructions={instructions}
      nextRoute="/news"
      nextState={{ ...location.state, surveyData: savedSurveyData, round: 2, group: "impar", game: "tetris" }}
      minimoMinutos={15}
    >
      <Tetris
        keyboardControls={{
          down: "MOVE_DOWN",
          left: "MOVE_LEFT",
          right: "MOVE_RIGHT",
          space: "HARD_DROP",
          z: "FLIP_COUNTERCLOCKWISE",
          x: "FLIP_CLOCKWISE",
          up: "FLIP_CLOCKWISE",
          p: "TOGGLE_PAUSE",
          c: "HOLD",
          shift: "HOLD",
        }}
      >
        {({
          HeldPiece,
          Gameboard,
          PieceQueue,
          points,
          linesCleared,
          state,
          controller,
        }) => (
          <div className="tetris-container">
            <div className="tetris-sidebar">
              <div className="tetris-panel">
                <h3>Guardado</h3>
                <HeldPiece />
              </div>
            </div>

            <div className="tetris-board">
              <Gameboard />
            </div>

            <div className="tetris-sidebar">
              <div className="tetris-panel">
                <h3>Próxima</h3>
                <PieceQueue />
              </div>

              <div className="tetris-panel">
                <h3>Pontos</h3>
                <p className="tetris-score-value">{points}</p>
              </div>

              <div className="tetris-panel">
                <h3>Linhas</h3>
                <p className="tetris-score-value">{linesCleared}</p>
              </div>

              {state === "LOST" && (
                <div className="tetris-game-over">
                  <h3>Fim de Jogo</h3>
                  <button className="tetris-restart-btn" onClick={controller.restart}>
                    Jogar Novamente
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Tetris>
    </GameWrapper>
  );
}
