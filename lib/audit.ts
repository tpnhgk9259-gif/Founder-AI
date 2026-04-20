/**
 * Module d'audit — trace les actions sensibles dans la table audit_log.
 *
 * Fire-and-forget : ne jamais bloquer l'action principale en cas d'échec du log.
 */

import { createServerClient } from "./supabase";

type AuditAction =
  | "document.upload"
  | "document.delete"
  | "knowledge.update"
  | "knowledge.index"
  | "codir.session"
  | "admin.license_update"
  | "admin.user_delete";

export function logAudit(params: {
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}): void {
  const supabase = createServerClient();
  supabase
    .from("audit_log")
    .insert({
      user_id: params.userId,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      metadata: params.metadata ?? {},
    })
    .then(({ error }) => {
      if (error) console.error("[audit] Échec log :", error.message);
    });
}
