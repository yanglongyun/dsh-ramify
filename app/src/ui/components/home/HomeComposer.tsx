import { useState, type RefObject } from 'react';
import type { Plant } from '../Plants';
import { CountPicker } from '../CountPicker';
import { useI18n } from '../I18nProvider';
import '../../styles/components/home/HomeComposer.css';

const MAX_PROMPT_LENGTH = 500;
const CATEGORIES = [
  ['想法', '把你的想法变成几个方向不同的完整方案'],
  ['原型', '设计一个可交互的产品原型，探索三种不同的信息架构'],
  ['落地页', '为一个新产品设计落地页，生成三个风格方向'],
  ['海报', '设计一张主题海报，探索三种不同的视觉语言'],
  ['Logo', '为一个新品牌设计 logo，生成三个明显不同的方向'],
  ['文档', '把这个想法整理成一份结构完整、易读的文档'],
  ['封面', '设计一个封面，探索三个构图与气质不同的版本'],
  ['简历', '设计一份清晰而有个性的个人简历'],
  ['插画', '创作一幅主题插画，生成三个不同艺术方向'],
  ['邀请函', '设计一张有仪式感的活动邀请函'],
] as const;

export function HomeComposer({ prompt, promptRef, plant, count, creating, error, onPromptChange, onCountChange, onSubmit }: {
  prompt: string;
  promptRef: RefObject<HTMLTextAreaElement>;
  plant: Plant;
  count: number;
  creating: boolean;
  error: string;
  onPromptChange: (value: string) => void;
  onCountChange: (value: number) => void;
  onSubmit: () => void;
}) {
  const { t } = useI18n();
  const [category, setCategory] = useState(0);
  const disabled = !prompt.trim() || creating;

  return (
    <header className="bd-head">
      <div className="bd-plant" aria-hidden="true" dangerouslySetInnerHTML={{ __html: plant.svg }} />
      <h1 className="bd-greet">让一个想法，长成一片创意</h1>
      <p className="bd-greet-sub">写一句话，定好出几版。每一版都是树上独立的一支——挑中最好的那支，继续往下长。</p>

      <form className="bd-ticket" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
        <section className="bd-ticket-top">
          <div className="bd-ticket-tabs" role="tablist" aria-label="创作类型">
            {CATEGORIES.map(([label, template], index) => (
              <button key={label} type="button" role="tab" aria-selected={category === index}
                className={`bd-ticket-tab${category === index ? ' is-selected' : ''}`}
                onClick={() => {
                  setCategory(index); onPromptChange(template);
                  requestAnimationFrame(() => {
                    const el = promptRef.current;
                    if (!el) return;
                    el.focus(); el.setSelectionRange(el.value.length, el.value.length);
                  });
                }}>{label}</button>
            ))}
          </div>
          <div className="bd-ticket-write">
            <textarea ref={promptRef} value={prompt} maxLength={MAX_PROMPT_LENGTH}
              onChange={(event) => onPromptChange(event.target.value)} placeholder={t('dsh.createPlaceholder')}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); onSubmit(); }
              }} />
            <div className="bd-ticket-write-foot">
              <span className={`bd-prompt-count${prompt.length > 0 ? ' is-active' : ''}`}>{prompt.length}/{MAX_PROMPT_LENGTH}</span>
            </div>
          </div>
        </section>
        <div className="bd-ticket-seam" aria-hidden="true"><span /></div>
        <section className="bd-ticket-bottom">
          <div className="bd-ticket-row">
            <CountPicker value={count} onChange={onCountChange} />
            <button type="submit" className="bd-start" disabled={disabled}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21V9" /><path d="M12 9c0-4 3-6.5 7-6-.4 4-3 6.7-7 6Z" /><path d="M12 13c0-3-2.4-5.4-5.6-5C6 11.4 8.6 13.8 12 13Z" /></svg>
              {creating ? t('dsh.sending') : `生成 ${count} 份`}
            </button>
          </div>
        </section>
      </form>
      <p className="bd-ticket-note">使用当前 DSH 会话与模型 · 每一版都会保留在树上</p>
      {error && <div className="bd-command-error">{error}</div>}
    </header>
  );
}
