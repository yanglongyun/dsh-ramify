import { memo } from 'react';
import type { Id, TreeNode } from '../types';
import type { Pos } from '../lib/layout';
import { api } from '../api';
import { BrandMark } from './BrandMark';
import { PLANTS } from './Plants';
import '../styles/components/NodeCard.css';
import { isArtifactType } from '../../shared/types';
import { useI18n } from './I18nProvider';

// 生成中占位:按节点 id 稳定地抽一株图鉴植物(轮询刷新不换株)
function plantOf(id: Id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PLANTS[h % PLANTS.length];
}

function BranchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20v-6M12 14c0-4 3-6 7-6M12 14c0-3-2-5-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

type Props = {
  node: TreeNode;
  seq: number;
  pos: Pos;
  selected: boolean;
  collapsed: boolean;
  hiddenCount: number;
  hasChildren: boolean;
  renderPreview: boolean;
  onClick: (id: Id) => void;
  onBranch?: (id: Id) => void;
  onToggle: (id: Id) => void;
};

export const NodeCard = memo(function NodeCard({
  node, seq, pos, selected, collapsed, hiddenCount, hasChildren, renderPreview, onClick, onBranch, onToggle,
}: Props) {
  const { t } = useI18n();
  const isRoot = node.parent_id === null;
  const isTitleOnly = node.type === 'text' && !node.content;
  const isWorking = isArtifactType(node.type) && !node.content;
  const hasArtifact = isArtifactType(node.type) && !!node.content;
  const wantThumb = hasArtifact && renderPreview;
  const previewRevision = `${node.updated_at}:${node.artifact_revision}`;

  // 所有节点首先都是思维导图节点；只有标题时使用纤细胶囊。
  if (isTitleOnly) {
    return (
      <div
        className={`cb-node cb-node-root${selected ? ' is-selected' : ''}`}
        style={{ transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`, position: 'absolute' }}
        onClick={(e) => { e.stopPropagation(); onClick(node.id); }}
      >
        {onBranch && <button className="cb-node-branch" title={isRoot ? t('dsh.branchRoot') : t('dsh.branchNode')} onClick={(e) => { e.stopPropagation(); onBranch(node.id); }}><BranchIcon /></button>}
        {hasChildren && (
          <button className={`cb-node-collapse${collapsed ? ' is-collapsed' : ''}`} title={collapsed ? t('node.expand', { count: hiddenCount }) : t('node.collapse')} onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}>{collapsed ? hiddenCount : '−'}</button>
        )}
        <span className="cb-node-root-mark">{isRoot ? <BrandMark size={14} /> : <span className="cb-node-root-seq">#{seq}</span>}</span>
        <span className="cb-node-root-text">{node.title}</span>
      </div>
    );
  }

  // content 只在没有可用 artifact 时呈现；有 artifact 时始终优先展示缩略图。
  if (node.type === 'text' && node.content) {
    return (
      <div
        className={`cb-node cb-node-content${selected ? ' is-selected' : ''}`}
        style={{ transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`, position: 'absolute' }}
        onClick={(e) => { e.stopPropagation(); onClick(node.id); }}
      >
        {onBranch && <button className="cb-node-branch" title={t('dsh.branchNode')} onClick={(e) => { e.stopPropagation(); onBranch(node.id); }}><BranchIcon /></button>}
        {hasChildren && (
          <button className={`cb-node-collapse${collapsed ? ' is-collapsed' : ''}`} title={collapsed ? t('node.expand', { count: hiddenCount }) : t('node.collapse')} onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}>{collapsed ? hiddenCount : '−'}</button>
        )}
        <span className="cb-content-tape" />
        <div className="cb-content-title"><span className="cb-node-seq">#{seq}</span>{node.title}</div>
        <div className="cb-content-text">{node.content}</div>
      </div>
    );
  }

  const cls = ['cb-node', 'cb-node-variant', isWorking ? 'is-generating' : '', node.type === 'error' ? 'is-error' : '', selected ? 'is-selected' : '']
    .filter(Boolean).join(' ');

  return (
    <div
      className={cls}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`, position: 'absolute' }}
      onClick={(e) => { e.stopPropagation(); onClick(node.id); }}
    >
      {onBranch && hasArtifact && (
        <button className="cb-node-branch" title={t('dsh.branchNode')} onClick={(e) => { e.stopPropagation(); onBranch(node.id); }}>
          <BranchIcon />
        </button>
      )}
      {hasChildren && (
        <button
          className={`cb-node-collapse${collapsed ? ' is-collapsed' : ''}`}
          title={collapsed ? t('node.expand', { count: hiddenCount }) : t('node.collapse')}
          onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
        >{collapsed ? hiddenCount : '−'}</button>
      )}
      <div className="cb-node-thumb">
        {wantThumb ? (
          <>
            {/* 缩略图不跑脚本:N 个动画页同时全速渲染会拖死画布;动效去预览/新窗口看 */}
            <iframe src={api.nodeHtmlUrl(node.id, previewRevision)} sandbox="" scrolling="no" loading="lazy" tabIndex={-1} title={node.title ?? String(node.id)} />
            <div className="cb-node-veil" />
          </>
        ) : hasArtifact ? (
          <div className="cb-node-skeleton" aria-hidden="true"><i /><i /><i /><i /></div>
        ) : isWorking ? (
          <div className="cb-node-center">
            <span className="cb-node-plant" title={t(plantOf(node.id).nameKey)} dangerouslySetInnerHTML={{ __html: plantOf(node.id).svg }} />
            <div className="cb-node-generating-label">{t('node.generating')}</div>
          </div>
        ) : (
          <div className="cb-node-center">
            <div className="cb-node-error-label">{node.content || t('node.failed')}</div>
          </div>
        )}
      </div>
      <div className="cb-node-info">
        {isWorking && !node.title ? (
          <div className="cb-node-info-skeleton" aria-hidden="true"><i /><i /></div>
        ) : (
          <>
            <div className="cb-node-title"><span className="cb-node-seq">#{seq}</span>{node.title}</div>
          </>
        )}
      </div>
    </div>
  );
});
