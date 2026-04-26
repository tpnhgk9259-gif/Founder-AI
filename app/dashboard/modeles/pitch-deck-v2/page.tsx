"use client";

import { useState, useEffect } from "react";

// ─── Agent mapping par slide ────────────────────────────────────────────────

type AgentInfo = { name: string; color: string; shape: string };

const AGENTS: Record<string, AgentInfo> = {
  maya:  { name: "Maya",  color: "#FF6A1F", shape: "50%" },
  alex:  { name: "Alex",  color: "#E8358E", shape: "36% 64% 42% 58% / 48% 36% 64% 52%" },
  sam:   { name: "Sam",   color: "#0DB4A0", shape: "4px" },
  leo:   { name: "Léo",   color: "#6E4BE8", shape: "50% 50% 14% 14%" },
  marc:  { name: "Marc",  color: "#FFD12A", shape: "50%" },
};

// Quel agent remplit quelle slide, par template
const SLIDE_AGENT: Record<string, Record<string, string>> = {
  standard: {
    cover: "marc", problem: "maya", solution: "maya", market: "alex",
    product: "leo", traction: "alex", business: "sam",
    competition: "maya", team: "marc", funds: "sam", roadmap: "leo", contact: "marc",
  },
  deeptech: {
    cover: "marc", problem: "maya", solution: "maya", market: "alex",
    technology: "leo", product: "leo", validation_sci: "leo",
    business: "sam", competition: "maya", team: "marc", funds: "sam",
    roadmap_rd: "leo", contact: "marc",
  },
  medtech: {
    cover: "marc", problem: "maya", solution: "maya", market: "alex",
    product_market_access: "leo", product: "leo", validation_clin: "leo",
    regulatory: "leo", competition: "maya", team: "marc", funds: "sam",
    roadmap_reg: "leo", contact: "marc",
  },
};

// ─── Types ──────────────────────────────────────────────────────────────────

type TemplateType = "standard" | "deeptech" | "medtech";

type SlideKey =
  | "cover" | "problem" | "solution" | "market" | "product" | "traction"
  | "business" | "competition" | "team" | "funds" | "roadmap" | "contact"
  // Deeptech
  | "technology" | "validation_sci"  | "roadmap_rd"
  // Medtech
  | "regulatory" | "validation_clin" | "product_market_access" | "roadmap_reg";

type SlideInfo = { key: SlideKey; num: string; label: string; color: string };

const SLIDES_STANDARD: SlideInfo[] = [
  { key: "cover",       num: "01", label: "Couverture",       color: "var(--uf-orange)" },
  { key: "problem",     num: "02", label: "Problème",         color: "var(--uf-magenta)" },
  { key: "solution",    num: "03", label: "Solution",         color: "var(--uf-teal)" },
  { key: "market",      num: "04", label: "Marché",           color: "var(--uf-violet)" },
  { key: "product",     num: "05", label: "Produit",          color: "var(--uf-orange)" },
  { key: "traction",    num: "06", label: "Traction",         color: "var(--uf-lime)" },
  { key: "business",    num: "07", label: "Business model",   color: "var(--uf-yellow)" },
  { key: "competition", num: "08", label: "Concurrence",      color: "var(--uf-magenta)" },
  { key: "team",        num: "09", label: "Équipe",           color: "var(--uf-teal)" },
  { key: "funds",       num: "10", label: "Usage des fonds",  color: "var(--uf-orange)" },
  { key: "roadmap",     num: "11", label: "Roadmap",          color: "var(--uf-violet)" },
  { key: "contact",     num: "12", label: "Contact",          color: "var(--uf-ink)" },
];

const SLIDES_DEEPTECH: SlideInfo[] = [
  { key: "cover",          num: "01", label: "Couverture",           color: "var(--uf-orange)" },
  { key: "problem",        num: "02", label: "Problème",             color: "var(--uf-magenta)" },
  { key: "solution",       num: "03", label: "Solution",             color: "var(--uf-teal)" },
  { key: "market",         num: "04", label: "Marché",               color: "var(--uf-violet)" },
  { key: "technology",     num: "05", label: "Technologie & IP",     color: "var(--uf-orange)" },
  { key: "product",        num: "06", label: "Produit",              color: "var(--uf-lime)" },
  { key: "validation_sci", num: "07", label: "Validation scientifique", color: "var(--uf-yellow)" },
  { key: "business",       num: "08", label: "Business model",       color: "var(--uf-magenta)" },
  { key: "competition",    num: "09", label: "Concurrence",          color: "var(--uf-teal)" },
  { key: "team",           num: "10", label: "Équipe",               color: "var(--uf-orange)" },
  { key: "funds",          num: "11", label: "Usage des fonds",      color: "var(--uf-violet)" },
  { key: "roadmap_rd",     num: "12", label: "Roadmap R&D",          color: "var(--uf-lime)" },
  { key: "contact",        num: "13", label: "Contact",              color: "var(--uf-ink)" },
];

const SLIDES_MEDTECH: SlideInfo[] = [
  { key: "cover",                num: "01", label: "Couverture",             color: "var(--uf-orange)" },
  { key: "problem",              num: "02", label: "Problème clinique",      color: "var(--uf-magenta)" },
  { key: "solution",             num: "03", label: "Solution",               color: "var(--uf-teal)" },
  { key: "market",               num: "04", label: "Marché",                 color: "var(--uf-violet)" },
  { key: "product_market_access",num: "05", label: "Produit & Remboursement",color: "var(--uf-orange)" },
  { key: "product",              num: "06", label: "Produit",                color: "var(--uf-lime)" },
  { key: "validation_clin",      num: "07", label: "Validation clinique",    color: "var(--uf-yellow)" },
  { key: "regulatory",           num: "08", label: "Parcours réglementaire", color: "var(--uf-magenta)" },
  { key: "competition",          num: "09", label: "Concurrence",            color: "var(--uf-teal)" },
  { key: "team",                 num: "10", label: "Équipe",                 color: "var(--uf-orange)" },
  { key: "funds",                num: "11", label: "Usage des fonds",        color: "var(--uf-violet)" },
  { key: "roadmap_reg",          num: "12", label: "Roadmap réglementaire",  color: "var(--uf-lime)" },
  { key: "contact",              num: "13", label: "Contact",                color: "var(--uf-ink)" },
];

const TEMPLATE_SLIDES: Record<TemplateType, SlideInfo[]> = {
  standard: SLIDES_STANDARD,
  deeptech: SLIDES_DEEPTECH,
  medtech: SLIDES_MEDTECH,
};

type Field = { key: string; label: string; placeholder?: string; type?: "text" | "textarea" | "image" | "color" | "toggle"; half?: boolean };

// ─── Champs communs ─────────────────────────────────────────────────────────

