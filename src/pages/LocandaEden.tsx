import { useEffect } from "react";
import "@/styles/eden.css";

export default function LocandaEden() {
  // Keep EDEN full-bleed globals even outside the landing.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.classList.add("eden-html");
    body.classList.add("eden-body");
    return () => {
      html.classList.remove("eden-html");
      body.classList.remove("eden-body");
    };
  }, []);

  return (
    <div className="eden-theme">
      <main className="page" style={{ padding: "120px 18px 60px" }}>
        <section className="eden-shell" aria-labelledby="locanda-eden-title">
          <h1 id="locanda-eden-title" className="eden-title" style={{ marginBottom: 10 }}>
            LOCANDA EDEN
          </h1>
          <p className="eden-sub">Pagina in arrivo. A breve ti preparo il layout completo come mi dirai tu.</p>
        </section>
      </main>
    </div>
  );
}

