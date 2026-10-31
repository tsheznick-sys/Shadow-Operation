import "./globals.css";
export const metadata = {
  title: "JARVIS — Shadow 3-Man Self + Squad Brain",
  description: "Self 3-man Content G4 + Social Buffer one-app + Admin whole + Squad hybrid — TubeGen 30m→OpusClip→Higgsfield→Claude Max→Buffer Team→Chatfuel 24/7 n8n embedded",
  manifest: "/manifest.json",
  themeColor: "#14b8a6"
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0f] text-white min-h-screen antialiased">
        <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur border-b border-zinc-800">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-purple-600 flex items-center justify-center text-sm font-black">J</div>
              <div>
                <div className="font-bold leading-none">JARVIS <span className="text-zinc-500 font-normal">— Shadow Brain</span></div>
                <div className="text-xs text-zinc-500">Sir, 1,462 GREEN • 5 pages YT brands • Churn 1.2% lock</div>
              </div>
            </div>
            <nav className="flex gap-2 text-sm flex-wrap justify-end">
              <a href="/" className="px-3 py-1.5 rounded-full bg-white text-black font-semibold">Pipeline</a>
              <a href="/drafts" className="px-3 py-1.5 rounded-full bg-zinc-800">Drafts</a>
              <a href="/omar" className="px-3 py-1.5 rounded-full bg-zinc-800">Omar 1%+25</a>
              <a href="/jarvis" className="px-3 py-1.5 rounded-full bg-zinc-800">Chat+Mic</a>
              <a href="/retention" className="px-3 py-1.5 rounded-full bg-white text-black font-bold">Churn 1-2%</a>
              <a href="/pods" className="px-3 py-1.5 rounded-full bg-teal-500 text-black font-bold">Pods 1.1%</a>
              <a href="/bros" className="px-3 py-1.5 rounded-full bg-zinc-800">Bros 3</a>
              <a href="/n8n" className="px-3 py-1.5 rounded-full bg-teal-500 text-black font-bold">n8n 6/day</a>
              <a href="/team" className="px-3 py-1.5 rounded-full bg-zinc-800">Team 3</a>
              <a href="/money" className="px-3 py-1.5 rounded-full bg-zinc-800">Funding</a>
              <a href="/autonomy" className="px-3 py-1.5 rounded-full bg-zinc-800">Autonomy</a>
              <a href="/login" className="px-3 py-1.5 rounded-full border border-zinc-700">Sign in</a>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        <footer className="max-w-6xl mx-auto px-4 py-8 text-xs text-zinc-600 border-t border-zinc-900 mt-8">
          Self 3-man + Squad hybrid • TubeGen 30m→OpusClip→Higgsfield per-clip→Claude Max SEO→Buffer Team unlimited → Vercel embeds n8n+Buffer+Chatfuel one-app 24/7 • Entitlement wired lib/entitlement.ts • 5 pages = 5 YT brands (its TT+IG+Shorts) • Churn 1.2% System+Agent+Proof
        </footer>
      </body>
    </html>
  );
}
