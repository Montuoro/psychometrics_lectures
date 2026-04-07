import { useState, useEffect } from "react";
import { SLIDE_COUNT, SLIDE_TITLES, NOTES } from "./notes.js";

const channel = new BroadcastChannel("deck-sync");

function FormattedNotes({ text, fontSize = 20 }) {
  // Split into segments: text inside "quotes" = speech (white), outside = directions (red)
  const parts = [];
  const regex = /\u201c([^"\u201d]*)\u201d|"([^"]*?)"/g;
  let last = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ type: "direction", text: text.slice(last, match.index) });
    }
    parts.push({ type: "speech", text: match[1] || match[2] });
    last = regex.lastIndex;
  }
  if (last < text.length) {
    parts.push({ type: "direction", text: text.slice(last) });
  }
  // Render a segment, handling **bold** markers within it
  const renderSegment = (str, color, key) => {
    const boldParts = str.split(/\*\*(.+?)\*\*/g);
    return (
      <span key={key} style={{ color }}>
        {boldParts.map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        )}
      </span>
    );
  };

  return (
    <div style={{ fontSize, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
      {parts.map((p, i) =>
        p.type === "speech"
          ? renderSegment(p.text, "#f8fafc", i)
          : renderSegment(p.text, "#ef4444", i)
      )}
    </div>
  );
}

export default function PresenterView() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const handler = (e) => {
      if (e.data.type === "slide-change") {
        setCurrentSlide(e.data.slide);
      }
    };
    channel.addEventListener("message", handler);
    channel.postMessage({ type: "presenter-ready" });
    return () => channel.removeEventListener("message", handler);
  }, []);

  const goTo = (slide) => {
    const s = Math.max(0, Math.min(SLIDE_COUNT - 1, slide));
    setCurrentSlide(s);
    channel.postMessage({ type: "slide-change", slide: s });
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") goTo(currentSlide + 1);
      if (e.key === "ArrowLeft") goTo(currentSlide - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#f8fafc", fontFamily: "system-ui,-apple-system,sans-serif", padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 24, color: "#f59e0b", fontWeight: 700 }}>Presenter Notes</h1>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <button onClick={() => goTo(currentSlide - 1)} disabled={currentSlide === 0} style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid #334155", background: "none", color: currentSlide === 0 ? "#334155" : "#94a3b8", cursor: currentSlide === 0 ? "default" : "pointer", fontSize: 15 }}>&larr; Prev</button>
          <span style={{ color: "#64748b", fontSize: 16, fontWeight: 600, minWidth: 100, textAlign: "center" }}>Slide {currentSlide + 1} / {SLIDE_COUNT}</span>
          <button onClick={() => goTo(currentSlide + 1)} disabled={currentSlide === SLIDE_COUNT - 1} style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid #334155", background: "none", color: currentSlide === SLIDE_COUNT - 1 ? "#334155" : "#94a3b8", cursor: currentSlide === SLIDE_COUNT - 1 ? "default" : "pointer", fontSize: 15 }}>Next &rarr;</button>
        </div>
      </div>

      <div style={{ flex: 1, background: "#1e293b", borderRadius: 12, padding: 36, overflowY: "auto" }}>
        <h2 style={{ fontSize: 36, color: "#f59e0b", marginBottom: 24 }}>{SLIDE_TITLES[currentSlide]}</h2>
        <FormattedNotes text={NOTES[currentSlide]} fontSize={30} />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        {SLIDE_TITLES.map((title, i) => (
          <button key={i} onClick={() => goTo(i)} style={{ padding: "6px 14px", borderRadius: 6, border: i === currentSlide ? "2px solid #f59e0b" : "1px solid #334155", background: i === currentSlide ? "rgba(245,158,11,0.15)" : "transparent", color: i === currentSlide ? "#f59e0b" : "#64748b", fontSize: 12, cursor: "pointer", transition: "all 0.15s" }}>{i + 1}</button>
        ))}
      </div>
    </div>
  );
}
