import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks déclarés avant les imports du module testé
vi.mock("@/lib/admin-auth", () => ({
  getRouteUser: vi.fn(),
  isSuperAdminEmail: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  createServerClient: vi.fn(),
}));

import { PATCH } from "@/app/api/admin/assign-startup/route";
import * as adminAuth from "@/lib/admin-auth";
import * as supabaseLib from "@/lib/supabase";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/admin/assign-startup", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeSupabaseMock(updateError: unknown = null) {
  const update = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: updateError }) });
  return { from: vi.fn().mockReturnValue({ update }) };
}

describe("PATCH /api/admin/assign-startup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourne 401 si non authentifié", async () => {
    vi.mocked(adminAuth.getRouteUser).mockResolvedValue(null);

    const res = await PATCH(makeRequest({ startupId: "s1", partnerId: "p1" }));
    expect(res.status).toBe(401);
  });

  it("retourne 403 si l'utilisateur n'est pas super-admin", async () => {
    vi.mocked(adminAuth.getRouteUser).mockResolvedValue({ email: "user@example.com", id: "u1" } as never);
    vi.mocked(adminAuth.isSuperAdminEmail).mockReturnValue(false);

    const res = await PATCH(makeRequest({ startupId: "s1", partnerId: "p1" }));
    expect(res.status).toBe(403);
  });

  it("retourne 400 si startupId manquant", async () => {
    vi.mocked(adminAuth.getRouteUser).mockResolvedValue({ email: "admin@example.com", id: "u1" } as never);
    vi.mocked(adminAuth.isSuperAdminEmail).mockReturnValue(true);

    const res = await PATCH(makeRequest({ partnerId: "p1" }));
    expect(res.status).toBe(400);
  });

  it("assigne une startup à un partenaire avec succès", async () => {
    vi.mocked(adminAuth.getRouteUser).mockResolvedValue({ email: "admin@example.com", id: "u1" } as never);
    vi.mocked(adminAuth.isSuperAdminEmail).mockReturnValue(true);
    vi.mocked(supabaseLib.createServerClient).mockReturnValue(makeSupabaseMock() as never);

    const res = await PATCH(makeRequest({ startupId: "s1", partnerId: "p1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it("désassigne une startup (partnerId null) avec succès", async () => {
    vi.mocked(adminAuth.getRouteUser).mockResolvedValue({ email: "admin@example.com", id: "u1" } as never);
    vi.mocked(adminAuth.isSuperAdminEmail).mockReturnValue(true);
    vi.mocked(supabaseLib.createServerClient).mockReturnValue(makeSupabaseMock() as never);

    const res = await PATCH(makeRequest({ startupId: "s1", partnerId: null }));
    expect(res.status).toBe(200);
  });

  it("retourne 500 si Supabase échoue", async () => {
    vi.mocked(adminAuth.getRouteUser).mockResolvedValue({ email: "admin@example.com", id: "u1" } as never);
    vi.mocked(adminAuth.isSuperAdminEmail).mockReturnValue(true);
    vi.mocked(supabaseLib.createServerClient).mockReturnValue(
      makeSupabaseMock({ message: "DB error" }) as never
    );

    const res = await PATCH(makeRequest({ startupId: "s1", partnerId: "p1" }));
    expect(res.status).toBe(500);
  });

  it("retourne 400 si le corps JSON est invalide", async () => {
    vi.mocked(adminAuth.getRouteUser).mockResolvedValue({ email: "admin@example.com", id: "u1" } as never);
    vi.mocked(adminAuth.isSuperAdminEmail).mockReturnValue(true);

    const req = new Request("http://localhost/api/admin/assign-startup", {
      method: "PATCH",
      body: "not json",
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });
});
