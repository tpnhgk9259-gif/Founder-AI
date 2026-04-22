"use client";

import { useState } from "react";
import { glossary } from "./HelpBubble";

// Construire un map acronyme → définition (case-insensitive)
const GLOSSARY_MAP = new Map<string, string>();
for (const g of glossary) {
  GLOSSARY_MAP.set(g.term.toLowerCase(), g.def);
}

// Regex qui matche tous les termes du glossaire (mots entiers)
const terms = glossary.map((g) => g.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
const GLOSSARY_REGEX = new RegExp(`\\b(${terms.join("|")})\\b`, "gi");

function Tooltip({ term, definition }: { term: string; definition: string }) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span
        className="underline decoration-dotted cursor-help"
        style={{ textDecorationColor: "var(--uf-orange)", textUnderlineOffset: 2 }}
      >
        {term}
      </span>
      {show && (
        <span
          className="absolute z-50 px-3 py-2 text-xs leading-relaxed max-w-xs -translate-x-1/2 left-1/2"
          style={{
            bottom: "calc(100% + 6px)",
            background: "var(--uf-ink)",
            color: "var(--uf-paper)",
            borderRadius: "var(--uf-r-sm)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            whiteSpace: "normal",
            width: "max-content",
            maxWidth: 280,
          }}
        >
          <strong style={{ color: "var(--uf-lime)" }}>{term}</strong>
          <br />
          {definition}
          <span
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              top: "100%",
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: "5px solid var(--uf-ink)",
            }}
          />
        </span>
      )}
    </span>
  );
}

/**
 * Remplace les acronymes/termes du glossaire par des tooltips dans un texte.
 * Chaque terme n'est enrichi qu'à sa première occurrence dans le texte.
 */
export default function GlossaryText({ text }: { text: string }) {
  if (!text) return null;

  const matched = new Set<string>();
  const parts: (string | { term: string; def: string })[] = [];
  let lastIndex = 0;

  const regex = new RegExp(GLOSSARY_REGEX.source, "gi");
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const termLower = match[1].toLowerCase();
    // Seulement la première occurrence de chaque terme
    if (matched.has(termLower)) continue;
    matched.add(termLower);

    const def = GLOSSARY_MAP.get(termLower);
    if (!def) continue;

    // Texte avant le match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push({ term: match[1], def });
    lastIndex = match.index + match[0].length;
  }

  // Texte restant
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  // Si aucun terme trouvé, retourner le texte brut
  if (parts.length === 0 || (parts.length === 1 && typeof parts[0] === "string")) {
    return <>{text}</>;
  }

  return (
    <>
      {parts.map((part, i) =>
        typeof part === "string" ? (
          <span key={i}>{part}</span>
        ) : (
          <Tooltip key={i} term={part.term} definition={part.def} />
        )
      )}
    </>
  );
}
