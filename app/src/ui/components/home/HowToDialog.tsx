import { useEffect } from 'react';
import { useI18n } from '../I18nProvider';
import '../../styles/components/home/HowToDialog.css';

type Props = { onClose: () => void };

export function HowToDialog({ onClose }: Props) {
  const { t } = useI18n();
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="bd-how-veil" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="bd-how-box" role="dialog" aria-modal="true" aria-labelledby="bd-how-title">
        <span className="bd-how-tape" aria-hidden="true" />
        <header>
          <div className="bd-how-kicker">{t('how.kicker')}</div>
          <h2 id="bd-how-title">{t('how.title')}</h2>
        </header>

        <div className="bd-how-guide">
          <p>{t('how.intro')}</p>
          <div className="bd-how-command">{t('how.command')}</div>
          <p>{t('how.outro')}</p>
        </div>

        <div className="bd-how-actions">
          <button className="is-main" onClick={onClose}>{t('how.ok')}</button>
        </div>
      </section>
    </div>
  );
}
