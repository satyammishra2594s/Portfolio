'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useWorldStore } from '../lib/store';

const orange = '#ff5724';
const metal = '#111821';
const edge = '#283744';
const cyan = '#71f4ff';

export default function Robot() {
  const { size } = useThree();
  const compact = size.width < 700;
  const rig = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const coreMat = useRef<THREE.MeshStandardMaterial>(null);
  const coreLight = useRef<THREE.PointLight>(null);
  const orbit = useRef<THREE.Group>(null);
  const hovered = useRef(false);
  const charge = useRef(0);

  useEffect(() => () => { document.body.style.cursor = ''; }, []);

  useFrame(({ clock, pointer }, delta) => {
    if (!rig.current) return;
    const reduced = useWorldStore.getState().reduced;
    const t = reduced ? 0 : clock.elapsedTime;
    const hover = hovered.current ? 1 : 0;
    const pulse = reduced ? 0 : charge.current;
    if (!reduced) charge.current = Math.max(0, pulse - delta * 1.7);

    rig.current.position.y = THREE.MathUtils.damp(rig.current.position.y, -0.95 + (reduced ? 0 : Math.sin(t * 1.7) * 0.085) + pulse * 0.18, 5, delta);
    rig.current.rotation.y = THREE.MathUtils.damp(rig.current.rotation.y, -0.2 + (reduced ? 0 : pointer.x) * 0.12 + (hover ? 0.12 : 0) + (reduced ? 0 : Math.sin(t * 0.42) * 0.035), 3.5, delta);
    if (torso.current) {
      torso.current.rotation.z = THREE.MathUtils.damp(torso.current.rotation.z, (reduced ? 0 : pointer.y) * -0.035 + (reduced ? 0 : Math.sin(t * 1.1) * 0.018), 4, delta);
    }
    if (head.current) {
      head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, (reduced ? 0 : pointer.x) * 0.13, 4, delta);
      head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, (reduced ? 0 : pointer.y) * 0.08, 4, delta);
    }
    if (leftArm.current) leftArm.current.rotation.z = THREE.MathUtils.damp(leftArm.current.rotation.z, -0.1 + (reduced ? 0 : Math.sin(t * 1.3) * 0.025), 4, delta);
    if (rightArm.current) rightArm.current.rotation.z = THREE.MathUtils.damp(rightArm.current.rotation.z, 0.22 + (reduced ? 0 : Math.sin(t * 1.3 + 1) * 0.025) - pulse * 0.2, 4, delta);
    if (leftLeg.current) leftLeg.current.rotation.z = THREE.MathUtils.damp(leftLeg.current.rotation.z, reduced ? 0 : Math.sin(t * 1.1) * 0.018, 4, delta);
    if (rightLeg.current) rightLeg.current.rotation.z = THREE.MathUtils.damp(rightLeg.current.rotation.z, reduced ? 0 : -Math.sin(t * 1.1) * 0.018, 4, delta);
    if (coreMat.current) coreMat.current.emissiveIntensity = 1.4 + hover * 1.2 + pulse * 3.2 + (reduced ? 0 : Math.sin(t * 2.4) * 0.2);
    if (coreLight.current) coreLight.current.intensity = 1.3 + hover * 1.5 + pulse * 5 + (reduced ? 0 : Math.sin(t * 2.4) * 0.3);
    if (orbit.current && !reduced) orbit.current.rotation.y += delta * (0.16 + hover * 0.6 + pulse * 1.4);
  });

  return (
    <group
      ref={rig}
      position={[compact ? 2.55 : 3.45, -0.95, -15]}
      scale={compact ? 0.88 : 1.2}
      onPointerOver={(e) => { e.stopPropagation(); hovered.current = true; document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { hovered.current = false; document.body.style.cursor = ''; }}
      onClick={(e) => { e.stopPropagation(); if (!useWorldStore.getState().reduced) charge.current = 1.35; }}
    >
      {/* A quiet radar ring grounds the mech in the scene. */}
      <group ref={orbit} position={[0, 0.02, 0]}>
        <mesh rotation-x={-Math.PI / 2}><torusGeometry args={[2.15, 0.018, 6, 96]} /><meshBasicMaterial color={cyan} transparent opacity={0.58} /></mesh>
        <mesh rotation-x={-Math.PI / 2}><torusGeometry args={[2.5, 0.008, 5, 96]} /><meshBasicMaterial color={orange} transparent opacity={0.38} /></mesh>
        <mesh position={[2.15, 0, 0]}><sphereGeometry args={[0.055, 10, 8]} /><meshBasicMaterial color={cyan} /></mesh>
        <mesh position={[-2.5, 0, 0]}><sphereGeometry args={[0.045, 10, 8]} /><meshBasicMaterial color={orange} /></mesh>
      </group>

      {/* Back fins and shoulder silhouette. */}
      <mesh position={[0, 3.85, -0.72]} rotation-y={0.12}><boxGeometry args={[1.85, 1.85, 0.16]} /><meshStandardMaterial color="#16212b" metalness={0.82} roughness={0.3} /></mesh>
      <mesh position={[-1.17, 4.15, -0.68]} rotation-z={0.15}><boxGeometry args={[0.1, 1.35, 0.16]} /><meshStandardMaterial color={orange} emissive={orange} emissiveIntensity={1.1} /></mesh>
      <mesh position={[1.17, 4.15, -0.68]} rotation-z={-0.15}><boxGeometry args={[0.1, 1.35, 0.16]} /><meshStandardMaterial color={orange} emissive={orange} emissiveIntensity={1.1} /></mesh>

      {/* Waist and articulated legs. */}
      <mesh position={[0, 2.55, 0]} castShadow><boxGeometry args={[1.48, 0.58, 1.05]} /><meshStandardMaterial color={edge} metalness={0.72} roughness={0.34} /></mesh>
      <mesh position={[0, 2.25, 0.57]}><boxGeometry args={[0.72, 0.22, 0.13]} /><meshStandardMaterial color={orange} emissive={orange} emissiveIntensity={0.7} /></mesh>
      <group ref={leftLeg} position={[-0.57, 2.3, 0]}>
        <mesh position={[0, -0.6, 0]} castShadow><boxGeometry args={[0.62, 1.15, 0.72]} /><meshStandardMaterial color={metal} metalness={0.74} roughness={0.32} /></mesh>
        <mesh position={[0, -1.27, 0.08]} castShadow><boxGeometry args={[0.72, 0.34, 0.9]} /><meshStandardMaterial color={edge} metalness={0.68} roughness={0.36} /></mesh>
        <mesh position={[0, -0.08, 0.42]}><boxGeometry args={[0.3, 0.12, 0.06]} /><meshStandardMaterial color={cyan} emissive={cyan} emissiveIntensity={1.25} /></mesh>
      </group>
      <group ref={rightLeg} position={[0.57, 2.3, 0]}>
        <mesh position={[0, -0.6, 0]} castShadow><boxGeometry args={[0.62, 1.15, 0.72]} /><meshStandardMaterial color={metal} metalness={0.74} roughness={0.32} /></mesh>
        <mesh position={[0, -1.27, 0.08]} castShadow><boxGeometry args={[0.72, 0.34, 0.9]} /><meshStandardMaterial color={edge} metalness={0.68} roughness={0.36} /></mesh>
        <mesh position={[0, -0.08, 0.42]}><boxGeometry args={[0.3, 0.12, 0.06]} /><meshStandardMaterial color={cyan} emissive={cyan} emissiveIntensity={1.25} /></mesh>
      </group>

      {/* Main armor, a layered chest core, and a visor that catches the fire light. */}
      <group ref={torso} position={[0, 3.62, 0]}>
        <mesh castShadow><boxGeometry args={[1.85, 1.95, 1.12]} /><meshStandardMaterial color={metal} metalness={0.78} roughness={0.28} /></mesh>
        <mesh position={[0, 0.72, 0.54]} rotation-x={-0.12}><boxGeometry args={[1.52, 0.46, 0.22]} /><meshStandardMaterial color="#34434d" metalness={0.72} roughness={0.26} /></mesh>
        <mesh position={[0, -0.58, 0.62]}><boxGeometry args={[1.22, 0.5, 0.2]} /><meshStandardMaterial color="#1b2932" metalness={0.65} roughness={0.3} /></mesh>
        <mesh position={[-0.68, -0.48, 0.75]} rotation-z={0.08}><boxGeometry args={[0.13, 0.45, 0.04]} /><meshStandardMaterial color={orange} emissive={orange} emissiveIntensity={1.6} /></mesh>
        <mesh position={[0.68, -0.48, 0.75]} rotation-z={-0.08}><boxGeometry args={[0.13, 0.45, 0.04]} /><meshStandardMaterial color={orange} emissive={orange} emissiveIntensity={1.6} /></mesh>
        <mesh position={[0, 0.05, 0.66]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.53, 0.075, 10, 48]} />
          <meshStandardMaterial color={cyan} emissive={cyan} emissiveIntensity={1.35} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.05, 0.62]}>
          <sphereGeometry args={[0.39, 24, 18]} />
          <meshStandardMaterial ref={coreMat} color="#56ddea" emissive="#34eafa" emissiveIntensity={1.4} metalness={0.3} roughness={0.18} />
        </mesh>
        <pointLight ref={coreLight} position={[0, 0.05, 1.1]} color={cyan} intensity={1.5} distance={7} />
      </group>

      <group ref={head} position={[0, 5.12, 0.02]}>
        <mesh position={[0, 0, 0]} castShadow><boxGeometry args={[0.96, 0.88, 0.86]} /><meshStandardMaterial color="#202b33" metalness={0.82} roughness={0.26} /></mesh>
        <mesh position={[0, -0.12, 0.45]}><boxGeometry args={[0.74, 0.19, 0.08]} /><meshStandardMaterial color={orange} emissive={orange} emissiveIntensity={3.2} toneMapped={false} /></mesh>
        <mesh position={[-0.54, 0.21, 0.02]} rotation-z={0.38}><boxGeometry args={[0.17, 0.52, 0.22]} /><meshStandardMaterial color="#121b22" metalness={0.78} roughness={0.28} /></mesh>
        <mesh position={[0.54, 0.21, 0.02]} rotation-z={-0.38}><boxGeometry args={[0.17, 0.52, 0.22]} /><meshStandardMaterial color="#121b22" metalness={0.78} roughness={0.28} /></mesh>
        <mesh position={[0, 0.55, -0.12]} rotation-z={0.38}><boxGeometry args={[0.11, 0.55, 0.12]} /><meshStandardMaterial color="#52616c" metalness={0.86} roughness={0.22} /></mesh>
        <mesh position={[-0.72, -0.05, 0.06]}><sphereGeometry args={[0.12, 12, 10]} /><meshStandardMaterial color={cyan} emissive={cyan} emissiveIntensity={2} /></mesh>
        <mesh position={[0.72, -0.05, 0.06]}><sphereGeometry args={[0.12, 12, 10]} /><meshStandardMaterial color={cyan} emissive={cyan} emissiveIntensity={2} /></mesh>
      </group>

      {/* Shoulder pods and articulated arms. */}
      <group ref={leftArm} position={[-1.28, 4.15, 0]}>
        <mesh castShadow><boxGeometry args={[0.92, 0.9, 1.14]} /><meshStandardMaterial color="#273944" metalness={0.72} roughness={0.34} /></mesh>
        <mesh position={[0, 0.06, 0.59]} rotation-z={0.15}><boxGeometry args={[0.56, 0.14, 0.12]} /><meshStandardMaterial color={cyan} emissive={cyan} emissiveIntensity={1.5} /></mesh>
        <mesh position={[0, -0.78, 0]} castShadow><boxGeometry args={[0.68, 0.92, 0.8]} /><meshStandardMaterial color={metal} metalness={0.78} roughness={0.3} /></mesh>
        <mesh position={[0, -1.39, 0.1]} castShadow><boxGeometry args={[0.58, 0.34, 0.62]} /><meshStandardMaterial color="#34434d" metalness={0.72} roughness={0.26} /></mesh>
      </group>
      <group ref={rightArm} position={[1.28, 4.15, 0]}>
        <mesh castShadow><boxGeometry args={[0.92, 0.9, 1.14]} /><meshStandardMaterial color="#273944" metalness={0.72} roughness={0.34} /></mesh>
        <mesh position={[0, 0.06, 0.59]} rotation-z={-0.15}><boxGeometry args={[0.56, 0.14, 0.12]} /><meshStandardMaterial color={orange} emissive={orange} emissiveIntensity={1.5} /></mesh>
        <mesh position={[0, -0.78, 0]} castShadow><boxGeometry args={[0.68, 0.92, 0.8]} /><meshStandardMaterial color={metal} metalness={0.78} roughness={0.3} /></mesh>
        <mesh position={[0, -1.39, 0.1]} castShadow><boxGeometry args={[0.58, 0.34, 0.62]} /><meshStandardMaterial color="#34434d" metalness={0.72} roughness={0.26} /></mesh>
        {/* A short energy blade keeps the samurai silhouette in the mech. */}
        <group position={[0.16, -1.5, 0.34]} rotation-z={-0.18}>
          <mesh position={[0, 0.83, 0]}><boxGeometry args={[0.12, 1.56, 0.12]} /><meshStandardMaterial color="#e9fdff" emissive={cyan} emissiveIntensity={3.6} toneMapped={false} /></mesh>
          <mesh position={[0, -0.08, 0]}><boxGeometry args={[0.44, 0.12, 0.16]} /><meshStandardMaterial color={orange} metalness={0.76} roughness={0.24} /></mesh>
          <mesh position={[0, -0.45, 0]}><boxGeometry args={[0.1, 0.64, 0.11]} /><meshStandardMaterial color="#c1cbd1" metalness={0.85} roughness={0.2} /></mesh>
        </group>
      </group>
    </group>
  );
}
