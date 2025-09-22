'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          RapidSoS
        </Link>
        <div className="space-x-4">
          <Link href="/user/init" className={`${pathname.startsWith('/user') ? 'font-bold' : ''}`}>
            User Login
          </Link>
          <Link href="/officer/init" className={`${pathname.startsWith('/officer') ? 'font-bold' : ''}`}>
            Officer Login
          </Link>
          <Link href="/sos" className={`${pathname.startsWith('/sos') ? 'font-bold' : ''}`}>
            SOS
          </Link>
        </div>
      </div>
    </nav>
  );
}