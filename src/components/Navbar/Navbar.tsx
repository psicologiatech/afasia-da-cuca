"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import styles from "./Navbar.module.css";

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  items?: NavItem[];
}

export const Navbar: React.FC<NavbarProps> = ({ items }) => {
  const pathname = usePathname();

  const defaultItems: NavItem[] = [
    { label: "🗣️ Afasia da Cuca", href: "/" },
    { label: "📋 Entrevista Familiar", href: "/entrevista" },
    { label: "🔬 Pesquisa de Base", href: "/pesquisa" },
    { label: "🔑 Gerar Convites", href: "/convite" },
  ];

  const links = items || defaultItems;

  return (
    <nav className={styles.toc} aria-label="Navegação do site">
      <div className={styles.wrap}>
        {links.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActive ? styles.active : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
        <ThemeToggle />
      </div>
    </nav>
  );
};
