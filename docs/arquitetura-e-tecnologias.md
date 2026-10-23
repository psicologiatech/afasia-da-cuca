# Arquitetura e Tecnologias do Projeto 🧠🗣️

O **Conversa Apoiada** (ou *Afasia da Cuca*) é uma aplicação de **Comunicação Alternativa e Aumentativa (CAA)** desenvolvida especificamente para apoiar pessoas idosas que sofreram AVC e convivem com sequelas como afasia, apraxia de fala ou disartria.

---

## 🛠️ Stack Tecnológica

| Tecnologia | Função no Projeto | Por que foi escolhida? |
|---|---|---|
| **Next.js 14** (App Router) | Framework Full-Stack | Renderização server-side rápida, rotas de API integradas e compatibilidade nativa com a infraestrutura serverless da Vercel. |
| **React 18** | Biblioteca de Interface | Componentização declarativa, estado reativo e controle refinado do ciclo de vida. |
| **TypeScript** | Superset Tipado | Previne erros em tempo de compilação, garante tipagem forte nos modelos de banco e nos componentes visuais. |
| **CSS Modules** (`*.module.css`) | Estilização por Componente | Isolamento de escopo para cada componente, evitando colisões de classes e facilitando a manutenção. |
| **Prisma ORM** | Mapeamento Objeto-Relacional | Modelagem declarativa do banco de dados, geração automática de tipos TypeScript e facilidade de integração com PostgreSQL. |
| **PostgreSQL / Vercel Postgres (Neon)** | Banco de Dados Relacional | Banco robusto, simples, escalável e com integração de 1 clique na Vercel (free tier generoso). |
| **Web Speech API** (`SpeechSynthesis`) | Síntese de Voz (TTS) | Voz nativa do navegador em português (`pt-BR`) sem dependência de APIs externas pagas ou latência de rede. |

---

## ♿ Princípios de Acessibilidade e Design (Tablet e Celular First)

O aplicativo foi desenhado levando em conta o perfil cognitivo, motor e sensorial de **idosos com histórico de AVC**:

1. **Mobile e Tablet First:** A interface foi projetada para dispositivos móveis e tablets posicionados perto da cama, poltrona ou mesa do paciente.
2. **Áreas de Toque Enormes:** Botões com altura mínima de 80px a 140px, permitindo acionamento mesmo para quem possui tremor, hemiparesia (fraqueza muscular em um dos lados do corpo) ou precisa usar a mão não dominante.
3. **Alto Contraste e Fontes Acessíveis:** Tipografia grande (*Atkinson Hyperlegible* e *Fraunces*) com alto contraste visual para idosos com baixa acuidade visual ou hemiatenção.
4. **Respostas Imediatas no Topo:** Botões permanentes de **SIM** e **NÃO** para confirmações binárias rápidas.
5. **Comunicação por Voz Imediata:** Ao tocar em qualquer cartão, o app pronuncia a frase de forma pausada e clara, permitindo que quem está ao redor compreenda imediatamente a necessidade do idoso.
