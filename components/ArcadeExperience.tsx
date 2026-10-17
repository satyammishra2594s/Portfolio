'use client';

import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { portfolio } from '../content/portfolio';
import JungleCanvas from './JungleCanvas';
import StageTransitions from './StageTransitions';

const cheatSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

function formatScore(score: number) {
  return String(score).padStart(6, '0');
}

function PixelMedal({ index }: { index: number }) {
  const colors = ['#f4cb65', '#75dce6', '#e77f54', '#b6cf78'];
  const color = colors[index % colors.length];
  return (
    <svg className="medal-icon" viewBox="0 0 28 34" aria-hidden="true">
      <path d="M6 1h7v12H6zM15 1h7v12h-7z" fill={index % 2 ? '#c7533d' : '#4b93a2'} />
      <path d="M7 14h14v13l-7 6-7-6z" fill={color} stroke="#ffe7a0" strokeWidth="1.5" />
      <path d="M14 17l2 4 4 .5-3 3 .7 4.2-3.7-2-3.7 2 .7-4.2-3-3 4-.5z" fill="#fff2c4" />
    </svg>
  );
}

function PowerIcon({ icon }: { icon: string }) {
  return <span className="power-icon" aria-hidden="true">{icon}</span>;
}

function KaliTerminal() {
  const [connected, setConnected] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setConnected(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={panelRef} className="terminal-panel pixel-panel">
      <div className="terminal-top">
        <span>{portfolio.arsenal.terminalTitle}</span>
        <span className="terminal-light" aria-hidden="true" />
      </div>
      <div className="terminal-body" aria-label={portfolio.arsenal.terminalTitle}>
        {connected ? (
          <div className="terminal-lines">
            {portfolio.arsenal.terminalLines.map((line, index) => (
              <p className="terminal-line" key={line.command} style={{ animationDelay: (index * 0.65) + 's' }}>
                <span className="terminal-prompt">{portfolio.arsenal.terminalPrompt}</span>
                <span className="terminal-command">{line.command}</span>
                <span className="terminal-output">{line.output}</span>
              </p>
            ))}
          </div>
        ) : (
          <p className="terminal-hint">{portfolio.arsenal.terminalHint}</p>
        )}
        <span className="terminal-cursor" aria-hidden="true">█</span>
      </div>
      <div className="sr-only">
        {portfolio.arsenal.terminalLines.map((line) => (
          <p key={'reader-' + line.command}>{portfolio.arsenal.terminalPrompt} {line.command} — {line.output}</p>
        ))}
      </div>
    </div>
  );
}

