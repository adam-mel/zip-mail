import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, FileText, Inbox, MailOpen, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useParams } from 'wouter';
import { getGetMessageQueryKey, getGetSessionQueryKey, getListMessagesQueryKey, useGetMessage, useGetSession, useListMessages, useRotateSession } from '@workspace/api-client-react';
import { ActionButton, AddressCard, AppShell, EmptyState, InboxError, InboxHeaderActions, MessageDetailSkeleton, MessageListSkeleton, MessageRow, RotateDialog, SessionMeta, StatusPill } from '@/components/mail-ui';
import { useI18n } from '@/lib/i18n';

const SESSION_STORAGE_KEY = 'quietbox-session-id';

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'short' }).format(new Date(value));
}

export default function InboxPage() {
  const { t, language } = useI18n();
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId ?? '';
  const [, setLocation] = useLocation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState<'address' | 'link' | null>(null);
  const sessionQuery = useGetSession(sessionId, { query: { enabled: !!sessionId, queryKey: getGetSessionQueryKey(sessionId) } });
  const session = sessionQuery.data;
  const messagesQuery = useListMessages(sessionId, { query: { enabled: !!sessionId && session?.status !== 'deleted', queryKey: getListMessagesQueryKey(sessionId) } });
  const messages = useMemo(() => messagesQuery.data ?? [], [messagesQuery.data]);
  const activeId = selectedId && messages.some((item) => item.id === selectedId) ? selectedId : (messages[0]?.id ?? null);
  const detailQuery = useGetMessage(sessionId, activeId ?? '', { query: { enabled: !!sessionId && !!activeId && session?.status !== 'deleted', queryKey: getGetMessageQueryKey(sessionId, activeId ?? '') } });
  const rotateSession = useRotateSession();

  useEffect(() => {
    if (session?.status === 'active') window.localStorage.setItem(SESSION_STORAGE_KEY, session.sessionId);
  }, [session]);

  const copy = async (value: string, kind: 'address' | 'link') => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const input = document.createElement('textarea');
      input.value = value;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1800);
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: t.brand, text: session?.address, url });
    else await copy(url, 'link');
  };

  const rotate = (duration: number) => {
    rotateSession.mutate({ sessionId, data: { durationSeconds: duration } }, {
      onSuccess: (next) => {
        window.localStorage.setItem(SESSION_STORAGE_KEY, next.sessionId);
        setDialogOpen(false);
        setLocation(`/inbox/${next.sessionId}`);
      },
    });
  };

  if (sessionQuery.isLoading) return <AppShell><div className="mx-auto max-w-[1240px] px-5 pb-20 pt-14 sm:px-8 lg:px-10"><div className="skeleton h-4 w-24 rounded" /><div className="skeleton mt-5 h-12 w-2/3 max-w-xl rounded-xl" /><div className="skeleton mt-4 h-5 w-full max-w-lg rounded" /><div className="mt-10 grid gap-5 lg:grid-cols-[.75fr_1.25fr]"><div className="skeleton h-32 rounded-2xl" /><div className="skeleton h-32 rounded-2xl" /></div></div></AppShell>;
  if (sessionQuery.isError || !session) return <AppShell><InboxError onRetry={() => sessionQuery.refetch()} /></AppShell>;

  const isDeleted = session.status === 'deleted';
  const isArchived = session.status === 'archived';
  const selectedMessage = detailQuery.data;
  return (
    <AppShell>
      <div className="quietbox-inbox-page mx-auto w-full max-w-[1240px] px-5 pb-16 pt-5 sm:px-8 lg:px-10 lg:pt-8">
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="animate-rise"><Link href="/" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]" data-testid="link-back-home"><ArrowLeft size={14} />{t.createAnother}</Link><div className="flex flex-wrap items-center gap-3"><h1 className="text-[clamp(1.9rem,4vw,3.1rem)] font-extrabold tracking-[-0.065em]" data-testid="text-inbox-heading">{t.inboxReady}</h1><StatusPill status={session.status} /></div><p className="mt-2 max-w-2xl text-sm text-[hsl(var(--muted-foreground))]">{isDeleted ? t.deletedBody : isArchived ? t.archivedBody : t.waiting}</p></div>
          <div className="animate-rise animate-rise-delay-1"><InboxHeaderActions onRefresh={() => { void messagesQuery.refetch(); void sessionQuery.refetch(); }} refreshing={messagesQuery.isFetching} onRotate={() => setDialogOpen(true)} status={session.status} /></div>
        </div>

        <AddressCard session={session} onCopy={() => copy(session.address, 'address')} onShare={share} copied={copied} />
        <div className="quietbox-session-meta mt-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.55)] p-4 sm:p-5"><SessionMeta session={session} /></div>

        <div className="quietbox-mail-workspace mt-6 grid overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm lg:grid-cols-[minmax(260px,360px)_1fr]">
          <section className="quietbox-mail-list border-b border-[hsl(var(--border))] lg:border-b-0 lg:border-r" aria-label={t.inbox}>
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-4"><div className="flex items-center gap-2"><Inbox size={16} className="text-[hsl(var(--primary))]" /><h2 className="text-sm font-bold">{t.inbox}</h2><span className="rounded-full bg-[hsl(var(--secondary))] px-2 py-0.5 font-mono text-[10px] text-[hsl(var(--muted-foreground))]" data-testid="text-message-count">{messages.length}</span></div>{isArchived && <span className="font-mono text-[9px] uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]">{t.readOnly}</span>}</div>
            {isDeleted ? <EmptyState archived /> : messagesQuery.isLoading ? <MessageListSkeleton /> : messagesQuery.isError ? <InboxError onRetry={() => messagesQuery.refetch()} /> : messages.length === 0 ? <EmptyState archived={isArchived} /> : <div>{messages.map((message) => <MessageRow key={message.id} message={message} selected={message.id === activeId} onClick={() => setSelectedId(message.id)} />)}</div>}
          </section>
          <section className="quietbox-mail-detail min-h-[390px] bg-[hsl(var(--card)/.6)]" aria-label={t.message}>
            {isDeleted ? <div className="flex min-h-[390px] flex-col items-center justify-center px-8 text-center"><ShieldCheck size={23} className="text-[hsl(var(--muted-foreground))]" /><p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">{t.deletedTitle}</p></div> : !activeId ? <div className="flex min-h-[390px] flex-col items-center justify-center px-8 text-center"><MailOpen size={25} className="text-[hsl(var(--muted-foreground))]" /><p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">{t.selectMessage}</p></div> : detailQuery.isLoading ? <MessageDetailSkeleton /> : detailQuery.isError ? <InboxError onRetry={() => detailQuery.refetch()} /> : selectedMessage ? <article className="animate-rise p-6 sm:p-8" data-testid={`article-message-${selectedMessage.id}`}><div className="flex items-start justify-between gap-4"><div><h2 className="max-w-2xl text-xl font-bold leading-snug tracking-[-0.035em] sm:text-2xl" data-testid="text-message-subject">{selectedMessage.subject || '(no subject)'}</h2><p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]"><span className="font-medium text-[hsl(var(--foreground))]">{selectedMessage.senderName || selectedMessage.senderAddress}</span> <span className="mx-1">·</span> {selectedMessage.senderAddress}</p></div><span className="shrink-0 font-mono text-[10px] text-[hsl(var(--muted-foreground))]">{formatDate(selectedMessage.receivedAt, language)}</span></div><div className="my-7 flex items-center gap-2 border-y border-[hsl(var(--border))] py-3 font-mono text-[10px] uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]"><FileText size={14} />{t.received} {formatDate(selectedMessage.receivedAt, language)}</div><div className="prose prose-sm max-w-none whitespace-pre-wrap leading-7 text-[hsl(var(--foreground))]" data-testid="text-message-body">{selectedMessage.textBody}</div>{selectedMessage.htmlBody && <details className="mt-8 rounded-xl border border-[hsl(var(--border))] p-4"><summary className="cursor-pointer text-xs font-bold text-[hsl(var(--primary))]" data-testid="button-toggle-rich-view">{t.htmlVersion}</summary><iframe title={t.htmlVersion} srcDoc={selectedMessage.htmlBody} sandbox="" className="mt-4 h-80 w-full rounded-lg border border-[hsl(var(--border))] bg-white" data-testid="frame-message-html" /></details>}</article> : null}
          </section>
        </div>
      </div>
      <RotateDialog open={dialogOpen} pending={rotateSession.isPending} onClose={() => setDialogOpen(false)} onRotate={rotate} />
    </AppShell>
  );
}
