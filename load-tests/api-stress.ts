/**
 * Test de charge : API endpoints sous stress progressif.
 *
 * Monte progressivement de 5 à 50 requêtes simultanées sur les API critiques.
 * Mesure la dégradation de performance et les erreurs.
 *
 * Usage : npx dotenv-cli -e .env.local -- npx tsx load-tests/api-stress.ts
 */

import { timedFetch, report, summary, type RequestResult } from "./utils";

const BASE = process.env.LOAD_TEST_URL ?? "http://localhost:3000";
const RAMP = [5, 10, 20, 50]; // montée progressive

async function stressEndpoint(
  label: string,
  url: string,
  init: RequestInit,
  concurrency: number
): Promise<RequestResult[]> {
  return Promise.all(
    Array.from({ length: concurrency }, () => timedFetch(url, init))
  );
}

async function runStress() {
  console.log(`\nTest de stress API — montée progressive sur ${BASE}`);
  console.log(`Paliers : ${RAMP.join(", ")} requêtes simultanées\n`);

  const allResults: Record<string, RequestResult[]> = {};

  for (const concurrency of RAMP) {
    console.log(`\n━━━ Palier ${concurrency} requêtes simultanées ━━━`);

    // GET /api/startup (lecture profil — sans auth = 401)
    const startupResults = await stressEndpoint(
      `GET /api/startup (×${concurrency})`,
      `${BASE}/api/startup?startupId=test`,
      {},
      concurrency
    );
    report(`GET /api/startup ×${concurrency}`, startupResults);

    // POST /api/chat (sans auth = 401, mais teste le rate limiter)
    const chatResults = await stressEndpoint(
      `POST /api/chat (×${concurrency})`,
      `${BASE}/api/chat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentKey: "strategie", message: "stress test" }),
      },
      concurrency
    );
    report(`POST /api/chat ×${concurrency}`, chatResults);

    // POST /api/intent (sans auth = 401)
    const intentResults = await stressEndpoint(
      `POST /api/intent (×${concurrency})`,
      `${BASE}/api/intent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "pricing", agentKey: "strategie" }),
      },
      concurrency
    );
    report(`POST /api/intent ×${concurrency}`, intentResults);

    // Stocker pour le résumé
    allResults[`startup ×${concurrency}`] = startupResults;
    allResults[`chat ×${concurrency}`] = chatResults;
    allResults[`intent ×${concurrency}`] = intentResults;

    // Pause entre les paliers pour ne pas saturer
    await new Promise((r) => setTimeout(r, 1000));
  }

  summary(allResults);

  // Vérifier la dégradation
  const chatLatencies = RAMP.map((c) => {
    const results = allResults[`chat ×${c}`];
    const p95 = [...results.map((r) => r.latencyMs)].sort((a, b) => a - b)[Math.ceil(0.95 * results.length) - 1];
    return { concurrency: c, p95 };
  });

  console.log("Dégradation latence chat (p95) :");
  for (const { concurrency, p95 } of chatLatencies) {
    const bar = "█".repeat(Math.min(50, Math.round(p95 / 20)));
    console.log(`  ×${String(concurrency).padStart(2)} : ${String(p95).padStart(5)}ms ${bar}`);
  }
}

runStress().catch(console.error);
