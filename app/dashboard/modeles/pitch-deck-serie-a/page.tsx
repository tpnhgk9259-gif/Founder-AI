"use client";

import { useState, useEffect } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

type SlideKey =
  | "cover" | "problem" | "solution" | "market" | "product" | "traction"
  | "unit_economics" | "business" | "gtm" | "cases" | "competition"
  | "moats" | "team" | "funds" | "roadmap" | "projections" | "exit" | "contact";

type SlideInfo = { key: SlideKey; num: string; label: string; color: string };

type Field = {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "textarea" | "image" | "color";
  half?: boolean;
};

// ─── 18 slides ──────────────────────────────────────────────────────────────

const SLIDES: SlideInfo[] = [
  { key: "cover",           num: "01", label: "Couverture",              color: "var(--uf-orange)" },
  { key: "problem",         num: "02", label: "Probleme",               color: "var(--uf-magenta)" },
  { key: "solution",        num: "03", label: "Solution",               color: "var(--uf-teal)" },
  { key: "market",          num: "04", label: "Marche",                 color: "var(--uf-violet)" },
  { key: "product",         num: "05", label: "Produit",                color: "var(--uf-orange)" },
  { key: "traction",        num: "06", label: "Traction detaillee",     color: "var(--uf-lime)" },
  { key: "unit_economics",  num: "07", label: "Unit Economics",         color: "var(--uf-yellow)" },
  { key: "business",        num: "08", label: "Business Model",         color: "var(--uf-magenta)" },
  { key: "gtm",             num: "09", label: "Go-to-Market",           color: "var(--uf-teal)" },
  { key: "cases",           num: "10", label: "Cas clients",            color: "var(--uf-violet)" },
  { key: "competition",     num: "11", label: "Concurrence",            color: "var(--uf-orange)" },
  { key: "moats",           num: "12", label: "Barrieres a l'entree",   color: "var(--uf-lime)" },
  { key: "team",            num: "13", label: "Equipe + Recrutement",   color: "var(--uf-yellow)" },
  { key: "funds",           num: "14", label: "Usage des fonds",        color: "var(--uf-magenta)" },
  { key: "roadmap",         num: "15", label: "Roadmap",                color: "var(--uf-teal)" },
  { key: "projections",     num: "16", label: "Projections 7 ans",      color: "var(--uf-violet)" },
  { key: "exit",            num: "17", label: "Strategie d'exit",       color: "var(--uf-orange)" },
  { key: "contact",         num: "18", label: "Contact",                color: "var(--uf-ink)" },
];

// ─── Champs par slide ───────────────────────────────────────────────────────

