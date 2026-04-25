# Pitch Deck — FounderAI × Lumen

Handoff pour l'implémentation du **pitch deck** généré par FounderAI à la fin d'un parcours utilisateur. Maquette d'une startup fictive — **Lumen** — qui aide les restaurateurs indépendants à réduire leur facture d'énergie.

## Aperçu rapide

Ouvre `preview.html` dans un navigateur moderne (Chrome/Safari). Les 12 sheets s'affichent en pile verticale, chacune au format **280 × 157,5 mm** paysage.

```bash
cd handoff_pitch_deck
python3 -m http.server 8000    # ou npx serve, ou ouvrir preview.html direct
open http://localhost:8000/preview.html
```

## Ce qui doit être généré par le backend

L'utilisateur final reçoit un PDF. Ce handoff décrit **la composition visuelle** de chaque slide ; la génération PDF elle-même peut se faire de deux façons :

1. **Rendu HTML → PDF** (recommandé) — `puppeteer` / `playwright` / `weasyprint` sur la page HTML fournie. Les coordonnées sont en mm, la grille est stable, le layout absolu évite tout reflow.
2. **jsPDF natif** — réécriture des slides en instructions jsPDF (texte, formes, images). Plus long mais 100 % côté client.

Contraintes de format :
- **Dimension** : 280 × 157,5 mm (ratio 16:9, paysage)
- **Marges** : 10 mm horizontal, 10 mm vertical pour le header/footer
- **DPI** : 300 pour export imprimable

## Structure des fichiers

```
handoff_pitch_deck/
├── README.md                 ← ce fichier
├── preview.html              ← page de test locale
└── src/
    ├── pdf-tokens.css        ← variables CSS (couleurs, grille, typo)
    ├── pdf-shared.jsx        ← primitives partagées (Abs, TitleBlock, Eyebrow, PDFHeader, PDFFooter…)
    └── pitch-deck.jsx        ← composants des 12 slides + data LUMEN + mock principal
```

## Données de la slide (à paramétrer)

Tout le contenu est dans la constante `LUMEN` en haut de `pitch-deck.jsx` :

```js
const LUMEN = {
  name: 'Lumen',
  tagline: "Le copilote énergie des restaurateurs indépendants.",
  founders: [ { name: 'Juliette Moreau', role: 'CEO' }, ... ],
  problem: { stats: [...], quote: '...' },
  solution: { features: [...], proof: '...' },
  market: { tam: '1,8 Md€', sam: '720 M€', som: '48 M€', ... },
  traction: { mrr: '14,2 k€', growth: '+38 %/mois', customers: 180, ... },
  ...
};
```

À brancher sur le schéma de données FounderAI lors de l'intégration.

## Design system

### Couleurs (dans `pdf-tokens.css` et `PDF_COLORS` dans `pdf-shared.jsx`)

| Token        | Valeur      | Usage |
| ------------ | ----------- | ----- |
| `--pdf-paper`  | `#FBF8F0` | Fond sheet (crème) |
| `--pdf-paper2` | `#EFEBE0` | Fond neutre secondaire (TAM bar) |
| `--pdf-card`   | `#FFFFFF` | Fond cartes |
| `--pdf-ink`    | `#0F0E0B` | Texte principal |
| `--pdf-ink2`   | `#2A2824` | Texte secondaire |
| `--pdf-muted`  | `#6C6760` | Texte labels, eyebrows |
| `--pdf-muted2` | `#9A938A` | Texte encore plus discret |
| `--pdf-line`   | `#D9D3C4` | Bordures & séparateurs |
| `--pdf-orange` | `#FF6A1F` | **Accent primaire** (SOM, highlights, logo dot) |
| `--pdf-violet` | `#7A5AF2` | Accent secondaire (SAM, roadmap) |
| `--pdf-teal`   | `#0D9488` | Accent tertiaire (traction, solution) |
| `--pdf-magenta`| `#D81B60` | Accent problème |
| `--pdf-lime`   | `#B8D82E` | Accent "avantage" / seed |
| `--pdf-yellow` | `#F6C945` | Accent pricing |

### Typographie

| Rôle | Font | Weight | Taille |
| ---- | ---- | ------ | ------ |
| **Display** (titres) | **Anton** | 400 | 36–54pt |
| **Serif italic** (sous-titres, citations) | Georgia / Instrument Serif | 400 italic | 12–22pt |
| **Body / UI** | **Geist** | 400/500/700 | 9–14pt |
| **Mono** (eyebrows, métriques) | **Geist Mono** | 400/700 | 7.5–11pt, letter-spacing 0.14–0.2em |

