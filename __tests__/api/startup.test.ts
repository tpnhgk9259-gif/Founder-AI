import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  getAuthenticatedUserId: vi.fn(),
  userOwnsStartup: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  createServerClient: vi.fn(),
}));

import { GET, PUT } from "@/app/api/startup/route";
import * as auth from "@/lib/auth";
import * as supabaseLib from "@/lib/supabase";

function getRequest(startupId?: string) {
  const url = startupId
    ? `http://localhost/api/startup?startupId=${startupId}`
    : "http://localhost/api/startup";
  return new NextRequest(url);
}

function putRequest(body: unknown) {
  return new NextRequest("http://localhost/api/startup", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const STARTUP_DATA = {
  id: "s1",
  user_id: "u1",
  name: "Ma Startup",
  description: "Description test",
  partner_id: null,
  partners: null,
};

describe("GET /api/startup", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retourne 401 si non authentifié", async () => {
    vi.mocked(auth.getAuthenticatedUserId).mockResolvedValue(null);
    const res = await GET(getRequest("s1"));
    expect(res.status).toBe(401);
  });

  it("retourne 400 si startupId absent", async () => {
    vi.mocked(auth.getAuthenticatedUserId).mockResolvedValue("u1");
    const res = await GET(getRequest());
    expect(res.status).toBe(400);
  });

  it("retourne 403 si l'utilisateur ne possède pas la startup", async () => {
    vi.mocked(auth.getAuthenticatedUserId).mockResolvedValue("u1");
    vi.mocked(auth.userOwnsStartup).mockResolvedValue(false);
    const res = await GET(getRequest("s1"));
    expect(res.status).toBe(403);
  });

  it("retourne les données de la startup si autorisé", async () => {
    vi.mocked(auth.getAuthenticatedUserId).mockResolvedValue("u1");
    vi.mocked(auth.userOwnsStartup).mockResolvedValue(true);

    vi.mocked(supabaseLib.createServerClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: STARTUP_DATA, error: null }),
          }),
        }),
      }),
    } as never);

    const res = await GET(getRequest("s1"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe("s1");
    expect(body.name).toBe("Ma Startup");
  });
});

describe("PUT /api/startup", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retourne 401 si non authentifié", async () => {
    vi.mocked(auth.getAuthenticatedUserId).mockResolvedValue(null);
    const res = await PUT(putRequest({ startupId: "s1", name: "Nouveau nom" }));
    expect(res.status).toBe(401);
  });

  it("retourne 400 si startupId manquant", async () => {
    vi.mocked(auth.getAuthenticatedUserId).mockResolvedValue("u1");
    const res = await PUT(putRequest({ name: "Nouveau nom" }));
    expect(res.status).toBe(400);
  });

  it("retourne 403 si l'utilisateur ne possède pas la startup", async () => {
    vi.mocked(auth.getAuthenticatedUserId).mockResolvedValue("u1");
    vi.mocked(auth.userOwnsStartup).mockResolvedValue(false);
    const res = await PUT(putRequest({ startupId: "s1", name: "Nom" }));
    expect(res.status).toBe(403);
  });

  it("met à jour les champs de la startup avec succès", async () => {
    vi.mocked(auth.getAuthenticatedUserId).mockResolvedValue("u1");
    vi.mocked(auth.userOwnsStartup).mockResolvedValue(true);

    const updatedData = { ...STARTUP_DATA, name: "Nouveau nom" };
    vi.mocked(supabaseLib.createServerClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedData, error: null }),
            }),
          }),
        }),
      }),
    } as never);

    const res = await PUT(putRequest({ startupId: "s1", name: "Nouveau nom" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Nouveau nom");
  });

  it("retourne 500 si Supabase échoue", async () => {
    vi.mocked(auth.getAuthenticatedUserId).mockResolvedValue("u1");
    vi.mocked(auth.userOwnsStartup).mockResolvedValue(true);

    vi.mocked(supabaseLib.createServerClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: "DB error" } }),
            }),
          }),
        }),
      }),
    } as never);

    const res = await PUT(putRequest({ startupId: "s1", name: "Nom" }));
    expect(res.status).toBe(500);
  });
});
