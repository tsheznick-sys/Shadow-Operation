import { TABS } from "@/lib/panel";

export function PanelTabs({ active }: { active: string }) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {TABS.map((t) => (
        <a
          key={t.key}
          href={t.href}
          className={
            "rounded-full px-3 py-1.5 text-xs font-bold " +
            (t.key === active ? "bg-orange-400 text-black" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800")
          }
          title={t.question}
        >
          {t.label}
        </a>
      ))}
    </div>
  );
}
