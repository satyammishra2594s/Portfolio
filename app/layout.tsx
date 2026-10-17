import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Satyam Mishra — AI, Data & Cybersecurity',
  description: 'Satyam Mishra — AI & Data Science student at IIT Jodhpur, exploring machine learning, software, and cybersecurity.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
