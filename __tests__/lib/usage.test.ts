import { describe, it, expect, vi, beforeEach } from "vitest";

const mockInsert = vi.fn().mockReturnValue({ then: vi.fn((cb: (v: unknown) => void) => cb({ error: null })) });

vi.mock("@/lib/supabase", () => ({
  createServerClient: vi.fn(() => ({
    from: vi.fn(() => ({ insert: mockInsert })),
  })),
}));

import { logUsage } from "@/lib/usage";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("logUsage", () => {
  it("insère un log avec les tokens et le modèle", () => {
    logUsage({
      startupId: "s1",
      userId: "u1",
      model: "claude-sonnet-4-6",
      inputTokens: 1500,
      outputTokens: 800,
      endpoint: "chat",
    });

    expect(mockInsert).toHaveBeenCalledWith({
      startup_id: "s1",
      user_id: "u1",
      model: "claude-sonnet-4-6",
      input_tokens: 1500,
      output_tokens: 800,
      endpoint: "chat",
    });
  });

  it("gère les valeurs nulles pour startup et user", () => {
    logUsage({
      model: "claude-haiku-4-5",
      inputTokens: 100,
      outputTokens: 50,
      endpoint: "codir/synthesis",
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        startup_id: null,
        user_id: null,
      })
    );
  });
});
