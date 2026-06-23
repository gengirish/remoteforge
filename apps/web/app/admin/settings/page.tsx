import { AffiliateSettingsClient } from "./affiliate-settings-client";
import { checkAdminConfigured, fetchAffiliateSettings } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Product Settings | RemoteForge",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const config = await checkAdminConfigured();

  if (!config.hasAdminToken) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-2xl font-bold">Product Settings</h1>
        <p className="mt-4 text-muted-foreground">
          Set <code className="text-sm">ADMIN_SETTINGS_TOKEN</code> on the web server (Vercel
          env) to enable this page.
        </p>
        {!config.hasInternalKey && (
          <p className="mt-3 text-sm text-amber-700 dark:text-amber-400">
            Also set <code>REMOTEFORGE_INTERNAL_KEY</code> (same value as the Fly API) so the
            web app can read and write settings.
          </p>
        )}
      </div>
    );
  }

  let data = null;
  if (config.authenticated) {
    const result = await fetchAffiliateSettings();
    if (result.success) data = result.data;
  }

  return <AffiliateSettingsClient initialData={data} />;
}
