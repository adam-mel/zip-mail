import { useState } from 'react';
import { ArrowRight, CheckCircle2, Clock3, LoaderCircle, LockKeyhole, Mail, MailPlus, ShieldCheck } from 'lucide-react';
import { useLocation } from 'wouter';
import { useCreateSession } from '@workspace/api-client-react';
import { AppShell } from '@/components/mail-ui';
import { useI18n } from '@/lib/i18n';

function LandingDurationPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const { t } = useI18n();
  const options = [
    { value: 3600, label: t.oneHour },
    { value: 21600, label: t.sixHours },
    { value: 86400, label: t.oneDay },
    { value: 259200, label: t.threeDays },
    { value: 604800, label: t.sevenDays },
  ];

  return (
    <div className="quietbox-duration-grid" role="radiogroup" aria-label={t.chooseExpiry}>
      {options.map((option, index) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`quietbox-duration-option ${selected ? 'is-selected' : ''}`}
            role="radio"
            aria-checked={selected}
            data-testid={`button-duration-${option.value}`}
          >
            <span className="quietbox-index">{String(index + 1).padStart(2, '0')}</span>
            <span className="quietbox-duration-label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function PrivacyLine({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="quietbox-privacy-line">
      <span>{icon}</span>
      <span>{children}</span>
    </div>
  );
}

export default function Home() {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const [duration, setDuration] = useState(86400);
  const createSession = useCreateSession();

  const submit = () => {
    createSession.mutate({ data: { durationSeconds: duration } }, {
      onSuccess: (session) => setLocation(`/inbox/${session.sessionId}`),
    });
  };

  return (
    <AppShell>
      <section className="quietbox-home-grid">
        <div className="quietbox-home-copy animate-rise">
          <div className="quietbox-eyebrow">
            <span />
            {t.secure}
          </div>
          <h1>{t.createTitle}</h1>
          <p className="quietbox-home-description">{t.createBody}</p>
          <div className="quietbox-home-note">
            <span className="quietbox-note-icon"><Mail size={15} strokeWidth={1.8} /></span>
            <span>{t.noTracking}. {t.privacyNote.split('.')[0]}.</span>
          </div>
        </div>

        <div className="quietbox-create-wrap animate-rise animate-rise-delay-2">
          <section className="quietbox-create-panel" aria-labelledby="create-inbox-title">
            <div className="quietbox-panel-heading">
              <div>
                <div className="quietbox-panel-kicker"><span /> {t.inboxReady}</div>
                <h2 id="create-inbox-title">{t.createButton}</h2>
                <p>{t.chooseExpiry}</p>
              </div>
              <span className="quietbox-panel-icon"><Clock3 size={20} strokeWidth={1.7} /></span>
            </div>

            <div className="quietbox-picker-wrap">
              <LandingDurationPicker value={duration} onChange={setDuration} />
            </div>

            <button
              type="button"
              onClick={submit}
              disabled={createSession.isPending}
              className="quietbox-submit"
              data-testid="button-create-inbox"
            >
              {createSession.isPending ? <><LoaderCircle size={16} className="animate-spin" />{t.creating}</> : <>{t.createButton}<ArrowRight size={16} /></>}
            </button>

            {createSession.isError && <p className="quietbox-create-error" data-testid="status-create-error">{t.loadError}</p>}

            <div className="quietbox-privacy">
              <PrivacyLine icon={<LockKeyhole size={15} />}>{t.noTracking}</PrivacyLine>
              <PrivacyLine icon={<ShieldCheck size={15} />}>{t.privacyNote}</PrivacyLine>
            </div>
          </section>
        </div>
      </section>

       <section className="quietbox-promise" aria-label={t.privacyNote}>
         <div className="quietbox-promise-label">ZipMail / {t.secure}</div>
        <p>{t.privacyNote}</p>
        <p className="quietbox-promise-secondary">{t.footer}</p>
      </section>

       <section className="quietbox-steps" aria-label="How ZipMail works">
        <div><span>01 /</span><strong>{t.createButton}</strong></div>
        <div><span>02 /</span><strong>{t.chooseExpiry}</strong></div>
        <div><span>03 /</span><strong>{t.archive}</strong></div>
        <div className="quietbox-step-mark"><CheckCircle2 size={16} /> {t.secure}</div>
      </section>
    </AppShell>
  );
}