const SLIDE_FIELDS: Record<SlideKey, Field[]> = {
  cover: [
    { key: "startupName", label: "Nom de la startup", placeholder: "Lumen" },
    { key: "tagline", label: "Tagline", placeholder: "Le copilote energie des restaurateurs independants." },
    { key: "stage", label: "Stade & levee", placeholder: "Serie A \u00b7 Recherche 5 M\u20ac" },
    { key: "startup_logo", label: "Logo de la startup", type: "image" },
    { key: "cover_image", label: "Image de couverture (produit, app, photo)", type: "image" },
    { key: "brand_color", label: "Couleur principale", placeholder: "#FF6A1F", half: true, type: "color" },
  ],
  problem: [
    { key: "problem_title", label: "Titre du probleme", placeholder: "L'energie, 2e poste de charges \u2014 ignore." },
    { key: "stat1_value", label: "Stat 1 \u2014 Valeur", placeholder: "18 %", half: true },
    { key: "stat1_label", label: "Stat 1 \u2014 Description", placeholder: "du CA moyen en facture d'energie" },
    { key: "stat2_value", label: "Stat 2 \u2014 Valeur", placeholder: "28 h", half: true },
    { key: "stat2_label", label: "Stat 2 \u2014 Description", placeholder: "par mois perdues a analyser les factures" },
    { key: "stat3_value", label: "Stat 3 \u2014 Valeur", placeholder: "72 %", half: true },
    { key: "stat3_label", label: "Stat 3 \u2014 Description", placeholder: "des restaurateurs ne comparent jamais leur contrat" },
    { key: "quote_text", label: "Citation client / expert", placeholder: "\u00ab Ma facture double entre janvier et juillet. \u00bb", type: "textarea" },
    { key: "quote_source", label: "Source de la citation", placeholder: "Marc L., Bistrot des Batignolles" },
  ],
  solution: [
    { key: "solution_title", label: "Titre de la solution", placeholder: "Un copilote energie pour chaque resto." },
    { key: "pillar1_title", label: "Pilier 1 \u2014 Titre", placeholder: "Connecter", half: true },
    { key: "pillar1_desc", label: "Pilier 1 \u2014 Description", placeholder: "Upload PDF ou sync Enedis en 2 min." },
    { key: "pillar2_title", label: "Pilier 2 \u2014 Titre", placeholder: "Analyser", half: true },
    { key: "pillar2_desc", label: "Pilier 2 \u2014 Description", placeholder: "Detection des 14 anomalies tarifaires." },
    { key: "pillar3_title", label: "Pilier 3 \u2014 Titre", placeholder: "Agir", half: true },
    { key: "pillar3_desc", label: "Pilier 3 \u2014 Description", placeholder: "Changement de contrat, plan de sobriete." },
  ],
  market: [
    { key: "tam_value", label: "TAM \u2014 Valeur", placeholder: "1,8 Md\u20ac", half: true },
    { key: "tam_label", label: "TAM \u2014 Description", placeholder: "Restauration francaise" },
    { key: "sam_value", label: "SAM \u2014 Valeur", placeholder: "720 M\u20ac", half: true },
    { key: "sam_label", label: "SAM \u2014 Description", placeholder: "Independants 5-30 ETP" },
    { key: "som_value", label: "SOM \u2014 Valeur", placeholder: "120 M\u20ac", half: true },
    { key: "som_label", label: "SOM \u2014 Description", placeholder: "France entiere \u00b7 3 ans" },
    { key: "market_growth", label: "Croissance du marche", placeholder: "+12 %/an", half: true },
    { key: "market_drivers", label: "Moteurs du marche", placeholder: "Hausse des couts energetiques, reglementation RSE, digitalisation de la restauration.", type: "textarea" },
  ],
  product: [
    { key: "product_title", label: "Titre", placeholder: "3 minutes pour savoir quoi faire." },
    { key: "product_image", label: "Image produit (screenshot, mockup, photo)", type: "image" },
    { key: "feature1_title", label: "Feature 1 \u2014 Titre", placeholder: "OCR factures", half: true },
    { key: "feature1_desc", label: "Feature 1 \u2014 Description", placeholder: "Lit EDF, Engie, TotalEnergies \u2014 PDF et scannees" },
    { key: "feature2_title", label: "Feature 2 \u2014 Titre", placeholder: "Alertes temps reel", half: true },
    { key: "feature2_desc", label: "Feature 2 \u2014 Description", placeholder: "Detecte 14 anomalies des reception de la facture" },
    { key: "feature3_title", label: "Feature 3 \u2014 Titre", placeholder: "Comparateur", half: true },
    { key: "feature3_desc", label: "Feature 3 \u2014 Description", placeholder: "Negocie en direct avec 8 fournisseurs" },
    { key: "feature4_title", label: "Feature 4 \u2014 Titre", placeholder: "Export PDF", half: true },
    { key: "feature4_desc", label: "Feature 4 \u2014 Description", placeholder: "Export PDF conforme aux decrets" },
  ],
  traction: [
    { key: "traction_title", label: "Titre", placeholder: "18 mois de croissance soutenue." },
    { key: "chart_label", label: "Nom de la metrique du graphique", placeholder: "ARR (\u20ac)", half: true },
    { key: "chart_period", label: "Periode affichee", placeholder: "Nov 2024 \u2192 Avr 2026", half: true },
    { key: "chart_m1", label: "Mois 1 \u2014 Date", placeholder: "Nov", half: true },
    { key: "chart_v1", label: "Mois 1 \u2014 Valeur", placeholder: "120k", half: true },
    { key: "chart_m2", label: "Mois 2 \u2014 Date", placeholder: "Jan", half: true },
    { key: "chart_v2", label: "Mois 2 \u2014 Valeur", placeholder: "210k", half: true },
    { key: "chart_m3", label: "Mois 3 \u2014 Date", placeholder: "Avr", half: true },
    { key: "chart_v3", label: "Mois 3 \u2014 Valeur", placeholder: "380k", half: true },
    { key: "chart_m4", label: "Mois 4 \u2014 Date", placeholder: "Jul", half: true },
    { key: "chart_v4", label: "Mois 4 \u2014 Valeur", placeholder: "620k", half: true },
    { key: "chart_m5", label: "Mois 5 \u2014 Date", placeholder: "Oct", half: true },
    { key: "chart_v5", label: "Mois 5 \u2014 Valeur", placeholder: "950k", half: true },
    { key: "chart_m6", label: "Mois 6 \u2014 Date", placeholder: "Avr", half: true },
    { key: "chart_v6", label: "Mois 6 \u2014 Valeur", placeholder: "1,4M", half: true },
    { key: "retention_m1", label: "Retention M1", placeholder: "95 %", half: true },
    { key: "retention_m3", label: "Retention M3", placeholder: "88 %", half: true },
    { key: "retention_m6", label: "Retention M6", placeholder: "82 %", half: true },
    { key: "growth_rate", label: "Taux de croissance", placeholder: "+15 % MoM", half: true },
    { key: "nb_clients", label: "Nombre de clients", placeholder: "320", half: true },
    { key: "arr", label: "ARR actuel", placeholder: "1,4 M\u20ac", half: true },
  ],
  unit_economics: [
    { key: "ue_title", label: "Titre", placeholder: "Des unit economics solides." },
    { key: "cac_value", label: "CAC", placeholder: "180 \u20ac", half: true },
    { key: "ltv_value", label: "LTV", placeholder: "8 400 \u20ac", half: true },
    { key: "ltv_cac_ratio", label: "Ratio LTV/CAC", placeholder: "47x", half: true },
    { key: "payback_period", label: "Payback period", placeholder: "3 mois", half: true },
    { key: "gross_margin", label: "Marge brute", placeholder: "78 %", half: true },
    { key: "arpu", label: "ARPU mensuel", placeholder: "240 \u20ac", half: true },
    { key: "churn_rate", label: "Churn mensuel", placeholder: "1,8 %", half: true },
    { key: "expansion_revenue", label: "Expansion revenue", placeholder: "+22 % NRR", half: true },
  ],
  business: [
    { key: "bm_title", label: "Titre", placeholder: "Trois offres, un moteur de croissance." },
    { key: "plan1_name", label: "Offre 1 \u2014 Nom", placeholder: "Starter", half: true },
    { key: "plan1_price", label: "Offre 1 \u2014 Prix", placeholder: "99 \u20ac/mois", half: true },
    { key: "plan1_desc", label: "Offre 1 \u2014 Description", placeholder: "Restaurant seul" },
    { key: "plan2_name", label: "Offre 2 \u2014 Nom", placeholder: "Growth", half: true },
    { key: "plan2_price", label: "Offre 2 \u2014 Prix", placeholder: "249 \u20ac/mois", half: true },
    { key: "plan2_desc", label: "Offre 2 \u2014 Description", placeholder: "2 a 10 etablissements" },
    { key: "plan3_name", label: "Offre 3 \u2014 Nom", placeholder: "Enterprise", half: true },
    { key: "plan3_price", label: "Offre 3 \u2014 Prix", placeholder: "Sur devis", half: true },
    { key: "plan3_desc", label: "Offre 3 \u2014 Description", placeholder: "Grands comptes, API dediee" },
    { key: "revenue_mix", label: "Mix revenus", placeholder: "60 % abonnements, 25 % commissions fournisseurs, 15 % services premium.", type: "textarea" },
  ],
  gtm: [
    { key: "gtm_title", label: "Titre", placeholder: "Trois canaux, un playbook eprouve." },
    { key: "channel1_name", label: "Canal 1 \u2014 Nom", placeholder: "Inside Sales", half: true },
    { key: "channel1_desc", label: "Canal 1 \u2014 Description", placeholder: "SDR + AE, cycle de 14 jours" },
    { key: "channel1_metrics", label: "Canal 1 \u2014 Metriques", placeholder: "45 % des deals, CAC 120 \u20ac" },
    { key: "channel2_name", label: "Canal 2 \u2014 Nom", placeholder: "Partenariats", half: true },
    { key: "channel2_desc", label: "Canal 2 \u2014 Description", placeholder: "Syndicats restaurateurs, GIE" },
    { key: "channel2_metrics", label: "Canal 2 \u2014 Metriques", placeholder: "35 % des deals, CAC 80 \u20ac" },
    { key: "channel3_name", label: "Canal 3 \u2014 Nom", placeholder: "Product-Led Growth", half: true },
    { key: "channel3_desc", label: "Canal 3 \u2014 Description", placeholder: "Freemium + viralite inter-restos" },
    { key: "channel3_metrics", label: "Canal 3 \u2014 Metriques", placeholder: "20 % des deals, CAC 40 \u20ac" },
    { key: "gtm_proof", label: "Preuve GTM", placeholder: "Pipeline actuel de 2,1 M\u20ac ARR, 40 % en negociation avancee.", type: "textarea" },
  ],
  cases: [
    { key: "cases_title", label: "Titre", placeholder: "Ils nous font confiance." },
    { key: "case1_logo", label: "Logo client 1", type: "image" },
    { key: "case1_name", label: "Client 1 \u2014 Nom", placeholder: "Groupe Bertrand", half: true },
    { key: "case1_quote", label: "Client 1 \u2014 Citation", placeholder: "\u00ab On a reduit notre facture de 22 % en 3 mois. \u00bb" },
    { key: "case1_impact", label: "Client 1 \u2014 Impact", placeholder: "-22 % sur la facture, ROI en 6 semaines", half: true },
    { key: "case2_name", label: "Client 2 \u2014 Nom", placeholder: "Big Mamma", half: true },
    { key: "case2_quote", label: "Client 2 \u2014 Citation", placeholder: "\u00ab Le dashboard est devenu un outil de pilotage quotidien. \u00bb" },
    { key: "case2_impact", label: "Client 2 \u2014 Impact", placeholder: "12 sites connectes, 18 % d'economies", half: true },
    { key: "case3_name", label: "Client 3 \u2014 Nom", placeholder: "PNY Burgers", half: true },
    { key: "case3_quote", label: "Client 3 \u2014 Citation", placeholder: "\u00ab On ne savait meme pas qu'on payait trop cher. \u00bb" },
    { key: "case3_impact", label: "Client 3 \u2014 Impact", placeholder: "Changement fournisseur, -31 % annuel", half: true },
  ],
  competition: [
    { key: "comp_title", label: "Titre", placeholder: "Pourquoi nous gagnons." },
    { key: "criteria1", label: "Critere 1", placeholder: "Prix", half: true },
    { key: "criteria2", label: "Critere 2", placeholder: "Simplicite", half: true },
    { key: "criteria3", label: "Critere 3", placeholder: "Couverture", half: true },
    { key: "criteria4", label: "Critere 4", placeholder: "Support", half: true },
    { key: "criteria5", label: "Critere 5", placeholder: "Integrations", half: true },
    { key: "comp1_name", label: "Concurrent 1", placeholder: "Acteur historique", half: true },
    { key: "comp1_scores", label: "Scores concurrent 1 (1-3 par critere, separes par virgule)", placeholder: "2,1,2,1,1" },
    { key: "comp2_name", label: "Concurrent 2", placeholder: "Nouvel entrant", half: true },
    { key: "comp2_scores", label: "Scores concurrent 2", placeholder: "1,2,1,2,1" },
    { key: "comp3_name", label: "Concurrent 3", placeholder: "Alternative indirecte", half: true },
    { key: "comp3_scores", label: "Scores concurrent 3", placeholder: "1,1,2,1,0" },
    { key: "our_scores", label: "Nos scores", placeholder: "3,3,3,2,3" },
    { key: "advantage1", label: "Avantage 1", placeholder: "Technologie proprietaire", half: true },
    { key: "advantage1_desc", label: "Detail avantage 1", placeholder: "Algorithme brevete 3x plus rapide", half: true },
    { key: "advantage2", label: "Avantage 2", placeholder: "Time-to-market", half: true },
    { key: "advantage2_desc", label: "Detail avantage 2", placeholder: "Deja en production depuis 18 mois", half: true },
  ],
  moats: [
    { key: "moat_title", label: "Titre", placeholder: "Trois barrieres, un avantage durable." },
    { key: "moat1_title", label: "Barriere 1 \u2014 Titre", placeholder: "Donnees proprietaires", half: true },
    { key: "moat1_desc", label: "Barriere 1 \u2014 Description", placeholder: "18 mois de donnees energetiques restauration, introuvables ailleurs." },
    { key: "moat2_title", label: "Barriere 2 \u2014 Titre", placeholder: "Effets de reseau", half: true },
    { key: "moat2_desc", label: "Barriere 2 \u2014 Description", placeholder: "Plus de restos = meilleur benchmark = plus de restos." },
    { key: "moat3_title", label: "Barriere 3 \u2014 Titre", placeholder: "Partenariats exclusifs", half: true },
    { key: "moat3_desc", label: "Barriere 3 \u2014 Description", placeholder: "Accord exclusif UMIH sur 3 regions." },
    { key: "moat_synthesis", label: "Synthese", placeholder: "Notre avantage se renforce avec le temps : chaque nouveau client enrichit l'algorithme et attire le suivant.", type: "textarea" },
  ],
  team: [
    { key: "member1_name", label: "Membre 1 \u2014 Nom", placeholder: "Juliette Moreau", half: true },
    { key: "member1_role", label: "Membre 1 \u2014 Role", placeholder: "CEO \u00b7 Ex-Sowee (EDF)", half: true },
    { key: "member2_name", label: "Membre 2 \u2014 Nom", placeholder: "Thomas Vidal", half: true },
    { key: "member2_role", label: "Membre 2 \u2014 Role", placeholder: "CTO \u00b7 Ex-Back Market", half: true },
    { key: "member3_name", label: "Membre 3 \u2014 Nom", placeholder: "Nadia Benhamou", half: true },
    { key: "member3_role", label: "Membre 3 \u2014 Role", placeholder: "COO \u00b7 Ex-Frichti", half: true },
    { key: "member4_name", label: "Membre 4 \u2014 Nom (optionnel)", placeholder: "Lucas Petit", half: true },
    { key: "member4_role", label: "Membre 4 \u2014 Role", placeholder: "VP Sales \u00b7 Ex-Doctolib", half: true },
    { key: "hire1_role", label: "Recrutement 1 \u2014 Poste", placeholder: "VP Engineering", half: true },
    { key: "hire1_quarter", label: "Recrutement 1 \u2014 Trimestre", placeholder: "T3 2026", half: true },
    { key: "hire2_role", label: "Recrutement 2 \u2014 Poste", placeholder: "Head of Data", half: true },
    { key: "hire2_quarter", label: "Recrutement 2 \u2014 Trimestre", placeholder: "T4 2026", half: true },
    { key: "hire3_role", label: "Recrutement 3 \u2014 Poste", placeholder: "Country Manager DACH", half: true },
    { key: "hire3_quarter", label: "Recrutement 3 \u2014 Trimestre", placeholder: "T1 2027", half: true },
  ],
  funds: [
    { key: "funds_title", label: "Titre", placeholder: "5 M\u20ac pour 24 mois" },
    { key: "fund_total", label: "Montant total", placeholder: "5 000 000 \u20ac", half: true },
    { key: "fund1_pct", label: "Poste 1 \u2014 %", placeholder: "40 %", half: true },
    { key: "fund1_amount", label: "Poste 1 \u2014 Montant", placeholder: "2 000 k\u20ac", half: true },
    { key: "fund1_label", label: "Poste 1 \u2014 Label", placeholder: "Equipe tech & produit (12 ETP)" },
    { key: "fund2_pct", label: "Poste 2 \u2014 %", placeholder: "30 %", half: true },
    { key: "fund2_amount", label: "Poste 2 \u2014 Montant", placeholder: "1 500 k\u20ac", half: true },
    { key: "fund2_label", label: "Poste 2 \u2014 Label", placeholder: "Sales & marketing" },
    { key: "fund3_pct", label: "Poste 3 \u2014 %", placeholder: "15 %", half: true },
    { key: "fund3_amount", label: "Poste 3 \u2014 Montant", placeholder: "750 k\u20ac", half: true },
    { key: "fund3_label", label: "Poste 3 \u2014 Label", placeholder: "Expansion internationale" },
    { key: "fund4_pct", label: "Poste 4 \u2014 %", placeholder: "10 %", half: true },
    { key: "fund4_amount", label: "Poste 4 \u2014 Montant", placeholder: "500 k\u20ac", half: true },
    { key: "fund4_label", label: "Poste 4 \u2014 Label", placeholder: "Infrastructure & securite" },
    { key: "fund5_pct", label: "Poste 5 \u2014 %", placeholder: "5 %", half: true },
    { key: "fund5_amount", label: "Poste 5 \u2014 Montant", placeholder: "250 k\u20ac", half: true },
    { key: "fund5_label", label: "Poste 5 \u2014 Label", placeholder: "Legal, compta, ops" },
  ],
  roadmap: [
    { key: "ms1_quarter", label: "Milestone 1 \u2014 Trimestre", placeholder: "T3 26", half: true },
    { key: "ms1_title", label: "Milestone 1 \u2014 Titre", placeholder: "Closing Serie A", half: true },
    { key: "ms1_note", label: "Milestone 1 \u2014 Note", placeholder: "5 M\u20ac, equipe 25 ETP" },
    { key: "ms2_quarter", label: "Milestone 2 \u2014 Trimestre", placeholder: "T4 26", half: true },
    { key: "ms2_title", label: "Milestone 2 \u2014 Titre", placeholder: "1 000 clients", half: true },
    { key: "ms2_note", label: "Milestone 2 \u2014 Note", placeholder: "Lancement v3 + API partenaires" },
    { key: "ms3_quarter", label: "Milestone 3 \u2014 Trimestre", placeholder: "T1 27", half: true },
    { key: "ms3_title", label: "Milestone 3 \u2014 Titre", placeholder: "Expansion DACH", half: true },
    { key: "ms3_note", label: "Milestone 3 \u2014 Note", placeholder: "Bureau Berlin, 50 premiers clients DE" },
    { key: "ms4_quarter", label: "Milestone 4 \u2014 Trimestre", placeholder: "T2 27", half: true },
    { key: "ms4_title", label: "Milestone 4 \u2014 Titre", placeholder: "3 M\u20ac ARR", half: true },
    { key: "ms4_note", label: "Milestone 4 \u2014 Note", placeholder: "Breakeven operationnel" },
    { key: "ms5_quarter", label: "Milestone 5 \u2014 Trimestre (optionnel)", placeholder: "T4 27", half: true },
    { key: "ms5_title", label: "Milestone 5 \u2014 Titre", placeholder: "Serie B", half: true },
    { key: "ms5_note", label: "Milestone 5 \u2014 Note", placeholder: "15-20 M\u20ac, expansion 5 pays EU" },
    { key: "ms6_quarter", label: "Milestone 6 \u2014 Trimestre (optionnel)", placeholder: "T2 28", half: true },
    { key: "ms6_title", label: "Milestone 6 \u2014 Titre", placeholder: "10 M\u20ac ARR", half: true },
    { key: "ms6_note", label: "Milestone 6 \u2014 Note", placeholder: "Leader europeen du segment" },
  ],
  projections: [
    { key: "proj_title", label: "Titre", placeholder: "Projections financieres 2026-2032" },
    { key: "year1_revenue", label: "Annee 1 \u2014 CA", placeholder: "1,4 M\u20ac", half: true },
    { key: "year1_costs", label: "Annee 1 \u2014 Couts", placeholder: "2,8 M\u20ac", half: true },
    { key: "year1_ebitda", label: "Annee 1 \u2014 EBITDA", placeholder: "-1,4 M\u20ac", half: true },
    { key: "year2_revenue", label: "Annee 2 \u2014 CA", placeholder: "3,2 M\u20ac", half: true },
    { key: "year2_costs", label: "Annee 2 \u2014 Couts", placeholder: "3,8 M\u20ac", half: true },
    { key: "year2_ebitda", label: "Annee 2 \u2014 EBITDA", placeholder: "-0,6 M\u20ac", half: true },
    { key: "year3_revenue", label: "Annee 3 \u2014 CA", placeholder: "7,5 M\u20ac", half: true },
    { key: "year3_costs", label: "Annee 3 \u2014 Couts", placeholder: "5,2 M\u20ac", half: true },
    { key: "year3_ebitda", label: "Annee 3 \u2014 EBITDA", placeholder: "+2,3 M\u20ac", half: true },
    { key: "year4_revenue", label: "Annee 4 \u2014 CA", placeholder: "15 M\u20ac", half: true },
    { key: "year4_costs", label: "Annee 4 \u2014 Couts", placeholder: "9 M\u20ac", half: true },
    { key: "year4_ebitda", label: "Annee 4 \u2014 EBITDA", placeholder: "+6 M\u20ac", half: true },
    { key: "year5_revenue", label: "Annee 5 \u2014 CA", placeholder: "28 M\u20ac", half: true },
    { key: "year5_costs", label: "Annee 5 \u2014 Couts", placeholder: "16 M\u20ac", half: true },
    { key: "year5_ebitda", label: "Annee 5 \u2014 EBITDA", placeholder: "+12 M\u20ac", half: true },
    { key: "year6_revenue", label: "Annee 6 \u2014 CA", placeholder: "45 M\u20ac", half: true },
    { key: "year6_costs", label: "Annee 6 \u2014 Couts", placeholder: "25 M\u20ac", half: true },
    { key: "year6_ebitda", label: "Annee 6 \u2014 EBITDA", placeholder: "+20 M\u20ac", half: true },
    { key: "year7_revenue", label: "Annee 7 \u2014 CA", placeholder: "70 M\u20ac", half: true },
    { key: "year7_costs", label: "Annee 7 \u2014 Couts", placeholder: "38 M\u20ac", half: true },
    { key: "year7_ebitda", label: "Annee 7 \u2014 EBITDA", placeholder: "+32 M\u20ac", half: true },
    { key: "breakeven_year", label: "Annee de breakeven", placeholder: "Annee 3 (2028)", half: true },
  ],
  exit: [
    { key: "exit_title", label: "Titre", placeholder: "Perspectives de sortie." },
    { key: "exit_timeline", label: "Horizon de sortie", placeholder: "5-7 ans (2031-2033)", half: true },
    { key: "acquirer1_name", label: "Acquereur potentiel 1", placeholder: "EDF / Sowee", half: true },
    { key: "acquirer1_rationale", label: "Acquereur 1 \u2014 Rationale", placeholder: "Extension de leur offre restauration" },
    { key: "acquirer2_name", label: "Acquereur potentiel 2", placeholder: "Edenred", half: true },
    { key: "acquirer2_rationale", label: "Acquereur 2 \u2014 Rationale", placeholder: "Complement a leur ecosysteme restauration" },
    { key: "acquirer3_name", label: "Acquereur potentiel 3", placeholder: "Schneider Electric", half: true },
    { key: "acquirer3_rationale", label: "Acquereur 3 \u2014 Rationale", placeholder: "Entree sur le segment PME restauration" },
    { key: "comparable1_name", label: "Comparable 1 \u2014 Nom", placeholder: "Toast (NYSE)", half: true },
    { key: "comparable1_multiple", label: "Comparable 1 \u2014 Multiple", placeholder: "12x ARR", half: true },
    { key: "comparable2_name", label: "Comparable 2 \u2014 Nom", placeholder: "Lightspeed", half: true },
    { key: "comparable2_multiple", label: "Comparable 2 \u2014 Multiple", placeholder: "8x ARR", half: true },
    { key: "exit_valuation_target", label: "Valorisation cible a la sortie", placeholder: "350-500 M\u20ac (10x ARR)", half: true },
  ],
  contact: [
    { key: "contact_subtitle", label: "Sous-titre", placeholder: "Rdv par telephone ou visio, 45 min. On vient avec les chiffres." },
    { key: "contact_name", label: "Nom du contact", placeholder: "Juliette Moreau" },
    { key: "contact_role", label: "Role", placeholder: "CEO", half: true },
    { key: "contact_email", label: "Email", placeholder: "juliette@lumen.earth", half: true },
    { key: "contact_phone", label: "Telephone", placeholder: "+33 6 71 42 19 08", half: true },
    { key: "contact_location", label: "Adresse", placeholder: "Station F \u00b7 5 parvis Alan Turing \u00b7 75013 Paris" },
    { key: "contact_cta", label: "Message d'accroche", placeholder: "Des fonds qui connaissent le SaaS vertical, la restauration et l'impact.", type: "textarea" },
    { key: "closing_date", label: "Date de closing", placeholder: "Septembre 2026", half: true },
    { key: "min_ticket", label: "Ticket minimum", placeholder: "500 k\u20ac \u00b7 jusqu'a 2 M\u20ac", half: true },
  ],
};

