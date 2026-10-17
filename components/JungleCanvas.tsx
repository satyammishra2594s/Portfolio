'use client';

import { useEffect, useRef } from 'react';

const WIDTH = 384;
const HEIGHT = 216;
const GROUND_Y = 184;
const MAX_PARTICLES = 112;
const POWER_TYPES = ['S', 'R', 'M', 'L', 'F'];
const PARTICLE_COLORS = ['#ff7542', '#f9d66b', '#7ee9ec', '#8ec96d'];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  rain: boolean;
  active: boolean;
};

type Bullet = { x: number; y: number; life: number; active: boolean };
type Capsule = { x: number; y: number; letter: string; active: boolean };

function newLayer() {
  const layer = document.createElement('canvas');
  layer.width = WIDTH;
  layer.height = HEIGHT;
  return layer;
}

export default function JungleCanvas({ stageIndex }: { stageIndex: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef(stageIndex);

  useEffect(() => {
    stageRef.current = stageIndex;
  }, [stageIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: false, desynchronized: true });
    if (!canvas || !context) return;

    const sky = newLayer();
    const mountains = newLayer();
    const jungle = newLayer();
    const ground = newLayer();
    const skyContext = sky.getContext('2d');
    const mountainContext = mountains.getContext('2d');
    const jungleContext = jungle.getContext('2d');
    const groundContext = ground.getContext('2d');
    if (!skyContext || !mountainContext || !jungleContext || !groundContext) return;

    skyContext.fillStyle = '#071324';
    skyContext.fillRect(0, 0, WIDTH, HEIGHT);
    skyContext.fillStyle = '#17303a';
    skyContext.fillRect(0, 101, WIDTH, 33);
    for (let i = 0; i < 72; i += 1) {
      const x = (i * 67 + 19) % WIDTH;
      const y = (i * 37 + 9) % 92;
      skyContext.fillStyle = i % 7 === 0 ? '#fff2b4' : '#9ecad0';
      skyContext.fillRect(x, y, i % 7 === 0 ? 2 : 1, i % 7 === 0 ? 2 : 1);
    }
    skyContext.fillStyle = '#f3d775';
    skyContext.fillRect(307, 32, 23, 23);
    skyContext.fillStyle = '#071324';
    skyContext.fillRect(301, 27, 8, 23);
    skyContext.fillRect(316, 50, 19, 8);
    skyContext.fillStyle = '#fff1bd';
    skyContext.fillRect(312, 36, 6, 6);

    mountainContext.fillStyle = '#122925';
    mountainContext.beginPath();
    mountainContext.moveTo(0, 139);
    mountainContext.lineTo(0, 112);
    for (let x = 0; x <= WIDTH; x += 32) {
      mountainContext.lineTo(x + 16, 83 + ((x * 13) % 31));
      mountainContext.lineTo(x + 32, 121 + ((x * 5) % 17));
    }
    mountainContext.lineTo(WIDTH, 151);
    mountainContext.lineTo(0, 151);
    mountainContext.closePath();
    mountainContext.fill();
    mountainContext.fillStyle = '#244035';
    mountainContext.beginPath();
    mountainContext.moveTo(0, 154);
    mountainContext.lineTo(0, 133);
    for (let x = 0; x <= WIDTH; x += 48) {
      mountainContext.lineTo(x + 22, 107 + ((x * 9) % 27));
      mountainContext.lineTo(x + 48, 147 + ((x * 3) % 13));
    }
    mountainContext.lineTo(WIDTH, 162);
    mountainContext.lineTo(0, 162);
    mountainContext.closePath();
    mountainContext.fill();

    jungleContext.fillStyle = '#122c23';
    for (let x = -20; x < WIDTH + 20; x += 34) {
      const treeHeight = 36 + ((x * 7 + 420) % 31);
      const crownY = 163 - treeHeight;
      jungleContext.fillRect(x + 13, crownY + 19, 10, treeHeight + 5);
      jungleContext.fillRect(x + 4, crownY + 10, 28, 18);
      jungleContext.fillRect(x + 8, crownY + 3, 20, 15);
      jungleContext.fillRect(x, crownY + 14, 12, 13);
      jungleContext.fillRect(x + 26, crownY + 12, 12, 15);
    }
    jungleContext.fillStyle = '#1d3b2b';
    for (let x = 12; x < WIDTH; x += 70) {
      jungleContext.fillRect(x + 16, 112, 7, 53);
      jungleContext.fillRect(x, 116, 40, 12);
      jungleContext.fillRect(x + 5, 105, 30, 13);
    }

    groundContext.fillStyle = '#302d22';
    groundContext.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);
    groundContext.fillStyle = '#596746';
    groundContext.fillRect(0, GROUND_Y, WIDTH, 4);
    groundContext.fillStyle = '#8da35a';
    for (let x = 0; x < WIDTH; x += 16) {
      groundContext.fillRect(x + 2, GROUND_Y - 2, 4, 2);
      groundContext.fillRect(x + 10, GROUND_Y - 1, 3, 1);
      groundContext.fillStyle = x % 32 === 0 ? '#494434' : '#3e3a2c';
      groundContext.fillRect(x, GROUND_Y + 10 + (x % 3), 16, 7);
      groundContext.fillStyle = '#8da35a';
    }
    groundContext.fillStyle = '#767553';
    groundContext.fillRect(42, 205, 14, 4);
    groundContext.fillRect(191, 199, 20, 4);
    groundContext.fillRect(316, 207, 13, 4);

    const particles: Particle[] = Array.from({ length: MAX_PARTICLES }, () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 0,
      size: 1,
      color: '#fff',
      rain: false,
      active: false,
    }));
    const bullets: Bullet[] = Array.from({ length: 18 }, () => ({
      x: 0,
      y: 0,
      life: 0,
      active: false,
    }));
    const capsules: Capsule[] = Array.from({ length: 5 }, () => ({
      x: 0,
      y: 0,
      letter: 'S',
      active: false,
    }));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowPower = (navigator.hardwareConcurrency || 4) < 6 || window.innerWidth < 700;
    let particleCap = lowPower ? 45 : MAX_PARTICLES;
    let activeParticles = 0;
    let elapsed = 0;
    let lastTime = 0;
    let lastShot = 0;
    let nextCapsule = 6;
    let nextExplosion = 12;
    let capsuleCount = 0;
    let nextAmbient = 0;
    let fpsElapsed = 0;
    let fpsFrames = 0;
    let slowWindows = 0;
    let recoveryFrames = 0;
    let cheatUntil = 0;
    let raf = 0;
    let scrollProgress = 0;

    function burst(x: number, y: number, amount: number) {
      for (let i = 0; i < particleCap && amount > 0; i += 1) {
        const particle = particles[i];
        if (particle.active) continue;
        const angle = Math.random() * Math.PI * 2;
        const speed = 8 + Math.random() * 33;
        particle.x = x;
        particle.y = y;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed - 8;
        particle.maxLife = 0.25 + Math.random() * 0.55;
        particle.life = particle.maxLife;
        particle.size = 1 + Math.floor(Math.random() * 3);
        particle.color = PARTICLE_COLORS[(Math.random() * PARTICLE_COLORS.length) | 0];
        particle.rain = false;
        particle.active = true;
        activeParticles += 1;
        amount -= 1;
      }
    }

    function shoot(x: number, y: number, now: number) {
      for (let i = 0; i < bullets.length; i += 1) {
        if (bullets[i].active) continue;
        bullets[i].x = x;
        bullets[i].y = y;
        bullets[i].life = now;
        bullets[i].active = true;
        break;
      }
      burst(x + 4, y, 4);
    }

    function drawWaterfall(now: number) {
      context.fillStyle = '#126979';
      context.fillRect(273, 76, 47, 106);
      context.fillStyle = '#163a38';
      context.fillRect(266, 70, 7, 115);
      context.fillRect(320, 70, 6, 116);
      context.fillStyle = '#62e0e7';
      context.fillRect(278, 77, 4, 103);
      context.fillRect(292, 77, 5, 103);
      context.fillRect(310, 77, 3, 103);
      const flow = (now * 18) % 9;
      context.fillStyle = '#b8ffff';
      for (let y = -9; y < 108; y += 18) {
        context.fillRect(284, y + flow + 76, 2, 7);
        context.fillRect(303, y + flow + 76, 2, 8);
      }
      context.fillStyle = '#71eaf1';
      context.fillRect(266, 177, 61, 7);
      context.fillRect(279, 185, 42, 2);
    }

    function drawBase(now: number) {
      context.fillStyle = '#26333c';
      context.fillRect(276, 87, 80, 95);
      context.fillStyle = '#54615b';
      context.fillRect(282, 80, 69, 8);
      context.fillRect(294, 66, 9, 14);
      context.fillRect(332, 59, 11, 21);
      context.fillStyle = '#8f9d83';
      context.fillRect(285, 98, 6, 77);
      context.fillRect(346, 98, 5, 77);
      context.fillStyle = Math.floor(now * 3) % 2 ? '#f7784d' : '#f9d66b';
      context.fillRect(310, 111, 15, 12);
      context.fillStyle = '#15212a';
      context.fillRect(314, 114, 7, 6);
    }

    function drawEnergyZone(now: number) {
      context.fillStyle = '#311e28';
      context.fillRect(260, 118, 112, 64);
      context.fillStyle = '#ff7645';
      context.fillRect(271, 110, 7, 73);
      context.fillRect(345, 105, 6, 78);
      context.fillStyle = '#f5bd53';
      context.fillRect(266, 137 + ((now * 12) % 20), 85, 3);
      context.fillStyle = '#f56546';
      context.fillRect(289, 145, 21, 24);
      context.fillStyle = '#ffd879';
      context.fillRect(295, 151, 9, 12);
    }

    function drawHangar() {
      context.fillStyle = '#263746';
      context.fillRect(263, 92, 110, 90);
      context.fillStyle = '#637078';
      context.fillRect(263, 92, 110, 6);
      context.fillRect(263, 113, 110, 3);
      context.fillRect(263, 169, 110, 5);
      context.fillStyle = '#9bb5aa';
      for (let x = 271; x < 370; x += 22) {
        context.fillRect(x, 102, 4, 64);
      }
      context.fillStyle = '#e0c96d';
      context.fillRect(303, 124, 31, 3);
      context.fillRect(316, 117, 4, 17);
    }

    function drawBossLair(now: number) {
      context.fillStyle = '#301e2b';
      context.fillRect(264, 78, 109, 104);
      context.fillStyle = '#6d3042';
      context.fillRect(271, 83, 95, 7);
      context.fillRect(271, 173, 95, 7);
      context.fillStyle = '#842e3f';
      context.fillRect(281, 90, 8, 80);
      context.fillRect(347, 90, 8, 80);
      context.fillStyle = Math.floor(now * 5) % 2 ? '#ff644a' : '#f5b958';
      context.fillRect(303, 111, 33, 7);
      context.fillRect(309, 126, 21, 5);
      context.fillRect(303, 141, 33, 7);
    }

    function drawCommando(now: number) {
      const runnerX = Math.floor((now * 39) % (WIDTH + 34)) - 24;
      const feet = GROUND_Y - 1;
      const step = Math.floor(now * 10) % 2;
      context.fillStyle = '#18251f';
      context.fillRect(runnerX + 3, feet - 5, 5, 4);
      context.fillRect(runnerX + 11, feet - (step ? 7 : 4), 6, 4);
      context.fillStyle = '#668b50';
      context.fillRect(runnerX + 3, feet - 12, 13, 8);
      context.fillRect(runnerX + 1, feet - 11, 4, 5);
      context.fillStyle = '#e9b67b';
      context.fillRect(runnerX + 11, feet - 19, 8, 7);
      context.fillStyle = '#536f42';
      context.fillRect(runnerX + 8, feet - 23, 13, 6);
      context.fillRect(runnerX + 6, feet - 18, 8, 2);
      context.fillStyle = '#82412f';
      context.fillRect(runnerX + 14, feet - 12, 5, 3);
      context.fillStyle = '#c1c8a0';
      context.fillRect(runnerX + 17, feet - 14, 12, 3);
      context.fillStyle = '#474c3f';
      context.fillRect(runnerX + 25, feet - 13, 9, 2);
      if (now - lastShot > 0.62) {
        lastShot = now;
        shoot(runnerX + 33, feet - 13, now);
      }
      if (now < cheatUntil) {
        context.fillStyle = '#f4cc6b';
        context.fillRect(runnerX + 31, feet - 16, 10, 2);
        context.fillRect(runnerX + 31, feet - 9, 10, 2);
      }
    }

    function draw(now: number, delta: number) {
      const stage = stageRef.current;
      const parallax = scrollProgress * WIDTH;
      context.imageSmoothingEnabled = false;
      context.drawImage(sky, 0, 0);
      let offset = -((now * 2 + parallax * 0.09) % WIDTH);
      context.drawImage(mountains, offset, 0);
      context.drawImage(mountains, offset + WIDTH, 0);
      offset = -((now * 5 + parallax * 0.28) % WIDTH);
      context.drawImage(jungle, offset, 0);
      context.drawImage(jungle, offset + WIDTH, 0);
      context.drawImage(ground, 0, 0);

      if (stage === 1) drawWaterfall(now);
      if (stage === 2) drawBase(now);
      if (stage === 3) drawEnergyZone(now);
      if (stage === 4) drawHangar();
      if (stage >= 5) drawBossLair(now);

      if (stage === 3) {
        context.fillStyle = 'rgba(229, 84, 47, 0.12)';
        context.fillRect(0, 0, WIDTH, HEIGHT);
      } else if (stage >= 4) {
        context.fillStyle = 'rgba(17, 20, 42, 0.20)';
        context.fillRect(0, 0, WIDTH, HEIGHT);
      }

      if (now >= nextAmbient) {
        nextAmbient = now + 0.045 + Math.random() * 0.11;
        for (let i = 0; i < particleCap; i += 1) {
          const particle = particles[i];
          if (particle.active) continue;
          const rain = Math.random() < 0.16;
          particle.x = Math.random() * WIDTH;
          particle.y = 48 + Math.random() * 124;
          particle.vx = rain ? -15 : -3 + Math.random() * 6;
          particle.vy = rain ? 45 + Math.random() * 25 : -4 - Math.random() * 8;
          particle.maxLife = 1.2 + Math.random() * 3.1;
          particle.life = particle.maxLife;
          particle.size = rain ? 4 : Math.random() > 0.87 ? 2 : 1;
          particle.color = rain ? '#74dce5' : PARTICLE_COLORS[(Math.random() * PARTICLE_COLORS.length) | 0];
          particle.rain = rain;
          particle.active = true;
          activeParticles += 1;
          break;
        }
      }

      if (now > nextExplosion) {
        nextExplosion = now + 13 + Math.random() * 18;
        burst(242 + Math.random() * 86, 99 + Math.random() * 47, 7);
      }

      if (now > nextCapsule) {
        nextCapsule = now + 8 + Math.random() * 6;
        for (let i = 0; i < capsules.length; i += 1) {
          if (capsules[i].active) continue;
          capsules[i].x = 65 + Math.random() * (WIDTH - 130);
          capsules[i].y = 40;
          capsules[i].letter = POWER_TYPES[capsuleCount % POWER_TYPES.length];
          capsuleCount += 1;
          capsules[i].active = true;
          break;
        }
      }

      for (let i = 0; i < particleCap; i += 1) {
        const particle = particles[i];
        if (!particle.active) continue;
        particle.life -= delta;
        if (particle.life <= 0) {
          particle.active = false;
          activeParticles -= 1;
          continue;
        }
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        const alpha = Math.max(0, Math.min(1, particle.life / particle.maxLife));
        context.globalAlpha = alpha;
        context.fillStyle = particle.color;
        context.fillRect(particle.x | 0, particle.y | 0, particle.rain ? 1 : particle.size, particle.rain ? 5 : particle.size);
      }
      context.globalAlpha = 1;

      for (let i = 0; i < bullets.length; i += 1) {
        const bullet = bullets[i];
        if (!bullet.active) continue;
        bullet.x += delta * 138;
        if (bullet.x > WIDTH || now - bullet.life > 2.7) {
          bullet.active = false;
          continue;
        }
        context.fillStyle = '#ffe89a';
        context.fillRect(bullet.x | 0, bullet.y | 0, 4, 2);
      }

      for (let i = 0; i < capsules.length; i += 1) {
        const capsule = capsules[i];
        if (!capsule.active) continue;
        capsule.y += delta * 23;
        if (capsule.y > GROUND_Y - 9) {
          capsule.active = false;
          burst(capsule.x, GROUND_Y - 7, 8);
          continue;
        }
        context.fillStyle = '#e6d287';
        context.fillRect(capsule.x | 0, capsule.y | 0, 12, 9);
        context.fillStyle = '#d94e3b';
        context.fillRect((capsule.x + 2) | 0, (capsule.y + 2) | 0, 8, 5);
        context.fillStyle = '#fff3b4';
        context.font = 'bold 7px monospace';
        context.fillText(capsule.letter, capsule.x + 4, capsule.y + 7);
      }

      drawCommando(now);
      if (activeParticles > particleCap) activeParticles = particleCap;
    }

    function handleScroll() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      if (reducedMotion) draw(0, 0);
    }

    function handleClick(event: MouseEvent) {
      burst((event.clientX / window.innerWidth) * WIDTH, (event.clientY / window.innerHeight) * HEIGHT, 12);
      if (reducedMotion) draw(0, 0);
    }

    function handleCheat() {
      cheatUntil = elapsed + 30;
      burst(WIDTH * 0.5, HEIGHT * 0.45, 24);
    }

    function frame(nowMs: number) {
      if (document.hidden) return;
      const delta = lastTime === 0 ? 0 : Math.min((nowMs - lastTime) / 1000, 0.05);
      lastTime = nowMs;
      elapsed += delta;
      fpsElapsed += delta;
      fpsFrames += 1;

      if (fpsElapsed >= 1) {
        const fps = fpsFrames / fpsElapsed;
        if (fps < 50) {
          slowWindows += 1;
          recoveryFrames = 0;
          if (slowWindows >= 2) {
            const previousParticleCap = particleCap;
            particleCap = Math.max(24, particleCap - 20);
            for (let i = particleCap; i < previousParticleCap; i += 1) {
              if (!particles[i].active) continue;
              particles[i].active = false;
              activeParticles -= 1;
            }
            slowWindows = 0;
          }
        } else {
          slowWindows = 0;
          recoveryFrames += 1;
          if (fps > 57 && recoveryFrames >= 4 && particleCap < (lowPower ? 45 : MAX_PARTICLES)) {
            particleCap = Math.min(lowPower ? 45 : MAX_PARTICLES, particleCap + 8);
            recoveryFrames = 0;
          }
        }
        fpsElapsed = 0;
        fpsFrames = 0;
      }

      draw(elapsed, delta);
      if (!reducedMotion) raf = requestAnimationFrame(frame);
    }

    function handleVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        return;
      }
      lastTime = 0;
      if (!reducedMotion) raf = requestAnimationFrame(frame);
      else draw(0, 0);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('contra:stage', handleScroll);
    window.addEventListener('click', handleClick, { passive: true });
    window.addEventListener('contra:cheat', handleCheat);
    document.addEventListener('visibilitychange', handleVisibility);
    handleScroll();
    draw(0, 0);
    if (!reducedMotion) raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('contra:stage', handleScroll);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('contra:cheat', handleCheat);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="arcade-canvas"
      width={WIDTH}
      height={HEIGHT}
      aria-hidden="true"
    />
  );
}
