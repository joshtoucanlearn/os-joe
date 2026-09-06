import type { Metadata } from 'next';
import { SiteFrame } from './components/SiteFrame';
import './globals.css';
export const metadata: Metadata = { title: 'OS_Joe', description: 'Joe’s projects, product line and arcade.', robots: {index:false,follow:false} };
export default function Layout({children}:Readonly<{children:React.ReactNode}>) {return <html lang="en"><body><SiteFrame>{children}</SiteFrame></body></html>}
