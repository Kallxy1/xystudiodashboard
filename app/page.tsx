import { Dashboard } from "@/components/dashboard";
import { LoginForm } from "@/components/login-form";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();
  if (!session) return <LoginForm />;
  return <Dashboard email={session.email} />;
}
