import { ImageResponse } from 'next/og';
import { portfolio } from '../content/portfolio';

export const runtime = 'edge';
export const alt = portfolio.meta.imageAlt;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  const trees = Array.from({ length: 16 }, (_, index) => ({
    left: 18 + index * 77,
    height: 92 + ((index * 19) % 76),
  }));

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #071327 0%, #122b36 58%, #193521 100%)',
          color: '#fff2bd',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ position: 'absolute', top: 76, right: 132, width: 72, height: 72, background: '#f5d875', boxShadow: '0 0 0 12px #f5d87522' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 114, height: 120, background: '#0b231f', clipPath: 'polygon(0 62%, 12% 10%, 20% 54%, 31% 0, 42% 62%, 53% 18%, 65% 70%, 78% 5%, 90% 55%, 100% 14%, 100% 100%, 0 100%)' }} />
        {trees.map((tree, index) => (
          <div key={index} style={{ display: 'flex', position: 'absolute', left: tree.left, bottom: 78, width: 34, height: tree.height, background: index % 2 ? '#173d2b' : '#204831', clipPath: 'polygon(42% 0, 60% 0, 60% 18%, 82% 18%, 82% 32%, 100% 32%, 100% 64%, 70% 64%, 70% 100%, 24% 100%, 24% 64%, 0 64%, 0 32%, 30% 32%, 30% 18%, 42% 18%)' }} />
        ))}
        <div style={{ display: 'flex', position: 'absolute', left: 744, bottom: 144, width: 34, height: 108, background: '#f7bc4c', clipPath: 'polygon(20% 0, 70% 0, 70% 12%, 90% 12%, 90% 68%, 100% 68%, 100% 100%, 0 100%, 0 68%, 10% 68%, 10% 12%, 20% 12%)' }} />
        <div style={{ display: 'flex', position: 'absolute', left: 724, bottom: 218, width: 76, height: 16, background: '#f7bc4c' }} />
        <div style={{ display: 'flex', position: 'absolute', inset: 30, border: '4px solid #f5d875', boxShadow: '8px 8px 0 #101a2a' }} />
        <div style={{ display: 'flex', position: 'absolute', top: 78, left: 76, flexDirection: 'column', gap: 26 }}>
          <div style={{ display: 'flex', color: '#72e3ec', fontSize: 24, letterSpacing: 9, textTransform: 'uppercase' }}>{portfolio.hero.stage} / {portfolio.hero.subtitle}</div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 72, lineHeight: 0.98, letterSpacing: -2, textTransform: 'uppercase', textShadow: '8px 8px 0 #1a292c' }}>
            {portfolio.name.split(' ').map((word) => <span key={word}>{word}</span>)}
          </div>
          <div style={{ display: 'flex', color: '#ff8d4d', fontSize: 22, letterSpacing: 5, textTransform: 'uppercase' }}>{portfolio.arsenal.categories.map((category) => category.name).join(' / ')}</div>
        </div>
        <div style={{ display: 'flex', position: 'absolute', left: 0, right: 0, bottom: 0, height: 78, background: '#192313', borderTop: '8px solid #537845' }} />
        {Array.from({ length: 46 }, (_, index) => (
          <div key={'tile-' + index} style={{ display: 'flex', position: 'absolute', left: index * 27, bottom: index % 3 ? 20 : 40, width: 10, height: 10, background: index % 2 ? '#df7041' : '#89b760' }} />
        ))}
      </div>
    ),
    size,
  );
}
