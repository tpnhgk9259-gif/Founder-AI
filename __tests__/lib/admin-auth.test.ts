import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isSuperAdminEmail } from "@/lib/admin-auth";

describe("isSuperAdminEmail", () => {
  const originalEnv = process.env.SUPER_ADMIN_EMAILS;

  afterEach(() => {
    process.env.SUPER_ADMIN_EMAILS = originalEnv;
  });

  it("retourne false si SUPER_ADMIN_EMAILS n'est pas défini", () => {
    delete process.env.SUPER_ADMIN_EMAILS;
    expect(isSuperAdminEmail("admin@example.com")).toBe(false);
  });

  it("retourne true si l'email correspond exactement", () => {
    process.env.SUPER_ADMIN_EMAILS = "admin@example.com";
    expect(isSuperAdminEmail("admin@example.com")).toBe(true);
  });

  it("est insensible à la casse", () => {
    process.env.SUPER_ADMIN_EMAILS = "Admin@Example.com";
    expect(isSuperAdminEmail("admin@example.com")).toBe(true);
    expect(isSuperAdminEmail("ADMIN@EXAMPLE.COM")).toBe(true);
  });

  it("parse plusieurs emails séparés par des virgules", () => {
    process.env.SUPER_ADMIN_EMAILS = "admin@example.com,other@example.com";
    expect(isSuperAdminEmail("admin@example.com")).toBe(true);
    expect(isSuperAdminEmail("other@example.com")).toBe(true);
    expect(isSuperAdminEmail("unknown@example.com")).toBe(false);
  });

  it("parse plusieurs emails séparés par des points-virgules", () => {
    process.env.SUPER_ADMIN_EMAILS = "admin@example.com;other@example.com";
    expect(isSuperAdminEmail("other@example.com")).toBe(true);
  });

  it("parse plusieurs emails séparés par des sauts de ligne", () => {
    process.env.SUPER_ADMIN_EMAILS = "admin@example.com\nother@example.com";
    expect(isSuperAdminEmail("other@example.com")).toBe(true);
  });

  it("ignore les espaces autour des emails", () => {
    process.env.SUPER_ADMIN_EMAILS = "  admin@example.com  ,  other@example.com  ";
    expect(isSuperAdminEmail("admin@example.com")).toBe(true);
  });

  it("retourne false si email non présent dans la liste", () => {
    process.env.SUPER_ADMIN_EMAILS = "admin@example.com";
    expect(isSuperAdminEmail("hacker@evil.com")).toBe(false);
  });

  it("retourne false pour une chaîne vide", () => {
    process.env.SUPER_ADMIN_EMAILS = "admin@example.com";
    expect(isSuperAdminEmail("")).toBe(false);
  });
});
