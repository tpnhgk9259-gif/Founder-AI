import { describe, it, expect, vi } from "vitest";

// Mock voyageai pour éviter l'erreur ESM directory import
vi.mock("voyageai", () => ({ VoyageAIClient: vi.fn() }));

import { chunkText } from "@/lib/rag";

describe("chunkText", () => {
  it("retourne un tableau vide pour un texte vide", () => {
    expect(chunkText("")).toEqual([]);
    expect(chunkText("   ")).toEqual([]);
  });

  it("retourne un seul chunk pour un texte court", () => {
    const text = "Blue Ocean Strategy : créer un espace de marché incontesté.";
    const chunks = chunkText(text);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe(text);
  });

  it("découpe un texte long en plusieurs chunks", () => {
    const paragraph = "Lorem ipsum dolor sit amet. ".repeat(100); // ~2800 chars
    const chunks = chunkText(paragraph);
    expect(chunks.length).toBeGreaterThan(1);
  });

  it("chaque chunk fait moins de ~1100 chars (chunk_size + marge)", () => {
    const text = "Mot ".repeat(500); // ~2000 chars
    const chunks = chunkText(text);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThan(1100);
    }
  });

  it("coupe aux paragraphes quand possible", () => {
    const text =
      "A".repeat(600) + "\n\n" + "B".repeat(600);
    const chunks = chunkText(text);
    expect(chunks.length).toBeGreaterThanOrEqual(2);
    // Le premier chunk devrait se terminer à la frontière du paragraphe
    expect(chunks[0]).not.toContain("B");
  });

  it("ignore les micro-chunks (< 50 chars)", () => {
    const text = "A".repeat(800) + "\n\n" + "B".repeat(10);
    const chunks = chunkText(text);
    // Le "B" tout seul est trop petit pour être un chunk
    for (const chunk of chunks) {
      expect(chunk.length).toBeGreaterThanOrEqual(50);
    }
  });
});
