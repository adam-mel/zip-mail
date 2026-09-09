import { useState, type ReactNode } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Languages,
  LoaderCircle,
  LockKeyhole,
  MailPlus,
  ShieldCheck,
} from "lucide-react";
import "./_group.css";

const copy = {
  brand: "Quietbox",
  brandTag: "temporary mail, quietly",
  language: "Language",
  secure: "Private by default",
  createTitle: "A private address, on your terms.",
  createBody:
    "Get a working inbox in one click. Choose how long it stays, then let it disappear when you are done.",
  createButton: "Create private inbox",
  chooseExpiry: "Keep it for",
  privacyNote:
    "No account. No marketing trail. Your inbox is only as temporary as you decide.",
  noTracking: "No account required",
  footer: "A small utility for moments that need a little privacy.",
  oneHour: "1 hour",
  sixHours: "6 hours",
  oneDay: "24 hours",
  threeDays: "3 days",
  sevenDays: "7 days",
};

function BrandMark() {
  return (
    <a href="#" className="group inline-flex items-center gap-3" aria-label="Quietbox home">
      <span className="relative grid size-9 place-items-center rounded-xl bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] shadow-sm transition-transform duration-300 group-hover:-rotate-6">
        <ShieldCheck size={19} strokeWidth={2.2} />
      </span>
      <span className="leading-none">
        <span className="block font-semibold tracking-[-0.03em] text-[hsl(var(--foreground))]">
          {copy.brand}
        </span>
        <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.15em] text-[hsl(var(--muted-foreground))]">
          {copy.brandTag}
        </span>
      </span>
    </a>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState("en");
  return (
    <div className="quietbox-home noise min-h-[100dvh] bg-[hsl(var(--background))]">
      <header className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <BrandMark />
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 text-[10px] font-mono uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))] sm:flex">
            <span className="pulse-dot size-1.5 rounded-full bg-[hsl(var(--primary))]" />
            {copy.secure}
          </div>
          <label className="inline-flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
            <Languages size={15} />
            <span className="sr-only">{copy.language}</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="cursor-pointer appearance-none bg-transparent py-1 pr-1 font-medium text-[hsl(var(--foreground))] outline-none"
              aria-label={copy.language}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="pt">Português</option>
              <option value="de">Deutsch</option>
            </select>
            <ChevronDown size={13} className="-ml-1" />
          </label>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-5 py-8 text-xs text-[hsl(var(--muted-foreground))] sm:px-8 lg:px-10">
        <span>{copy.footer}</span>
        <span className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] sm:flex">
          <ShieldCheck size={13} /> {copy.secure}
        </span>
      </footer>
    </div>
  );
}

function DurationPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const options = [
    [3600, copy.oneHour],
    [21600, copy.sixHours],
    [86400, copy.oneDay],
    [259200, copy.threeDays],
    [604800, copy.sevenDays],
  ] as const;
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" role="radiogroup" aria-label={copy.chooseExpiry}>
      {options.map(([optionValue, label]) => (
        <button
          key={optionValue}
          type="button"
          onClick={() => onChange(optionValue)}
          className={`rounded-xl border px-3 py-3 text-left transition-all duration-200 ${
            value === optionValue
              ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.09)] text-[hsl(var(--primary))] shadow-sm"
              : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/.35)]"
          }`}
          role="radio"
          aria-checked={value === optionValue}
        >
          <span className="block font-mono text-[10px] uppercase tracking-[0.08em]">
            {value === optionValue ? "Selected" : "Until"}
          </span>
          <span className="mt-1 block text-sm font-semibold">{label}</span>
        </button>
      ))}
    </div>
  );
}

function ActionButton({ children, onClick, disabled = false }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-55"
    >
      {children}
    </button>
  );
}

export default function Current() {
  const [duration, setDuration] = useState(86400);
  const [creating, setCreating] = useState(false);
  const submit = () => {
    setCreating(true);
    window.setTimeout(() => setCreating(false), 700);
  };

  return (
    <AppShell>
      <section className="mx-auto grid w-full max-w-[1240px] gap-10 px-5 pb-14 pt-8 sm:px-8 sm:pt-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-20 lg:px-10 lg:pb-24 lg:pt-20">
        <div className="animate-rise self-center">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary)/.2)] bg-[hsl(var(--primary)/.06)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[hsl(var(--primary))]">
            <span className="pulse-dot size-1.5 rounded-full bg-current" />
            {copy.secure}
          </div>
          <h1 className="max-w-xl text-[clamp(2.8rem,7vw,5.8rem)] font-extrabold leading-[.98] tracking-[-0.075em] text-[hsl(var(--foreground))]">
            {copy.createTitle}
          </h1>
          <p className="mt-7 max-w-lg text-base leading-7 text-[hsl(var(--muted-foreground))] sm:text-lg">
            {copy.createBody}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-[hsl(var(--muted-foreground))]">
            <span className="inline-flex items-center gap-2"><LockKeyhole size={15} className="text-[hsl(var(--primary))]" />{copy.noTracking}</span>
            <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-[hsl(var(--primary))]" />{copy.privacyNote.split(".")[0]}</span>
          </div>
        </div>
        <div className="animate-rise animate-rise-delay-2 relative">
          <div className="absolute -inset-3 rounded-[2rem] bg-[hsl(var(--accent)/.14)] blur-2xl" />
          <div className="relative rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-lg sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <span className="grid size-11 place-items-center rounded-xl bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]"><MailPlus size={22} /></span>
                <h2 className="mt-5 text-xl font-bold tracking-[-0.04em]">{copy.createButton}</h2>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{copy.chooseExpiry}</p>
              </div>
              <Clock3 size={20} className="text-[hsl(var(--muted-foreground))]" />
            </div>
            <div className="mt-6"><DurationPicker value={duration} onChange={setDuration} /></div>
            <ActionButton onClick={submit} disabled={creating}>
              {creating ? <><LoaderCircle size={16} className="animate-spin" />Creating inbox</> : <>{copy.createButton}<ArrowRight size={16} /></>}
            </ActionButton>
            <p className="mt-4 text-center font-mono text-[10px] leading-5 text-[hsl(var(--muted-foreground))]">{copy.privacyNote}</p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}