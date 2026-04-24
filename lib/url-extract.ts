/**
 * Extraction du contenu textuel des URLs trouvées dans un message.
 *
 * - Détecte les URLs http/https dans le texte
 * - Fetch le HTML côté serveur
 * - Extrait le texte principal (supprime scripts, styles, nav, footer)
 * - Cap à 8000 chars par page pour ne pas exploser le contexte
 * - Timeout de 5s par URL, max 3 URLs par message
 */

const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
const MAX_URLS = 3;
const MAX_CHARS_PER_PAGE = 8000;
const FETCH_TIMEOUT_MS = 5000;

/**
 * Extrait les URLs d'un message texte.
 */
export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX) ?? [];
  // Dédupliquer et limiter
  return [...new Set(matches)].slice(0, MAX_URLS);
}

/**
 * Fetch une URL et retourne le texte extrait.
 * Retourne null en cas d'erreur ou timeout.
 */
async function fetchPageText(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "FounderAI-Bot/1.0 (content extraction)",
        "Accept": "text/html,application/xhtml+xml,text/plain",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "";

    // Texte brut
    if (contentType.includes("text/plain")) {
      const text = await res.text();
      return text.slice(0, MAX_CHARS_PER_PAGE);
    }

    // HTML → extraire le texte
    if (contentType.includes("text/html") || contentType.includes("application/xhtml")) {
      const html = await res.text();
      return htmlToText(html);
    }

    // PDF, JSON, etc. → pas supporté
    return null;
  } catch {
    return null;
  }
}

/**
 * Convertit du HTML en texte lisible.
 * Supprime scripts, styles, nav, footer, header, aside.
 */
function htmlToText(html: string): string {
  let text = html;

  // Supprimer les éléments non-contenu
  text = text.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<nav[\s\S]*?<\/nav>/gi, "");
  text = text.replace(/<footer[\s\S]*?<\/footer>/gi, "");
  text = text.replace(/<header[\s\S]*?<\/header>/gi, "");
  text = text.replace(/<aside[\s\S]*?<\/aside>/gi, "");
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
  text = text.replace(/<!--[\s\S]*?-->/g, "");

  // Convertir les blocs en sauts de ligne
  text = text.replace(/<\/(p|div|h[1-6]|li|tr|br|hr)[^>]*>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");

  // Supprimer toutes les balises restantes
  text = text.replace(/<[^>]+>/g, " ");

  // Décoder les entités HTML courantes
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, " ");

  // Nettoyer les espaces
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n\s*\n/g, "\n\n");
  text = text.trim();

  return text.slice(0, MAX_CHARS_PER_PAGE);
}

/**
 * Enrichit un message avec le contenu des URLs qu'il contient.
 * Retourne le message original + le contenu extrait formaté.
 */
export async function enrichMessageWithUrls(message: string): Promise<string> {
  const urls = extractUrls(message);
  if (urls.length === 0) return message;

  const results = await Promise.all(
    urls.map(async (url) => {
      const text = await fetchPageText(url);
      return { url, text };
    })
  );

  const extracted = results.filter((r) => r.text);
  if (extracted.length === 0) return message;

  const sections = extracted
    .map((r) => `--- Contenu de ${r.url} ---\n${r.text}\n--- Fin ---`)
    .join("\n\n");

  return `${message}\n\n[Contenu des liens référencés par l'utilisateur]\n${sections}`;
}
