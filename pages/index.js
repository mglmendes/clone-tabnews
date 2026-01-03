import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // RESET TOTAL (remove bordas e scroll)
    const html = document.documentElement;
    const body = document.body;

    html.style.margin = "0";
    html.style.padding = "0";
    html.style.height = "100%";
    html.style.overflow = "hidden";

    body.style.margin = "0";
    body.style.padding = "0";
    body.style.height = "100%";
    body.style.overflow = "hidden";

    // Carrega fonte Bebas Neue (Rainbow Six Siege style)
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <div style={styles.container}>
      {/* SOMENTE este texto usa a fonte Siege */}
      <h1 style={styles.title}>SIEGENEWS</h1>

      {/* TODO o resto permanece em Arial */}
      <p style={styles.subtitle}>
        O site <strong>siegenews.com.br</strong> está em desenvolvimento 🚧
      </p>

      <p style={styles.description}>
        Em breve traremos notícias, atualizações e conteúdos exclusivos sobre o
        universo do Rainbow Six Siege X.
      </p>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    inset: 0,
    backgroundColor: "#0f172a",
    color: "#e5e7eb",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",

    // Fonte padrão do site
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  logo: {
    width: "240px",
    marginBottom: "30px",
  },
  title: {
    fontFamily: "'Bebas Neue', sans-serif", // 👈 só o SIEGENEWS
    fontSize: "3rem",
    marginBottom: "10px",
    letterSpacing: "2px",
  },
  subtitle: {
    fontSize: "1.3rem",
    marginBottom: "15px",
  },
  description: {
    maxWidth: "500px",
    fontSize: "1rem",
    opacity: 0.9,
  },
};
