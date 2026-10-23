import React from "react";
import styles from "./Header.module.css";

interface HeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
}

export const Header: React.FC<HeaderProps> = ({ eyebrow, title, description }) => {
  return (
    <header className={styles.hero}>
      <div className={styles.wrap}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.lede}>{description}</p>
      </div>
    </header>
  );
};
