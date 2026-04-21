import { describe, it, expect } from "vitest";
import { normalizeLicenseConfig, DEFAULT_LICENSE_CONFIG } from "@/lib/licenses";

describe("normalizeLicenseConfig", () => {
  it("retourne les valeurs par défaut si l'input est null", () => {
    const result = normalizeLicenseConfig(null);
    expect(result).toEqual(DEFAULT_LICENSE_CONFIG);
  });

  it("retourne les valeurs par défaut si l'input est undefined", () => {
    expect(normalizeLicenseConfig(undefined)).toEqual(DEFAULT_LICENSE_CONFIG);
  });

  it("retourne les valeurs par défaut si l'input est un objet vide", () => {
    expect(normalizeLicenseConfig({})).toEqual(DEFAULT_LICENSE_CONFIG);
  });

  it("préserve les valeurs valides fournies", () => {
    const input = {
      available_agents: ["strategie", "vente"],
      conversational_memory_enabled: false,
      conversational_memory_window: 5,
      max_chat_messages_per_day: 100,
      max_codir_sessions_per_month: 10,
      portfolio_plan_allowances: { starter: 20, growth: 10, scale: 5 },
    };
    const result = normalizeLicenseConfig(input);
    expect(result.available_agents).toEqual(["strategie", "vente"]);
    expect(result.conversational_memory_enabled).toBe(false);
    expect(result.conversational_memory_window).toBe(5);
    expect(result.max_chat_messages_per_day).toBe(100);
    expect(result.max_codir_sessions_per_month).toBe(10);
    expect(result.portfolio_plan_allowances.starter).toBe(20);
    expect(result.portfolio_plan_allowances.growth).toBe(10);
    expect(result.portfolio_plan_allowances.scale).toBe(5);
  });

  it("filtre les agents invalides", () => {
    const input = { available_agents: ["strategie", "invalid_agent", "vente"] };
    const result = normalizeLicenseConfig(input);
    expect(result.available_agents).toEqual(["strategie", "vente"]);
  });

  it("utilise les agents par défaut si aucun agent valide", () => {
    const input = { available_agents: ["invalid1", "invalid2"] };
    const result = normalizeLicenseConfig(input);
    expect(result.available_agents).toEqual(DEFAULT_LICENSE_CONFIG.available_agents);
  });

  it("utilise les agents par défaut si available_agents n'est pas un tableau", () => {
    const result = normalizeLicenseConfig({ available_agents: "strategie" });
    expect(result.available_agents).toEqual(DEFAULT_LICENSE_CONFIG.available_agents);
  });

  it("déduplication des agents", () => {
    const input = { available_agents: ["strategie", "strategie", "vente"] };
    const result = normalizeLicenseConfig(input);
    expect(result.available_agents).toEqual(["strategie", "vente"]);
  });

  it("clamp conversational_memory_window entre 1 et 100", () => {
    expect(normalizeLicenseConfig({ conversational_memory_window: 0 }).conversational_memory_window).toBe(1);
    expect(normalizeLicenseConfig({ conversational_memory_window: 200 }).conversational_memory_window).toBe(100);
    expect(normalizeLicenseConfig({ conversational_memory_window: 50 }).conversational_memory_window).toBe(50);
  });

  it("clamp max_chat_messages_per_day entre 1 et 100 000", () => {
    expect(normalizeLicenseConfig({ max_chat_messages_per_day: 0 }).max_chat_messages_per_day).toBe(1);
    expect(normalizeLicenseConfig({ max_chat_messages_per_day: 999999 }).max_chat_messages_per_day).toBe(100000);
  });

  it("clamp max_codir_sessions_per_month entre 1 et 100 000", () => {
    expect(normalizeLicenseConfig({ max_codir_sessions_per_month: -5 }).max_codir_sessions_per_month).toBe(1);
    expect(normalizeLicenseConfig({ max_codir_sessions_per_month: 200000 }).max_codir_sessions_per_month).toBe(100000);
  });

  it("clamp portfolio_plan_allowances entre 0 et 100 000", () => {
    expect(normalizeLicenseConfig({ portfolio_plan_allowances: { starter: -1 } }).portfolio_plan_allowances.starter).toBe(0);
    expect(normalizeLicenseConfig({ portfolio_plan_allowances: { starter: 999999 } }).portfolio_plan_allowances.starter).toBe(100000);
    expect(normalizeLicenseConfig({ portfolio_plan_allowances: { growth: -5 } }).portfolio_plan_allowances.growth).toBe(0);
    expect(normalizeLicenseConfig({ portfolio_plan_allowances: { scale: 50 } }).portfolio_plan_allowances.scale).toBe(50);
  });

  it("gère les valeurs non-numériques pour les champs numériques", () => {
    const result = normalizeLicenseConfig({
      conversational_memory_window: "abc",
      max_chat_messages_per_day: null,
    });
    expect(result.conversational_memory_window).toBe(DEFAULT_LICENSE_CONFIG.conversational_memory_window);
    expect(result.max_chat_messages_per_day).toBe(DEFAULT_LICENSE_CONFIG.max_chat_messages_per_day);
  });

  it("gère conversational_memory_enabled non-booléen", () => {
    const result = normalizeLicenseConfig({ conversational_memory_enabled: "yes" });
    expect(result.conversational_memory_enabled).toBe(DEFAULT_LICENSE_CONFIG.conversational_memory_enabled);
  });
});
