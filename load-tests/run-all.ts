/**
 * Lance tous les tests de charge séquentiellement.
 *
 * Usage :
 *   npx dotenv-cli -e .env.local -- npx tsx load-tests/run-all.ts
 *
 * Contre la prod :
 *   LOAD_TEST_URL=https://founderai.vercel.app npx tsx load-tests/run-all.ts
 */

import { execSync } from "child_process";

const scripts = [
  { name: "Pages publiques", file: "concurrent-pages.ts" },
  { name: "Rate limiting", file: "rate-limit.ts" },
  { name: "Stress API", file: "api-stress.ts" },
];

console.log("╔═══════════════════════════════════════╗");
console.log("║     TESTS DE CHARGE — FounderAI       ║");
console.log("╚═══════════════════════════════════════╝\n");

for (const script of scripts) {
  console.log(`\n▶ ${script.name}...`);
  try {
    execSync(`npx tsx load-tests/${script.file}`, {
      stdio: "inherit",
      env: process.env,
    });
  } catch {
    console.error(`✗ ${script.name} a échoué`);
  }
}

console.log("\n✓ Tests de charge terminés");
