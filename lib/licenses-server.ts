import { createServerClient } from "@/lib/supabase";
import { DEFAULT_LICENSE_CONFIG, normalizeLicenseConfig, type LicenseConfig } from "@/lib/licenses";

export async function getEffectiveStartupLicense(startupId: string): Promise<LicenseConfig> {
  const supabase = createServerClient();
  const { data: startup } = await supabase
    .from("startups")
    .select("partner_id, license_config")
    .eq("id", startupId)
    .maybeSingle();

  if (!startup) return DEFAULT_LICENSE_CONFIG;

  const startupLicense = normalizeLicenseConfig(startup.license_config);
  if (!startup.partner_id) return startupLicense;

  const { data: partner } = await supabase
    .from("partners")
    .select("license_config")
    .eq("id", startup.partner_id)
    .maybeSingle();

  const partnerLicense = normalizeLicenseConfig(partner?.license_config);
  return normalizeLicenseConfig({
    ...partnerLicense,
    ...startupLicense,
    available_agents: startupLicense.available_agents?.length
      ? startupLicense.available_agents
      : partnerLicense.available_agents,
  });
}
