import React from "react";
import styles from "./Card.module.css";

interface CardProps {
  title?: string;
  tag?: string;
  tagType?: "lang" | "motor" | "plan";
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ title, tag, tagType, children, className = "", style }) => {
  const getTagClass = () => {
    if (tagType === "motor") return styles.tagMotor;
    if (tagType === "plan") return styles.tagPlan;
    return styles.tagLang;
  };

  return (
    <article className={`${styles.card} ${className}`} style={style}>
      {tag && <span className={`${styles.tag} ${getTagClass()}`}>{tag}</span>}
      {title && <h3 className={styles.title}>{title}</h3>}
      {children}
    </article>
  );
};
