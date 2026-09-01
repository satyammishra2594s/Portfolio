'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useWorldStore } from '../lib/store';

const sections = ['HOME','THE WARRIOR','THE JOURNEY','SKILL TREE','SHADOW ARTS','MISSIONS','VICTORIES','FINAL BATTLE','ENDING'];

export default function Overlay() {
  const progress = useWorldStore(s => s.progress);
  const setProgress = useWorldStore(s => s.setProgress);
  const [terminalText, setTerminalText] = useState('');
  const terminal = 'shadow@kali:~$ skills --cyber';
  const codeRain = useMemo(() => Array.from({length: 22}, (_, i) => ({ left: (i * 4.7) % 100, delay: (i % 7) * .7, duration: 5 + (i % 5) })), []);

  useEffect(() => {
    let i = 0;
    const id = window.setInterval(() => { i += 1; setTerminalText(terminal.slice(0, i)); if (i >= terminal.length) window.clearInterval(id); }, 55);
    const on = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      setProgress(max ? scrollY / max : 0);
    };
    addEventListener('scroll', on, { passive: true });
    on();
    return () => { clearInterval(id); removeEventListener('scroll', on); };
  }, [setProgress]);

  const jump = (i: number) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    scrollTo({ top: max * (i / (sections.length - 1)), behavior: 'smooth' });
  };

  return <div className="relative z-10 pointer-events-none">
    <nav className="pointer-events-auto fixed left-1/2 top-4 z-40 flex max-w-[96vw] -translate-x-1/2 overflow-x-auto rounded-full border border-white/10 bg-black/45 px-1 py-1 backdrop-blur-xl">
      {sections.map((s,i) => <button key={s} onClick={() => jump(i)} className="whitespace-nowrap px-3 py-2 text-[8px] font-bold tracking-[.16em] text-white/60 transition hover:text-orange-300 md:text-[9px]">{s}</button>)}
    </nav>

    <div className="fixed left-5 top-5 z-40 hud text-[9px] text-white/55">
      <div>PLAYER 01</div><div>LEVEL 01 — ORIGIN</div><div className="mt-1 text-orange-300">STATUS: ONLINE</div>
      <div className="mt-2 h-1 w-36 bg-white/10"><div className="h-full bg-orange-400 transition-[width] duration-150" style={{width: `${progress * 100}%`}} /></div>
      <div className="mt-1 text-[7px] text-white/30">XP {Math.round(progress * 1000).toString().padStart(4,'0')}</div>
    </div>

    <main className="min-h-[900vh]">
      <section className="flex min-h-screen items-center px-6 md:px-16">
        <div className="max-w-5xl">
          <p className="hud mb-5 text-xs text-orange-300">FORGING THE WORLD • PLAYER 01</p>
          <h1 className="fire-text text-6xl font-black md:text-[10rem] md:leading-[.82]">SATYAM<br/>MISHRA</h1>
          <p className="mt-8 text-lg text-white/80 md:text-2xl">AI &amp; Data Science Student @ IIT Jodhpur</p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55 md:text-base">Exploring AI, Data Science, Machine Learning, Web Development and Cybersecurity while building practical technology.</p>
          <div className="pointer-events-auto mt-8 flex flex-wrap gap-3"><Button onClick={() => jump(1)}>ENTER MY WORLD</Button><Button secondary onClick={() => jump(5)}>VIEW MY QUEST</Button></div>
        </div>
      </section>

      <section className="flex min-h-screen items-center px-6 md:px-16"><Card kicker="THE WARRIOR" title="Curiosity turned into practical technology." body="IIT Jodhpur • AI & Data Science • AI/ML • Web Development • Cybersecurity • Hackathons • Gaganyaan • Technology leadership • Building practical solutions" /></section>

      <section className="relative flex min-h-screen items-center px-6 md:px-16"><div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_45%,rgba(70,120,255,.12),transparent_35%)]"/><Card kicker="THE JOURNEY • SPACE MISSION BEAT" title="Six milestones that shaped the quest." body="IIT Jodhpur • Gaganyaan internship • ISRO Hackathon participant • Deloitte Australia cybersecurity job simulation via Forage • AWS SBG IIT Jodhpur Technical Co-Lead • Smart India Hackathon participant" /></section>

      <section className="flex min-h-screen items-center px-6 md:px-16"><SkillTree /></section>

      <section className="relative flex min-h-screen items-center justify-end overflow-hidden px-6 md:px-16">
        <div className="matrix absolute inset-0 opacity-25">{codeRain.map((c,i) => <span key={i} style={{left:`${c.left}%`,animationDelay:`${c.delay}s`,animationDuration:`${c.duration}s`}}>01XKALI</span>)}</div>
        <Card kicker="SHADOW ARTS • CYBERSECURITY" title="Enter the shadow realm." body="Cybersecurity • Ethical Hacking • Kali Linux" terminalText={terminalText} />
      </section>

      <section className="flex min-h-screen items-center px-6 md:px-16"><Missions /></section>
      <section className="flex min-h-screen items-center px-6 md:px-16"><Victories /></section>

      <section className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="max-w-4xl"><p className="hud text-xs text-orange-300">FINAL BATTLE</p><h2 className="mt-5 text-5xl font-black md:text-8xl">THE JOURNEY<br/>DOESN&apos;T END HERE.</h2><p className="mt-5 text-white/55">Let&apos;s build something meaningful.</p>
          <div className="pointer-events-auto mt-8 flex flex-wrap justify-center gap-3"><a className="glass rounded-full px-6 py-3 text-xs font-bold" href="#">GITHUB — EDIT LINK</a><a className="glass rounded-full px-6 py-3 text-xs font-bold" href="#">LINKEDIN — EDIT LINK</a><a className="rounded-full bg-orange-500 px-6 py-3 text-xs font-bold text-black" href="mailto:your-email@example.com">EMAIL — EDIT LINK</a></div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 text-center"><div><p className="hud text-orange-300">NEXT LEVEL LOADING…</p><h3 className="mt-5 text-5xl font-black md:text-8xl">SATYAM MISHRA</h3><p className="mt-4 tracking-[.35em] text-white/45">BUILD. LEARN. INNOVATE.</p><button onClick={() => jump(0)} className="pointer-events-auto mt-10 rounded-full border border-white/15 px-6 py-3 text-xs font-bold tracking-widest text-white/70 hover:border-orange-400 hover:text-orange-300">RESTART QUEST</button></div></section>
    </main>
  </div>;
}

