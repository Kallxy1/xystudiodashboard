import { Dashboard } from "@/components/dashboard";
import { LoginForm } from "@/components/login-form";
import { getSession } from "@/lib/auth";
import { branding } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();
  const brand = branding();
  if (!session) return <LoginForm brand={brand} />;
  return <Dashboard email={session.email} brand={brand} />;
}
