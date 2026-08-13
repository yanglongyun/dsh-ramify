import { api } from '../../api';
import type { Project } from '../../types';
import { useI18n } from '../I18nProvider';
import '../../styles/components/home/ProjectCard.css';

function ProjectThumb({ project }: { project: Project }) {
  const { t } = useI18n();
  const previewId = project.preview_node_id ?? null;
  return (
    <div className="bd-shot">
      {(project.generating_count ?? 0) > 0 && <div className="bd-live"><span />{t('project.generating', { count: project.generating_count ?? 0 })}</div>}
      {previewId ? (
        <><iframe src={api.nodeHtmlUrl(previewId, project.updated_at)} sandbox="" scrolling="no" loading="lazy" tabIndex={-1} title={project.title || project.id} /><div className="bd-shot-veil" /></>
      ) : <div className="bd-shot-mock"><i className="b" /><i /><i className="s" /><i className="xs" /></div>}
    </div>
  );
}

type Props = {
  index: number;
  project: Project;
  onOpen: () => void;
  onRemove: (event: React.MouseEvent) => void;
};

const PIN_TONE = ['', ' is-green', ' is-gold'];

export function ProjectCard({ index, project, onOpen, onRemove }: Props) {
  const { t, intlLocale } = useI18n();
  const date = new Date(project.updated_at.replace(' ', 'T') + 'Z');
  const formattedDate = Number.isNaN(date.getTime()) ? project.updated_at.slice(0, 10) : new Intl.DateTimeFormat(intlLocale, {
    month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date);

  return (
    <div className="bd-card" onClick={onOpen}>
      <span className={`bd-pin${PIN_TONE[index % 3]}`} />
      <button className="bd-del" title={t('project.delete')} onClick={onRemove}>✕</button>
      <ProjectThumb project={project} />
      <h3>{project.title || t('project.untitled')}</h3>
      <div className="bd-memo">“{project.prompt}”</div>
      <div className="bd-meta"><span>{t('project.versions', { count: project.node_count ?? 0 })}</span><span>{formattedDate}</span></div>
    </div>
  );
}
