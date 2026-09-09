import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'wouter';
import { Archive, Check, ChevronDown, Clock3, Copy, ExternalLink, Inbox, Languages, LoaderCircle, Mail, RefreshCw, RotateCcw, Send, Share2, ShieldCheck, Sparkles, X } from 'lucide-react';
import type { MessageSummary, Session, SessionStatus } from '@workspace/api-client-react';
import { useHealthCheck, getHealthCheckQueryKey } from '@workspace/api-client-react';
import { useI18n, type Language } from '@/lib/i18n';

export function BrandMark() {
  const { t } = useI18n();
  return (
    <Link href="/" className="quietbox-brand group inline-flex items-center gap-3" data-testid="link-brand">
      <span className="quietbox-brand-mark relative grid size-9 place-items-center bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] shadow-sm transition-transform duration-300 group-hover:-rotate-6">
        <Mail size={19} strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className="leading-none">
        <span className="block font-semibold tracking-[-0.03em] text-[hsl(var(--foreground))]">{t.brand}</span>
        <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.15em] text-[hsl(var(--muted-foreground))]">{t.brandTag}</span>
      </span>
    </Link>
  );
}

export function LanguageSelect() {
  const { language, setLanguage, t, names } = useI18n();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<Language | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const options: Language[] = ['en', 'fr', 'es', 'pt', 'de'];

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="quietbox-language-select relative" data-testid="control-language">
      <button
        type="button"
        className="quietbox-language-trigger inline-flex items-center gap-2 text-xs font-medium"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.language}
        data-testid="select-language"
      >
        <Languages size={15} aria-hidden="true" />
        <span>{names[language]}</span>
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div className="quietbox-language-menu" role="listbox" aria-label={t.language}>
          {options.map((item) => (
            <button
              key={item}
              type="button"
              role="option"
              aria-selected={language === item}
              className={`quietbox-language-option ${language === item ? 'is-selected' : ''} ${hovered === item ? 'is-hovered' : ''}`}
              onPointerEnter={() => setHovered(item)}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setHovered(item)}
              onBlur={() => setHovered(null)}
              onClick={() => {
                setLanguage(item);
                setHovered(null);
                setOpen(false);
              }}
              data-testid={`option-language-${item}`}
            >
              {names[item]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const health = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), staleTime: 60000, retry: 1 } });
  return (
    <div className="noise quietbox-shell min-h-[100dvh]">
      <header className="quietbox-header mx-auto flex w-full max-w-[1240px] items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <BrandMark />
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 text-[10px] font-mono uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))] sm:flex" data-testid="status-service">
            <span className={`pulse-dot size-1.5 rounded-full ${health.isError ? 'bg-[hsl(var(--destructive))]' : 'bg-[hsl(var(--primary))]'}`} />
            {health.isError ? t.unavailable : t.secure}
          </div>
          <LanguageSelect />
        </div>
      </header>
      <main>{children}</main>
      <footer className="quietbox-footer mx-auto flex w-full max-w-[1240px] items-center justify-between px-5 py-8 text-xs text-[hsl(var(--muted-foreground))] sm:px-8 lg:px-10">
        <span>{t.footer}</span>
        <span className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] sm:flex"><ShieldCheck size={13} /> {t.secure}</span>
      </footer>
    </div>
  );
}

export function ActionButton({ children, onClick, variant = 'primary', disabled = false, testId, type = 'button' }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'quiet' | 'danger'; disabled?: boolean; testId: string; type?: 'button' | 'submit' }) {
  const styles = {
    primary: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm hover:-translate-y-0.5 hover:shadow-md',
    secondary: 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary)/.45)] hover:bg-[hsl(var(--secondary))]',
    quiet: 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]',
    danger: 'border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.06)] text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/.12)]',
  };
  return <button type={type} onClick={onClick} disabled={disabled} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-55 ${styles[variant]}`} data-testid={testId}>{children}</button>;
}

export function DurationPicker({ value, onChange, compact = false }: { value: number; onChange: (value: number) => void; compact?: boolean }) {
  const { t } = useI18n();
  const options = [{ value: 3600, label: t.oneHour }, { value: 21600, label: t.sixHours }, { value: 86400, label: t.oneDay }, { value: 259200, label: t.threeDays }, { value: 604800, label: t.sevenDays }];
  return (
    <div className={`grid grid-cols-2 gap-2 ${compact ? 'sm:grid-cols-5' : 'sm:grid-cols-5'}`} role="radiogroup" aria-label={t.chooseExpiry}>
      {options.map((option) => (
        <button key={option.value} type="button" onClick={() => onChange(option.value)} className={`rounded-xl border px-3 py-3 text-left transition-all duration-200 ${value === option.value ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.09)] text-[hsl(var(--primary))] shadow-sm' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/.35)]'}`} role="radio" aria-checked={value === option.value} data-testid={`button-duration-${option.value}`}>
          <span className="block font-mono text-[10px] uppercase tracking-[0.08em]">{option.value === value ? 'Selected' : 'Until'}</span>
          <span className="mt-1 block text-sm font-semibold">{option.label}</span>
        </button>
      ))}
    </div>
  );
}

export function StatusPill({ status }: { status: SessionStatus }) {
  const { t } = useI18n();
  const copy = status === 'active' ? t.live : status === 'archived' ? t.archive : t.unavailable;
  const style = status === 'active' ? 'bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]' : status === 'archived' ? 'bg-[hsl(var(--accent)/.18)] text-[hsl(34 55% 38%)]' : 'bg-[hsl(var(--destructive)/.1)] text-[hsl(var(--destructive))]';
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] ${style}`} data-testid={`status-session-${status}`}><span className="size-1.5 rounded-full bg-current" />{copy}</span>;
}

