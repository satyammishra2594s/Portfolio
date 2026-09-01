import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Satyam Mishra — AI & Data Science',
  description: 'Satyam Mishra — AI & Data Science Student @ IIT Jodhpur',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
