'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useWorldStore } from '../lib/store';

gsap.registerPlugin(ScrollTrigger);

function Terrain() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(70, 190, 70, 150);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      p.setZ(i, Math.sin(x * .2) * .7 + Math.sin(y * .1) * .55 + Math.sin((x + y) * .055) * .8 + Math.random() * .12);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return <mesh geometry={geo} rotation-x={-Math.PI / 2} position={[0, -1.2, -46]} receiveShadow><meshStandardMaterial color="#17100e" roughness={1} metalness={.12} /></mesh>;
}

function Mountains() {
  return <group position={[0, 3.5, -76]}>{Array.from({ length: 15 }).map((_, i) => { const x = (i - 7) * 8.5; const h = 9 + (i % 5) * 3.2; return <mesh key={i} position={[x, h / 2, (i % 3) * -2]}><coneGeometry args={[7 + (i % 3), h, 6]} /><meshStandardMaterial color="#07090d" roughness={1} /></mesh>; })}</group>;
}

function Gate({ z, final = false }: { z: number; final?: boolean }) {
  const left = useRef<THREE.Group>(null), right = useRef<THREE.Group>(null);
  useEffect(() => {
    const leftTo = left.current ? gsap.quickTo(left.current.rotation, 'y', { duration: .18, overwrite: true }) : (_value: number) => {};
    const rightTo = right.current ? gsap.quickTo(right.current.rotation, 'y', { duration: .18, overwrite: true }) : (_value: number) => {};
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: self => {
        const start = Math.min(Math.max((Math.abs(z) / 180) - .08, 0), .8);
        const open = THREE.MathUtils.clamp((self.progress - start) / .1, 0, 1);
        leftTo(.8 * open);
        rightTo(-.8 * open);
      }
    });
    return () => trigger.kill();
  }, [z]);
  return <group position={[0, 3, z]} scale={final ? 1.28 : 1}>
    {[-1, 1].map(s => <mesh key={s} position={[s * 5, 0, 0]} castShadow><cylinderGeometry args={[.75, .9, 12, 10]} /><meshStandardMaterial color="#35130b" metalness={.35} roughness={.5} emissive="#381008" emissiveIntensity={1.1} /></mesh>)}
    <mesh position={[0, 8, 0]} castShadow><boxGeometry args={[13.5, 1, 1]} /><meshStandardMaterial color="#641b0b" metalness={.2} roughness={.5} emissive="#421006" emissiveIntensity={1.2} /></mesh>
    <group ref={left} position={[-3.2, 4.5, .2]}><mesh><boxGeometry args={[4.6, 7, .38]} /><meshStandardMaterial color="#48150b" roughness={.6} /></mesh></group>
    <group ref={right} position={[3.2, 4.5, .2]}><mesh><boxGeometry args={[4.6, 7, .38]} /><meshStandardMaterial color="#48150b" roughness={.6} /></mesh></group>
  </group>;
}

