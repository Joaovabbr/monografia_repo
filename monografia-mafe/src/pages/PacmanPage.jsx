// PacmanPage.jsx
import React from "react";
import GameWrapper from "./GameWrapper";
import { useLocation } from "react-router-dom";

export default function PacmanPage() {
  const src = "https://freepacman.org";
  const instructions = `Agora, você jogará um jogo por volta de 15 a 30 minutos. Novamente, é importante que não tenha interrupções durante a jogatina. Em seguida, será mostrado o jogo e para prosseguir é necessário somente o apertar de teclas. Assim como o Pacman tradicional, para jogar é necessário o uso das setas do computador enquanto foge dos fantasmas.

Ao final, será mostrado no canto inferior um botão “Terminei” para prosseguir.`;
    const location = useLocation();


return (
  <GameWrapper
    title="Jogo: Pacman"
    src={src}
    instructions={instructions}
    nextRoute="/news" 
    nextState={{ ...location.state, round: 2 }} // 
    minimoMinutos={10}
  />
);

}
