/**
 * Test de charge : vérifier que le rate limiting fonctionne sous pression.
 *
 * Envoie 50 requêtes en rafale sur /api/chat — le rate limiter doit
 * bloquer après 30 requêtes/minute avec un 429.
 *
 * Usage : npx dotenv-cli -e .env.local -- npx tsx load-tests/rate-limit.ts
 */

import { timedFetch, report, type RequestResult } from "./utils";

const BASE = process.env.LOAD_TEST_URL ?? "http://localhost:3000";
const BURST = 50; // requêtes en rafale

async function testRateLimit() {
  console.log(`\nTest rate limiting — ${BURST} requêtes en rafale sur ${BASE}/api/chat`);
  console.log("Attendu : ~30 réponses 200/401, puis des 429\n");

  const results: RequestResult[] = await Promise.all(
    Array.from({ length: BURST }, () =>
      timedFetch(`${BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentKey: "strategie",
          message: "test de charge",
        }),
      })
    )
  );

  report("Rate Limiting /api/chat", results);

  const rateLimited = results.filter((r) => r.status === 429).length;
  const ok = results.filter((r) => r.status !== 429 && r.status !== 0).length;

  console.log(`\n  Verdict : ${rateLimited > 0 ? "✅ Rate limiting actif" : "⚠️ Pas de 429 détecté"}`);
  console.log(`  ${ok} requêtes passées, ${rateLimited} bloquées`);
}

testRateLimit().catch(console.error);
