// src/pages/Home.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { API_BASE } from "../config";

export default function Home() {
  const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onBlur" });
  const navigate = useNavigate();

  // Função genérica para validar email antes de navegar
  const validarEmail = (data) => {
    const email = data.email?.trim();
    if (!email) return "O email é obrigatório.";
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return "Digite um email válido.";
    return null;
  };

  // envia o termo via backend (/api/tcle) — retorna promise, pode ser chamada "fire-and-forget"
  async function sendConsentEmail(destinatario) {
    try {
      const res = await fetch(`${API_BASE}/api/tcle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinatario }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("Erro /api/tcle:", res.status, text);
        // não lançar para não interromper fluxo, apenas logar
        return { ok: false, error: text || `status ${res.status}` };
      }
      const data = await res.json();
      console.log("Envio TCLE ok:", data);
      return { ok: true, data };
    } catch (err) {
      console.error("Falha ao enviar TCLE:", err);
      return { ok: false, error: String(err) };
    }
  }

  // Clique em "Participar" — tenta enviar o email em background e navega imediatamente
  const onParticipar = (data) => {
    const erro = validarEmail(data);
    if (erro) return alert(erro);
    const email = data.email.trim();

    // dispara envio em background (não await)
    sendConsentEmail(email).catch((e) => console.error("sendConsentEmail error:", e));

    // navega sem aguardar
    navigate("/validation", { state: { email } });
  };

  // Clique em "Não participar" — mesma lógica: dispara envio e segue
  const onNaoParticipar = (data) => {
    const erro = validarEmail(data);
    if (erro) return alert(erro);
    const email = data.email.trim();

    // dispara envio em background (não await)
    sendConsentEmail(email).catch((e) => console.error("sendConsentEmail error:", e));

    // navega sem aguardar
    navigate("/thank-you", { state: { email } });
  };

  return (
    <main className="home-page">
      <h1>Do jogo à realidade: A relação da metacognição no reconhecimento de fake news com o uso da gamificação</h1>

      <section className="info-boxes">
        <div className="info-card small">
          <h2>Convite para pesquisa</h2>
          <p>
            Bem vindo a pesquisa com o título “Do jogo à realidade: a relação da metacognição no reconhecimento de fake news com o uso da gamificação”. 
            A seguir será apresentado o Termo de Consentimento Livre e Esclarecido (TCLE) e é muito importante a leitura desse texto com atenção, pois é apresentado todas as informações sobre a pesquisa como: objetivos, riscos e benefícios. Após ele, será iniciado o processo da pesquisa.
          </p>
        </div>

        <div className="info-card large">
          <h2>TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO</h2>
          <textarea
            readOnly
            value={`  Você está sendo convidado(a) para participar de uma pesquisa, intitulada "Do jogo à realidade: A relação da metacognição no reconhecimento de fake news com o uso da gamificação". A pesquisa é realizada pela aluna de graduação em Psicologia na Universidade Federal de São Carlos - UFSCar,  Maria Fernanda de Lemos Salicioni sob a orientação da professora Patrícia Waltz Schelini do departamento de Psicologia. Sua participação é livre e voluntária.

    A pesquisa possui o objetivo de avaliar a efetividade do uso de jogos eletrônicos como intervenção no reconhecimento de notícias falsas (fake news) e verificar a relação da metacognição nesse processo. A sua participação consistirá em responder a algumas perguntas relativas a informações pessoais (idade, gênero, identificação étcnico-racial, nível de escolaridade e estado de nascença) e, em seguida, você responderá a um questionário de alinhamento político e um teste que avalia mudança de estratégias metacognitivas. Após isso, será apresentado um pré-teste de notícias falsas antes da intervenção (os jogos) e após a intervenção outras notícias falsas. A pesquisa no total dura entre xx - xx minutos. No entanto, a qualquer momento da pesquisa, você pode optar pela interrupção das respostas, seja continuando posteriormente ou não. O único momento que é necessário a atenção do indivíduo sem interrupção é durante o teste de estratégias metacognitivas. 

    Esta pesquisa foi submetida ao Comitê de Ética em Pesquisa com Seres Humanos (CEP) da Universidade Federal de São Carlos (CAAE: XXXXXXXXXXXX) e aprovada sob o número XXXXX. O CEP, vinculado à Comissão Nacional de Ética em Pesquisa (CONEP), tem a responsabilidade de garantir e fiscalizar que todas as pesquisas científicas com seres humanos obedeçam às normas éticas do País, e que os participantes de pesquisa tenham todos os seus direitos respeitados. O CEP-UFSCar funciona na Pró-Reitoria de Pesquisa da Universidade Federal de São Carlos, localizado no prédio da reitoria (área sul do campus São Carlos).  Endereço: Rodovia Washington Luís, km 235 - CEP: 13.565-905 - São Carlos-SP. E-mail: cephumanos@ufscar.br. Telefone (16) 3351-9685. Horário de atendimento: das 08:30 às 11:30.

    Você é livre para se recusar a participar ou retirar sua autorização, a qualquer momento, em qualquer fase da pesquisa, e isso não trará nenhum prejuízo na sua relação com as pesquisadoras ou com a instituição, ou seja, você não sofrerá nenhuma penalidade ou terá qualquer prejuízo. Sua desistência pode ser comunicada diretamente às pesquisadoras responsáveis através dos seus respectivos endereços eletrônicos a qualquer momento. Não há nenhum custo para participar desta pesquisa e também não há remuneração ou gratificação por parte de qualquer pessoa envolvida.

    Os testes e questionários a serem utilizados não contêm perguntas invasivas à intimidade dos participantes, não oferecendo risco imediato ao(a) senhor(a), mas alguns itens podem remeter a algum desconforto, evocar sentimentos ou lembranças desagradáveis. Além disso, o tempo de resposta e a exposição à tela podem causar cansaço e/ou desconforto, assim como a postura mantida durante o preenchimento das perguntas. Em caso de algum problema ou necessidade de ajuda, a pesquisadora estará disponível nos meios de contato disponibilizados abaixo, de acordo com a necessidade dos participantes, para qualquer dúvida ou diálogo, visando acolher os desconfortos suscitados.

    Os benefícios que este trabalho poderá trazer não são diretos nem imediatos. Os resultados serão utilizados para dar mais suporte científico às pesquisas que se propõem a aumentar o reconhecimento de fake news no contexto digital e sua relação com a metacognição. Futuramente, esses achados poderão servir para fundamentos para elaborar intervenções mais efetivas nesse desempenho.

    Apesar de não haver garantia total de sigilo das informações da pesquisa por conta de limitações características dos meios eletrônicos, as pesquisadoras empregarão esforços para a preservação do sigilo. Os dados dessa pesquisa serão coletados através de um site criado pelas próprias pesquisadoras, em que somente as pesquisadoras responsáveis terão acesso às respostas.

    As pesquisadoras responsáveis se comprometem a tornar públicos nos meios acadêmicos e científicos os resultados obtidos ao final da pesquisa, sejam eles favoráveis ou não, sem qualquer identificação de indivíduos participantes. Assim que os dados da pesquisa forem publicados, você poderá ter acesso ao resultado na íntegra. As respostas são anônimas e serão armazenadas em local seguro por cinco anos e, depois desse tempo, serão apagadas.

    Considerando estes termos, ao participar, você autoriza a divulgação dos dados coletados referentes à sua participação. O(a) senhor(a) receberá uma via deste termo via email, em que consta o telefone e o endereço do pesquisador principal e responsável com quem você poderá tirar suas dúvidas sobre a pesquisa e sua participação agora ou a qualquer momento. Sugerimos que guarde uma cópia.

    Ao final da pesquisa, a pesquisadora irá enviar por email os resultados obtidos, de maneira
    clara e acessível, a todos os participantes que optarem por recebê-los.

    Ao clicar na opção “Li e estou de acordo com os termos da pesquisa”, você informa que leu todas as informações e declara que concorda em participar da pesquisa nos termos deste TCLE. Caso não concorde em participar, apenas clique na opção “Li e não quero participar da pesquisa” que o direciona a uma página de agradecimento e em seguida feche a página do navegador. As pesquisadoras ficarão à disposição para eventuais esclarecimentos durante e após a sua participação.

`}
            aria-label="Termo de consentimento"
          />
          <div className="info-card contact-card">
            <h2>Contato das Pesquisadoras</h2>

            <div className="contact-group">
              <h3>Pesquisadora principal:</h3>
              <p>Maria Fernanda de Lemos Salicioni</p>
              <p>Email: <a href="mailto:maria.salicioni@estudante.ufscar.br">maria.salicioni@estudante.ufscar.br</a></p>
              <p>Telefone: (21) 99929-8412</p>
            </div>

            <div className="contact-group">
              <h3>Pesquisadora responsável:</h3>
              <p>Patrícia Waltz Schelini</p>
              <p>Email: <a href="mailto:pws@ufscar.br">pws@ufscar.br</a></p>
              <p>Telefone: (16) 98190-5220</p>
            </div>
          </div>
        </div>
      </section>

      <form className="email-form" onSubmit={handleSubmit(onParticipar)} noValidate>
        <label className="email-label">
          Seu email:
          <input
            type="email"
            placeholder="seu@email.com"
            {...register("email", {
              required: "O email é obrigatório",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Digite um email válido",
              },
            })}
            aria-invalid={errors.email ? "true" : "false"}
          />
        </label>
        {errors.email && <p className="error">{errors.email.message}</p>}

        <div className="button-row">
          <button
            type="button"
            className="btn btn-ghost btn-primary"
            onClick={handleSubmit(onNaoParticipar)}
          >
            Li e não quero participar da pesquisa
          </button>

          <button type="submit" className="btn btn-primary">
           Li e estou de acordo para participar da pesquisa
          </button>
        </div>
      </form>
    </main>
  );
}