const FIELDS_COMMON: Partial<Record<SlideKey, Field[]>> = {
  cover: [
    { key: "startupName", label: "Nom de la startup", placeholder: "Lumen" },
    { key: "tagline", label: "Tagline", placeholder: "Le copilote énergie des restaurateurs indépendants." },
    { key: "stage", label: "Stade & levée", placeholder: "Pré-seed · Recherche 800 k€" },
    { key: "startup_logo", label: "Logo de la startup", type: "image" },
    { key: "adapt_colors", label: "Adapter les couleurs du deck à mon logo", type: "toggle" },
    { key: "cover_image", label: "Image de couverture (produit, app, photo)", type: "image" },
    { key: "brand_color", label: "Couleur principale (forcer manuellement)", placeholder: "#FF6A1F", half: true, type: "color" },
  ],
  problem: [
    { key: "problem_title", label: "Titre du problème", placeholder: "L'énergie, 2e poste de charges — ignoré." },
    { key: "stat1_value", label: "Stat 1 — Valeur", placeholder: "18 %", half: true },
    { key: "stat1_label", label: "Stat 1 — Description", placeholder: "du CA moyen en facture d'énergie" },
    { key: "stat2_value", label: "Stat 2 — Valeur", placeholder: "28 h", half: true },
    { key: "stat2_label", label: "Stat 2 — Description", placeholder: "par mois perdues à analyser les factures" },
    { key: "quote_text", label: "Citation client / expert", placeholder: "« Ma facture double entre janvier et juillet. »", type: "textarea" },
    { key: "quote_source", label: "Source de la citation", placeholder: "Marc L., Bistrot des Batignolles" },
  ],
  solution: [
    { key: "solution_title", label: "Titre de la solution", placeholder: "Un copilote énergie pour chaque resto." },
    { key: "pillar1_title", label: "Étape 1 — Titre", placeholder: "Connecter", half: true },
    { key: "pillar1_desc", label: "Étape 1 — Description", placeholder: "Upload PDF ou sync Enedis en 2 min." },
    { key: "pillar2_title", label: "Étape 2 — Titre", placeholder: "Analyser", half: true },
    { key: "pillar2_desc", label: "Étape 2 — Description", placeholder: "Détection des 14 anomalies tarifaires." },
    { key: "pillar3_title", label: "Étape 3 — Titre", placeholder: "Agir", half: true },
    { key: "pillar3_desc", label: "Étape 3 — Description", placeholder: "Changement de contrat, plan de sobriété." },
  ],
  market: [
    { key: "tam_value", label: "TAM — Valeur", placeholder: "1,8 Md€", half: true },
    { key: "tam_label", label: "TAM — Description", placeholder: "Restauration française" },
    { key: "sam_value", label: "SAM — Valeur", placeholder: "720 M€", half: true },
    { key: "sam_label", label: "SAM — Description", placeholder: "Indépendants 5-30 ETP" },
    { key: "som_value", label: "SOM — Valeur", placeholder: "48 M€", half: true },
    { key: "som_label", label: "SOM — Description", placeholder: "Île-de-France + 4 métropoles · 3 ans" },
    { key: "market_metric1_label", label: "Métrique 1 — Label", placeholder: "Croissance du marché", half: true },
    { key: "market_metric1_value", label: "Métrique 1 — Valeur", placeholder: "+12 %/an", half: true },
    { key: "market_metric2_label", label: "Métrique 2 — Label", placeholder: "Pénétration visée", half: true },
    { key: "market_metric2_value", label: "Métrique 2 — Valeur", placeholder: "6,7 %", half: true },
  ],
  business: [
    { key: "bm_title", label: "Titre", placeholder: "Deux leviers, zéro CAC variable." },
    { key: "plan1_name", label: "Offre 1 — Nom", placeholder: "Solo", half: true },
    { key: "plan1_price", label: "Offre 1 — Prix", placeholder: "39 €/mois", half: true },
    { key: "plan1_desc", label: "Offre 1 — Description", placeholder: "Restaurant seul" },
    { key: "plan2_name", label: "Offre 2 — Nom", placeholder: "Growth", half: true },
    { key: "plan2_price", label: "Offre 2 — Prix", placeholder: "99 €/mois", half: true },
    { key: "plan2_desc", label: "Offre 2 — Description", placeholder: "2 à 5 établissements" },
    { key: "plan3_name", label: "Offre 3 — Nom (optionnel)", placeholder: "Groupe", half: true },
    { key: "plan3_price", label: "Offre 3 — Prix", placeholder: "249 €/mois", half: true },
    { key: "plan3_desc", label: "Offre 3 — Description", placeholder: "6 à 30 · pack enseigne" },
    { key: "plan4_name", label: "Offre 4 — Nom (optionnel)", placeholder: "Enterprise", half: true },
    { key: "plan4_price", label: "Offre 4 — Prix", placeholder: "Sur devis", half: true },
    { key: "plan4_desc", label: "Offre 4 — Description", placeholder: "Grands comptes, API dédiée" },
    { key: "cac_value", label: "CAC", placeholder: "42 €", half: true },
    { key: "ltv_value", label: "LTV", placeholder: "3 860 €", half: true },
    { key: "ltv_cac_ratio", label: "Ratio LTV/CAC", placeholder: "91:1", half: true },
    { key: "cogs_value", label: "COGS", placeholder: "8 %", half: true },
  ],
  competition: [
    { key: "comp_title", label: "Titre", placeholder: "Pourquoi nous gagnons." },
    { key: "criteria1", label: "Critère 1 (important pour le client)", placeholder: "Prix", half: true },
    { key: "criteria2", label: "Critère 2", placeholder: "Simplicité", half: true },
    { key: "criteria3", label: "Critère 3", placeholder: "Couverture", half: true },
    { key: "criteria4", label: "Critère 4", placeholder: "Support", half: true },
    { key: "criteria5", label: "Critère 5 (optionnel)", placeholder: "Intégrations", half: true },
    { key: "comp1_name", label: "Concurrent 1", placeholder: "Acteur historique", half: true },
    { key: "comp1_scores", label: "Scores concurrent 1 (1-3 par critère, séparés par virgule)", placeholder: "2,1,2,1,1" },
    { key: "comp2_name", label: "Concurrent 2", placeholder: "Nouvel entrant", half: true },
    { key: "comp2_scores", label: "Scores concurrent 2", placeholder: "1,2,1,2,1" },
    { key: "comp3_name", label: "Concurrent 3 (optionnel)", placeholder: "Alternative indirecte", half: true },
    { key: "comp3_scores", label: "Scores concurrent 3", placeholder: "1,1,2,1,0" },
    { key: "our_scores", label: "Nos scores (vos forces !)", placeholder: "3,3,3,2,3" },
    { key: "advantage1", label: "Avantage 1", placeholder: "Technologie propriétaire", half: true },
    { key: "advantage1_desc", label: "Détail avantage 1", placeholder: "Algorithme breveté 3x plus rapide", half: true },
    { key: "advantage2", label: "Avantage 2", placeholder: "Time-to-market", half: true },
    { key: "advantage2_desc", label: "Détail avantage 2", placeholder: "Déjà en production depuis 6 mois", half: true },
    { key: "advantage3", label: "Avantage 3 (optionnel)", placeholder: "Réseau distribution", half: true },
    { key: "advantage3_desc", label: "Détail avantage 3", placeholder: "Partenariat exclusif avec 3 distributeurs", half: true },
  ],
  team: [
    { key: "member1_name", label: "Fondateur 1 — Nom", placeholder: "Juliette Moreau", half: true },
    { key: "member1_role", label: "Fondateur 1 — Rôle", placeholder: "CEO · Ex-Sowee (EDF)", half: true },
    { key: "member2_name", label: "Fondateur 2 — Nom", placeholder: "Thomas Vidal", half: true },
    { key: "member2_role", label: "Fondateur 2 — Rôle", placeholder: "CTO · Ex-Back Market", half: true },
    { key: "member3_name", label: "Fondateur 3 — Nom", placeholder: "Nadia Benhamou", half: true },
    { key: "member3_role", label: "Fondateur 3 — Rôle", placeholder: "COO · Ex-Frichti", half: true },
    { key: "advisor1", label: "Advisor 1", placeholder: "Pierre-Édouard Stérin (Otium)", half: true },
    { key: "advisor2", label: "Advisor 2", placeholder: "Claire Léost (Alan)", half: true },
  ],
  funds: [
    { key: "funds_title", label: "Titre", placeholder: "800 k€ pour 18 mois de runway." },
    { key: "fund1_pct", label: "Poste 1 — %", placeholder: "45 %", half: true },
    { key: "fund1_amount", label: "Poste 1 — Montant", placeholder: "360 k€", half: true },
    { key: "fund1_label", label: "Poste 1 — Label", placeholder: "Équipe tech (3 ETP senior)" },
    { key: "fund2_pct", label: "Poste 2 — %", placeholder: "25 %", half: true },
    { key: "fund2_amount", label: "Poste 2 — Montant", placeholder: "200 k€", half: true },
    { key: "fund2_label", label: "Poste 2 — Label", placeholder: "Acquisition B2B (partenariats)" },
    { key: "fund3_pct", label: "Poste 3 — %", placeholder: "18 %", half: true },
    { key: "fund3_amount", label: "Poste 3 — Montant", placeholder: "144 k€", half: true },
    { key: "fund3_label", label: "Poste 3 — Label", placeholder: "Partenaires fournisseurs" },
    { key: "fund4_pct", label: "Poste 4 — %", placeholder: "12 %", half: true },
    { key: "fund4_amount", label: "Poste 4 — Montant", placeholder: "96 k€", half: true },
    { key: "fund4_label", label: "Poste 4 — Label", placeholder: "Pilotage (légal, compta, ops)" },
  ],
  contact: [
    { key: "contact_subtitle", label: "Sous-titre (sous « Rencontrons nous »)", placeholder: "Rdv par téléphone ou visio, 45 min. On vient avec les chiffres." },
    { key: "contact_name", label: "Nom du contact", placeholder: "Juliette Moreau" },
    { key: "contact_role", label: "Rôle", placeholder: "CEO", half: true },
    { key: "contact_email", label: "Email", placeholder: "juliette@lumen.earth", half: true },
    { key: "contact_phone", label: "Téléphone", placeholder: "+33 6 71 42 19 08", half: true },
    { key: "contact_location", label: "Adresse", placeholder: "Station F · 5 parvis Alan Turing · 75013 Paris" },
    { key: "contact_cta", label: "Message d'accroche", placeholder: "Des fonds qui connaissent la restauration, le SaaS vertical, l'impact.", type: "textarea" },
    { key: "closing_date", label: "Date de closing", placeholder: "Juillet 2026", half: true },
    { key: "min_ticket", label: "Ticket minimum", placeholder: "50 k€ · jusqu'à 250 k€", half: true },
  ],
  product: [
    { key: "product_title", label: "Titre", placeholder: "3 minutes pour savoir quoi faire." },
    { key: "product_image", label: "Image produit (screenshot, mockup, photo)", type: "image" },
    { key: "feature1_title", label: "Feature 1 — Titre", placeholder: "OCR factures", half: true },
    { key: "feature1_desc", label: "Feature 1 — Description", placeholder: "Lit EDF, Engie, TotalEnergies — PDF et scannées" },
    { key: "feature2_title", label: "Feature 2 — Titre", placeholder: "Alertes temps réel", half: true },
    { key: "feature2_desc", label: "Feature 2 — Description", placeholder: "Détecte 14 anomalies dès réception de la facture" },
    { key: "feature3_title", label: "Feature 3 — Titre", placeholder: "Comparateur", half: true },
    { key: "feature3_desc", label: "Feature 3 — Description", placeholder: "Négocie en direct avec 8 fournisseurs" },
    { key: "feature4_title", label: "Feature 4 — Titre (optionnel)", placeholder: "Export PDF", half: true },
    { key: "feature4_desc", label: "Feature 4 — Description", placeholder: "Export PDF conforme aux décrets" },
    { key: "feature5_title", label: "Feature 5 — Titre (optionnel)", placeholder: "Mode multi-sites", half: true },
    { key: "feature5_desc", label: "Feature 5 — Description", placeholder: "Pour les groupes de 2 à 30 établissements" },
  ],
};

