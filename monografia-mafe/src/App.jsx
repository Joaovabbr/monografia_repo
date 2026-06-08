import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Validation from "./pages/Validation";
import Instructions from "./pages/Instructions";
import ThankYou from "./pages/ThankYou";
import Sociodemographic from "./pages/Sociodemographic";
import QAP from "./pages/QAP";
import WisconsinInstructions from "./pages/WisconsinInstructions";
import NewsTrustworthiness from "./pages/NewsTrustworthiness";
import TetrisPage from "./pages/TetrisPage";
import BadNewsPage from "./pages/BadNewsPage";
import Wisconsin from "./pages/Wisconsin";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        const monitoredPaths = [
          "/instructions",
          "/sociodemographic",
          "/qap",
          "/wisconsin-instructions",
          "/news",
          "/game/tetris",
          "/game/badnews",
          "/wisconsin"
        ];
        
        if (monitoredPaths.includes(location.pathname)) {
          console.warn("Usuário saiu do modo tela cheia na página:", location.pathname);
          try {
            let surveyData = JSON.parse(sessionStorage.getItem("surveyData") || "{}");
            surveyData.exited_fullscreen = true;
            sessionStorage.setItem("surveyData", JSON.stringify(surveyData));
          } catch (e) {
            console.warn("Erro ao registrar saída de tela cheia:", e);
          }
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/validation" element={<Validation />} />
      <Route path="/instructions" element={<Instructions />} />
      <Route path="/thank-you" element={<ThankYou />} />
      <Route path="/sociodemographic" element={<Sociodemographic />} />
      <Route path="/qap" element={<QAP />} />
      <Route path="/wisconsin-instructions" element={<WisconsinInstructions />} />
      <Route path="/news" element={<NewsTrustworthiness />} />
      <Route path="/game/tetris" element={<TetrisPage />} />
      <Route path="/game/badnews" element={<BadNewsPage />} />
      <Route path="/wisconsin" element={<Wisconsin />} />
    </Routes>
  );
}
