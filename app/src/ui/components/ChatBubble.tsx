import { useEffect, useRef, useState } from 'react';
import type { TreeNode } from '../types';
import { CountPicker } from './CountPicker';
import type { Pos } from '../lib/layout';
import { useI18n } from './I18nProvider';
import '../styles/components/ChatBubble.css';

// 发散气泡:挂在节点右上角,输入指令 + 选数量,生成子节点。
export function ChatBubble({ node, pos, onSubmit, onClose }: {
  node: TreeNode;
  pos: Pos;
  onSubmit: (prompt: string, count: number) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [text, setText] = useState('');
  const [count, setCount] = useState(1);
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    setCount(1);
    const timer = setTimeout(() => ref.current?.focus(), 60);
    return () => clearTimeout(timer);
  }, [node.id]);

  const isRoot = node.parent_id === null;
  const submit = () => { if (text.trim()) onSubmit(text.trim(), count); };
  const arrowTop = 44;
  const bubblePos = { left: pos.x + pos.w / 2 + 3 + 24, top: pos.y - pos.h / 2 + 1 - arrowTop };

  return (
    <div className="cb-branch-panel" style={{ ...bubblePos, width: 280, ['--arrow-top' as string]: `${arrowTop}px` }}
      onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
      <div className="cb-branch-head">{isRoot ? t('dsh.branchRoot') : t('dsh.branchNode', { title: node.title })}</div>
      <textarea ref={ref} value={text} onChange={(e) => setText(e.target.value)}
        placeholder={t('dsh.branchPlaceholder')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); }
          if (e.key === 'Escape') onClose();
        }} />
      <div className="cb-branch-row"><CountPicker value={count} onChange={setCount} /></div>
      <button className="cb-button cb-button-primary cb-branch-submit" onClick={submit}>{t('dsh.branch')} · {count}</button>
    </div>
  );
}