// ─── Champs spécifiques Standard ────────────────────────────────────────────

const FIELDS_STANDARD: Partial<Record<SlideKey, Field[]>> = {
  traction: [
    { key: "traction_title", label: "Titre", placeholder: "6 mois d'existence, 38 restos payants." },
    { key: "chart_label", label: "Nom de la métrique du graphique", placeholder: "MRR (€)", half: true },
    { key: "chart_period", label: "Période affichée", placeholder: "Nov 2025 → Avr 2026", half: true },
    { key: "chart_m1", label: "Mois 1 — Date", placeholder: "Nov", half: true },
    { key: "chart_v1", label: "Mois 1 — Valeur", placeholder: "0", half: true },
    { key: "chart_m2", label: "Mois 2 — Date", placeholder: "Déc", half: true },
    { key: "chart_v2", label: "Mois 2 — Valeur", placeholder: "480", half: true },
    { key: "chart_m3", label: "Mois 3 — Date", placeholder: "Jan", half: true },
    { key: "chart_v3", label: "Mois 3 — Valeur", placeholder: "1240", half: true },
    { key: "chart_m4", label: "Mois 4 — Date", placeholder: "Fév", half: true },
    { key: "chart_v4", label: "Mois 4 — Valeur", placeholder: "2850", half: true },
    { key: "chart_m5", label: "Mois 5 — Date", placeholder: "Mar", half: true },
    { key: "chart_v5", label: "Mois 5 — Valeur", placeholder: "5420", half: true },
    { key: "chart_m6", label: "Mois 6 — Date", placeholder: "Avr", half: true },
    { key: "chart_v6", label: "Mois 6 — Valeur", placeholder: "9180", half: true },
    { key: "kpi1_value", label: "KPI 1 — Valeur", placeholder: "+87 %", half: true },
    { key: "kpi1_label", label: "KPI 1 — Label", placeholder: "croissance MRR mois sur mois", half: true },
    { key: "kpi2_value", label: "KPI 2 — Valeur", placeholder: "9 180€", half: true },
    { key: "kpi2_label", label: "KPI 2 — Label", placeholder: "MRR avril 2026", half: true },
    { key: "kpi3_value", label: "KPI 3 — Valeur", placeholder: "38 / 45", half: true },
    { key: "kpi3_label", label: "KPI 3 — Label", placeholder: "payants sur comptes activés (84%)", half: true },
    { key: "kpi4_value", label: "KPI 4 — Valeur", placeholder: "94 %", half: true },
    { key: "kpi4_label", label: "KPI 4 — Label", placeholder: "rétention 90 jours", half: true },
  ],
  roadmap: [
    { key: "ms1_quarter", label: "Milestone 1 — Trimestre", placeholder: "T2 26", half: true },
    { key: "ms1_title", label: "Milestone 1 — Titre", placeholder: "Seed", half: true },
    { key: "ms1_note", label: "Milestone 1 — Note", placeholder: "Closing 800 k€, 3 ETP" },
    { key: "ms2_quarter", label: "Milestone 2 — Trimestre", placeholder: "T3 26", half: true },
    { key: "ms2_title", label: "Milestone 2 — Titre", placeholder: "100 restos", half: true },
    { key: "ms2_note", label: "Milestone 2 — Note", placeholder: "v1 multi-sites + export BDR" },
    { key: "ms3_quarter", label: "Milestone 3 — Trimestre", placeholder: "T4 26", half: true },
    { key: "ms3_title", label: "Milestone 3 — Titre", placeholder: "Umih deal", half: true },
    { key: "ms3_note", label: "Milestone 3 — Note", placeholder: "Distribution officielle 40 dpts" },
    { key: "ms4_quarter", label: "Milestone 4 — Trimestre", placeholder: "T1 27", half: true },
    { key: "ms4_title", label: "Milestone 4 — Titre", placeholder: "500 restos", half: true },
    { key: "ms4_note", label: "Milestone 4 — Note", placeholder: "MRR 40 k€, breakeven" },
    { key: "ms5_quarter", label: "Milestone 5 — Trimestre (optionnel)", placeholder: "T2 27", half: true },
    { key: "ms5_title", label: "Milestone 5 — Titre", placeholder: "Série A", half: true },
    { key: "ms5_note", label: "Milestone 5 — Note", placeholder: "3 à 5 M€, ouverture Belgique" },
    { key: "ms6_quarter", label: "Milestone 6 — Trimestre (optionnel)", placeholder: "T4 27", half: true },
    { key: "ms6_title", label: "Milestone 6 — Titre", placeholder: "2 000 clients", half: true },
    { key: "ms6_note", label: "Milestone 6 — Note", placeholder: "Équipe 14 ETP, 2 pays" },
  ],
};

