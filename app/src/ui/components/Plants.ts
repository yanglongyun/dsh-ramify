import type { MessageKey } from '../lib/i18n';

// Flora 植物图鉴(10 株):首页顶部随机展示。与画布「Flora 植物图鉴」项目同源,手绘语言:
// 墨线 #2c2827 · 朱砂红 #d95b57 · 花芯 #eec16f · 灰绿 #7d8c77/#9ab08f · 赭金 #c98a2e
const VB = '20 58 200 198';
const svg = (inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB}" fill="none">${inner}</svg>`;

const FLOWER_120_104 = ['0', '72', '144', '216', '288'].map((d) =>
  `<ellipse cx="0" cy="-17.7" rx="11.6" ry="17" fill="#d95b57" stroke="#2c2827" stroke-width="2.6" stroke-linejoin="round" transform="rotate(${d})"/>`).join('')
  + '<circle r="10.2" fill="#eec16f" stroke="#2c2827" stroke-width="2.6"/>';

const SUN_PETALS = Array.from({ length: 12 }, (_, i) =>
  `<ellipse cx="0" cy="-24" rx="7.5" ry="13" fill="#eec16f" stroke="#2c2827" stroke-width="1.9" stroke-linejoin="round" transform="rotate(${i * 30})"/>`).join('');

export type Plant = { name: string; nameKey: MessageKey; svg: string };

