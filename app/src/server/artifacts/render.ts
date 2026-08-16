import { marked } from 'marked';
import type { ArtifactType } from '../../shared/types.js';

const MD_STYLE = `
  :root{color-scheme:light}
  *{box-sizing:border-box}
  body{margin:0;background:#faf7f2;color:#2b2620;font:16px/1.75 Georgia,'Songti SC','Noto Serif SC',serif;-webkit-font-smoothing:antialiased}
  main{max-width:720px;margin:0 auto;padding:56px 32px 88px}
  h1,h2,h3,h4,h5,h6{color:#171310;line-height:1.3;margin:2em 0 .6em;font-weight:700}
  h1{font-size:2rem;margin-top:.4em}
  h2{font-size:1.5rem;padding-bottom:.35em;border-bottom:1px solid #e7ded0}
  h3{font-size:1.2rem}
  p{margin:.9em 0}
  a{color:#b3492f;text-decoration:underline;text-underline-offset:3px}
  strong{color:#171310}
  blockquote{margin:1.4em 0;padding:.2em 1.2em;border-left:3px solid #c9a27a;background:#f3ece1;color:#5a4f42;border-radius:0 8px 8px 0}
  code{font:.86em/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;background:#efe8dc;padding:.15em .4em;border-radius:5px}
  pre{background:#211d18;color:#e8e0d2;padding:18px 20px;border-radius:12px;overflow-x:auto;margin:1.4em 0}
  pre code{background:none;padding:0;color:inherit}
  ul,ol{padding-left:1.5em;margin:.9em 0}
  li{margin:.3em 0}
  table{border-collapse:collapse;width:100%;margin:1.4em 0;font-size:.94em}
  th,td{border:1px solid #e0d6c5;padding:.55em .8em;text-align:left}
  th{background:#f1eadd}
  hr{border:0;border-top:1px solid #e0d6c5;margin:2.4em auto;width:52%}
  img{max-width:100%}
`;

const SVG_STYLE = `
  html,body{margin:0;height:100%}
  body{display:grid;place-items:center;background:#f4f1ea;background-image:radial-gradient(#00000010 1px,transparent 1px);background-size:18px 18px}
  svg{max-width:92vw;max-height:92vh;filter:drop-shadow(0 10px 30px rgba(20,16,10,.14))}
`;

const MEDIA_STYLE = `
  :root{color-scheme:light}
  *{box-sizing:border-box}
  html,body{margin:0;width:100%;height:100%}
  body{display:grid;place-items:center;padding:24px;background:#f4f1ea;background-image:radial-gradient(#00000010 1px,transparent 1px);background-size:18px 18px}
  img,video{display:block;max-width:100%;max-height:100%;object-fit:contain;border-radius:12px;box-shadow:0 18px 48px rgba(20,16,10,.16)}
  audio{width:min(560px,100%)}
`;

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

const escapeAttribute = (value: string) => escapeHtml(value).replace(/"/g, '&quot;');

function standardsDocument(document: string): string {
  const doctype = /^\s*<!doctype[^>]*>/i.exec(document);
  if (doctype) return document;
  return `<!DOCTYPE html>${document}`;
}

export function renderArtifact(content: string, type: ArtifactType): string {
  if (type === 'image' || type === 'video' || type === 'audio') {
    const source = escapeAttribute(content.trim());
    const media = type === 'image'
      ? `<img src="${source}" alt="生成的图片">`
      : type === 'video'
        ? `<video src="${source}" controls playsinline preload="metadata"></video>`
        : `<audio src="${source}" controls preload="metadata"></audio>`;
    return standardsDocument(`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${MEDIA_STYLE}</style></head><body>${media}</body></html>`);
  }
  if (type === 'markdown') {
    const body = marked.parse(content, { async: false }) as string;
    return standardsDocument(`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${MD_STYLE}</style></head><body><main>${body}</main></body></html>`);
  }
  if (type === 'svg') {
    return standardsDocument(`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${SVG_STYLE}</style></head><body>${content}</body></html>`);
  }
  return standardsDocument(content);
}