// ─── Champs spécifiques Deeptech ────────────────────────────────────────────

const FIELDS_DEEPTECH: Partial<Record<SlideKey, Field[]>> = {
  technology: [
    { key: "tech_title", label: "Titre", placeholder: "Une rupture dans le stockage d'énergie solide." },
    { key: "trl_current", label: "TRL actuel", placeholder: "TRL 4", half: true },
    { key: "trl_target", label: "TRL cible (18 mois)", placeholder: "TRL 7", half: true },
    { key: "tech_desc", label: "Description de la technologie", placeholder: "Électrolyte solide sulfure à base de Li₆PS₅Cl, synthèse brevetée à froid.", type: "textarea" },
    { key: "patent1", label: "Brevet / IP 1", placeholder: "FR2301234 — Synthèse à froid d'électrolyte sulfure", half: true },
    { key: "patent2", label: "Brevet / IP 2 (optionnel)", placeholder: "PCT/FR2024/000567 — Architecture cellule tout-solide", half: true },
    { key: "patent3", label: "Brevet / IP 3 (optionnel)", placeholder: "Licence exclusive CEA-Liten", half: true },
    { key: "pub1", label: "Publication 1 (optionnel)", placeholder: "Nature Energy, 2025 — 'Cold-pressed sulfide electrolytes'", half: true },
    { key: "pub2", label: "Publication 2 (optionnel)", placeholder: "Advanced Materials, 2024", half: true },
    { key: "tech_image", label: "Schéma / illustration technique", type: "image" },
    { key: "tech_diff1", label: "Différenciation 1", placeholder: "10x plus rapide que le frittage classique", half: true },
    { key: "tech_diff2", label: "Différenciation 2", placeholder: "Coût matière -60% vs concurrents", half: true },
    { key: "tech_diff3", label: "Différenciation 3 (optionnel)", placeholder: "Compatible lignes de production Li-ion existantes", half: true },
  ],
  validation_sci: [
    { key: "validation_title", label: "Titre", placeholder: "Du labo au prototype fonctionnel." },
    { key: "val_kpi1_value", label: "Résultat clé 1 — Valeur", placeholder: "450 Wh/kg", half: true },
    { key: "val_kpi1_label", label: "Résultat clé 1 — Label", placeholder: "Densité énergétique atteinte (vs 250 Wh/kg Li-ion)", half: true },
    { key: "val_kpi2_value", label: "Résultat clé 2 — Valeur", placeholder: "1 200", half: true },
    { key: "val_kpi2_label", label: "Résultat clé 2 — Label", placeholder: "Cycles charge/décharge sans dégradation", half: true },
    { key: "val_kpi3_value", label: "Résultat clé 3 — Valeur", placeholder: "3", half: true },
    { key: "val_kpi3_label", label: "Résultat clé 3 — Label", placeholder: "POC industriels en cours avec partenaires", half: true },
    { key: "val_kpi4_value", label: "Résultat clé 4 — Valeur (optionnel)", placeholder: "2", half: true },
    { key: "val_kpi4_label", label: "Résultat clé 4 — Label", placeholder: "Publications peer-reviewed", half: true },
    { key: "partner_acad1", label: "Partenaire académique 1", placeholder: "CEA-Liten (Grenoble)", half: true },
    { key: "partner_acad2", label: "Partenaire académique 2 (optionnel)", placeholder: "CNRS-IMN (Nantes)", half: true },
    { key: "partner_indus1", label: "Partenaire industriel 1", placeholder: "Saft (TotalEnergies)", half: true },
    { key: "partner_indus2", label: "Partenaire industriel 2 (optionnel)", placeholder: "Verkor", half: true },
  ],
  roadmap_rd: [
    { key: "roadmap_rd_title", label: "Titre de la slide", placeholder: "De la recherche au marché." },
    { key: "rd1_quarter", label: "Jalon R&D 1 — Période", placeholder: "T2 26", half: true },
    { key: "rd1_title", label: "Jalon R&D 1 — Titre", placeholder: "Seed + bourse EIC", half: true },
    { key: "rd1_note", label: "Jalon R&D 1 — Détail", placeholder: "1,5 M€ equity + 2 M€ grant EIC Accelerator" },
    { key: "rd1_trl", label: "Jalon R&D 1 — TRL", placeholder: "TRL 4", half: true },
    { key: "rd2_quarter", label: "Jalon R&D 2 — Période", placeholder: "T4 26", half: true },
    { key: "rd2_title", label: "Jalon R&D 2 — Titre", placeholder: "Prototype cellule 10 Ah", half: true },
    { key: "rd2_note", label: "Jalon R&D 2 — Détail", placeholder: "Validation densité 450 Wh/kg en format pouch" },
    { key: "rd2_trl", label: "Jalon R&D 2 — TRL", placeholder: "TRL 5", half: true },
    { key: "rd3_quarter", label: "Jalon R&D 3 — Période", placeholder: "T2 27", half: true },
    { key: "rd3_title", label: "Jalon R&D 3 — Titre", placeholder: "Pilote pré-industriel", half: true },
    { key: "rd3_note", label: "Jalon R&D 3 — Détail", placeholder: "Ligne pilote 100 cellules/jour chez Saft" },
    { key: "rd3_trl", label: "Jalon R&D 3 — TRL", placeholder: "TRL 6", half: true },
    { key: "rd4_quarter", label: "Jalon R&D 4 — Période (optionnel)", placeholder: "T4 27", half: true },
    { key: "rd4_title", label: "Jalon R&D 4 — Titre", placeholder: "Série A", half: true },
    { key: "rd4_note", label: "Jalon R&D 4 — Détail", placeholder: "10-15 M€, scale-up ligne de production" },
    { key: "rd4_trl", label: "Jalon R&D 4 — TRL", placeholder: "TRL 7", half: true },
    { key: "grant1", label: "Financement public 1", placeholder: "BPI i-Nov : 600 k€ (obtenu)", half: true },
    { key: "grant2", label: "Financement public 2 (optionnel)", placeholder: "EIC Accelerator : 2 M€ (en cours)", half: true },
    { key: "grant3", label: "Financement public 3 (optionnel)", placeholder: "France 2030 : candidature T3 26", half: true },
  ],
};

// ─── Champs spécifiques Medtech ─────────────────────────────────────────────

