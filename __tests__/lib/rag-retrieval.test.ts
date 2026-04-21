import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock voyageai avec une vraie classe pour que `new VoyageAIClient()` fonctionne
vi.mock("voyageai", () => ({
  VoyageAIClient: class {
    async embed() {
      return { data: [{ embedding: new Array(1024).fill(0.1) }] };
    }
  },
}));

vi.mock("@/lib/supabase", () => ({
  createServerClient: vi.fn(),
}));

import { retrieveRelevantChunks, chunkText, embedText } from "@/lib/rag";
import * as supabaseLib from "@/lib/supabase";

beforeEach(() => {
  vi.clearAllMocks();
  process.env.VOYAGE_API_KEY = "test-key";
});

describe("embedText", () => {
  it("retourne un embedding de 1024 dimensions", async () => {
    const emb = await embedText("test");
    expect(emb).not.toBeNull();
    expect(emb!.length).toBe(1024);
  });

  it("retourne null sans VOYAGE_API_KEY", async () => {
    delete process.env.VOYAGE_API_KEY;
    const emb = await embedText("test");
    expect(emb).toBeNull();
  });
});

describe("retrieveRelevantChunks", () => {
  it("retourne les chunks pertinents au-dessus du seuil", async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: [
          { content: "Blue Ocean Strategy", similarity: 0.85 },
          { content: "Porter Five Forces", similarity: 0.72 },
        ],
        error: null,
      }),
    };
    vi.mocked(supabaseLib.createServerClient).mockReturnValue(supabase as never);

    const chunks = await retrieveRelevantChunks("strategie", "positionnement marché");
    expect(chunks).not.toBeNull();
    expect(chunks!.length).toBe(2);
    expect(chunks![0]).toBe("Blue Ocean Strategy");
  });

  it("filtre les chunks sous le seuil de similarité (0.3)", async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: [
          { content: "Pertinent", similarity: 0.6 },
          { content: "Non pertinent", similarity: 0.15 },
        ],
        error: null,
      }),
    };
    vi.mocked(supabaseLib.createServerClient).mockReturnValue(supabase as never);

    const chunks = await retrieveRelevantChunks("strategie", "test");
    expect(chunks).not.toBeNull();
    expect(chunks!.length).toBe(1);
    expect(chunks![0]).toBe("Pertinent");
  });

  it("retourne null si aucun chunk pertinent", async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: [{ content: "Bruit", similarity: 0.1 }],
        error: null,
      }),
    };
    vi.mocked(supabaseLib.createServerClient).mockReturnValue(supabase as never);

    const chunks = await retrieveRelevantChunks("strategie", "xyz");
    expect(chunks).toBeNull();
  });

  it("retourne null en cas d'erreur RPC", async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "function not found" },
      }),
    };
    vi.mocked(supabaseLib.createServerClient).mockReturnValue(supabase as never);

    const chunks = await retrieveRelevantChunks("strategie", "test");
    expect(chunks).toBeNull();
  });

  it("retourne null sans VOYAGE_API_KEY", async () => {
    delete process.env.VOYAGE_API_KEY;
    const chunks = await retrieveRelevantChunks("strategie", "test");
    expect(chunks).toBeNull();
  });
});

describe("chunkText + retrieveRelevantChunks integration", () => {
  it("un texte chunké produit des chunks recherchables", () => {
    const text = "OKR trimestriels. ".repeat(60); // ~1080 chars
    const chunks = chunkText(text);
    expect(chunks.length).toBeGreaterThan(0);
    for (const chunk of chunks) {
      expect(chunk.length).toBeGreaterThanOrEqual(50);
    }
  });
});
