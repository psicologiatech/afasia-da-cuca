import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header/Header";
import { Navbar } from "@/components/Navbar/Navbar";
import { Card } from "@/components/Card/Card";
import { Callout } from "@/components/Callout/Callout";
import { Footer } from "@/components/Footer/Footer";
import styles from "./pesquisa.module.css";

export default function PesquisaPage() {
  return (
    <>
      <Header
        eyebrow="Conversa Apoiada · Material da Equipe"
        title="Pesquisa de base"
        description="O que o AVC pode causar na comunicação, o que já existe para ajudar e como as respostas das famílias orientam a arquitetura e acessibilidade do app."
      />
      <Navbar />

      <main className="wrap">
        {/* 1. O que o AVC pode causar */}
        <section className={styles.section} id="efeitos">
          <h2>1. O que o AVC pode causar na comunicação</h2>
          <p>
            Três quadros aparecem com maior frequência. Podem surgir isolados ou combinados, exigindo soluções clínicas e de design distintas:
          </p>

          <div className={styles.grid3}>
            <Card tag="Linguagem" tagType="lang" title="Afasia">
              <p>Atinge a própria faculdade da linguagem: encontrar palavras, montar sentenças e compreender. Pode afetar também leitura e escrita.</p>
              <ul className={styles.cleanList}>
                <li><strong>Expressiva (Broca):</strong> entende bem, mas a fala trava ou sai telegráfica.</li>
                <li><strong>Receptiva (Wernicke):</strong> fala fluente porém sem sentido, com compreensão comprometida.</li>
                <li><strong>Global:</strong> tanto a emissão quanto a compreensão são amplamente afetadas.</li>
              </ul>
            </Card>

            <Card tag="Motor" tagType="motor" title="Disartria">
              <p>A linguagem está preservada; o problema é motor na musculatura articulatória (boca, língua, respiração, cordas vocais). A fala sai arrastada, anasalada ou fraca.</p>
              <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>A pessoa sabe o que quer dizer e geralmente consegue digitar ou apontar.</p>
            </Card>

            <Card tag="Planejamento" tagType="plan" title="Apraxia de fala">
              <p>Os músculos funcionam e a pessoa conhece a palavra, mas o cérebro tem dificuldade para planejar a sequência motora da articulação.</p>
              <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>Frases automáticas ou cantar muitas vezes saem melhor que a fala intencional.</p>
            </Card>
          </div>

          <div className={styles.grid3} style={{ marginTop: 24 }}>
            <Card>
              <div className={styles.stat}>42%</div>
              <div className={styles.statLabel}>apresentaram disartria após o primeiro AVC em estudo nacional</div>
            </Card>
            <Card>
              <div className={styles.stat}>30%</div>
              <div className={styles.statLabel}>apresentaram afasia no mesmo estudo; 10% com disfagia associada</div>
            </Card>
            <Card>
              <div className={styles.stat}>12 meses</div>
              <div className={styles.statLabel}>tempo médio de fonoterapia no SUS — mais longo em afasias severas</div>
            </Card>
          </div>

          <Callout type="warm">
            <p>
              <strong>Fatores cruciais para o design:</strong> paralisia ou fraqueza hemisférica (muitas vezes forçando o uso da mão não dominante), hemiatenção/negligência visual unilateral, fadiga cognitiva rápida e depressão pós-AVC.
            </p>
          </Callout>
        </section>

        {/* 2. O que já existe */}
        <section className={styles.section} id="existe">
          <h2>2. O que já existe e lições da literatura</h2>
          <div className={styles.grid2}>
            <Card title="Treino do parceiro de comunicação (SCA)">
              <p>
                Método <em>Supported Conversation for Adults with Aphasia</em>: ensinar a família e cuidadores a dar suporte à conversa. Reconhece que a pessoa é competente e sabe mais do que consegue verbalizar.
              </p>
            </Card>

            <Card title="Pranchas e álbuns de baixa tecnologia">
              <p>
                Fotografias reais da família, cadernos de conversa e pranchas temáticas funcionam porque colocam a pessoa como condutora da conversa, não apenas como respondente passiva.
              </p>
            </Card>
          </div>
        </section>

        {/* 3. Respostas das famílias -> Arquitetura do App */}
        <section className={styles.section} id="arquitetura">
          <h2>3. Como as respostas da família moldam o aplicativo</h2>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Bloco da Entrevista</th>
                  <th>O que investigamos</th>
                  <th>Impacto na Arquitetura do App</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>A · Como está agora</strong></td>
                  <td>Tipo de sequela (afasia, disartria, apraxia) e tempo de evolução</td>
                  <td>Decide se o app focará em texto/teclado, símbolos visuais ou áudio sintetizado</td>
                </tr>
                <tr>
                  <td><strong>B · Compreensão</strong></td>
                  <td>Entendimento de frases, leitura e reconhecimento de fotos</td>
                  <td>Determina se as instruções e cartões terão voz alta, fotos reais ou ilustrações</td>
                </tr>
                <tr>
                  <td><strong>C · Expressão</strong></td>
                  <td>Por onde a mensagem sai (fala residual, escrita, gestos)</td>
                  <td>Mecanismos de entrada: botões de toque largo, pranchas rápidas ou atalhos</td>
                </tr>
                <tr>
                  <td><strong>D · Corpo e visão</strong></td>
                  <td>Mão utilizada, tremor, campo visual e fadiga</td>
                  <td>Tamanho dos botões touch, contraste, layout adaptado para hemiplegia</td>
                </tr>
                <tr>
                  <td><strong>E · Rotina diária</strong></td>
                  <td>Momentos críticos de frustração, dor, necessidades básicas</td>
                  <td>Cartões de emergência e rotina fixos na tela inicial para acesso imediato</td>
                </tr>
                <tr>
                  <td><strong>G · Lembranças e identidade</strong></td>
                  <td>Apelidos familiares, histórias, comidas e vocabulário afetivo</td>
                  <td>Personalização única de vocabulário para cada família (evita apps genéricos)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 20 }}>
            Para convidar novas famílias a participar, acesse a <Link href="/convite">área de convites da equipe</Link>.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
