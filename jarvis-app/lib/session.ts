// SESSION — Google OAuth via next-auth, with the original email+password as fallback.
// Roles are resolved from the env-seeded team list, so Google never gets to invent a seat.
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { teamUsers, type Role, checkPassword } from "./auth";

export function googleEnabled(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function roleFor(email: string): { role: Role; name: string } | null {
  const u = teamUsers().find((x) => x.email === email.toLowerCase());
  return u ? { role: u.role, name: u.name } : null;
}

export const authOptions: NextAuthOptions = {
  providers: [
    ...(googleEnabled()
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Team password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email || "").toLowerCase().trim();
        const password = credentials?.password || "";
        const user = teamUsers().find((u) => u.email === email);
        if (!user || !checkPassword(password, user.password)) return null;
        return { id: user.email, email: user.email, name: user.name };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user }) {
      const email = (user?.email || "").toLowerCase();
      if (!email) return false;
      // Only the three seeded seats may sign in, whatever the provider.
      return Boolean(roleFor(email));
    },
    async jwt({ token, user }) {
      const email = ((user?.email || token.email) as string || "").toLowerCase();
      const seat = roleFor(email);
      if (seat) {
        (token as any).role = seat.role;
        (token as any).seatName = seat.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = (token as any).role;
        (session.user as any).seatName = (token as any).seatName;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "dev-only-shadow-secret-change-me",
};
