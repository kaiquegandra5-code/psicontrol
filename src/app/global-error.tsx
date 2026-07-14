"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body>
        <div style={{ padding: 40, fontFamily: "system-ui, sans-serif" }}>
          <h1>Algo deu errado</h1>
          <p>{error.message}</p>
          <button onClick={reset}>Tentar novamente</button>
        </div>
      </body>
    </html>
  );
}
