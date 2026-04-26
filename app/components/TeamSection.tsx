"use client";

import { useState, useEffect } from "react";

type Member = {
  id: string;
  user_id: string | null;
  email: string;
  role: "owner" | "editor" | "viewer";
  invited_at: string;
  joined_at: string | null;
};

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  owner:  { label: "Fondateur", color: "var(--uf-orange)" },
  editor: { label: "Éditeur",   color: "var(--uf-teal)" },
  viewer: { label: "Lecteur",   color: "var(--uf-muted)" },
};

export default function TeamSection({ startupId }: { startupId: string | null }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor");
  const [inviting, setInviting] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!startupId) return;
    setLoading(true);
    fetch(`/api/startup/members?startupId=${startupId}`)
      .then((r) => r.json())
      .then((data) => setMembers(data.members ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [startupId]);

  const isOwner = members.some((m) => m.role === "owner" && m.user_id);

  async function handleInvite() {
    if (!inviteEmail.trim() || !startupId) return;
    setInviting(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/startup/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId, email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setMessage(data.autoJoined ? `${inviteEmail} a rejoint l'équipe.` : `Invitation envoyée à ${inviteEmail}.`);
      setInviteEmail("");
      setShowInvite(false);
      // Refresh
      const refreshRes = await fetch(`/api/startup/members?startupId=${startupId}`);
      const refreshData = await refreshRes.json();
      setMembers(refreshData.members ?? []);
    } catch {
      setError("Erreur lors de l'envoi de l'invitation.");
    } finally {
      setInviting(false);
    }
  }

  async function handleChangeRole(memberId: string, newRole: string) {
    if (!startupId) return;
    const res = await fetch("/api/startup/members", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startupId, memberId, role: newRole }),
    });
    if (res.ok) {
      setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, role: newRole as Member["role"] } : m));
    }
  }

  async function handleRemove(memberId: string) {
    if (!startupId) return;
    const res = await fetch(`/api/startup/members?startupId=${startupId}&memberId=${memberId}`, { method: "DELETE" });
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    }
  }

  if (!startupId) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="uppercase tracking-[-0.01em]" style={{ fontFamily: "var(--uf-display)", fontSize: 24, color: "var(--uf-ink)" }}>
          Mon équipe
        </h2>
        {isOwner && (
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="text-sm font-medium px-4 py-2 rounded-full transition-all hover:opacity-90"
            style={{ background: "var(--uf-orange)", color: "#fff" }}
          >
            {showInvite ? "Annuler" : "Inviter un membre"}
          </button>
        )}
      </div>

      {/* Formulaire d'invitation */}
      {showInvite && (
        <div className="mb-4 p-4 flex items-end gap-3 flex-wrap" style={{ background: "var(--uf-card)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-lg)" }}>
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-medium tracking-[0.12em] uppercase block mb-1" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>Email</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="collègue@startup.com"
              className="w-full px-3 py-2 text-sm focus:outline-none"
              style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)", color: "var(--uf-ink)", background: "var(--uf-paper)" }}
            />
          </div>
          <div>
            <label className="text-[10px] font-medium tracking-[0.12em] uppercase block mb-1" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>Rôle</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "editor" | "viewer")}
              className="px-3 py-2 text-sm focus:outline-none cursor-pointer"
              style={{ border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-sm)", color: "var(--uf-ink)", background: "var(--uf-paper)" }}
            >
              <option value="editor">Éditeur</option>
              <option value="viewer">Lecteur</option>
            </select>
          </div>
          <button
            onClick={handleInvite}
            disabled={inviting || !inviteEmail.trim()}
            className="px-4 py-2 text-sm font-medium rounded-full disabled:opacity-40 transition-all"
            style={{ background: "var(--uf-ink)", color: "var(--uf-paper)" }}
          >
            {inviting ? "Envoi..." : "Envoyer"}
          </button>
        </div>
      )}

      {error && <div className="mb-3 text-sm px-4 py-2" style={{ color: "var(--uf-orange)", background: "#FF6A1F14", border: "1px solid #FF6A1F30", borderRadius: "var(--uf-r-md)" }}>{error}</div>}
      {message && <div className="mb-3 text-sm px-4 py-2" style={{ color: "var(--uf-teal)", background: "#0DB4A014", border: "1px solid #0DB4A030", borderRadius: "var(--uf-r-md)" }}>{message}</div>}

      {/* Liste des membres */}
      <div style={{ background: "var(--uf-card)", border: "1px solid var(--uf-line)", borderRadius: "var(--uf-r-xl)", overflow: "hidden" }}>
        {loading ? (
          <div className="px-6 py-8 text-center text-sm" style={{ color: "var(--uf-muted)" }}>Chargement...</div>
        ) : members.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm" style={{ color: "var(--uf-muted)" }}>Aucun membre.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--uf-line)" }}>
                <th className="text-left px-5 py-3 text-[10px] font-medium tracking-[0.12em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>Email</th>
                <th className="text-left px-5 py-3 text-[10px] font-medium tracking-[0.12em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>Rôle</th>
                <th className="text-left px-5 py-3 text-[10px] font-medium tracking-[0.12em] uppercase" style={{ fontFamily: "var(--uf-mono)", color: "var(--uf-muted)" }}>Statut</th>
                {isOwner && <th className="px-5 py-3" />}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const roleInfo = ROLE_LABELS[m.role] || ROLE_LABELS.viewer;
                const isPending = !m.joined_at;
                return (
                  <tr key={m.id} style={{ borderBottom: "1px solid var(--uf-line)" }}>
                    <td className="px-5 py-3 text-sm" style={{ color: "var(--uf-ink)" }}>{m.email}</td>
                    <td className="px-5 py-3">
                      {isOwner && m.role !== "owner" ? (
                        <select
                          value={m.role}
                          onChange={(e) => handleChangeRole(m.id, e.target.value)}
                          className="text-xs font-medium px-2 py-1 cursor-pointer focus:outline-none"
                          style={{ background: `${roleInfo.color}18`, color: roleInfo.color, border: "none", borderRadius: "var(--uf-r-sm)", fontFamily: "var(--uf-mono)" }}
                        >
                          <option value="editor">Éditeur</option>
                          <option value="viewer">Lecteur</option>
                        </select>
                      ) : (
                        <span className="text-xs font-medium px-2 py-1" style={{ background: `${roleInfo.color}18`, color: roleInfo.color, borderRadius: "var(--uf-r-sm)", fontFamily: "var(--uf-mono)" }}>
                          {roleInfo.label}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: isPending ? "var(--uf-orange)" : "var(--uf-teal)", fontFamily: "var(--uf-mono)" }}>
                      {isPending ? "En attente" : "Actif"}
                    </td>
                    {isOwner && (
                      <td className="px-5 py-3 text-right">
                        {m.role !== "owner" && (
                          <button
                            onClick={() => handleRemove(m.id)}
                            className="text-xs transition-colors hover:opacity-70"
                            style={{ color: "var(--uf-muted)" }}
                          >
                            Retirer
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-3 text-[11px]" style={{ color: "var(--uf-muted)" }}>
        Les éditeurs peuvent modifier le profil, discuter avec les agents et générer des livrables. Les lecteurs ont un accès en consultation.
      </p>
    </div>
  );
}
