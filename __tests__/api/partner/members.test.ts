import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  getAuthenticatedUserId: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  createServerClient: vi.fn(),
}));

import { POST, DELETE } from "@/app/api/partner/members/route";
import * as auth from "@/lib/auth";
import * as supabaseLib from "@/lib/supabase";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function postRequest(body: unknown) {
  return new NextRequest("http://localhost/api/partner/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function deleteRequest(partnerId: string, memberId: string) {
  return new NextRequest(
    `http://localhost/api/partner/members?partnerId=${partnerId}&memberId=${memberId}`,
    { method: "DELETE" }
  );
}

/**
 * Construit un mock Supabase qui simule les appels chaînés.
 * Chaque entrée de `callMap` définit ce que retourne from(table).
 */
function makeSupabaseMock(callMap: Record<string, unknown>) {
  return {
    from: vi.fn((table: string) => callMap[table] ?? callMap["*"]),
  };
}

// ─── POST /api/partner/members ────────────────────────────────────────────────

describe("POST /api/partner/members", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retourne 401 si non authentifié", async () => {
    vi.mocked(auth.getAuthenticatedUserId).mockResolvedValue(null);
    const res = await POST(postRequest({ partnerId: "p1", email: "user@x.com" }));
    expect(res.status).toBe(401);
  });

  it("retourne 400 si email manquant", async () => {
    vi.mocked(auth.getAuthenticatedUserId).mockResolvedValue("u1");

    // L'admin check passe
    const adminSelect = { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: { id: "m1" } }) }) }) }) }) };
    vi.mocked(supabaseLib.createServerClient).mockReturnValue(makeSupabaseMock({ partner_members: adminSelect }) as never);

    const res = await POST(postRequest({ partnerId: "p1" }));
    expect(res.status).toBe(400);
  });

  it("retourne 403 si l'utilisateur n'est pas admin du partenaire", async () => {
    vi.mocked(auth.getAuthenticatedUserId).mockResolvedValue("u1");

    const notAdminSelect = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null }), // pas admin
            }),
          }),
        }),
      }),
    };

    vi.mocked(supabaseLib.createServerClient).mockReturnValue(
      makeSupabaseMock({ partner_members: notAdminSelect }) as never
    );

    const res = await POST(postRequest({ partnerId: "p1", email: "user@x.com" }));
    expect(res.status).toBe(403);
  });

  it("retourne 409 si quota custom épuisé", async () => {
    vi.mocked(auth.getAuthenticatedUserId).mockResolvedValue("u1");

    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "partners") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { license_config: { portfolio_plan_allowances: { custom: 1 } } },
                }),
              }),
            }),
          };
        }
        if (table === "partner_members") {
          return {
            select: vi.fn((fields: string, opts?: unknown) => {
              // Appel admin check
              if (!opts) {
                return {
                  eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                      eq: vi.fn().mockReturnValue({
                        maybeSingle: vi.fn().mockResolvedValue({ data: { id: "m_admin" } }),
                      }),
                    }),
                  }),
                };
              }
              // Appel count (allowance check)
              return {
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ count: 1 }), // quota atteint (1 >= 1)
                  }),
                }),
              };
            }),
          };
        }
        return {};
      }),
    };

    vi.mocked(supabaseLib.createServerClient).mockReturnValue(supabase as never);

    const res = await POST(postRequest({ partnerId: "p1", email: "new@x.com" }));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/quota/i);
  });
});

// ─── DELETE /api/partner/members ─────────────────────────────────────────────

describe("DELETE /api/partner/members", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retourne 401 si non authentifié", async () => {
    vi.mocked(auth.getAuthenticatedUserId).mockResolvedValue(null);
    const res = await DELETE(deleteRequest("p1", "m1"));
    expect(res.status).toBe(401);
  });

  it("retourne 400 si partnerId ou memberId manquant", async () => {
    vi.mocked(auth.getAuthenticatedUserId).mockResolvedValue("u1");
    const req = new NextRequest("http://localhost/api/partner/members", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  it("retourne 403 si l'utilisateur n'est pas admin", async () => {
    vi.mocked(auth.getAuthenticatedUserId).mockResolvedValue("u1");

    // Mock enchaîné : select().eq().eq().eq().maybeSingle()
    const maybeSingle = vi.fn().mockResolvedValue({ data: null });
    const eq3 = vi.fn().mockReturnValue({ maybeSingle });
    const eq2 = vi.fn().mockReturnValue({ eq: eq3 });
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
    const select = vi.fn().mockReturnValue({ eq: eq1 });

    vi.mocked(supabaseLib.createServerClient).mockReturnValue({
      from: vi.fn().mockReturnValue({ select }),
    } as never);

    const res = await DELETE(deleteRequest("p1", "m1"));
    expect(res.status).toBe(403);
  });
});
