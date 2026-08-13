import '../styles/components/CountPicker.css';
import { useI18n } from './I18nProvider';

// 一次发散几个变体(1–5)。
export function CountPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const { t } = useI18n();
  return (
    <div className="cb-count-picker" title={t('dsh.countAria')}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button type="button" key={n} className={value === n ? 'is-selected' : ''} onClick={() => onChange(n)}>{n}</button>
      ))}
    </div>
  );
}
