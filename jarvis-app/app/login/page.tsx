import LoginForm from "./login-form";
import { showDemoLogins, teamUsers } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  const demo = showDemoLogins()
    ? teamUsers().map((u) => ({ email: u.email, role: u.role, password: u.password }))
    : [];

  return <LoginForm demoLogins={demo} next={searchParams.next || "/team"} />;
}
