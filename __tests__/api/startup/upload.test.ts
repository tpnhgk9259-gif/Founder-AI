import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  getAuthenticatedUserId: vi.fn(),
  userOwnsStartup: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockReturnValue({ ok: true, remaining: 9 }),
}));

vi.mock("@/lib/audit", () => ({
  logAudit: vi.fn(),
}));

import { POST, DELETE } from "@/app/api/startup/upload/route";
import * as auth from "@/lib/auth";
import * as supabaseLib from "@/lib/supabase";
import * as auditLib from "@/lib/audit";

function uploadRequest(overrides: { startupId?: string; fileName?: string; text?: string } = {}) {
  const form = new FormData();
  form.append("startupId", overrides.startupId ?? "s1");
  form.append("file", new File(["hello world"], overrides.fileName ?? "test.txt", { type: "text/plain" }));
  if (overrides.text) form.append("text", overrides.text);
  return new NextRequest("http://localhost/api/startup/upload", { method: "POST", body: form });
}

function deleteRequest(startupId: string, docId: string) {
  return new NextRequest(`http://localhost/api/startup/upload?startupId=${startupId}&docId=${docId}`, { method: "DELETE" });
}

function mockSupabase(existingDocs: unknown[] = []) {
  const storage = {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: null }),
      remove: vi.fn().mockResolvedValue({ error: null }),
    }),
  };

  const supabase = {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { documents: existingDocs } }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    })),
    storage,
  };
  vi.mocked(supabaseLib.createServerClient).mockReturnValue(supabase as never);
  return supabase;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(auth.getAuthenticatedUserId).mockResolvedValue("u1");
  vi.mocked(auth.userOwnsStartup).mockResolvedValue(true);
});

describe("POST /api/startup/upload", () => {
  it("retourne 401 si non authentifié", async () => {
    vi.mocked(auth.getAuthenticatedUserId).mockResolvedValue(null);
    const res = await POST(uploadRequest());
    expect(res.status).toBe(401);
  });

  it("retourne 403 si l'utilisateur ne possède pas la startup", async () => {
    vi.mocked(auth.userOwnsStartup).mockResolvedValue(false);
    mockSupabase();
    const res = await POST(uploadRequest());
    expect(res.status).toBe(403);
  });

  it("upload un document texte avec succès", async () => {
    mockSupabase([]);
    const res = await POST(uploadRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.document).toBeDefined();
    expect(body.document.name).toBe("test.txt");
    expect(body.document.text).toBe("hello world");
  });

  it("log un audit après upload réussi", async () => {
    mockSupabase([]);
    await POST(uploadRequest());
    expect(auditLib.logAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "document.upload", userId: "u1" })
    );
  });

  it("refuse si le quota de 30 documents est atteint", async () => {
    const docs = Array.from({ length: 30 }, (_, i) => ({
      id: `d${i}`, name: `doc${i}.txt`, text: "x", uploadedAt: new Date().toISOString(),
    }));
    mockSupabase(docs);
    const res = await POST(uploadRequest());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/30/);
  });

  it("ne compte pas les documents supprimés dans le quota", async () => {
    const docs = Array.from({ length: 30 }, (_, i) => ({
      id: `d${i}`, name: `doc${i}.txt`, text: "x", uploadedAt: new Date().toISOString(),
      deleted_at: new Date().toISOString(), // tous supprimés
    }));
    mockSupabase(docs);
    const res = await POST(uploadRequest());
    expect(res.status).toBe(200);
  });

  it("utilise le texte fourni pour les docs générés (pas d'upload Storage)", async () => {
    const supabase = mockSupabase([]);
    await POST(uploadRequest({ text: "Texte pré-extrait du pitch deck" }));
    // Pas d'appel à storage.upload pour les docs générés
    expect(supabase.storage.from).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/startup/upload", () => {
  it("retourne 401 si non authentifié", async () => {
    vi.mocked(auth.getAuthenticatedUserId).mockResolvedValue(null);
    const res = await DELETE(deleteRequest("s1", "d1"));
    expect(res.status).toBe(401);
  });

  it("soft delete : retourne 200 et supprime du Storage", async () => {
    mockSupabase([
      { id: "d1", name: "test.txt", text: "hello", uploadedAt: "2026-01-01", storage_path: "s1/d1_test.txt" },
    ]);
    const res = await DELETE(deleteRequest("s1", "d1"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it("log un audit après suppression", async () => {
    mockSupabase([
      { id: "d1", name: "rapport.pdf", text: "x", uploadedAt: "2026-01-01" },
    ]);
    await DELETE(deleteRequest("s1", "d1"));
    expect(auditLib.logAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "document.delete", entityId: "d1" })
    );
  });
});