export function SessionMeta({ session }: { session: Session }) {
  const { t, language } = useI18n();
  const [remaining, setRemaining] = useState(() => Math.max(0, new Date(session.expiresAt).getTime() - Date.now()));
  useEffect(() => {
    const update = () => setRemaining(Math.max(0, new Date(session.expiresAt).getTime() - Date.now()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [session.expiresAt]);
  const format = (date: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
  const formatRemaining = (milliseconds: number) => {
    const totalMinutes = Math.ceil(milliseconds / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    return days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };
  const remainingLabel = {
    en: 'Expires in',
    fr: 'Expire dans',
    es: 'Caduca en',
    pt: 'Expira em',
    de: 'Läuft ab in',
  }[language];
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4" data-testid="panel-session-meta">
      <div><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">{t.created}</p><p className="mt-1 text-xs font-medium text-[hsl(var(--foreground))]">{format(session.createdAt)}</p></div>
      <div><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">{session.status === 'archived' ? t.archivedUntil : remainingLabel}</p><p className="mt-1 text-xs font-medium text-[hsl(var(--foreground))]">{session.status === 'archived' ? format(session.archiveUntil) : formatRemaining(remaining)}</p></div>
      <div><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">{t.messages}</p><p className="mt-1 text-xs font-medium text-[hsl(var(--foreground))]">{session.messageCount}</p></div>
      <div><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">{t.readOnly}</p><p className="mt-1 text-xs font-medium text-[hsl(var(--foreground))]">{session.status === 'active' ? '—' : 'Yes'}</p></div>
    </div>
  );
}

export function MessageRow({ message, selected, onClick }: { message: MessageSummary; selected: boolean; onClick: () => void }) {
  const when = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(message.receivedAt));
  return (
    <button type="button" onClick={onClick} className={`group w-full border-b border-[hsl(var(--border)/.7)] px-4 py-4 text-left transition-colors duration-200 last:border-0 ${selected ? 'bg-[hsl(var(--primary)/.08)]' : 'hover:bg-[hsl(var(--secondary)/.55)]'}`} data-testid={`button-message-${message.id}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 size-2 shrink-0 rounded-full ${message.isRead ? 'bg-[hsl(var(--border))]' : 'bg-[hsl(var(--accent))]'}`} />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-3"><span className={`truncate text-sm ${message.isRead ? 'font-medium text-[hsl(var(--muted-foreground))]' : 'font-bold text-[hsl(var(--foreground))]'}`}>{message.senderName || message.senderAddress}</span><span className="shrink-0 font-mono text-[10px] text-[hsl(var(--muted-foreground))]">{when}</span></span>
          <span className={`mt-1 block truncate text-xs ${message.isRead ? 'text-[hsl(var(--muted-foreground))]' : 'font-semibold text-[hsl(var(--foreground))]'}`}>{message.subject || '(no subject)'}</span>
          <span className="mt-1 block truncate text-xs text-[hsl(var(--muted-foreground))]">{message.preview}</span>
        </span>
      </div>
    </button>
  );
}

export function MessageListSkeleton() {
  return <div className="space-y-px p-4" aria-label="Loading messages">{[1, 2, 3, 4].map((item) => <div key={item} className="flex gap-3 border-b border-[hsl(var(--border)/.6)] py-4"><span className="skeleton mt-1 size-2 rounded-full" /><div className="flex-1 space-y-2"><div className="skeleton h-3 w-2/5 rounded" /><div className="skeleton h-3 w-3/5 rounded" /><div className="skeleton h-2.5 w-4/5 rounded" /></div></div>)}</div>;
}

export function MessageDetailSkeleton() {
  return <div className="space-y-5 p-6 sm:p-8"><div className="skeleton h-5 w-3/4 rounded" /><div className="skeleton h-3 w-2/5 rounded" /><div className="space-y-3 pt-6"><div className="skeleton h-3 w-full rounded" /><div className="skeleton h-3 w-11/12 rounded" /><div className="skeleton h-3 w-4/5 rounded" /></div></div>;
}

export function EmptyState({ archived = false }: { archived?: boolean }) {
  const { t } = useI18n();
  return <div className="quietbox-empty-state flex min-h-[330px] flex-col items-center justify-center px-8 text-center"><span className="quietbox-empty-icon grid size-14 place-items-center bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><Mail size={24} strokeWidth={1.6} /></span><h3 className="mt-5 text-base font-bold tracking-[-0.02em]">{archived ? t.archivedTitle : t.emptyTitle}</h3><p className="mt-2 max-w-xs text-sm leading-6 text-[hsl(var(--muted-foreground))]">{archived ? t.archivedBody : t.emptyBody}</p>{!archived && <p className="mt-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[hsl(var(--primary))]"><span className="pulse-dot size-1.5 rounded-full bg-current" />{t.waiting}</p>}</div>;
}

export function InboxError({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return <div className="quietbox-error-state flex min-h-[400px] flex-col items-center justify-center px-8 text-center"><span className="grid size-12 place-items-center bg-[hsl(var(--destructive)/.1)] text-[hsl(var(--destructive))]"><X size={22} /></span><h2 className="mt-5 text-base font-bold">{t.loadError}</h2><ActionButton onClick={onRetry} variant="secondary" testId="button-retry-inbox">{t.retry}</ActionButton></div>;
}

export function RotateDialog({ open, pending, onClose, onRotate }: { open: boolean; pending: boolean; onClose: () => void; onRotate: (duration: number) => void }) {
  const { t } = useI18n();
  const [duration, setDuration] = useState(86400);
  if (!open) return null;
  return <div className="fixed inset-0 z-40 grid place-items-center bg-[hsl(var(--foreground)/.35)] px-5 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="rotate-title" data-testid="dialog-rotate"><div className="quietbox-dialog w-full max-w-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-4"><div><span className="mb-4 grid size-10 place-items-center bg-[hsl(var(--accent)/.22)] text-[hsl(var(--accent-foreground))]"><RotateCcw size={18} /></span><h2 id="rotate-title" className="text-xl font-bold tracking-[-0.03em]">{t.rotateTitle}</h2><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{t.rotateBody}</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]" aria-label={t.close} data-testid="button-close-rotate"><X size={18} /></button></div><div className="mt-7"><p className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-[hsl(var(--muted-foreground))]">{t.chooseExpiry}</p><DurationPicker value={duration} onChange={setDuration} compact /></div><div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><ActionButton onClick={onClose} variant="quiet" testId="button-cancel-rotate">{t.cancel}</ActionButton><ActionButton onClick={() => onRotate(duration)} disabled={pending} testId="button-confirm-rotate">{pending ? <><LoaderCircle size={16} className="animate-spin" />{t.rotating}</> : <><RotateCcw size={16} />{t.rotateButton}</>}</ActionButton></div></div></div>;
}

export function AddressCard({ session, onCopy, onShare, copied }: { session: Session; onCopy: () => void; onShare: () => void; copied: 'address' | 'link' | null }) {
  const { t } = useI18n();
  return <div className="quietbox-address-card rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm sm:p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">{t.inbox}</p><p className="mt-1 truncate font-mono text-sm font-medium text-[hsl(var(--foreground))]" data-testid="text-session-address">{session.address}</p></div><div className="flex shrink-0 gap-2"><ActionButton onClick={onCopy} variant="secondary" testId="button-copy-address">{copied === 'address' ? <Check size={15} /> : <Copy size={15} />}{copied === 'address' ? t.copied : t.copyAddress}</ActionButton><ActionButton onClick={onShare} variant="secondary" testId="button-share-inbox"><Share2 size={15} />{t.share}</ActionButton></div></div></div>;
}

export function InboxHeaderActions({ onRefresh, refreshing, onRotate, status }: { onRefresh: () => void; refreshing: boolean; onRotate: () => void; status: SessionStatus }) {
  const { t } = useI18n();
  return <div className="quietbox-header-actions flex flex-wrap items-center gap-2"><ActionButton onClick={onRefresh} variant="quiet" disabled={refreshing || status === 'deleted'} testId="button-refresh-messages">{refreshing ? <LoaderCircle size={15} className="animate-spin" /> : <RefreshCw size={15} />}{refreshing ? t.loading : t.refresh}</ActionButton><ActionButton onClick={onRotate} variant="secondary" testId="button-rotate-inbox"><RotateCcw size={15} />{t.newInbox}</ActionButton></div>;
}