// ─── Page ───────────────────────────────────────────────────────────────────

export default function PitchDeckSerieAPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [activeSlide, setActiveSlide] = useState<SlideKey>("cover");
  const [startupId, setStartupId] = useState<string | null>(null);
  const [filling, setFilling] = useState(false);

  // Charger depuis localStorage
  useEffect(() => {
    const id = localStorage.getItem("founderai_startup_id");
    if (!id) return;
    setStartupId(id);
    const saved = localStorage.getItem(`founderai_pitch_deck_sa_${id}`);
    if (saved) {
      try { setValues(JSON.parse(saved)); } catch { /* ignore */ }
    }
    // Pre-remplir depuis le profil startup
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

  // Sauvegarder dans localStorage
  useEffect(() => {
    if (!startupId) return;
    localStorage.setItem(`founderai_pitch_deck_sa_${startupId}`, JSON.stringify(values));
  }, [values, startupId]);

  function updateField(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function autoFill() {
    if (!startupId || filling) return;
    setFilling(true);
    try {
      const filledByUser = Object.fromEntries(Object.entries(values).filter(([, v]) => v.trim()));
      const res = await fetch("/api/ai/fill-pitch-deck-serie-a", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId, userContext: filledByUser }),
      });
      if (!res.ok || !res.body) { setFilling(false); return; }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") continue;
          try {
            const parsed = JSON.parse(raw);
            if (parsed.values) {
              setValues((prev) => {
                const merged = { ...parsed.values };
                for (const [k, v] of Object.entries(prev)) {
                  if (typeof v === "string" && v.trim()) merged[k] = v;
                }
                return merged;
              });
            }
          } catch { /* ignore partial JSON */ }
        }
      }
    } catch { /* silencieux */ }
    finally { setFilling(false); }
  }

  function clearAll() {
    setValues({});
    if (startupId) localStorage.removeItem(`founderai_pitch_deck_sa_${startupId}`);
  }

  function openPreview() {
    sessionStorage.setItem("founderai_pitch_deck_sa", JSON.stringify(values));
    window.open("/pitch-deck-serie-a-preview.html", "_blank");
  }

  const fields = SLIDE_FIELDS[activeSlide] ?? [];
  const filledCount = Object.values(values).filter(Boolean).length;
  const totalFields = Object.values(SLIDE_FIELDS).flat().length;

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
              Pitch Deck Serie A &mdash; 18 slides
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
              {filling ? "Generation\u2026" : "Demander a mes agents"}
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full hover:-translate-y-px transition-transform"
              style={{ border: "1px solid var(--uf-line)", color: "var(--uf-muted)" }}
            >
              Vider
            </button>
            <button
              onClick={openPreview}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full hover:-translate-y-px transition-transform"
              style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}
            >
              Preview &amp; Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-4 flex gap-6">
        {/* Nav slides */}
        <nav className="w-48 shrink-0 space-y-1">
          {SLIDES.map((s) => {
            const isActive = activeSlide === s.key;
            const slideFields = SLIDE_FIELDS[s.key] ?? [];
            const filled = slideFields.filter((f) => values[f.key]).length;
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
            <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: SLIDES.find((s) => s.key === activeSlide)?.color ?? "var(--uf-ink)", color: "#fff", fontFamily: "var(--uf-mono)" }}>
              {SLIDES.find((s) => s.key === activeSlide)?.num ?? "?"}
            </span>
            <h2 className="uppercase tracking-normal" style={{ fontFamily: "var(--uf-display)", fontSize: 22, color: "var(--uf-ink)" }}>
              {SLIDES.find((s) => s.key === activeSlide)?.label ?? ""}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {fields.map((f) => (
              <div key={f.key} className={f.half ? "" : "col-span-2"}>
                <label className="text-[11px] font-medium tracking-[0.1em] uppercase block mb-1" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>
                  {f.label}
                </label>
                {f.type === "image" ? (
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
                const idx = SLIDES.findIndex((s) => s.key === activeSlide);
                if (idx > 0) setActiveSlide(SLIDES[idx - 1].key);
              }}
              disabled={activeSlide === SLIDES[0]?.key}
              className="text-sm font-medium disabled:opacity-30"
              style={{ color: "var(--uf-muted)" }}
            >
              Slide precedente
            </button>
            <button
              onClick={() => {
                const idx = SLIDES.findIndex((s) => s.key === activeSlide);
                if (idx < SLIDES.length - 1) setActiveSlide(SLIDES[idx + 1].key);
              }}
              disabled={activeSlide === SLIDES[SLIDES.length - 1]?.key}
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
