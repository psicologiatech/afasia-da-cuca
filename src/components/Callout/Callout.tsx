import React from "react";
import styles from "./Callout.module.css";

interface CalloutProps {
  type?: "default" | "warm" | "gold";
  children: React.ReactNode;
  className?: string;
}

export const Callout: React.FC<CalloutProps> = ({ type = "default", children, className = "" }) => {
  const getTypeClass = () => {
    if (type === "warm") return styles.warm;
    if (type === "gold") return styles.gold;
    return "";
  };

  return (
    <div className={`${styles.callout} ${getTypeClass()} ${className}`}>
      {children}
    </div>
  );
};
