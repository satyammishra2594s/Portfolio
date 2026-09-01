'use client';
import dynamic from 'next/dynamic';
const World=dynamic(()=>import('../components/World'),{ssr:false});
import Overlay from '../components/Overlay';
import {useEffect} from 'react';
import {useWorldStore} from '../lib/store';
export default function Home(){const setReduced=useWorldStore(s=>s.setReduced);useEffect(()=>{setReduced(matchMedia('(prefers-reduced-motion: reduce)').matches)},[setReduced]);return <div className="relative min-h-screen bg-[#030305]"><World/><Overlay/></div>}
