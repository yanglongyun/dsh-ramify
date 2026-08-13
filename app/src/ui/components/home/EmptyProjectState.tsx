import '../../styles/components/home/EmptyProjectState.css';
import { useI18n } from '../I18nProvider';
import type { MessageKey } from '../../lib/i18n';

const EXAMPLES = [
  ['empty.landingTitle', 'empty.landingMemo', 'flower'],
  ['empty.documentTitle', 'empty.documentMemo', 'document'],
  ['empty.logoTitle', 'empty.logoMemo', 'logo'],
  ['empty.anythingTitle', 'empty.anythingMemo', 'sprout'],
] as const satisfies readonly [MessageKey, MessageKey, string][];

export function EmptyProjectState() {
  const { t } = useI18n();
  return (
    <section className="bd-empty-state" aria-label={t('empty.aria')}>
      <div className="bd-empty-grid">
        {EXAMPLES.map(([title, memo, icon]) => (
          <article key={title} className="bd-ghost-card">
            <span className="bd-ghost-pinhole" />
            <div className={`bd-ghost-shot is-${icon}`} aria-hidden="true"><i /><i /><i /></div>
            <h3>{t(title)}</h3>
            <div className="bd-ghost-memo">{t(memo)}</div>
          </article>
        ))}
      </div>
      <div className="bd-empty-note">{t('empty.noteBefore')}<b>{t('empty.noteStrong')}</b>{t('empty.noteAfter')}</div>
    </section>
  );
}