export default function ArcadeExperience() {
  const [stageIndex, setStageIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [roleIndex, setRoleIndex] = useState(0);
  const [bootStep, setBootStep] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [cheatActive, setCheatActive] = useState(false);
  const [countdown, setCountdown] = useState(9);
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const bootStartRef = useRef<HTMLButtonElement>(null);
  const targetRef = useRef({ x: -100, y: -100 });
  const cursorPositionRef = useRef({ x: -100, y: -100 });
  const trailPositionRef = useRef({ x: -100, y: -100 });
  const cursorFrameRef = useRef(0);
  const cheatPositionRef = useRef(0);
  const soundEnabledRef = useRef(soundEnabled);
  const bootStepRef = useRef<number | null>(bootStep);
  const scoredStagesRef = useRef(new Set<string>());

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    try {
      if (window.localStorage.getItem('contra-portfolio-intro-skipped') !== '1') setBootStep(0);
    } catch {
      setBootStep(null);
    }
  }, []);

  useEffect(() => {
    if (bootStep !== null) bootStartRef.current?.focus();
  }, [bootStep]);

  useEffect(() => {
    bootStepRef.current = bootStep;
    window.dispatchEvent(new Event('contra:stage'));
  }, [stageIndex, bootStep]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRoleIndex((current) => (current + 1) % portfolio.hero.roles.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown((current) => (current === 0 ? 9 : current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('.stage-section'));
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        let mostVisible: IntersectionObserverEntry | null = null;
        for (let i = 0; i < entries.length; i += 1) {
          const entry = entries[i];
          if (!entry.isIntersecting) continue;
          if (!mostVisible || entry.intersectionRatio > mostVisible.intersectionRatio) mostVisible = entry;
          if (!scoredStagesRef.current.has(entry.target.id)) {
            scoredStagesRef.current.add(entry.target.id);
            setScore((current) => current + 1000);
          }
        }
        if (mostVisible) {
          const nextStage = Number((mostVisible.target as HTMLElement).dataset.stageIndex);
          if (Number.isFinite(nextStage)) setStageIndex(nextStage);
        }
      },
      { threshold: [0.15, 0.35, 0.6] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && bootStepRef.current !== null) {
        setBootStep(null);
        bootStepRef.current = null;
        try {
          window.localStorage.setItem('contra-portfolio-intro-skipped', '1');
        } catch {
          return;
        }
        window.setTimeout(() => document.getElementById('hero-start')?.focus(), 0);
        return;
      }
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (key === cheatSequence[cheatPositionRef.current]) {
        cheatPositionRef.current += 1;
        if (cheatPositionRef.current === cheatSequence.length) {
          cheatPositionRef.current = 0;
          setCheatActive(true);
          window.dispatchEvent(new Event('contra:cheat'));
          window.setTimeout(() => setCheatActive(false), 30000);
        }
      } else {
        cheatPositionRef.current = key === cheatSequence[0] ? 1 : 0;
      }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, []);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)');
    if (!finePointer.matches) return;
    document.body.classList.add('custom-cursor-enabled');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cursorActive = false;

    const moveCursor = () => {
      cursorActive = false;
      const cursor = cursorRef.current;
      const trail = trailRef.current;
      if (!cursor || !trail) return;
      const point = cursorPositionRef.current;
      const target = targetRef.current;
      const factor = prefersReducedMotion ? 1 : 0.24;
      point.x += (target.x - point.x) * factor;
      point.y += (target.y - point.y) * factor;
      const trailPoint = trailPositionRef.current;
      trailPoint.x += (point.x - trailPoint.x) * (prefersReducedMotion ? 1 : 0.22);
      trailPoint.y += (point.y - trailPoint.y) * (prefersReducedMotion ? 1 : 0.22);
      cursor.style.transform = 'translate3d(' + point.x + 'px,' + point.y + 'px,0)';
      trail.style.transform = 'translate3d(' + (trailPoint.x - 3) + 'px,' + (trailPoint.y - 3) + 'px,0)';
      if (Math.abs(target.x - point.x) > 0.5 || Math.abs(target.y - point.y) > 0.5) {
        cursorActive = true;
        cursorFrameRef.current = requestAnimationFrame(moveCursor);
      }
    };

    const pointermove = (event: PointerEvent) => {
      targetRef.current.x = event.clientX;
      targetRef.current.y = event.clientY;
      if (!cursorActive) {
        cursorActive = true;
        cursorFrameRef.current = requestAnimationFrame(moveCursor);
      }
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-tilt]') : null;
      if (target) {
        const rect = target.getBoundingClientRect();
        target.style.setProperty('--tilt-x', ((event.clientX - rect.left) / rect.width - 0.5) * 5 + 'deg');
        target.style.setProperty('--tilt-y', (0.5 - (event.clientY - rect.top) / rect.height) * 4 + 'deg');
      }
      const magnetic = event.target instanceof Element ? event.target.closest<HTMLElement>('.pixel-button, .contact-link, .hud-toggle') : null;
      if (magnetic) {
        const rect = magnetic.getBoundingClientRect();
        magnetic.classList.add('pixel-magnetic');
        magnetic.style.setProperty('--mag-x', ((event.clientX - rect.left) / rect.width - 0.5) * 5 + 'px');
        magnetic.style.setProperty('--mag-y', ((event.clientY - rect.top) / rect.height - 0.5) * 4 + 'px');
      }
    };

    const clearTilt = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-tilt]') : null;
      if (target) {
        target.style.setProperty('--tilt-x', '0deg');
        target.style.setProperty('--tilt-y', '0deg');
      }
      const magnetic = event.target instanceof Element ? event.target.closest<HTMLElement>('.pixel-magnetic') : null;
      if (magnetic) {
        magnetic.classList.remove('pixel-magnetic');
        magnetic.style.setProperty('--mag-x', '0px');
        magnetic.style.setProperty('--mag-y', '0px');
      }
    };

    const updateLock = (event: PointerEvent, active: boolean) => {
      const element = event.target instanceof Element ? event.target.closest('a, button, [data-tilt]') : null;
      cursorRef.current?.classList.toggle('is-locked', active && Boolean(element));
      element?.classList.toggle('pixel-targeted', active);
    };

    const pointerover = (event: PointerEvent) => updateLock(event, true);
    const pointerout = (event: PointerEvent) => {
      updateLock(event, false);
      clearTilt(event);
    };

    const impact = (event: MouseEvent) => {
      const spark = document.createElement('span');
      spark.className = 'click-impact';
      spark.style.left = event.clientX + 'px';
      spark.style.top = event.clientY + 'px';
      document.body.appendChild(spark);
      window.setTimeout(() => spark.remove(), 360);
      if (!soundEnabledRef.current) return;
      const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextConstructor) return;
      const audio = new AudioContextConstructor();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(720, audio.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(150, audio.currentTime + 0.075);
      gain.gain.setValueAtTime(0.045, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.085);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + 0.09);
      oscillator.onended = () => void audio.close();
    };

    window.addEventListener('pointermove', pointermove, { passive: true });
    window.addEventListener('pointerover', pointerover);
    window.addEventListener('pointerout', pointerout);
    window.addEventListener('click', impact);
    return () => {
      cancelAnimationFrame(cursorFrameRef.current);
      document.body.classList.remove('custom-cursor-enabled');
      window.removeEventListener('pointermove', pointermove);
      window.removeEventListener('pointerover', pointerover);
      window.removeEventListener('pointerout', pointerout);
      window.removeEventListener('click', impact);
    };
  }, []);

  const closeBoot = () => {
    setBootStep(null);
    bootStepRef.current = null;
    try {
      window.localStorage.setItem('contra-portfolio-intro-skipped', '1');
    } catch {
      // The intro can still close when storage is unavailable.
    }
    window.setTimeout(() => document.getElementById('hero-start')?.focus(), 0);
  };

  const advanceBoot = () => {
    if (bootStep === null) return;
    if (bootStep >= 2) {
      closeBoot();
      return;
    }
    setBootStep(bootStep + 1);
  };

  const handleCardPointer = (event: ReactPointerEvent<HTMLElement>) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const card = event.currentTarget;
    const bounds = card.getBoundingClientRect();
    card.style.setProperty('--tilt-x', ((event.clientX - bounds.left) / bounds.width - 0.5) * 5 + 'deg');
    card.style.setProperty('--tilt-y', (0.5 - (event.clientY - bounds.top) / bounds.height) * 4 + 'deg');
  };

  const clearCardPointer = (event: ReactPointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty('--tilt-x', '0deg');
    event.currentTarget.style.setProperty('--tilt-y', '0deg');
  };

  const roleStyle = { '--characters': String(portfolio.hero.roles[roleIndex].length) } as CSSProperties;

  return (
    <div className={'experience ' + (crtEnabled ? 'crt-enabled' : 'crt-disabled') + (cheatActive ? ' cheat-active' : '')}>
      <a className="skip-link" href="#mission-stages">{portfolio.navigation.skipLink}</a>
      <JungleCanvas stageIndex={stageIndex} />
      <div className="scene-wash" aria-hidden="true" />
      <div className="crt-overlay" aria-hidden="true" />

      <header className="arcade-hud" aria-label={portfolio.hud.stageProgress}>
        <div className="hud-line hud-main">
          <a className="hud-player" href={'#' + portfolio.stages[0].id} aria-label={portfolio.hud.jumpTop}>{portfolio.hud.player}</a>
          <span className="hud-score-label">{portfolio.hud.score}</span>
          <span className="score-readout" key={score}>{formatScore(score)}</span>
          <span className="hud-hi-label">{portfolio.hud.highScore}</span>
          <span className="hi-score">{formatScore(42700)}</span>
          <span className="hud-lives-label">{portfolio.hud.lives}</span>
          <span className="life-medals" aria-label={portfolio.hud.lifeLabel}>
            <PixelMedal index={0} />
            <PixelMedal index={1} />
            <PixelMedal index={2} />
          </span>
          <div className="hud-controls">
            <button
              className="hud-toggle"
              type="button"
              onClick={() => setSoundEnabled((enabled) => !enabled)}
              aria-label={portfolio.hud.audioLabel}
              aria-pressed={soundEnabled}
            >
              {soundEnabled ? portfolio.hud.effectsOn : portfolio.hud.effectsOff}
            </button>
            <button
              className="hud-toggle"
              type="button"
              onClick={() => setCrtEnabled((enabled) => !enabled)}
              aria-label={portfolio.hud.crtLabel}
              aria-pressed={crtEnabled}
            >
              {crtEnabled ? portfolio.hud.screenOn : portfolio.hud.screenOff}
            </button>
          </div>
        </div>
        <nav className="stage-nav" aria-label={portfolio.hud.stageSelect}>
          {portfolio.stages.map((stage, index) => (
            <a
              key={stage.id}
              className={stageIndex === index ? 'stage-nav-link is-current' : 'stage-nav-link'}
              href={'#' + stage.id}
              aria-current={stageIndex === index ? 'location' : undefined}
            >
              <span className="nav-stage-number">{String(index + 1).padStart(2, '0')}</span>
              <span>{stage.nav}</span>
            </a>
          ))}
        </nav>
      </header>

      <StageTransitions />
      <main id="mission-stages" className="stage-stack">
        <section id={portfolio.stages[0].id} data-stage-index="0" className="stage-section hero-stage">
          <div className="stage-content stage-reveal">
            <p className="stage-kicker">{portfolio.hero.stage} <span>{portfolio.hero.kicker}</span></p>
            <h1 className="arcade-title glitch-text" data-text={portfolio.name}>{portfolio.name}</h1>
            <p className="hero-role"><span key={portfolio.hero.roles[roleIndex]} className="typed-role" style={roleStyle}>{portfolio.hero.roles[roleIndex]}</span></p>
            <p className="hero-subtitle">{portfolio.hero.subtitle}</p>
            <p className="hero-briefing">{portfolio.hero.briefing}</p>
            <div className="pixel-actions">
              <a id="hero-start" className="pixel-button pixel-button-primary" href={'#' + portfolio.stages[1].id}>{portfolio.hero.startMission}<span aria-hidden="true"> ▶</span></a>
              <a className="pixel-button pixel-button-quiet" href={'#' + portfolio.stages[5].id}>{portfolio.hero.contact}</a>
            </div>
            <a className="scroll-deploy" href={'#' + portfolio.stages[1].id}><span className="scroll-arrow" aria-hidden="true">▼</span>{portfolio.hero.scrollHint}</a>
          </div>
          <span className="hero-moon-label" aria-hidden="true">●</span>
          <div className="hero-ground-art" role="img" aria-label={portfolio.hero.portraitAlt} />
        </section>

        <section id={portfolio.stages[1].id} data-stage-index="1" className="stage-section brief-stage">
          <div className="section-grid stage-reveal">
            <div className="stage-heading">
              <p className="stage-kicker">{portfolio.about.stage} <span>{portfolio.about.kicker}</span></p>
              <h2 className="glitch-text" data-text={portfolio.about.title}>{portfolio.about.title}</h2>
              <div className="dialogue-box pixel-panel">
                {portfolio.about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              <div className="mission-objective pixel-panel">
                <span className="objective-mark" aria-hidden="true">!</span>
                <div><p className="micro-label">{portfolio.about.objectiveLabel}</p><p>{portfolio.about.objective}</p></div>
              </div>
            </div>
            <div className="field-readout pixel-panel" data-tilt onPointerMove={handleCardPointer} onPointerLeave={clearCardPointer}>
              <p className="micro-label">{portfolio.about.statusLabel}</p>
              <div className="radar-art" aria-hidden="true"><span /><i /><b /></div>
              <p className="field-coordinate">{portfolio.about.coordinates}</p>
              <p className="field-status">{portfolio.about.status}</p>
              <span className="readout-code" aria-hidden="true">{portfolio.about.coordinateReadout}</span>
            </div>
          </div>
        </section>

        <section id={portfolio.stages[2].id} data-stage-index="2" className="stage-section arsenal-stage">
          <div className="stage-reveal">
            <div className="section-title-row">
              <div>
                <p className="stage-kicker">{portfolio.arsenal.stage} <span>{portfolio.arsenal.kicker}</span></p>
                <h2 className="glitch-text" data-text={portfolio.arsenal.title}>{portfolio.arsenal.title}</h2>
              </div>
              <p className="section-side-copy">{portfolio.arsenal.description}</p>
            </div>
            <div className="arsenal-grid">
              {portfolio.arsenal.categories.map((category) => (
                <article className="weapon-card pixel-panel" data-tilt key={category.name} onPointerMove={handleCardPointer} onPointerLeave={clearCardPointer}>
                  <div className="weapon-card-top">
                    <PowerIcon icon={category.icon} />
                    <div><p className="micro-label">{category.name}</p><span className="gear-count">{String(category.items.length).padStart(2, '0')} {portfolio.arsenal.meterLabel}</span></div>
                  </div>
                  <div className="gear-meter" role="img" aria-label={category.items.length + ' ' + portfolio.arsenal.meterLabel}>
                    {Array.from({ length: 10 }, (_, index) => (
                      <span key={index} className={index < category.items.length ? 'meter-segment is-loaded' : 'meter-segment'} />
                    ))}
                  </div>
                  <ul className="weapon-list">
                    {category.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </article>
              ))}
            </div>
            <KaliTerminal />
          </div>
        </section>

        <section id={portfolio.stages[3].id} data-stage-index="3" className="stage-section missions-stage">
          <div className="stage-reveal">
            <div className="section-title-row">
              <div>
                <p className="stage-kicker">{portfolio.missions.stage} <span>{portfolio.missions.kicker}</span></p>
                <h2 className="glitch-text" data-text={portfolio.missions.title}>{portfolio.missions.title}</h2>
              </div>
              <p className="section-side-copy">{portfolio.missions.description}</p>
            </div>
            <div className="mission-grid">
              {portfolio.missions.items.map((mission, index) => (
                <article
                  className={'mission-card pixel-panel mission-card-' + (index + 1)}
                  data-tilt
                  key={mission.title}
                  onPointerMove={handleCardPointer}
                  onPointerLeave={clearCardPointer}
                >
                  <div className="cartridge-top">
                    <span className="mission-mark" aria-hidden="true">{mission.mark}</span>
                    <span className="micro-label">{portfolio.missions.fileLabel} {String(index + 1).padStart(2, '0')}</span>
                    <span className="mission-stamp">{portfolio.missions.openLabel}</span>
                  </div>
                  <h3>{mission.title}</h3>
                  <p className="mission-subtitle">{mission.subtitle}</p>
                  <p className="mission-detail">{mission.detail}</p>
                  <ul className="metadata-row">
                    {mission.metadata.map((tag) => <li key={tag}>{tag}</li>)}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id={portfolio.stages[4].id} data-stage-index="4" className="stage-section achievements-stage">
          <div className="stage-reveal">
            <div className="section-title-row">
              <div>
                <p className="stage-kicker">{portfolio.achievements.stage} <span>{portfolio.achievements.kicker}</span></p>
                <h2 className="glitch-text" data-text={portfolio.achievements.title}>{portfolio.achievements.title}</h2>
              </div>
              <p className="section-side-copy">{portfolio.achievements.description}</p>
            </div>
            <div className="medal-grid">
              {portfolio.achievements.items.map((achievement, index) => (
                <article className="medal-card pixel-panel" data-tilt key={achievement.title} onPointerMove={handleCardPointer} onPointerLeave={clearCardPointer}>
                  <div className="medal-card-mark"><PixelMedal index={index} /><span>{achievement.mark}</span></div>
                  <div><p className="micro-label">{portfolio.achievements.medalLabel}</p><h3>{achievement.title}</h3><p className="medal-detail">{achievement.detail}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id={portfolio.stages[5].id} data-stage-index="5" className="stage-section contact-stage">
          <div className="contact-frame pixel-panel stage-reveal">
            <p className="stage-kicker">{portfolio.contact.stage} <span>{portfolio.contact.kicker}</span></p>
            <p className="final-label" aria-hidden="true">★ ★ ★</p>
            <h2 className="game-clear glitch-text" data-text={portfolio.contact.title}>{portfolio.contact.title}</h2>
            <p className="contact-copy">{portfolio.contact.description}</p>
            <div className="contact-grid">
              {portfolio.contact.links.map((link) => (
                link.kind === 'profile' && link.href ? (
                  <a className="contact-link pixel-panel" href={link.href} key={link.label} target="_blank" rel="noreferrer">
                    <span>{link.label}</span><span className="link-arrow" aria-label={portfolio.contact.linkIconLabel}>↗</span>
                  </a>
                ) : (
                  <div className="contact-placeholder pixel-panel" key={link.label}>
                    <span>{link.label}</span><small>{link.placeholder}</small>
                  </div>
                )
              ))}
            </div>
            <a className="pixel-button pixel-button-primary restart-button" href={'#' + portfolio.stages[0].id}>{portfolio.contact.restart}</a>
            <p className="continue-line">{portfolio.contact.continueLabel}<span key={countdown}> {countdown}</span></p>
          </div>
        </section>
      </main>

      <footer className="arcade-footer">
        <span>{portfolio.name} / {portfolio.footer.year}</span>
        <span>{portfolio.footer.signature}</span>
        <span>{portfolio.hud.cheatHelp}</span>
      </footer>

      {bootStep !== null && (
        <div className="boot-screen" role="dialog" aria-modal="true" aria-label={portfolio.navigation.insertCoin}>
          <div className="boot-frame pixel-panel">
            <div className="boot-logo" aria-hidden="true"><span /><i /><b /></div>
            <p className="boot-kicker">{portfolio.name} / {portfolio.boot.kicker}</p>
            <button ref={bootStartRef} type="button" className="boot-start" onClick={advanceBoot}>
              {bootStep === 0 ? portfolio.navigation.insertCoin : bootStep === 1 ? portfolio.navigation.pressStart : portfolio.navigation.onePlayerStart}
            </button>
            <p className="boot-muted">{portfolio.navigation.mutedDefault}</p>
            <button type="button" className="boot-skip" onClick={closeBoot}>{portfolio.navigation.skipIntro}</button>
          </div>
        </div>
      )}

      {cheatActive && <div className="cheat-toast" role="status">{portfolio.hud.cheatToast}</div>}
      <div ref={trailRef} className="pixel-cursor-trail" aria-hidden="true" />
      <div ref={cursorRef} className="pixel-cursor" aria-hidden="true">
        <span className="reticle-corners" />
        <span className="reticle-center" />
        <span className="spread-reticle">✦</span>
      </div>
    </div>
  );
}
