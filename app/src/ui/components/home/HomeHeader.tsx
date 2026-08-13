import { useMemo } from 'react';
import { randomPlant } from '../Plants';
import { useI18n } from '../I18nProvider';
import type { MessageKey } from '../../lib/i18n';
import '../../styles/components/home/HomeHeader.css';

function greeting(): MessageKey {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();

  if (minutes >= 30 && minutes < 5 * 60) return 'greeting.late';
  if (minutes >= 5 * 60 && minutes < 9 * 60) return 'greeting.early';
  if (minutes >= 9 * 60 && minutes < 12 * 60) return 'greeting.morning';
  if (minutes >= 12 * 60 && minutes < 18 * 60) return 'greeting.afternoon';
  return 'greeting.evening';
}

export function HomeHeader() {
  const { t } = useI18n();
  const plant = useMemo(() => randomPlant(), []);
  return (
    <header className="bd-head">
      <div className="bd-plant" title={t(plant.nameKey)} dangerouslySetInnerHTML={{ __html: plant.svg }} />
      <h1 className="bd-greet">{t(greeting())}</h1>
    </header>
  );
}