const fireVertex = `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const fireFragment = `uniform float uTime; varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
void main(){vec2 uv=vUv;float n=noise(vec2(uv.x*4.0,uv.y*3.0-uTime*1.4));n+=.5*noise(vec2(uv.x*9.0,uv.y*7.0-uTime*2.1));float flame=smoothstep(.08,.78,(1.0-uv.y)+n*.55);float edge=smoothstep(.03,.28,uv.x)*smoothstep(.03,.28,1.0-uv.x);float a=flame*edge;vec3 deep=vec3(.35,.015,.002),orange=vec3(1.0,.12,.005),hot=vec3(1.0,.82,.32);vec3 col=mix(deep,orange,smoothstep(.15,.55,flame));col=mix(col,hot,smoothstep(.55,.92,flame));gl_FragColor=vec4(col,a*.92);}`;

function Fire() {
  const mat = useRef<THREE.ShaderMaterial>(null); const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => { const t = clock.elapsedTime; if (mat.current) mat.current.uniforms.uTime.value = t; if (light.current) light.current.intensity = 7 + Math.sin(t * 8) * 1.3 + Math.sin(t * 17) * .7; });
  return <group position={[0, 0, -31]}><pointLight ref={light} color="#ff5720" distance={48} intensity={8} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
    <mesh position={[0, 3.2, 0]} scale={[5, 7, 2.5]}><planeGeometry args={[1, 1, 32, 32]} /><shaderMaterial ref={mat} vertexShader={fireVertex} fragmentShader={fireFragment} transparent depthWrite={false} blending={THREE.AdditiveBlending} uniforms={{ uTime: { value: 0 } }} /></mesh>
    <mesh position={[0, 1, -.8]}><sphereGeometry args={[2.5, 24, 16]} /><meshStandardMaterial color="#ff6b18" emissive="#ff2600" emissiveIntensity={5} /></mesh>
  </group>;
}

function EmberField() {
  const group = useRef<THREE.InstancedMesh>(null); const count = useMemo(() => typeof window !== 'undefined' && (innerWidth < 800 || (navigator.hardwareConcurrency || 4) < 6) ? 320 : 900, []);
  const data = useMemo(() => Array.from({ length: count }, () => ({ x: (Math.random() - .5) * 45, y: Math.random() * 18 - 1, z: -Math.random() * 155, s: .035 + Math.random() * .09 })), [count]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => { if (!group.current) return; data.forEach((v, i) => { dummy.position.set(v.x, v.y, v.z); dummy.scale.setScalar(v.s); dummy.updateMatrix(); group.current!.setMatrixAt(i, dummy.matrix); }); group.current.instanceMatrix.needsUpdate = true; }, [data, dummy]);
  useFrame(({ clock }) => { if (!group.current || useWorldStore.getState().reduced) return; data.forEach((v, i) => { v.y += .025; v.x += Math.sin(clock.elapsedTime * .8 + i) * .002; if (v.y > 20) v.y = -1; dummy.position.set(v.x, v.y, v.z); dummy.scale.setScalar(v.s); dummy.updateMatrix(); group.current!.setMatrixAt(i, dummy.matrix); }); group.current.instanceMatrix.needsUpdate = true; });
  return <instancedMesh ref={group} args={[undefined, undefined, count]}><sphereGeometry args={[1, 5, 5]} /><meshBasicMaterial color="#ff7438" /></instancedMesh>;
}

function Samurai() {
  return <group position={[4, -.9, -42]} rotation-y={-.25}>
    <mesh position={[0, 2.2, 0]} castShadow><sphereGeometry args={[.65, 8, 6]} /><meshStandardMaterial color="#15171b" metalness={.55} roughness={.35} /></mesh>
    <mesh position={[0, 1.2, 0]} castShadow><cylinderGeometry args={[.75, .9, 1.8, 8]} /><meshStandardMaterial color="#17191f" metalness={.5} roughness={.45} /></mesh>
    <mesh position={[0, .15, 0]} castShadow><boxGeometry args={[.45, 1.7, .45]} /><meshStandardMaterial color="#101216" /></mesh>
    <mesh position={[-.55, .9, 0]} rotation-z={-.35} castShadow><capsuleGeometry args={[.16, 1.1, 5, 8]} /><meshStandardMaterial color="#24262b" /></mesh>
    <mesh position={[.55, .9, 0]} rotation-z={.35} castShadow><capsuleGeometry args={[.16, 1.1, 5, 8]} /><meshStandardMaterial color="#24262b" /></mesh>
    <mesh position={[.95, 1.15, -.1]} rotation-z={-.7}><boxGeometry args={[.06, 2.7, .06]} /><meshStandardMaterial color="#d6d9df" metalness={.8} roughness={.2} emissive="#332014" emissiveIntensity={.4} /></mesh>
    <mesh position={[.1, 2.82, 0]}><boxGeometry args={[1.15, .12, .8]} /><meshStandardMaterial color="#12151a" metalness={.65} roughness={.3} /></mesh>
  </group>;
}

function CameraRig() {
  const { camera } = useThree(); const tl = useRef<gsap.core.Tween | null>(null); const mouse = useRef({ x: 0, y: 0 }); const reduced = useWorldStore(s => s.reduced);
  useEffect(() => { if (reduced) return; const target = { progress: 0 }; tl.current = gsap.to(target, { progress: 1, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1, onUpdate: self => useWorldStore.getState().setProgress(self.progress) }, onUpdate: () => { camera.position.z = 5 - target.progress * 145; } }); const f = (e: MouseEvent) => { mouse.current.x = e.clientX / innerWidth - .5; mouse.current.y = e.clientY / innerHeight - .5; }; addEventListener('mousemove', f); return () => { tl.current?.kill(); tl.current?.scrollTrigger?.kill(); removeEventListener('mousemove', f); }; }, [camera, reduced]);
  useFrame(() => { if (reduced) return; camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.current.x * .8, .05); camera.position.y = THREE.MathUtils.lerp(camera.position.y, 2.2 - mouse.current.y * .5, .05); camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, -mouse.current.x * .035, .05); });
  return null;
}

function Scene() {
  const [low, setLow] = useState(false); const reduced = useWorldStore(s => s.reduced);
  useEffect(() => { const gpu = navigator.hardwareConcurrency || 4; setLow(innerWidth < 700 || gpu < 4); }, []);
  return <><color attach="background" args={['#020306']} /><fogExp2 attach="fog" args={['#09070a', .033]} /><ambientLight intensity={reduced ? .35 : .16} /><directionalLight position={[-8, 15, 8]} intensity={.5} color="#93a7c9" castShadow shadow-mapSize-width={low ? 512 : 1024} shadow-mapSize-height={low ? 512 : 1024} /><Environment preset="night" background={false} blur={.35} /><Stars radius={120} depth={90} count={low ? 900 : 2600} factor={1.5} saturation={0} fade speed={reduced ? 0 : .15} /><mesh position={[18, 22, -65]}><sphereGeometry args={[2.4, 24, 16]} /><meshBasicMaterial color="#d9e3ff" /></mesh><pointLight position={[18, 20, -65]} color="#9eb7ff" intensity={1.2} distance={35} />
    <Terrain /><Mountains /><Fire /><EmberField /><Samurai /><Gate z={-8} /><Gate z={-55} /><Gate z={-105} /><Gate z={-142} final /><CameraRig />
    <EffectComposer multisampling={low ? 0 : 2}><Bloom intensity={1.25} luminanceThreshold={.5} luminanceSmoothing={.35} mipmapBlur /><DepthOfField focusDistance={.018} focalLength={.035} bokehScale={low ? 1 : 2.1} /><ChromaticAberration offset={new THREE.Vector2(.00035, .00035)} /><Vignette darkness={.72} eskil={false} /><Noise premultiply opacity={.075} /></EffectComposer></>;
}

export default function World() { const [ready, setReady] = useState(false); useEffect(() => { const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; useWorldStore.getState().setReduced(reduced); const t = setTimeout(() => setReady(true), 350); return () => clearTimeout(t); }, []); if (!ready) return <div className="fixed inset-0 z-50 grid place-items-center bg-[#030305] text-center"><div><div className="hud text-orange-300">FORGING THE WORLD…</div><div className="mt-4 h-1 w-56 overflow-hidden bg-white/10"><div className="h-full w-2/3 animate-pulse bg-orange-500" /></div></div></div>; return <div className="fixed inset-0 z-0"><Canvas shadows dpr={[1, 1.6]} camera={{ position: [0, 2.2, 5], fov: 55 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}><Scene /></Canvas></div>; }