const FIELDS_MEDTECH: Partial<Record<SlideKey, Field[]>> = {
  product_market_access: [
    { key: "pma_title", label: "Titre", placeholder: "Un cathéter intelligent, remboursé." },
    { key: "product_image", label: "Image produit / dispositif", type: "image" },
    { key: "dm_class", label: "Classe du DM", placeholder: "Classe IIb", half: true },
    { key: "dm_type", label: "Type de dispositif", placeholder: "Cathéter à capteur intégré", half: true },
    { key: "feature1_title", label: "Fonctionnalité 1 — Titre", placeholder: "Mesure en temps réel", half: true },
    { key: "feature1_desc", label: "Fonctionnalité 1 — Description", placeholder: "Capteur piézo intégré, données envoyées en continu" },
    { key: "feature2_title", label: "Fonctionnalité 2 — Titre", placeholder: "Biocompatibilité avancée", half: true },
    { key: "feature2_desc", label: "Fonctionnalité 2 — Description", placeholder: "Revêtement hydrophile breveté, durée d'implantation 2x" },
    { key: "feature3_title", label: "Fonctionnalité 3 — Titre (optionnel)", placeholder: "App clinicien", half: true },
    { key: "feature3_desc", label: "Fonctionnalité 3 — Description", placeholder: "Dashboard temps réel pour le suivi patient" },
    { key: "remb_strategy", label: "Stratégie de remboursement", placeholder: "LPPR Titre III, dépôt CNEDiMTS prévu T1 27", type: "textarea" },
    { key: "price_hospital", label: "Prix hospitalier cible", placeholder: "350 € / unité", half: true },
    { key: "price_remb", label: "Tarif remboursement visé", placeholder: "280 € (base LPPR)", half: true },
  ],
  validation_clin: [
    { key: "clin_title", label: "Titre", placeholder: "Preuves cliniques solides." },
    { key: "clin_phase", label: "Phase actuelle", placeholder: "Étude pivot en cours (n=120)", half: true },
    { key: "clin_design", label: "Design de l'étude", placeholder: "Randomisée, multicentrique, en double aveugle", half: true },
    { key: "clin_kpi1_value", label: "Résultat clé 1 — Valeur", placeholder: "-42 %", half: true },
    { key: "clin_kpi1_label", label: "Résultat clé 1 — Label", placeholder: "Réduction des complications post-op (étude pilote, n=45)", half: true },
    { key: "clin_kpi2_value", label: "Résultat clé 2 — Valeur", placeholder: "98 %", half: true },
    { key: "clin_kpi2_label", label: "Résultat clé 2 — Label", placeholder: "Taux de succès d'implantation (first-time-right)", half: true },
    { key: "clin_kpi3_value", label: "Résultat clé 3 — Valeur (optionnel)", placeholder: "3", half: true },
    { key: "clin_kpi3_label", label: "Résultat clé 3 — Label", placeholder: "CHU investigateurs (Necker, Pitié-Salpêtrière, Lyon HCL)", half: true },
    { key: "kol1", label: "KOL 1 (Key Opinion Leader)", placeholder: "Pr. Dupont — Chef de service cardiologie, Necker", half: true },
    { key: "kol2", label: "KOL 2 (optionnel)", placeholder: "Pr. Martin — Directrice recherche clinique, HCL Lyon", half: true },
    { key: "kol3", label: "KOL 3 (optionnel)", placeholder: "Dr. Lefèvre — Chirurgien vasculaire, Pitié-Salpêtrière", half: true },
  ],
  regulatory: [
    { key: "reg_title", label: "Titre", placeholder: "Parcours réglementaire maîtrisé." },
    { key: "reg_pathway", label: "Voie réglementaire", placeholder: "Marquage CE (MDR 2017/745) + 510(k) FDA", type: "textarea" },
    { key: "reg_class_eu", label: "Classe EU", placeholder: "IIb", half: true },
    { key: "reg_class_us", label: "Classe FDA (optionnel)", placeholder: "Class II", half: true },
    { key: "reg_step1_date", label: "Étape 1 — Date", placeholder: "T3 26", half: true },
    { key: "reg_step1_label", label: "Étape 1 — Intitulé", placeholder: "Dossier technique CE complet", half: true },
    { key: "reg_step1_status", label: "Étape 1 — Statut", placeholder: "En cours", half: true },
    { key: "reg_step2_date", label: "Étape 2 — Date", placeholder: "T1 27", half: true },
    { key: "reg_step2_label", label: "Étape 2 — Intitulé", placeholder: "Audit organisme notifié (BSI)", half: true },
    { key: "reg_step2_status", label: "Étape 2 — Statut", placeholder: "Planifié", half: true },
    { key: "reg_step3_date", label: "Étape 3 — Date", placeholder: "T3 27", half: true },
    { key: "reg_step3_label", label: "Étape 3 — Intitulé", placeholder: "Marquage CE obtenu", half: true },
    { key: "reg_step3_status", label: "Étape 3 — Statut", placeholder: "Objectif", half: true },
    { key: "reg_step4_date", label: "Étape 4 — Date (optionnel)", placeholder: "T1 28", half: true },
    { key: "reg_step4_label", label: "Étape 4 — Intitulé", placeholder: "Clearance 510(k) FDA", half: true },
    { key: "reg_step4_status", label: "Étape 4 — Statut", placeholder: "Objectif", half: true },
    { key: "reg_notified_body", label: "Organisme notifié", placeholder: "BSI (UK)", half: true },
    { key: "reg_cro", label: "CRO / consultant réglementaire", placeholder: "Qualitiso (Paris)", half: true },
  ],
  roadmap_reg: [
    { key: "rr1_quarter", label: "Jalon 1 — Période", placeholder: "T2 26", half: true },
    { key: "rr1_title", label: "Jalon 1 — Titre", placeholder: "Fin étude pivot", half: true },
    { key: "rr1_note", label: "Jalon 1 — Détail", placeholder: "n=120 patients, résultats primaires" },
    { key: "rr2_quarter", label: "Jalon 2 — Période", placeholder: "T3 26", half: true },
    { key: "rr2_title", label: "Jalon 2 — Titre", placeholder: "Soumission CE", half: true },
    { key: "rr2_note", label: "Jalon 2 — Détail", placeholder: "Dossier technique complet à BSI" },
    { key: "rr3_quarter", label: "Jalon 3 — Période", placeholder: "T1 27", half: true },
    { key: "rr3_title", label: "Jalon 3 — Titre", placeholder: "Marquage CE", half: true },
    { key: "rr3_note", label: "Jalon 3 — Détail", placeholder: "Lancement commercial EU" },
    { key: "rr4_quarter", label: "Jalon 4 — Période", placeholder: "T2 27", half: true },
    { key: "rr4_title", label: "Jalon 4 — Titre", placeholder: "Dépôt CNEDiMTS", half: true },
    { key: "rr4_note", label: "Jalon 4 — Détail", placeholder: "Demande inscription LPPR Titre III" },
    { key: "rr5_quarter", label: "Jalon 5 — Période (optionnel)", placeholder: "T4 27", half: true },
    { key: "rr5_title", label: "Jalon 5 — Titre", placeholder: "Soumission 510(k)", half: true },
    { key: "rr5_note", label: "Jalon 5 — Détail", placeholder: "Entrée marché US" },
    { key: "rr6_quarter", label: "Jalon 6 — Période (optionnel)", placeholder: "T2 28", half: true },
    { key: "rr6_title", label: "Jalon 6 — Titre", placeholder: "Remboursement obtenu", half: true },
    { key: "rr6_note", label: "Jalon 6 — Détail", placeholder: "LPPR + premiers marchés hospitaliers" },
  ],
};

// ─── Merge fields par template ──────────────────────────────────────────────

