/**
 * Test de charge : pages publiques sous N utilisateurs simultanés.
 *
 * Simule 20 utilisateurs qui accèdent aux pages publiques en parallèle.
 * Mesure les temps de réponse et vérifie qu'aucune page ne plante.
 *
 * Usage : npx tsx load-tests/concurrent-pages.ts
 */

import { timedFetch, report, summary, type RequestResult } from "./utils";

const BASE = process.env.LOAD_TEST_URL ?? "http://localhost:3000";
const CONCURRENT = 20;

const PAGES = [
  { path: "/", label: "Landing" },
  { path: "/connexion", label: "Connexion" },
  { path: "/inscription", label: "Inscription" },
  { path: "/guide", label: "Guide" },
  { path: "/cgu", label: "CGU" },
  { path: "/mentions-legales", label: "Mentions légales" },
];

async function testConcurrentPages() {
  console.log(`\nTest pages publiques — ${CONCURRENT} utilisateurs simultanés sur ${BASE}`);

  const allResults: Record<string, RequestResult[]> = {};

  for (const page of PAGES) {
    const results = await Promise.all(
      Array.from({ length: CONCURRENT }, () => timedFetch(`${BASE}${page.path}`))
    );
    allResults[page.label] = results;
    report(page.label, results);
  }

  summary(allResults);

  // Vérification
  let allOk = true;
  for (const [label, results] of Object.entries(allResults)) {
    const errors = results.filter((r) => r.status !== 200);
    if (errors.length > 0) {
      console.log(`⚠️ ${label} : ${errors.length} réponses non-200`);
      allOk = false;
    }
  }
  console.log(allOk ? "✅ Toutes les pages répondent en 200" : "⚠️ Certaines pages ont des erreurs");
}

testConcurrentPages().catch(console.error);
