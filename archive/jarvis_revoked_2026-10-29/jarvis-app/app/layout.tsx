import "./globals.css";
export const metadata = {
  title: "JARVIS — Shadow Operation Brain",
  description: "Squad 3-5 bros • Chat-first • Vercel Cloud • Full auto to Whop • Human swipe for money",
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
                <div className="text-xs text-zinc-500">Sir, 1,462 GREEN • 200/200 LIVE • Cloud-only v1</div>
              </div>
            </div>
            <nav className="flex gap-2 text-sm">
              <a href="/" className="px-3 py-1.5 rounded-full bg-white text-black font-semibold">Pipeline</a>
              <a href="/drafts" className="px-3 py-1.5 rounded-full bg-zinc-800">Drafts</a>
              <a href="/omar" className="px-3 py-1.5 rounded-full bg-zinc-800">Omar Tracker</a>
              <a href="/jarvis" className="px-3 py-1.5 rounded-full bg-zinc-800">Chat + Mic</a>
              <a href="/bros" className="px-3 py-1.5 rounded-full bg-zinc-800">Bros</a>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        <footer className="max-w-6xl mx-auto px-4 py-8 text-xs text-zinc-600 border-t border-zinc-900 mt-8">
          Cloud-only v1 • Vercel + Neon free • Google OAuth • Strict 0%550 • Forever memory • Hosted & connected • Agent primarily
        </footer>
      </body>
    </html>
  );
}
