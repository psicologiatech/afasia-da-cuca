import React, { Suspense } from "react";
import { Header } from "@/components/Header/Header";
import { Navbar } from "@/components/Navbar/Navbar";
import { Footer } from "@/components/Footer/Footer";
import { EntrevistaForm } from "./EntrevistaForm";

export default function EntrevistaPage() {
  return (
    <>
      <Header
        eyebrow="Conversa Apoiada"
        title="Queremos ouvir você"
        description="Estamos criando um aplicativo para ajudar quem teve um AVC a se comunicar com a família. Ninguém conhece a pessoa, a rotina e o que hoje é difícil melhor do que a família."
      />
      <Navbar />

      <main>
        <Suspense
          fallback={
            <div className="wrap" style={{ padding: "48px 16px", textAlign: "center" }}>
              Carregando formulário da entrevista...
            </div>
          }
        >
          <EntrevistaForm />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}