export const PLANTS: Plant[] = [
  { name: '小红花', nameKey: 'plant.redFlower', svg: svg(`
<path d="M120 232 C118 196 123 164 120 128" stroke="#7d8c77" stroke-width="4" stroke-linecap="round"/>
<path d="M120 190 C96 186 88 166 112 174 C117 177 119 183 120 190 Z" fill="#9ab08f" stroke="#2c2827" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M121 168 C144 162 152 142 128 151 C123 154 121 160 121 168 Z" fill="#7d8c77" stroke="#2c2827" stroke-width="2.2" stroke-linejoin="round"/>
<g transform="translate(120 104)">${FLOWER_120_104}</g>
<path d="M92 236 H148" stroke="#2c2827" stroke-width="2.4" stroke-linecap="round" opacity=".25"/>`) },

  { name: '初生豆蔻芽', nameKey: 'plant.cardamom', svg: svg(`
<path d="M120 218 C119 196 121 182 120 168" stroke="#7d8c77" stroke-width="3.6" stroke-linecap="round"/>
<path d="M119 172 C94 168 86 142 108 150 C116 154 118 162 119 172 Z" fill="#9ab08f" stroke="#2c2827" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M121 172 C146 168 154 142 132 150 C124 154 122 162 121 172 Z" fill="#7d8c77" stroke="#2c2827" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M84 224 C96 214 144 214 156 224" fill="#e8dfc9" stroke="#2c2827" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M96 224 L104 218 M136 218 L144 224" stroke="#2c2827" stroke-width="1.6" stroke-linecap="round" opacity=".5"/>`) },

  { name: '岩缝倔强松', nameKey: 'plant.pineCrack', svg: svg(`
<path d="M70 236 L96 208 L124 232 L152 204 L176 236 Z" fill="#ded5c0" stroke="#2c2827" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M118 214 C112 190 124 172 132 150" stroke="#8a6a48" stroke-width="4.4" stroke-linecap="round"/>
<path d="M132 150 C138 138 148 132 156 128" stroke="#8a6a48" stroke-width="3.2" stroke-linecap="round"/>
<path d="M108 128 C120 106 148 106 160 122 C170 118 178 124 176 132 C186 140 176 152 164 150 C150 160 118 156 112 144 C102 142 100 132 108 128 Z" fill="#7d8c77" stroke="#2c2827" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M120 132 L128 140 M140 126 L146 136 M156 132 L160 140" stroke="#2c2827" stroke-width="1.4" stroke-linecap="round" opacity=".45"/>`) },

  { name: '温室阔叶苗', nameKey: 'plant.broadleaf', svg: svg(`
<path d="M120 226 C119 200 121 184 120 164" stroke="#7d8c77" stroke-width="3.8" stroke-linecap="round"/>
<path d="M118 180 C74 176 62 128 104 140 C116 146 118 164 118 180 Z" fill="#9ab08f" stroke="#2c2827" stroke-width="2.3" stroke-linejoin="round"/>
<path d="M122 168 C168 162 180 112 136 126 C124 132 122 152 122 168 Z" fill="#7d8c77" stroke="#2c2827" stroke-width="2.3" stroke-linejoin="round"/>
<path d="M118 176 C102 166 92 152 96 144 M122 164 C140 154 150 138 146 132" stroke="#2c2827" stroke-width="1.4" stroke-linecap="round" opacity=".4"/>
<ellipse cx="120" cy="230" rx="34" ry="7" stroke="#2c2827" stroke-width="2" opacity=".25"/>`) },

  { name: '含羞草芽', nameKey: 'plant.mimosa', svg: svg(`
<path d="M116 228 C114 202 112 184 122 168 C130 156 128 148 122 144" stroke="#7d8c77" stroke-width="3.6" stroke-linecap="round"/>
<g stroke="#2c2827" stroke-width="1.8" stroke-linejoin="round">
  <ellipse cx="104" cy="150" rx="9" ry="5.5" fill="#9ab08f" transform="rotate(-24 104 150)"/>
  <ellipse cx="138" cy="146" rx="9" ry="5.5" fill="#9ab08f" transform="rotate(20 138 146)"/>
  <ellipse cx="108" cy="132" rx="8" ry="5" fill="#7d8c77" transform="rotate(-30 108 132)"/>
  <ellipse cx="134" cy="128" rx="8" ry="5" fill="#7d8c77" transform="rotate(24 134 128)"/>
</g>
<path d="M112 142 Q114 144 116 142 M126 140 Q128 142 130 140" stroke="#2c2827" stroke-width="1.8" stroke-linecap="round"/>
<circle cx="108" cy="147" r="3.4" fill="#d95b57" opacity=".28"/><circle cx="134" cy="145" r="3.4" fill="#d95b57" opacity=".28"/>
<path d="M88 232 H150" stroke="#2c2827" stroke-width="2.4" stroke-linecap="round" opacity=".25"/>`) },

  { name: '向日葵幼苗', nameKey: 'plant.sunflower', svg: svg(`
<path d="M120 228 C118 200 122 176 120 152" stroke="#7d8c77" stroke-width="4" stroke-linecap="round"/>
<path d="M118 196 C96 192 88 174 110 180 C116 183 117 189 118 196 Z" fill="#9ab08f" stroke="#2c2827" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M122 184 C144 178 152 160 130 168 C124 171 122 177 122 184 Z" fill="#7d8c77" stroke="#2c2827" stroke-width="2.2" stroke-linejoin="round"/>
<g transform="translate(120 110)">${SUN_PETALS}<circle r="17" fill="#a8763e" stroke="#2c2827" stroke-width="2.2"/>
<path d="M-6 -3 Q-4 -6 -2 -3 M2 -3 Q4 -6 6 -3" stroke="#2c2827" stroke-width="1.8" stroke-linecap="round"/>
<path d="M-5 4 Q0 9 5 4" stroke="#2c2827" stroke-width="1.8" stroke-linecap="round"/></g>
<path d="M90 232 H152" stroke="#2c2827" stroke-width="2.4" stroke-linecap="round" opacity=".25"/>`) },

  { name: '治愈多肉', nameKey: 'plant.succulent', svg: svg(`
<g stroke="#2c2827" stroke-width="2.2" stroke-linejoin="round">
  <path d="M78 196 C64 172 84 154 100 166 C96 148 118 138 128 154 C140 138 162 148 156 168 C174 160 186 180 170 196 Z" fill="#9ab08f"/>
  <path d="M92 196 C84 180 96 168 108 176 C106 162 124 156 130 168 C140 158 154 166 150 180 C160 178 166 190 158 196 Z" fill="#7d8c77"/>
</g>
<path d="M112 178 Q114 176 116 178 M130 176 Q132 174 134 176" stroke="#2c2827" stroke-width="2" stroke-linecap="round"/>
<path d="M119 186 Q123 189 127 186" stroke="#2c2827" stroke-width="1.8" stroke-linecap="round"/>
<ellipse cx="122" cy="204" rx="52" ry="9" fill="#e8dfc9" stroke="#2c2827" stroke-width="2.2"/>`) },

  { name: '孤松', nameKey: 'plant.lonePine', svg: svg(`
<path d="M96 228 C100 214 92 206 104 198 C96 188 108 178 116 172 C110 160 122 150 132 146" stroke="#7a5c3e" stroke-width="5" stroke-linecap="round"/>
<g stroke="#2c2827" stroke-width="2.3" stroke-linejoin="round">
  <ellipse cx="140" cy="128" rx="40" ry="16" fill="#7d8c77"/>
  <ellipse cx="96" cy="150" rx="26" ry="11" fill="#9ab08f"/>
  <ellipse cx="170" cy="156" rx="22" ry="9" fill="#9ab08f"/>
</g>
<path d="M76 232 L100 210 L126 232 Z" fill="#ded5c0" stroke="#2c2827" stroke-width="2.3" stroke-linejoin="round"/>
<path d="M56 240 C88 234 152 234 184 240" stroke="#2c2827" stroke-width="1.6" stroke-linecap="round" opacity=".3"/>`) },

  { name: '竹', nameKey: 'plant.bamboo', svg: svg(`
<path d="M104 232 L104 112" stroke="#7d8c77" stroke-width="7" stroke-linecap="round"/>
<path d="M136 232 L136 132" stroke="#9ab08f" stroke-width="6" stroke-linecap="round"/>
<path d="M100 196 H108 M100 160 H108 M100 126 H108 M132 200 H140 M132 168 H140" stroke="#2c2827" stroke-width="2.4" stroke-linecap="round"/>
<g fill="#7d8c77" stroke="#2c2827" stroke-width="1.9" stroke-linejoin="round">
  <path d="M104 112 C92 100 78 98 68 102 C80 108 92 112 104 112 Z"/>
  <path d="M104 112 C112 98 126 92 138 94 C128 104 116 110 104 112 Z"/>
  <path d="M136 132 C146 122 158 118 168 122 C158 130 146 133 136 132 Z" fill="#9ab08f"/>
</g>
<path d="M84 238 H160" stroke="#2c2827" stroke-width="2.2" stroke-linecap="round" opacity=".25"/>`) },

  { name: '一叶知秋', nameKey: 'plant.autumnLeaf', svg: svg(`
<path d="M110 232 C108 200 114 176 112 148 C111 132 116 120 124 112" stroke="#7a5c3e" stroke-width="4.4" stroke-linecap="round"/>
<path d="M113 168 C124 158 136 154 148 156 M111 140 C102 132 92 128 82 130 M122 116 C130 106 142 102 152 104" stroke="#7a5c3e" stroke-width="2.6" stroke-linecap="round"/>
<g transform="translate(158 176) rotate(28)">
  <path d="M0 -14 C10 -6 12 8 0 16 C-12 8 -10 -6 0 -14 Z" fill="#c98a2e" stroke="#2c2827" stroke-width="2" stroke-linejoin="round"/>
  <path d="M0 -10 L0 12" stroke="#2c2827" stroke-width="1.3" stroke-linecap="round" opacity=".5"/>
</g>
<path d="M150 200 C148 206 152 210 150 216" stroke="#2c2827" stroke-width="1.2" stroke-linecap="round" opacity=".35" stroke-dasharray="2 4"/>
<path d="M86 238 H150" stroke="#2c2827" stroke-width="2.2" stroke-linecap="round" opacity=".25"/>`) },
];

export function randomPlant(): Plant {
  return PLANTS[Math.floor(Math.random() * PLANTS.length)];
}