Imports Google Fonts :
```html
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet"/>
```

### Grille & positionnement

Tout est en **mm** via la constante `MM = 3.7795` (1 mm = 3.7795 px à 96 DPI).

Primitives de layout dans `pdf-shared.jsx` :
- **`<Abs x y>`** — positionnement absolu depuis le coin haut-gauche de la sheet
- **`<Slab x y w h color>`** — ligne/séparateur horizontal ou vertical
- **`<Eyebrow x y accent>`** — micro-label en haut de slide (ex : "02 — Problème")
- **`<TitleBlock x y size lines={[…]}>`** — titre multi-lignes, mix sans/serif en flow normal
- **`<PDFHeader kind page total>`** — header standard (logo, label deck, pagination)
- **`<PDFFooter startup>`** — footer standard (nom startup, mention confidentiel, date)
- **`<PDFLogo>`** — le logo FounderAI (carré + dot orange)

### Structure d'une sheet type

```jsx
<div className="pdf-sheet">
  <PDFHeader kind="Pitch Deck" page={n} total={total}/>
  <Eyebrow x={14} y={22} accent={PDF_COLORS.orange}>02 — Problème</Eyebrow>
  <TitleBlock x={14} y={30} size={40} lines={[
    { text: 'UN RESTAURATEUR PERD' },
    { text: '18 % DE SON CA' },
    { text: 'en énergie invisible.', serif: true, size: 26, color: PDF_COLORS.orange, mt: 2 },
  ]}/>
  {/* contenu entre y=62 et y=138 */}
  <Abs x={14} y={62}>...</Abs>
  <PDFFooter startup={s.name}/>
</div>
```

**Règle importante** : le contenu principal occupe la zone **y=62 à y=138**, au-dessus du footer à y=148.5. Jamais de contenu sous y=138 sauf petits textes de bas de page.

## Les 12 slides en résumé

| # | Nom | Contenu |
| - | --- | ------- |
| 01 | Cover | Nom + tagline + founder + date |
| 02 | Problème | 3 stats + citation d'un resto |
| 03 | Marché | Barres TAM/SAM/SOM (1,8 Md€ / 720 M€ / 48 M€) + 3 métriques contexte |
| 04 | Solution | 3 features illustrées + preuve client |
| 05 | Produit | Mock mobile + 4 features clés |
| 06 | Traction | Courbe MRR + 4 KPIs (clients, churn, NPS, LTV/CAC) |
| 07 | Business model | 3 plans tarifaires + ratios CAC/LTV/payback |
| 08 | Concurrence | Matrice 2×2 + 4 raisons de gagner |
| 09 | Équipe | 3 founders + advisors |
| 10 | Usage des fonds | Donut + breakdown 4 lignes (équipe / acquisition / partenaires / pilotage) |
| 11 | Roadmap | Timeline Q2 26 → Q1 28, 6 milestones |
| 12 | Contact | CTA + coordonnées |

## Points de vigilance pour l'intégration

1. **Fonts** — Anton, Geist et Geist Mono sont sous OFL. Prévoir fallback système si CDN indispo.
2. **Chart donut slide 10** — actuellement `conic-gradient` CSS ; pour l'export PDF il faut soit un SVG équivalent, soit un rendu canvas→image. Sinon les couleurs se perdent.
3. **TitleBlock** — gère le retour à la ligne serif italic via `lines={[{text, serif, size, color, mt}]}`. Respecter l'API.
4. **Responsive** — les sheets sont **non-responsive** : largeur fixe `.pdf-sheet` = 280 mm. Si affichées en web, prévoir un wrapper scroll horizontal ou un scale.
5. **Footer line** à y=148.5mm — ne JAMAIS faire déborder du contenu sous cette ligne.

## Questions / ambiguïtés

- Les chiffres (MRR, CAC, etc.) sont mockés. **Schéma de données à définir** pour les remplir dynamiquement.
- Le slide 08 (matrice concurrence) a ses axes hardcodés — à paramétrer selon le secteur.
- Le donut slide 10 pourrait bénéficier d'un rendu SVG explicite pour garantir export PDF fidèle.

---

Généré depuis le projet FounderAI design system — 24 avril 2026.
