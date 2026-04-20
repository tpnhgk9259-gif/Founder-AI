import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/admin-auth", () => ({
  getRouteUser: vi.fn(),
  isSuperAdminEmail: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  createServerClient: vi.fn(),
}));

import { GET, PUT } from "@/app/api/admin/licenses/route";
import * as adminAuth from "@/lib/admin-auth";
import * as supabaseLib from "@/lib/supabase";

function makeSupabaseGetMock(partners: unknown[], startups: unknown[]) {
  return {
    from: vi.fn((table: string) => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: table === "partners" ? partners : startups,
          error: null,
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    })),
  };
}

describe("GET /api/admin/licenses", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retourne 401 si non authentifié", async () => {
    vi.mocked(adminAuth.getRouteUser).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("retourne 403 si pas super-admin", async () => {
    vi.mocked(adminAuth.getRouteUser).mockResolvedValue({ email: "user@x.com" } as never);
    vi.mocked(adminAuth.isSuperAdminEmail).mockReturnValue(false);
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("retourne les licences normalisées pour les partenaires et startups", async () => {
    vi.mocked(adminAuth.getRouteUser).mockResolvedValue({ email: "admin@x.com" } as never);
    vi.mocked(adminAuth.isSuperAdminEmail).mockReturnValue(true);
    vi.mocked(supabaseLib.createServerClient).mockReturnValue(
      makeSupabaseGetMock(
        [{ id: "p1", name: "Partenaire A", license_config: null }],
        [{ id: "s1", name: "Startup B", partner_id: "p1", license_config: null }]
      ) as never
    );

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.partners).toHaveLength(1);
    expect(body.startups).toHaveLength(1);
    // Vérifie que normalizeLicenseConfig est appliqué (valeurs par défaut)
    expect(body.partners[0].license_config.max_chat_messages_per_day).toBe(200);
  });
});

describe("PUT /api/admin/licenses", () => {
  beforeEach(() => vi.clearAllMocks());

  const makeUpdateMock = (error: unknown = null) => ({
    from: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error }),
      }),
    }),
  });

  it("retourne 401 si non authentifié", async () => {
    vi.mocked(adminAuth.getRouteUser).mockResolvedValue(null);
    const req = new Request("http://localhost/api/admin/licenses", {
      method: "PUT",
      body: JSON.stringify({ targetType: "partner", targetId: "p1", license: {} }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(401);
  });

  it("retourne 403 si pas super-admin", async () => {
    vi.mocked(adminAuth.getRouteUser).mockResolvedValue({ email: "user@x.com" } as never);
    vi.mocked(adminAuth.isSuperAdminEmail).mockReturnValue(false);
    const req = new Request("http://localhost/api/admin/licenses", {
      method: "PUT",
      body: JSON.stringify({ targetType: "partner", targetId: "p1", license: {} }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(403);
  });

  it("retourne 400 si targetType ou targetId manquant", async () => {
    vi.mocked(adminAuth.getRouteUser).mockResolvedValue({ email: "admin@x.com" } as never);
    vi.mocked(adminAuth.isSuperAdminEmail).mockReturnValue(true);
    const req = new Request("http://localhost/api/admin/licenses", {
      method: "PUT",
      body: JSON.stringify({ license: {} }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(400);
  });

  it("met à jour la licence d'un partenaire avec succès", async () => {
    vi.mocked(adminAuth.getRouteUser).mockResolvedValue({ email: "admin@x.com" } as never);
    vi.mocked(adminAuth.isSuperAdminEmail).mockReturnValue(true);
    vi.mocked(supabaseLib.createServerClient).mockReturnValue(makeUpdateMock() as never);

    const req = new Request("http://localhost/api/admin/licenses", {
      method: "PUT",
      body: JSON.stringify({ targetType: "partner", targetId: "p1", license: {} }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it("met à jour la licence d'une startup avec succès", async () => {
    vi.mocked(adminAuth.getRouteUser).mockResolvedValue({ email: "admin@x.com" } as never);
    vi.mocked(adminAuth.isSuperAdminEmail).mockReturnValue(true);
    vi.mocked(supabaseLib.createServerClient).mockReturnValue(makeUpdateMock() as never);

    const req = new Request("http://localhost/api/admin/licenses", {
      method: "PUT",
      body: JSON.stringify({ targetType: "startup", targetId: "s1", license: {} }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(200);
  });

  it("retourne 500 si Supabase échoue", async () => {
    vi.mocked(adminAuth.getRouteUser).mockResolvedValue({ email: "admin@x.com" } as never);
    vi.mocked(adminAuth.isSuperAdminEmail).mockReturnValue(true);
    vi.mocked(supabaseLib.createServerClient).mockReturnValue(
      makeUpdateMock({ message: "DB error" }) as never
    );

    const req = new Request("http://localhost/api/admin/licenses", {
      method: "PUT",
      body: JSON.stringify({ targetType: "partner", targetId: "p1", license: {} }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(500);
  });
});
