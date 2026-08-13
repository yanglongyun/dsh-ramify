import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandMark } from '../components/BrandMark';
import { EmptyProjectState } from '../components/home/EmptyProjectState';
import { HomeHeader } from '../components/home/HomeHeader';
import { HowToDialog } from '../components/home/HowToDialog';
import { ProjectCard } from '../components/home/ProjectCard';
import { useProjects } from '../hooks/useProjects';
import { api } from '../api';
import type { Id } from '../types';
import { useI18n } from '../components/I18nProvider';
import '../styles/pages/ProjectList.css';

const PAGE_SIZE = 12;

export function ProjectList() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { projects, loading, reload } = useProjects();
  const [page, setPage] = useState(0);
  const [howOpen, setHowOpen] = useState(false);

  const closeHow = useCallback(() => setHowOpen(false), []);

  async function remove(event: React.MouseEvent, id: Id) {
    event.stopPropagation();
    if (!confirm(t('home.deleteConfirm'))) return;
    await api.deleteProject(id);
    void reload();
  }

  const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = projects.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="bd-home">
      <div className="bd-corner"><BrandMark size={20} /><b>Ramify</b></div>
      <button className="bd-help-entry" onClick={() => setHowOpen(true)}><span>?</span>{t('home.help')}</button>
      <main className="bd-board">
        <HomeHeader />
        {loading && projects.length === 0 ? <div className="bd-empty">{t('home.loading')}</div>
          : projects.length === 0 ? <EmptyProjectState />
            : <>
              <div className="bd-grid">
                {pageItems.map((project, index) => (
                  <ProjectCard key={project.id} index={index} project={project}
                    onOpen={() => navigate(`/projects/${project.id}`)} onRemove={(event) => void remove(event, project.id)} />
                ))}
              </div>
              {totalPages > 1 && <div className="bd-pager">
                <button disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>‹</button>
                <span>{safePage + 1} / {totalPages}</span>
                <button disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)}>›</button>
              </div>}
            </>}
      </main>
      {howOpen && <HowToDialog onClose={closeHow} />}
    </div>
  );
}
