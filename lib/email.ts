import { Resend } from "resend";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://founderai-kappa.vercel.app";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function getFrom() {
  return process.env.RESEND_FROM ?? "FounderAI <onboarding@resend.dev>";
}

// ─── Template wrapper V2 ─────────────────────────────────────────────────────

function wrapTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FounderAI</title></head>
<body style="margin:0;padding:0;background:#FBF8F0;font-family:'Geist',system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FBF8F0;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:20px;overflow:hidden;border:1px solid #E0D9C7;">
        <tr>
          <td style="padding:28px 40px;border-bottom:1px solid #E0D9C7;">
            <span style="display:inline-block;width:32px;height:32px;border-radius:50%;background:#FF6A1F;color:#fff;font-size:16px;line-height:32px;text-align:center;font-weight:400;vertical-align:middle;">f</span>
            <span style="font-size:18px;font-weight:600;color:#0F0E0B;vertical-align:middle;margin-left:10px;">FOUNDER<span style="color:#6C6760;">AI</span></span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #E0D9C7;text-align:center;">
            <p style="margin:0;font-size:12px;color:#A09A8E;">FounderAI par DEEP SIGHT CONSULTING</p>
            <p style="margin:8px 0 0;font-size:12px;color:#A09A8E;">
              <a href="${BASE_URL}/politique-confidentialite" style="color:#FF6A1F;text-decoration:none;">Confidentialité</a>
              &nbsp;·&nbsp;
              <a href="${BASE_URL}/cgu" style="color:#FF6A1F;text-decoration:none;">CGU</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(text: string, href: string): string {
  return `<table cellpadding="0" cellspacing="0"><tr><td style="background:#0F0E0B;border-radius:999px;">
    <a href="${href}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:500;color:#FBF8F0;text-decoration:none;">${text}</a>
  </td></tr></table>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:24px;font-weight:900;color:#0F0E0B;">${text}</h1>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:#6C6760;line-height:1.6;">${text}</p>`;
}

// ─── Email functions ─────────────────────────────────────────────────────────

/** Bienvenue après inscription */
export async function sendWelcomeEmail(to: string, firstName: string) {
  const html = wrapTemplate(
    heading(`Bienvenue, ${firstName} !`) +
    paragraph("Votre compte FounderAI est prêt. Vos agents IA — stratégie, commercial, finance, technique et opérations — n'attendent plus que vous.") +
    paragraph("Commencez par décrire votre startup pour que vos agents apprennent à vous connaître.") +
    button("Accéder à mon dashboard →", `${BASE_URL}/dashboard`)
  );
  await getResend().emails.send({ from: getFrom(), to, subject: `Bienvenue sur FounderAI, ${firstName} !`, html });
}

/** Réinitialisation de mot de passe */
export async function sendPasswordResetEmail(to: string, resetLink: string) {
  const html = wrapTemplate(
    heading("Réinitialisation de mot de passe") +
    paragraph("Vous avez demandé à réinitialiser votre mot de passe FounderAI.") +
    paragraph("Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien expire dans 1 heure.") +
    button("Réinitialiser mon mot de passe →", resetLink) +
    `<p style="margin:24px 0 0;font-size:13px;color:#A09A8E;line-height:1.6;">Si vous n'avez pas fait cette demande, ignorez cet email. Votre mot de passe restera inchangé.</p>`
  );
  await getResend().emails.send({ from: getFrom(), to, subject: "FounderAI — Réinitialisation de mot de passe", html });
}

/** Partenaire activé par l'admin */
export async function sendPartnerActivatedEmail(to: string, partnerName: string) {
  const html = wrapTemplate(
    heading("Votre espace est activé !") +
    paragraph(`L'espace partenaire <strong>${partnerName}</strong> a été validé par notre équipe. Vous pouvez maintenant gérer votre portefeuille de startups et personnaliser vos agents.`) +
    button("Accéder à mon espace →", `${BASE_URL}/partner`)
  );
  await getResend().emails.send({ from: getFrom(), to, subject: `${partnerName} — Espace partenaire activé`, html });
}

