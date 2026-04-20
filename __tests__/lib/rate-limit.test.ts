import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("autorise les premières requêtes sous la limite", () => {
    const r = checkRateLimit("test-allow", "user1", 5, 60_000);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.remaining).toBe(4);
  });

  it("bloque quand la limite est atteinte", () => {
    const name = "test-block";
    const key = "user-block";
    for (let i = 0; i < 3; i++) {
      checkRateLimit(name, key, 3, 60_000);
    }
    const r = checkRateLimit(name, key, 3, 60_000);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("réinitialise après expiration de la fenêtre", async () => {
    const name = "test-expire";
    const key = "user-expire";
    // Remplir la limite avec une fenêtre très courte
    for (let i = 0; i < 2; i++) {
      checkRateLimit(name, key, 2, 50);
    }
    const blocked = checkRateLimit(name, key, 2, 50);
    expect(blocked.ok).toBe(false);

    // Attendre l'expiration
    await new Promise((r) => setTimeout(r, 60));
    const after = checkRateLimit(name, key, 2, 50);
    expect(after.ok).toBe(true);
  });

  it("isole les compteurs par nom et clé", () => {
    const r1 = checkRateLimit("test-iso-a", "user1", 1, 60_000);
    const r2 = checkRateLimit("test-iso-b", "user1", 1, 60_000);
    const r3 = checkRateLimit("test-iso-a", "user2", 1, 60_000);
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    expect(r3.ok).toBe(true);
  });
});
