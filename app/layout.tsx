import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata={title:'Satyam Mishra — AI & Data Science','description':'Cinematic 3D portfolio of Satyam Mishra, AI & Data Science student at IIT Jodhpur.',viewport:'width=device-width, initial-scale=1'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
