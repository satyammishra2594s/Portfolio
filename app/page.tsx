'use client';

import dynamic from 'next/dynamic';
import Overlay from '../components/Overlay';

const World = dynamic(() => import('../components/World'), { ssr: false });

export default function Home() {
  return <div className="relative min-h-screen bg-[#030305]"><World /><Overlay /></div>;
}
