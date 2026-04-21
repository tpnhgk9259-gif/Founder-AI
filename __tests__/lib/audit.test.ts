import { describe, it, expect, vi, beforeEach } from "vitest";

const mockInsert = vi.fn().mockReturnValue({ then: vi.fn((cb: (v: unknown) => void) => cb({ error: null })) });

vi.mock("@/lib/supabase", () => ({
  createServerClient: vi.fn(() => ({
    from: vi.fn(() => ({ insert: mockInsert })),
  })),
}));

import { logAudit } from "@/lib/audit";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("logAudit", () => {
  it("insère un log dans audit_log", () => {
    logAudit({
      userId: "u1",
      action: "document.upload",
      entityType: "document",
      entityId: "d1",
      metadata: { fileName: "test.pdf" },
    });

    expect(mockInsert).toHaveBeenCalledWith({
      user_id: "u1",
      action: "document.upload",
      entity_type: "document",
      entity_id: "d1",
      metadata: { fileName: "test.pdf" },
    });
  });

  it("gère les paramètres optionnels absents", () => {
    logAudit({
      userId: "u1",
      action: "knowledge.update",
      entityType: "agent_knowledge",
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        entity_id: null,
        metadata: {},
      })
    );
  });
});
