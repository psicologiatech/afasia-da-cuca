import React from "react";
import Link from "next/link";
import styles from "./Footer.module.css";

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.wrap}>
        <p className={styles.disclaimer}>
          <strong>Conversa Apoiada</strong> · Este material tem finalidade de apoio e pesquisa e não substitui avaliação ou acompanhamento de fonoaudiologia e equipe médica.
        </p>
        <p className={styles.disclaimer}>
          <Link href="/pesquisa">Ver pesquisa de base</Link> · <Link href="/convite">Área da equipe</Link> · Hospedado com Next.js na Vercel
        </p>
      </div>
    </footer>
  );
};