// Placeholders contextualisés par template pour les slides communes
const PLACEHOLDER_OVERRIDES: Record<TemplateType, Record<string, string>> = {
  standard: {},
  deeptech: {
    startupName: "SolidIon",
    tagline: "Le stockage d'énergie solide, 10x plus dense.",
    stage: "Seed · Recherche 1,5 M€",
    problem_title: "Les batteries Li-ion atteignent leurs limites physiques.",
    stat1_value: "250 Wh/kg",
    stat1_label: "plafond de densité énergétique des cellules Li-ion actuelles",
    stat2_value: "40 %",
    stat2_label: "du coût d'un véhicule électrique lié au pack batterie",
    quote_text: "« Nous avons besoin d'un saut technologique, pas d'améliorations incrémentales. »",
    quote_source: "Directeur R&D, Constructeur automobile européen",
    solution_title: "Un électrolyte solide qui change la donne.",
    pillar1_title: "Synthèse",
    pillar1_desc: "Procédé breveté à froid, 10x moins énergivore que le frittage.",
    pillar2_title: "Intégration",
    pillar2_desc: "Compatible avec les lignes de production Li-ion existantes.",
    pillar3_title: "Performance",
    pillar3_desc: "450 Wh/kg, 1 200 cycles, sécurité intrinsèque.",
    tam_value: "120 Md€",
    tam_label: "Marché mondial des batteries (2030)",
    sam_value: "18 Md€",
    sam_label: "Batteries solides pour EV et stockage stationnaire",
    som_value: "200 M€",
    som_label: "Contrats pilotes OEM européens · 5 ans",
    market_metric1_label: "CAGR batteries solides",
    market_metric1_value: "+35 %/an",
    market_metric2_label: "Adoption OEM prévue",
    market_metric2_value: "2028-2030",
    bm_title: "Licence techno + vente de cellules.",
    plan1_name: "Licence IP",
    plan1_price: "Redevance 3-5 %",
    plan1_desc: "Licence du procédé aux fabricants de cellules",
    plan2_name: "Cellules pilotes",
    plan2_price: "Sur devis",
    plan2_desc: "Vente directe de cellules prototypes et petites séries",
    plan3_name: "Co-développement",
    plan3_price: "NRE + royalties",
    plan3_desc: "Programme conjoint avec OEM automobile",
    plan4_name: "",
    plan4_price: "",
    plan4_desc: "",
    cac_value: "N/A",
    ltv_value: "2-5 M€",
    ltv_cac_ratio: "N/A",
    cogs_value: "65 %",
    criteria1: "Densité énergie",
    criteria2: "Sécurité",
    criteria3: "Coût production",
    criteria4: "Maturité",
    criteria5: "Compatibilité Li-ion",
    comp1_name: "QuantumScape",
    comp1_scores: "3,2,1,2,1",
    comp2_name: "Solid Power",
    comp2_scores: "2,2,2,2,2",
    comp3_name: "Samsung SDI",
    comp3_scores: "2,3,3,3,2",
    our_scores: "3,3,2,1,3",
    advantage1: "Procédé à froid breveté",
    advantage1_desc: "10x moins énergivore, compatible lignes existantes",
    advantage2: "Densité record",
    advantage2_desc: "450 Wh/kg validé en labo, +80 % vs Li-ion",
    advantage3: "Équipe CEA",
    advantage3_desc: "3 fondateurs issus du CEA-Liten, 40 ans d'expérience cumulée",
    member1_name: "Dr. Marie Laurent",
    member1_role: "CEO · Ex-CEA-Liten, 12 ans R&D batteries",
    member2_name: "Dr. Antoine Mercier",
    member2_role: "CTO · Ex-Saft, expert procédés électrochimiques",
    member3_name: "Sophie Garnier",
    member3_role: "COO · Ex-Verkor, scale-up industriel",
    advisor1: "Pr. Jean-Marie Tarascon (Collège de France)",
    advisor2: "Florence Lambert (Ex-DG CEA-Liten)",
    funds_title: "1,5 M€ pour 24 mois de runway.",
    fund1_label: "R&D et prototypage (4 chercheurs)",
    fund1_pct: "50 %",
    fund1_amount: "750 k€",
    fund2_label: "Équipements labo et ligne pilote",
    fund2_pct: "25 %",
    fund2_amount: "375 k€",
    fund3_label: "PI et réglementaire",
    fund3_pct: "15 %",
    fund3_amount: "225 k€",
    fund4_label: "Fonctionnement (loyer, juridique, ops)",
    fund4_pct: "10 %",
    fund4_amount: "150 k€",
    contact_name: "Dr. Marie Laurent",
    contact_role: "CEO",
    contact_email: "marie@solidion.tech",
    contact_location: "CEA-Liten · 17 av. des Martyrs · 38000 Grenoble",
    contact_cta: "Des fonds deeptech qui comprennent les cycles longs et la propriété intellectuelle.",
    closing_date: "Septembre 2026",
    min_ticket: "100 k€ · jusqu'à 500 k€",
    contact_subtitle: "Visite du labo possible. On vous montre les cellules.",
    product_title: "Du concept au prototype fonctionnel.",
    product_image: "",
    feature1_title: "Cellule pouch 10 Ah",
    feature1_desc: "Format standard, testable sur bancs OEM",
    feature2_title: "Dashboard de caractérisation",
    feature2_desc: "Suivi en temps réel des cycles, impédance, température",
    feature3_title: "Kit d'évaluation",
    feature3_desc: "Pack envoyé aux partenaires pour tests internes",
  },
  medtech: {
    startupName: "NeuroPulse",
    tagline: "Le cathéter intelligent qui réduit les complications post-op de 42 %.",
    stage: "Seed · Recherche 2 M€",
    problem_title: "30 % de complications évitables en chirurgie vasculaire.",
    stat1_value: "180 000",
    stat1_label: "interventions vasculaires par an en France",
    stat2_value: "12 Md€",
    stat2_label: "coût annuel des complications post-opératoires en Europe",
    quote_text: "« On opère à l'aveugle. On ne sait jamais en temps réel si le cathéter est bien positionné. »",
    quote_source: "Pr. Dupont, Chef de service cardiologie, Hôpital Necker",
    solution_title: "Un capteur intégré pour voir en temps réel.",
    pillar1_title: "Mesurer",
    pillar1_desc: "Capteur piézoélectrique intégré au cathéter, données en continu.",
    pillar2_title: "Visualiser",
    pillar2_desc: "App clinicien avec feedback haptique et visuel en salle d'op.",
    pillar3_title: "Prévenir",
    pillar3_desc: "Alerte prédictive de mauvais positionnement avant la complication.",
    tam_value: "8,5 Md€",
    tam_label: "Marché mondial des cathéters cardiovasculaires",
    sam_value: "1,2 Md€",
    sam_label: "Cathéters guidés Europe + US",
    som_value: "45 M€",
    som_label: "France + Allemagne · 50 CHU · 5 ans",
    market_metric1_label: "Croissance du marché",
    market_metric1_value: "+8 %/an",
    market_metric2_label: "Taux adoption techno guidée",
    market_metric2_value: "12 % → 45 % (2030)",
    bm_title: "Vente de dispositifs + consommables.",
    plan1_name: "Cathéter unitaire",
    plan1_price: "350 €",
    plan1_desc: "Usage unique, stérile, compatible bloc opératoire",
    plan2_name: "Console de lecture",
    plan2_price: "15 000 €",
    plan2_desc: "Prêt ou vente, amortie sur 500 actes",
    plan3_name: "Maintenance + SAV",
    plan3_price: "2 500 €/an",
    plan3_desc: "Contrat annuel par centre hospitalier",
    plan4_name: "",
    plan4_price: "",
    plan4_desc: "",
    cac_value: "8 000 €",
    ltv_value: "180 000 €",
    ltv_cac_ratio: "22:1",
    cogs_value: "35 %",
    criteria1: "Précision guidage",
    criteria2: "Biocompatibilité",
    criteria3: "Facilité d'adoption",
    criteria4: "Remboursement",
    criteria5: "Données cliniques",
    comp1_name: "Medtronic (cathéters classiques)",
    comp1_scores: "1,3,3,3,2",
    comp2_name: "Robocath",
    comp2_scores: "3,2,1,1,1",
    comp3_name: "Stereotaxis",
    comp3_scores: "2,2,1,2,2",
    our_scores: "3,3,2,2,3",
    advantage1: "Capteur intégré breveté",
    advantage1_desc: "Mesure in vivo sans modifier le geste chirurgical",
    advantage2: "Données cliniques solides",
    advantage2_desc: "-42 % de complications (étude pilote n=45, 2 CHU)",
    advantage3: "Voie de remboursement claire",
    advantage3_desc: "LPPR Titre III, dépôt CNEDiMTS prévu T1 27",
    member1_name: "Dr. Claire Duval",
    member1_role: "CEO · Chirurgien vasculaire, 15 ans de pratique clinique",
    member2_name: "Hugo Petit",
    member2_role: "CTO · Ex-Medtronic, expert systèmes embarqués médicaux",
    member3_name: "Dr. Amina Khelifi",
    member3_role: "CMO · Ex-AP-HP, directrice recherche clinique",
    advisor1: "Pr. Dupont (Necker, chirurgie vasculaire)",
    advisor2: "Dr. Lefèvre (Pitié-Salpêtrière)",
    funds_title: "2 M€ pour 24 mois de runway.",
    fund1_label: "Essai pivot multicentrique (n=120)",
    fund1_pct: "40 %",
    fund1_amount: "800 k€",
    fund2_label: "Affaires réglementaires (CE + FDA prep)",
    fund2_pct: "25 %",
    fund2_amount: "500 k€",
    fund3_label: "R&D produit (V2 + logiciel)",
    fund3_pct: "20 %",
    fund3_amount: "400 k€",
    fund4_label: "Équipe et fonctionnement",
    fund4_pct: "15 %",
    fund4_amount: "300 k€",
    contact_name: "Dr. Claire Duval",
    contact_role: "CEO",
    contact_email: "claire@neuropulse.med",
    contact_location: "BioLab · 8 rue de la Physique · 75005 Paris",
    contact_cta: "Des fonds medtech/healthtech avec un horizon long terme et une compréhension du parcours réglementaire.",
    closing_date: "Octobre 2026",
    min_ticket: "150 k€ · jusqu'à 500 k€",
    contact_subtitle: "Visite de notre salle blanche et démo sur simulateur possible.",
    product_title: "Un cathéter qui communique en temps réel.",
    product_image: "",
    feature1_title: "Capteur piézo intégré",
    feature1_desc: "Mesure pression et flux en continu, sans modifier le geste",
    feature2_title: "App clinicien",
    feature2_desc: "Dashboard temps réel en salle d'op, alerte prédictive",
    feature3_title: "Biocompatibilité avancée",
    feature3_desc: "Revêtement hydrophile breveté, durée d'implantation 2x",
  },
};

