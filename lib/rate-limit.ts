/**
 * Rate limiter en mémoire (par clé — userId ou IP).
 *
 * Stockage en Map avec expiration automatique.
 * Suffisant pour un déploiement single-instance (Vercel Edge, Node unique).
 * Pour du multi-instance, remplacer par Redis (Upstash, etc.).
 */

type RateLimitEntry = { count: number; resetAt: number };

const stores = new Map<string, Map<string, RateLimitEntry>>();

function getStore(name: string): Map<string, RateLimitEntry> {
  let store = stores.get(name);
  if (!store) {
    store = new Map();
    stores.set(name, store);
  }
  return store;
}

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSeconds: number };

/**
 * Vérifie et incrémente le compteur de rate limit.
 *
 * @param name      Nom du limiter (ex: "chat", "codir", "upload")
 * @param key       Clé unique (userId, IP, etc.)
 * @param limit     Nombre max de requêtes
 * @param windowMs  Fenêtre en millisecondes
 */
export function checkRateLimit(
  name: string,
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const store = getStore(name);
  const now = Date.now();
  const entry = store.get(key);

  // Fenêtre expirée ou première requête → reset
  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  // Sous la limite
  if (entry.count < limit) {
    entry.count++;
    return { ok: true, remaining: limit - entry.count };
  }

  // Limite atteinte
  const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
  return { ok: false, retryAfterSeconds };
}

// Nettoyage périodique des entrées expirées (toutes les 5 min)
setInterval(() => {
  const now = Date.now();
  for (const store of stores.values()) {
    for (const [key, entry] of store) {
      if (now >= entry.resetAt) store.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();
