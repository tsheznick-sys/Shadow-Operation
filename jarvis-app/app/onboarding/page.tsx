import Wizard from "./wizard";
import { getSession, ROLE_LABEL } from "@/lib/auth";
import { questionsFor, type Role } from "@/lib/interview";

export const dynamic = "force-dynamic";

export default function OnboardingPage() {
  const session = getSession();
  if (!session) return <div className="text-sm text-zinc-500">Sign in to start your interview.</div>;

  const role = session.role as Role;
  const questions = questionsFor(role);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Your interview</h1>
      <p className="text-sm text-zinc-500 mb-6 max-w-3xl">
        Jarvis runs the operation from these answers — not from assumptions. Answer in your own words, as specifically as you can.
        Everything saves as a draft; nothing is sent anywhere until you finish.
      </p>
      <Wizard role={role} roleLabel={ROLE_LABEL[role]} name={session.name} questions={questions} />
    </div>
  );
}