function getFields(template: TemplateType): Record<string, Field[]> {
  const variant =
    template === "deeptech" ? FIELDS_DEEPTECH :
    template === "medtech"  ? FIELDS_MEDTECH :
    FIELDS_STANDARD;
  const overrides = PLACEHOLDER_OVERRIDES[template];
  const all: Record<string, Field[]> = {};
  const slides = TEMPLATE_SLIDES[template];
  for (const s of slides) {
    const base = variant[s.key] ?? FIELDS_COMMON[s.key] ?? [];
    // Apply placeholder overrides for common fields
    all[s.key] = base.map(f => overrides[f.key] !== undefined ? { ...f, placeholder: overrides[f.key] } : f);
  }
  return all;
}

// ─── Page ───────────────────────────────────────────────────────────────────

const TEMPLATE_LABELS: Record<TemplateType, { label: string; desc: string }> = {
  standard: { label: "Standard", desc: "SaaS, marketplace, app mobile" },
  deeptech: { label: "Deeptech", desc: "Biotech, hardware, énergie, matériaux" },
  medtech:  { label: "Dispositif médical", desc: "DM classe I à III, diagnostic in vitro" },
};

export default function PitchDeckV2Page() {
  const [template, setTemplate] = useState<TemplateType>("standard");
  const [values, setValues] = useState<Record<string, string>>({});
  const [activeSlide, setActiveSlide] = useState<string>("cover");
  const [startupId, setStartupId] = useState<string | null>(null);
  const [filling, setFilling] = useState(false);

  const slides = TEMPLATE_SLIDES[template];
  const allFields = getFields(template);

  // Reset active slide si elle n'existe plus dans le template
  useEffect(() => {
    if (!slides.find((s) => s.key === activeSlide)) {
      setActiveSlide(slides[0].key);
    }
  }, [template]);

  // Pré-remplir depuis le profil startup
  useEffect(() => {
    const id = localStorage.getItem("founderai_startup_id");
    if (!id) return;
    setStartupId(id);
    fetch(`/api/startup?startupId=${id}`)
      .then((r) => r.json())
      .then((data) => {
        const prefill: Record<string, string> = {};
        if (data.name) prefill.startupName = data.name;
        if (data.description) prefill.tagline = data.description;
        if (data.sector) prefill.tam_label = data.sector;
        setValues((prev) => ({ ...prefill, ...prev }));
      })
      .catch(() => {});
  }, []);

  function updateField(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function autoFill() {
    if (!startupId || filling) return;
    setFilling(true);
    try {
      const res = await fetch("/api/ai/fill-pitch-deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId, template }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.values) {
          setValues((prev) => ({ ...prev, ...data.values }));
        }
      }
    } catch { /* silencieux */ }
    finally { setFilling(false); }
  }

  function openPreview() {
    sessionStorage.setItem("founderai_pitch_deck_v2", JSON.stringify({ ...values, _template: template }));
    window.open("/pitch-deck-v2-preview.html", "_blank");
  }

  const fields = allFields[activeSlide] ?? [];
  const filledCount = Object.values(values).filter(Boolean).length;
  const totalFields = Object.values(allFields).flat().length;

  return (
    <div className="min-h-screen" style={{ background: "var(--uf-paper)" }}>
      {/* Header */}
      <div style={{ background: "var(--uf-card)", borderBottom: "1px solid var(--uf-line)" }}>
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <a href="/dashboard" className="inline-flex items-center gap-2.5 text-lg font-semibold">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-normal" style={{ background: "var(--uf-orange)", fontFamily: "var(--uf-display)" }}>f</div>
              <span>FOUNDER<span style={{ color: "var(--uf-muted)" }}>AI</span></span>
            </a>
            <h1 className="mt-2 uppercase tracking-[-0.015em]" style={{ fontFamily: "var(--uf-display)", fontSize: 24, lineHeight: 0.82 }}>
              Pitch Deck — {slides.length} slides
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>
              {filledCount} / {totalFields} champs
            </span>
            <button
              onClick={autoFill}
              disabled={filling || !startupId}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full disabled:opacity-40 hover:-translate-y-px transition-transform"
              style={{ background: "var(--uf-orange)", color: "#fff" }}
            >
              {filling ? "Génération…" : "Demander à mes agents"}
            </button>
            <button
              onClick={openPreview}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full hover:-translate-y-px transition-transform"
              style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}
            >
              Preview & Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Template selector */}
      <div className="max-w-5xl mx-auto px-6 pt-5 pb-1">
        <div className="flex gap-3">
          {(Object.entries(TEMPLATE_LABELS) as [TemplateType, { label: string; desc: string }][]).map(([key, { label, desc }]) => (
            <button
              key={key}
              onClick={() => setTemplate(key)}
              className="flex-1 text-left px-4 py-3 transition-all"
              style={{
                background: template === key ? "var(--uf-card)" : "transparent",
                border: template === key ? "1.5px solid var(--uf-orange)" : "1.5px solid var(--uf-line)",
                borderRadius: "var(--uf-r-lg)",
              }}
            >
              <div className="text-sm font-semibold" style={{ color: template === key ? "var(--uf-orange)" : "var(--uf-ink)" }}>{label}</div>
              <div className="text-[11px] mt-0.5" style={{ color: "var(--uf-muted)" }}>{desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-4 flex gap-6">
        {/* Nav slides */}
        <nav className="w-48 shrink-0 space-y-1">
          {slides.map((s) => {
            const isActive = activeSlide === s.key;
            const slideFields = allFields[s.key] ?? [];
            const filled = slideFields.filter((f) => values[f.key]).length;
            const agentKey = SLIDE_AGENT[template]?.[s.key];
            const agent = agentKey ? AGENTS[agentKey] : null;
            return (
              <button
                key={s.key}
                onClick={() => setActiveSlide(s.key)}
                className="w-full text-left flex items-center gap-2 px-3 py-2 transition-all"
                style={{
                  background: isActive ? "var(--uf-card)" : "transparent",
                  border: isActive ? "1px solid var(--uf-line)" : "1px solid transparent",
                  borderRadius: "var(--uf-r-md)",
                }}
              >
                <span className="text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: isActive ? s.color : "var(--uf-paper-2)", color: isActive ? "#fff" : "var(--uf-muted)", fontFamily: "var(--uf-mono)" }}>
                  {s.num}
                </span>
                <span className="text-xs font-medium truncate" style={{ color: isActive ? "var(--uf-ink)" : "var(--uf-muted)" }}>
                  {s.label}
                </span>
                {filled > 0 && (
                  <span className="ml-auto text-[9px] font-medium" style={{ color: filled === slideFields.length ? "var(--uf-teal)" : "var(--uf-muted-2)" }}>
                    {filled}/{slideFields.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Formulaire */}
        <div className="flex-1 p-6" style={{ background: "var(--uf-card)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-xl)" }}>
          <div className="flex items-center gap-3 mb-5">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: slides.find((s) => s.key === activeSlide)?.color ?? "var(--uf-ink)", color: "#fff", fontFamily: "var(--uf-mono)" }}>
              {slides.find((s) => s.key === activeSlide)?.num ?? "?"}
            </span>
            <h2 className="uppercase tracking-normal" style={{ fontFamily: "var(--uf-display)", fontSize: 22, color: "var(--uf-ink)" }}>
              {slides.find((s) => s.key === activeSlide)?.label ?? ""}
            </h2>
            {(() => {
              const agentKey = SLIDE_AGENT[template]?.[activeSlide];
              const agent = agentKey ? AGENTS[agentKey] : null;
              if (!agent) return null;
              return (
                <div className="flex items-center gap-1.5 ml-auto px-3 py-1 rounded-full" style={{ background: `${agent.color}14`, border: `1px solid ${agent.color}30` }}>
                  <div style={{
                    width: 18, height: 18, background: agent.color,
                    borderRadius: agent.shape,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: agentKey === "marc" ? "#0F0E0B" : "#fff",
                    fontFamily: "var(--uf-display)", fontSize: 9,
                  }}>{agent.name[0]}</div>
                  <span className="text-[11px] font-medium" style={{ color: agent.color }}>{agent.name} remplit</span>
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {fields.map((f) => (
              <div key={f.key} className={f.half ? "" : "col-span-2"}>
                <label className="text-[11px] font-medium tracking-[0.1em] uppercase block mb-1" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>
                  {f.label}
                </label>
                {f.type === "toggle" ? (
                  <button
                    type="button"
                    onClick={() => updateField(f.key, values[f.key] === "true" ? "false" : "true")}
                    className="flex items-center gap-3 py-1"
                  >
                    <div
                      className="relative w-11 h-6 rounded-full transition-colors"
                      style={{ background: values[f.key] === "true" ? "var(--uf-orange)" : "var(--uf-line)" }}
                    >
                      <div
                        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                        style={{ left: values[f.key] === "true" ? 22 : 2 }}
                      />
                    </div>
                    <span className="text-sm" style={{ color: "var(--uf-ink)" }}>
                      {values[f.key] === "true" ? "Activé" : "Désactivé"}
                    </span>
                  </button>
                ) : f.type === "image" ? (
                  <div className="flex items-center gap-4">
                    <div
                      className="w-24 h-24 flex items-center justify-center overflow-hidden cursor-pointer"
                      style={{ border: "2px dashed var(--uf-line)", borderRadius: "var(--uf-r-md)", background: "var(--uf-paper-2)" }}
                      onClick={() => document.getElementById(`img-${f.key}`)?.click()}
                    >
                      {values[f.key] ? (
                        <img src={values[f.key]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl" role="img" aria-label="image">&#128444;</span>
                      )}
                    </div>
                    <input
                      id={`img-${f.key}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => updateField(f.key, reader.result as string);
                        reader.readAsDataURL(file);
                      }}
                    />
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => document.getElementById(`img-${f.key}`)?.click()}
                        className="text-xs font-medium px-3 py-1.5 rounded-full"
                        style={{ border: "1px solid var(--uf-line)", color: "var(--uf-ink)" }}
                      >
                        {values[f.key] ? "Changer" : "Choisir une image"}
                      </button>
                      {values[f.key] && (
                        <button
                          type="button"
                          onClick={() => updateField(f.key, "")}
                          className="text-xs" style={{ color: "var(--uf-muted)" }}
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                ) : f.type === "color" ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={values[f.key] || "#FF6A1F"}
                      onChange={(e) => updateField(f.key, e.target.value)}
                      className="w-10 h-10 cursor-pointer border-0 p-0"
                      style={{ borderRadius: "var(--uf-r-sm)" }}
                    />
                    <input
                      type="text"
                      value={values[f.key] ?? ""}
                      onChange={(e) => updateField(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="flex-1 px-3 py-2 text-sm focus:outline-none"
                      style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)", color: "var(--uf-ink)", background: "var(--uf-paper)" }}
                    />
                  </div>
                ) : f.type === "textarea" ? (
                  <textarea
                    value={values[f.key] ?? ""}
                    onChange={(e) => updateField(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    rows={3}
                    className="w-full px-3 py-2 text-sm focus:outline-none resize-y"
                    style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)", color: "var(--uf-ink)", background: "var(--uf-paper)" }}
                  />
                ) : (
                  <input
                    type="text"
                    value={values[f.key] ?? ""}
                    onChange={(e) => updateField(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2 text-sm focus:outline-none"
                    style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)", color: "var(--uf-ink)", background: "var(--uf-paper)" }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => {
                const idx = slides.findIndex((s) => s.key === activeSlide);
                if (idx > 0) setActiveSlide(slides[idx - 1].key);
              }}
              disabled={activeSlide === slides[0]?.key}
              className="text-sm font-medium disabled:opacity-30"
              style={{ color: "var(--uf-muted)" }}
            >
              Slide precedente
            </button>
            <button
              onClick={() => {
                const idx = slides.findIndex((s) => s.key === activeSlide);
                if (idx < slides.length - 1) setActiveSlide(slides[idx + 1].key);
              }}
              disabled={activeSlide === slides[slides.length - 1]?.key}
              className="text-sm font-medium disabled:opacity-30"
              style={{ color: "var(--uf-orange)" }}
            >
              Slide suivante
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
