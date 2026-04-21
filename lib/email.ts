import { Resend } from "resend";

// TODO: remplacer par noreply@founderai.fr une fois le domaine vérifié dans Resend
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://founderai.fr";

function buildWelcomeHtml(firstName: string, dashboardUrl: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bienvenue sur FounderAI</title></head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#7c3aed;padding:32px 40px;text-align:center;">
            <span style="font-size:24px;font-weight:900;color:#fff;">Founder<span style="color:#c4b5fd;">AI</span></span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 16px;font-size:28px;font-weight:900;color:#111827;">Bienvenue, ${firstName} ! 🎉</h1>
            <p style="margin:0 0 16px;font-size:16px;color:#6b7280;line-height:1.6;">
              Votre compte FounderAI est prêt. Vos agents IA — stratégie, commercial, finance, technique et opérations — n'attendent plus que vous.
            </p>
            <p style="margin:0 0 32px;font-size:16px;color:#6b7280;line-height:1.6;">
              Commencez par décrire votre startup pour que vos agents apprennent à vous connaître.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#7c3aed;border-radius:14px;">
                  <a href="${dashboardUrl}" style="display:inline-block;padding:16px 32px;font-size:16px;font-weight:700;color:#fff;text-decoration:none;">
                    Accéder à mon dashboard →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #f3f4f6;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">FounderAI par DEEP SIGHT CONSULTING · 60 rue François Ier, 75008 Paris</p>
            <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">
              <a href="${BASE_URL}/politique-confidentialite" style="color:#7c3aed;text-decoration:none;">Politique de confidentialité</a>
              &nbsp;·&nbsp;
              <a href="${BASE_URL}/cgu" style="color:#7c3aed;text-decoration:none;">CGU</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendWelcomeEmail(to: string, firstName: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM = process.env.RESEND_FROM ?? "FounderAI <onboarding@resend.dev>";

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Bienvenue sur FounderAI, ${firstName} !`,
    html: buildWelcomeHtml(firstName, `${BASE_URL}/dashboard`),
  });
}
