import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/licenses-server", () => ({
  getEffectiveStartupLicense: vi.fn(),
}));

import { checkChatAccess, checkCodirAccess } from "@/lib/license-service";
import * as licensesServer from "@/lib/licenses-server";
import * as supabaseLib from "@/lib/supabase";
import { DEFAULT_LICENSE_CONFIG } from "@/lib/licenses";

function mockSupabase(overrides: { convos?: { id: string }[]; messageCount?: number; codirCount?: number } = {}) {
  const supabase = {
    from: vi.fn((table: string) => {
      if (table === "conversations") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: overrides.convos ?? [] }),
          }),
        };
      }
      if (table === "messages") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({ count: overrides.messageCount ?? 0 }),
              }),
            }),
          }),
        };
      }
      if (table === "codir_sessions") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockResolvedValue({ count: overrides.codirCount ?? 0 }),
            }),
          }),
        };
      }
      return {};
    }),
  };
  vi.mocked(supabaseLib.createServerClient).mockReturnValue(supabase as never);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("checkChatAccess", () => {
  it("autorise si l'agent est inclus et le quota non atteint", async () => {
    vi.mocked(licensesServer.getEffectiveStartupLicense).mockResolvedValue(DEFAULT_LICENSE_CONFIG);
    mockSupabase({ convos: [{ id: "c1" }], messageCount: 5 });

    const result = await checkChatAccess("s1", "strategie");
    expect(result.ok).toBe(true);
  });

  it("refuse si l'agent n'est pas dans la licence", async () => {
    vi.mocked(licensesServer.getEffectiveStartupLicense).mockResolvedValue({
      ...DEFAULT_LICENSE_CONFIG,
      available_agents: ["strategie", "vente"],
    });
    mockSupabase();

    const result = await checkChatAccess("s1", "finance");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(403);
  });

  it("refuse si le quota quotidien est atteint", async () => {
    vi.mocked(licensesServer.getEffectiveStartupLicense).mockResolvedValue({
      ...DEFAULT_LICENSE_CONFIG,
      max_chat_messages_per_day: 10,
    });
    mockSupabase({ convos: [{ id: "c1" }], messageCount: 10 });

    const result = await checkChatAccess("s1", "strategie");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(429);
  });

  it("autorise si aucune conversation n'existe encore", async () => {
    vi.mocked(licensesServer.getEffectiveStartupLicense).mockResolvedValue(DEFAULT_LICENSE_CONFIG);
    mockSupabase({ convos: [] });

    const result = await checkChatAccess("s1", "strategie");
    expect(result.ok).toBe(true);
  });
});

describe("checkCodirAccess", () => {
  it("autorise si CODIR est inclus et le quota non atteint", async () => {
    vi.mocked(licensesServer.getEffectiveStartupLicense).mockResolvedValue(DEFAULT_LICENSE_CONFIG);
    mockSupabase({ codirCount: 5 });

    const result = await checkCodirAccess("s1");
    expect(result.ok).toBe(true);
  });

  it("refuse si CODIR n'est pas dans la licence", async () => {
    vi.mocked(licensesServer.getEffectiveStartupLicense).mockResolvedValue({
      ...DEFAULT_LICENSE_CONFIG,
      available_agents: ["strategie", "vente", "finance"],
    });
    mockSupabase();

    const result = await checkCodirAccess("s1");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(403);
  });

  it("refuse si le quota mensuel est atteint", async () => {
    vi.mocked(licensesServer.getEffectiveStartupLicense).mockResolvedValue({
      ...DEFAULT_LICENSE_CONFIG,
      max_codir_sessions_per_month: 5,
    });
    mockSupabase({ codirCount: 5 });

    const result = await checkCodirAccess("s1");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(429);
  });
});
