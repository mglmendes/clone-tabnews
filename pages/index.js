import { useEffect } from "react";

function Home() {
  useEffect(() => {
    // RESET GLOBAL FORÇADO
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.documentElement.style.width = "100%";
    document.documentElement.style.height = "100%";
    document.documentElement.style.overflow = "hidden";

    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.width = "100%";
    document.body.style.height = "100%";
    document.body.style.overflow = "hidden";
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>SiegeNews</h1>

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
    inset: 0, // substitui 100vh / 100vw
    backgroundColor: "#0f172a",
    color: "#e5e7eb",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "3rem",
    margin: "0 0 12px 0",
    letterSpacing: "2px",
  },
  subtitle: {
    fontSize: "1.2rem",
    margin: "0 0 10px 0",
  },
  description: {
    maxWidth: "520px",
    fontSize: "1rem",
    opacity: 0.9,
    margin: 0,
  },
};

export default Home;
