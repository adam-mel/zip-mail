import { useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Languages,
  LockKeyhole,
  Mail,
  MailOpen,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import "./_redesign.css";

const copy = {
  brand: "Quietbox",
  brandTag: "temporary mail, quietly",
  language: "Language",
  secure: "Private by default",
  eyebrow: "A small, private utility",
  createTitle: "An address that knows when to leave.",
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

type DurationOption = {
  seconds: number;
  label: string;
  detail: string;
};

const durationOptions: DurationOption[] = [
  { seconds: 3600, label: copy.oneHour, detail: "A quick errand" },
  { seconds: 21600, label: copy.sixHours, detail: "An afternoon" },
  { seconds: 86400, label: copy.oneDay, detail: "One day" },
  { seconds: 259200, label: copy.threeDays, detail: "A long weekend" },
  { seconds: 604800, label: copy.sevenDays, detail: "A full week" },
];

function BrandMark() {
  return (
    <button
      type="button"
      className="qb-focus group inline-flex items-center gap-3 text-left"
      aria-label="Quietbox home"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <span className="relative grid size-10 place-items-center border border-[hsl(var(--qb-ink))] bg-[hsl(var(--qb-red))] text-[hsl(var(--qb-white))] shadow-[3px_3px_0_hsl(var(--qb-ink))] transition-transform duration-200 group-hover:-rotate-3">
        <span className="absolute inset-[5px] border border-[hsl(var(--qb-white)/.55)]" />
        <ShieldCheck size={18} strokeWidth={2.1} />
      </span>
      <span className="leading-none">
        <span className="block text-[15px] font-bold tracking-[-0.04em]">{copy.brand}</span>
        <span className="qb-mono mt-1.5 block text-[8px] uppercase tracking-[0.16em] text-[hsl(var(--qb-ink-soft))]">
          {copy.brandTag}
        </span>
      </span>
    </button>
  );
}

function DurationPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="sr-only">{copy.chooseExpiry}</legend>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {durationOptions.map((option, index) => {
          const selected = value === option.seconds;
          return (
            <label
              key={option.seconds}
              className={`qb-option relative cursor-pointer border p-3 ${
                selected
                  ? "border-[hsl(var(--qb-ink))] bg-[hsl(var(--qb-ink))] text-[hsl(var(--qb-white))] shadow-[3px_3px_0_hsl(var(--qb-red))]"
                  : "border-[hsl(var(--qb-line))] bg-[hsl(var(--qb-white)/.52)] text-[hsl(var(--qb-ink-soft))] hover:border-[hsl(var(--qb-ink)/.65)]"
              }`}
            >
              <input
                type="radio"
                name="quietbox-duration"
                value={option.seconds}
                checked={selected}
                onChange={() => onChange(option.seconds)}
                className="sr-only"
              />
              <span className="qb-mono block text-[9px] uppercase tracking-[.12em] opacity-70">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mt-2 block text-sm font-bold tracking-[-.03em]">{option.label}</span>
              <span className="mt-1 block text-[10px] leading-4 opacity-70">{option.detail}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function PrivacyLine({ children, icon }: { children: ReactNode; icon: ReactNode }) {
  return (
    <div className="flex items-start gap-3 border-t border-[hsl(var(--qb-line)/.75)] py-3.5 text-[12px] leading-5 text-[hsl(var(--qb-ink-soft))]">
      <span className="mt-0.5 text-[hsl(var(--qb-red))]">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

function CreatePanel({
  duration,
  onDurationChange,
  created,
  creating,
  onCreate,
  onReset,
}: {
  duration: number;
  onDurationChange: (value: number) => void;
  created: boolean;
  creating: boolean;
  onCreate: () => void;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const address = "cloud-otter@quietbox.email";

  const copyAddress = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  if (created) {
    return (
      <section className="qb-entrance relative border-2 border-[hsl(var(--qb-ink))] bg-[hsl(var(--qb-white))] p-5 shadow-[7px_7px_0_hsl(var(--qb-ink))] sm:p-7" aria-live="polite">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 bg-[hsl(var(--qb-sky)/.58)] px-2 py-1 qb-mono text-[9px] uppercase tracking-[.12em] text-[hsl(var(--qb-ink))]">
              <Check size={12} strokeWidth={2.5} /> Ready to receive
            </div>
            <h2 className="qb-display text-[2.5rem] leading-[.94] sm:text-[3rem]">Your quiet corner.</h2>
          </div>
          <span className="grid size-11 shrink-0 place-items-center border border-[hsl(var(--qb-line))] text-[hsl(var(--qb-red))]">
            <MailOpen size={20} strokeWidth={1.7} />
          </span>
        </div>
        <div className="mt-7 border-y border-[hsl(var(--qb-line))] py-4">
          <p className="qb-mono text-[9px] uppercase tracking-[.12em] text-[hsl(var(--qb-ink-soft))]">Private address</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm font-bold tracking-[-.03em] text-[hsl(var(--qb-ink))]">{address}</p>
            <button
              type="button"
              onClick={copyAddress}
              className="qb-focus inline-flex shrink-0 items-center gap-1.5 text-[11px] font-bold text-[hsl(var(--qb-red-dark))]"
              aria-label="Copy private address"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
        <p className="mt-5 text-[12px] leading-5 text-[hsl(var(--qb-ink-soft))]">
          This inbox will disappear in {durationOptions.find((item) => item.seconds === duration)?.label.toLowerCase() ?? "24 hours"}. No account to close later.
        </p>
        <button type="button" onClick={() => undefined} className="qb-ink-button qb-focus mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[hsl(var(--qb-red))] px-4 text-sm font-bold text-[hsl(var(--qb-white))] shadow-[3px_3px_0_hsl(var(--qb-ink))]">
          Open private inbox <ArrowRight size={16} />
        </button>
        <button type="button" onClick={onReset} className="qb-focus mt-5 inline-flex w-full items-center justify-center gap-2 text-[11px] font-bold text-[hsl(var(--qb-ink-soft))]">
          <RotateCcw size={13} /> Make another address
        </button>
      </section>
    );
  }

  return (
    <section className="qb-entrance relative border-2 border-[hsl(var(--qb-ink))] bg-[hsl(var(--qb-white))] p-5 shadow-[7px_7px_0_hsl(var(--qb-ink))] sm:p-7">
      <div className="flex items-start justify-between gap-5">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 qb-mono text-[9px] uppercase tracking-[.13em] text-[hsl(var(--qb-red-dark))]">
            <span className="size-2 bg-[hsl(var(--qb-red))]" /> Start here
          </div>
          <h2 className="qb-display text-[2.6rem] leading-[.92] sm:text-[3.2rem]">A fresh inbox.</h2>
          <p className="mt-3 max-w-xs text-[13px] leading-5 text-[hsl(var(--qb-ink-soft))]">{copy.chooseExpiry}</p>
        </div>
        <span className="grid size-11 shrink-0 place-items-center border border-[hsl(var(--qb-line))] text-[hsl(var(--qb-red))]">
          <Clock3 size={20} strokeWidth={1.7} />
        </span>
      </div>
      <div className="mt-7">
        <DurationPicker value={duration} onChange={onDurationChange} />
      </div>
      <button
        type="button"
        onClick={onCreate}
        disabled={creating}
        className="qb-ink-button qb-focus mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[hsl(var(--qb-ink))] px-4 text-sm font-bold text-[hsl(var(--qb-white))] shadow-[3px_3px_0_hsl(var(--qb-red))] disabled:cursor-wait disabled:opacity-70"
      >
        {creating ? "Making a quiet place…" : copy.createButton}
        {!creating && <ArrowRight size={16} />}
      </button>
      <div className="mt-6">
        <PrivacyLine icon={<LockKeyhole size={15} />}>{copy.noTracking}</PrivacyLine>
        <PrivacyLine icon={<ShieldCheck size={15} />}>{copy.privacyNote}</PrivacyLine>
      </div>
    </section>
  );
}

export function Redesign() {
  const [language, setLanguage] = useState("en");
  const [duration, setDuration] = useState(86400);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const submit = () => {
    setCreating(true);
    window.setTimeout(() => {
      setCreating(false);
      setCreated(true);
    }, 650);
  };

  const reset = () => {
    setCreated(false);
    setCreating(false);
  };

  return (
    <div className="quietbox-redesign min-h-[100dvh]">
      <header className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-5 py-5 sm:px-8 sm:py-7 lg:px-10">
        <BrandMark />
        <div className="flex items-center gap-5">
          <div className="hidden items-center gap-2 qb-mono text-[9px] uppercase tracking-[.14em] text-[hsl(var(--qb-ink-soft))] sm:flex">
            <span className="size-2 bg-[hsl(var(--qb-red))]" />
            {copy.secure}
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--qb-ink-soft))]">
            <Languages size={15} strokeWidth={1.8} />
            <span className="sr-only">{copy.language}</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="qb-focus cursor-pointer appearance-none bg-transparent py-1 pr-1 text-[hsl(var(--qb-ink))] outline-none"
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

      <main className="mx-auto w-full max-w-[1180px] px-5 pb-16 sm:px-8 lg:px-10">
        <section className="grid gap-12 pb-20 pt-12 sm:pt-20 lg:grid-cols-[1fr_450px] lg:gap-20 lg:pb-28 lg:pt-24">
          <div className="qb-entrance self-center">
            <div className="mb-7 flex items-center gap-3 qb-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--qb-red-dark))]">
              <span className="h-px w-8 bg-[hsl(var(--qb-red))]" />
              {copy.eyebrow}
            </div>
            <h1 className="qb-display max-w-[680px] text-[clamp(3.5rem,8vw,7.6rem)] leading-[.86]">
              {copy.createTitle}
            </h1>
            <p className="mt-8 max-w-[470px] text-[15px] leading-7 text-[hsl(var(--qb-ink-soft))] sm:text-base">
              {copy.createBody}
            </p>
            <div className="mt-10 flex items-center gap-3 text-[11px] font-bold text-[hsl(var(--qb-ink))]">
              <span className="grid size-7 place-items-center border border-[hsl(var(--qb-line))] bg-[hsl(var(--qb-white)/.55)] text-[hsl(var(--qb-red))]">
                <Mail size={14} strokeWidth={1.8} />
              </span>
              Nothing to remember. Nothing to tidy up.
            </div>
          </div>
          <div className="qb-entrance qb-entrance-delay">
            <CreatePanel
              duration={duration}
              onDurationChange={setDuration}
              created={created}
              creating={creating}
              onCreate={submit}
              onReset={reset}
            />
          </div>
        </section>

        <section className="grid border-y border-[hsl(var(--qb-line))] py-8 sm:grid-cols-[180px_1fr_1fr] sm:gap-10 lg:py-10" aria-label="How Quietbox works">
          <div className="qb-mono text-[9px] uppercase tracking-[.15em] text-[hsl(var(--qb-red-dark))]">The quiet promise</div>
          <p className="mt-4 max-w-md text-[14px] font-bold leading-6 tracking-[-.02em] sm:mt-0">
            Privacy should not require a new password, a profile, or a tour of settings.
          </p>
          <p className="mt-4 max-w-md text-[13px] leading-6 text-[hsl(var(--qb-ink-soft))] sm:mt-0">
            Pick a lifetime. Use the address. When its time is up, the inbox and everything in it are gone.
          </p>
        </section>

        <section className="grid gap-8 py-16 sm:grid-cols-3 sm:gap-10 sm:py-20">
          <div className="qb-entrance qb-entrance-delay-more">
            <span className="qb-mono text-[10px] text-[hsl(var(--qb-red-dark))]">01 / MAKE</span>
            <h2 className="qb-display mt-4 text-[2.5rem] leading-none">One click in.</h2>
            <p className="mt-4 text-[13px] leading-6 text-[hsl(var(--qb-ink-soft))]">No account, no email address of your own, no waiting room.</p>
          </div>
          <div className="qb-entrance qb-entrance-delay-more">
            <span className="qb-mono text-[10px] text-[hsl(var(--qb-red-dark))]">02 / USE</span>
            <h2 className="qb-display mt-4 text-[2.5rem] leading-none">Keep it brief.</h2>
            <p className="mt-4 text-[13px] leading-6 text-[hsl(var(--qb-ink-soft))]">Choose one hour, an afternoon, or up to a week. The clock is yours.</p>
          </div>
          <div className="qb-entrance qb-entrance-delay-more">
            <span className="qb-mono text-[10px] text-[hsl(var(--qb-red-dark))]">03 / LEAVE</span>
            <h2 className="qb-display mt-4 text-[2.5rem] leading-none">No trace left.</h2>
            <p className="mt-4 text-[13px] leading-6 text-[hsl(var(--qb-ink-soft))]">When the lifetime ends, your temporary inbox disappears with it.</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-[hsl(var(--qb-line))]">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-3 px-5 py-7 text-[11px] text-[hsl(var(--qb-ink-soft))] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <span>{copy.footer}</span>
          <span className="qb-mono flex items-center gap-2 text-[9px] uppercase tracking-[.13em]">
            <ShieldCheck size={13} /> Built for less exposure
          </span>
        </div>
      </footer>
    </div>
  );
}

export default Redesign;