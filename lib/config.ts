export type SiteConfig = {
  name: string;
  url: string;
  type?: "buildbox" | "admin" | "custom";
  note?: string;
};

export function branding() {
  return {
    title: process.env.ADMIN_BRAND_TITLE || "XyStudio Control Center",
    subtitle: process.env.ADMIN_BRAND_SUBTITLE || "Monitor sites, BuildBox, revenue, and server actions.",
    logoUrl: process.env.ADMIN_BRAND_LOGO_URL || "",
    accent: process.env.ADMIN_BRAND_ACCENT || "#facc15"
  };
}

export function sites(): SiteConfig[] {
  const raw = process.env.ADMIN_SITES_JSON;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as SiteConfig[];
      return parsed.filter((site) => site.name && site.url);
    } catch {}
  }
  return [
    { name: "BuildBox", url: "https://build.xystudio.my.id", type: "buildbox" },
    { name: "XyStudio", url: "https://www.xystudio.my.id", type: "custom" },
    { name: "Admin", url: "https://admin.xystudio.my.id", type: "admin" }
  ];
}

export function githubRepos() {
  return [
    { label: "Frontend", owner: process.env.BUILDBOX_GITHUB_OWNER || "Kallxy1", repo: process.env.BUILDBOX_FRONTEND_REPO || "androidbuilderfrontend" },
    { label: "Engine", owner: process.env.BUILDBOX_GITHUB_OWNER || "Kallxy1", repo: process.env.BUILDBOX_ENGINE_REPO || "androidengine" }
  ];
}
