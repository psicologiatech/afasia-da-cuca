"use client";

import React, { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.css";

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Verifica tema salvo ou preferência do sistema operacional
    const saved = localStorage.getItem("conversa-tema") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = saved || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("conversa-tema", nextTheme);
  };

  return (
    <button
      type="button"
      className={styles.themeBtn}
      onClick={toggleTheme}
      aria-label="Alternar tema claro ou escuro"
    >
      <span>◐</span>
      <span>{theme === "light" ? "Escuro" : "Claro"}</span>
    </button>
  );
};