/** Invitation d'une startup par un partenaire */
export async function sendPartnerInviteEmail(to: string, partnerName: string, plan: string) {
  const html = wrapTemplate(
    heading(`${partnerName} vous invite !`) +
    paragraph(`Vous êtes invité à rejoindre FounderAI via le programme <strong>${partnerName}</strong>. Un plan <strong>${plan}</strong> vous a été attribué.`) +
    paragraph("Créez votre compte en 2 minutes et accédez à votre équipe de direction IA.") +
    button("Créer mon compte →", `${BASE_URL}/inscription`)
  );
  await getResend().emails.send({ from: getFrom(), to, subject: `${partnerName} vous invite sur FounderAI`, html });
}

/** Quota atteint (80%) */
export async function sendQuotaWarningEmail(to: string, firstName: string, usage: number, limit: number) {
  const pct = Math.round((usage / limit) * 100);
  const html = wrapTemplate(
    heading(`${pct}% de votre quota utilisé`) +
    paragraph(`${firstName}, vous avez utilisé <strong>${usage}</strong> messages sur les <strong>${limit}</strong> inclus dans votre forfait aujourd'hui.`) +
    paragraph("Passez au plan supérieur pour des sessions illimitées et débloquer tous les agents.") +
    button("Voir les forfaits →", `${BASE_URL}/#tarifs`)
  );
  await getResend().emails.send({ from: getFrom(), to, subject: "FounderAI — Vous approchez de votre limite", html });
}

/** Quota atteint (100%) */
export async function sendQuotaReachedEmail(to: string, firstName: string) {
  const html = wrapTemplate(
    heading("Limite quotidienne atteinte") +
    paragraph(`${firstName}, vous avez atteint votre limite de messages pour aujourd'hui. Vos agents seront de nouveau disponibles demain.`) +
    paragraph("Pour un accès illimité, passez au plan Growth ou Scale.") +
    button("Upgrader mon plan →", `${BASE_URL}/#tarifs`)
  );
  await getResend().emails.send({ from: getFrom(), to, subject: "FounderAI — Limite atteinte", html });
}

/** Session CODIR terminée */
export async function sendCodirDoneEmail(to: string, firstName: string, question: string) {
  const shortQ = question.length > 80 ? question.slice(0, 80) + "…" : question;
  const html = wrapTemplate(
    heading("Synthèse CODIR disponible") +
    paragraph(`${firstName}, la session CODIR sur la question « <em>${shortQ}</em> » est terminée.`) +
    paragraph("Les 5 agents ont débattu et Victor a produit sa synthèse avec recommandations.") +
    button("Voir la synthèse →", `${BASE_URL}/dashboard`)
  );
  await getResend().emails.send({ from: getFrom(), to, subject: "FounderAI — Synthèse CODIR prête", html });
}

/** Nouvel agent custom disponible */
export async function sendNewAgentEmail(to: string, agentName: string, agentRole: string, partnerName: string) {
  const html = wrapTemplate(
    heading(`Nouvel agent : ${agentName}`) +
    paragraph(`<strong>${partnerName}</strong> a créé un nouvel agent spécialisé pour vous accompagner.`) +
    paragraph(`<strong>${agentName}</strong> — ${agentRole}`) +
    paragraph("Retrouvez-le dans votre sidebar et invitez-le dans vos sessions CODIR.") +
    button("Parler à " + agentName + " →", `${BASE_URL}/dashboard`)
  );
  await getResend().emails.send({ from: getFrom(), to, subject: `FounderAI — Nouvel agent : ${agentName}`, html });
}

export async function sendInviteEmail(to: string, startupName: string, invitedBy: string, role: string, link: string) {
  const roleLabel = role === "editor" ? "Éditeur" : "Lecteur";
  const html = wrapTemplate(
    heading(`Vous êtes invité à rejoindre ${startupName}`) +
    paragraph(`<strong>${invitedBy}</strong> vous invite à rejoindre l'équipe de <strong>${startupName}</strong> sur FounderAI en tant que <strong>${roleLabel}</strong>.`) +
    paragraph("Vous aurez accès aux conversations avec les agents IA, aux documents et aux livrables de la startup.") +
    button("Rejoindre l'équipe →", link)
  );
  await getResend().emails.send({ from: getFrom(), to, subject: `FounderAI — Invitation à rejoindre ${startupName}`, html });
}