function Button({children, onClick, secondary=false}:{children:React.ReactNode;onClick:()=>void;secondary?:boolean}) {
  return <motion.button whileHover={{y:-3,scale:1.02}} whileTap={{scale:.98}} onClick={onClick} className={secondary ? 'glass rounded-full px-6 py-3 text-xs font-black tracking-widest' : 'rounded-full bg-orange-500 px-6 py-3 text-xs font-black tracking-widest text-black'}>{children}</motion.button>;
}

function Card({kicker,title,body,terminalText}:{kicker:string;title:string;body:string;terminalText?:string}) {
  return <motion.div initial={{opacity:0,y:32}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.25}} transition={{duration:.55}} className="glass relative z-10 max-w-2xl rounded-3xl p-7 md:p-10"><p className="hud text-xs text-orange-300">{kicker}</p><h2 className="mt-5 text-3xl font-black md:text-5xl">{title}</h2><p className="mt-5 text-sm leading-7 text-white/60">{body}</p>{terminalText !== undefined && <div className="mt-7 rounded-2xl border border-cyan-300/10 bg-black/65 p-5 font-mono text-xs leading-7 text-cyan-200"><span className="text-white/30">{terminalText}</span><span className="animate-pulse">▌</span><br/><span className="text-white/30">shadow@kali:~$</span> whoami<br/>AI &amp; Data Science student • cybersecurity learner<br/><span className="text-white/30">shadow@kali:~$</span> skills --cyber<br/><span className="text-orange-300">Cybersecurity • Ethical Hacking • Kali Linux</span></div>}</motion.div>;
}

function SkillTree() {
  const groups=[['AI & DATA',['AI','Data Science','Machine Learning','Statistics & Probability']],['PROGRAMMING',['Python','DSA']],['WEB',['HTML','CSS','JavaScript','Responsive Design']],['CYBERSECURITY',['Cybersecurity','Ethical Hacking','Kali Linux']],['TOOLS',['Git','GitHub','Vercel']]];
  return <div className="w-full max-w-6xl"><p className="hud text-xs text-orange-300">SKILL TREE</p><h2 className="mt-4 text-5xl font-black md:text-7xl">UNLOCKED<br/>ABILITIES</h2><div className="skill-tree mt-10"><div className="skill-line"/>{groups.map(([h,items])=><div key={h} className="glass skill-node rounded-2xl p-5"><p className="hud text-[10px] text-cyan-200">{h}</p><div className="mt-4 flex flex-wrap gap-2">{items.map(x=><span key={x} className="rounded-full border border-orange-300/10 bg-white/5 px-3 py-2 text-xs text-white/75">{x}</span>)}</div></div>)}</div></div>;
}

function Missions() {
  return <div className="w-full max-w-5xl"><p className="hud text-xs text-orange-300">MISSIONS</p><h2 className="mt-4 text-5xl font-black md:text-7xl">BUILD LOG</h2><div className="mt-10 grid gap-4 md:grid-cols-2"><div className="glass rounded-3xl p-7"><p className="hud text-xs text-cyan-200">MISSION 01</p><h3 className="mt-3 text-3xl font-black">AeroAI</h3><div className="mt-5 grid gap-2 text-xs text-white/50"><span>DESCRIPTION: <b className="text-white/70">EDITABLE PLACEHOLDER</b></span><span>STACK: <b className="text-white/70">EDITABLE PLACEHOLDER</b></span><span>LINK: <b className="text-white/70">EDITABLE PLACEHOLDER</b></span></div></div><div className="rounded-3xl border border-dashed border-white/15 p-7"><p className="hud text-xs text-white/30">NEXT MISSION</p><h3 className="mt-3 text-3xl font-black text-white/35">LOCKED SLOT</h3></div></div></div>;
}

function Victories() {
  const items=['Gaganyaan Internship','ISRO Hackathon Participant','Deloitte Australia / Forage Cybersecurity Job Simulation','Lean Six Sigma AI — Yellow Belt','AWS SBG IIT Jodhpur — Technical Co-Lead','Smart India Hackathon — Participant'];
  return <div className="w-full max-w-5xl"><p className="hud text-xs text-orange-300">VICTORIES</p><h2 className="mt-4 text-5xl font-black md:text-7xl">MILESTONES</h2><div className="mt-10 grid gap-3 md:grid-cols-2">{items.map((x,i)=><motion.div whileHover={{y:-4}} key={x} className={i===0 ? 'glass rounded-2xl border-orange-400/30 p-6 md:col-span-2 md:p-8' : 'glass rounded-2xl p-5'}><p className="hud text-[10px] text-orange-300">{String(i+1).padStart(2,'0')} / ACHIEVEMENT</p><h3 className="mt-2 text-xl font-black md:text-2xl">{x}</h3></motion.div>)}</div><p className="mt-6 text-xs text-white/35">Secondary: IIT Jodhpur chess team for an inter-college competition.</p></div>;
}
