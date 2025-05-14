// app/layout.tsx
import 'leaflet/dist/leaflet.css';
import './globals.css';
import Link from 'next/link';
import { ReactNode } from 'react';
import 'leaflet/dist/leaflet.css';
export const metadata = { title: 'İş Yönetim Platformu' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <nav style={{ padding: '1rem', background: '#f0f0f0', color: '#000' }}>
          <Link href="/mapping">1. HARİTALAMA</Link> |{' '}
          <Link href="/personnel-control">2. PERSONEL KONTROLÜ</Link> |{' '}
          <Link href="/personnel-routing">3. ROTALAMA</Link> |{' '}
          <Link href="/auto-scheduling">4. PLANLAMA</Link> |{' '}
          <Link href="/task-creation">5. GÖREV OLUŞTURMA</Link> |{' '}
          <Link href="/task-creation">6. AMBAR SEVKİYAT BÖLÜMÜ</Link> |{' '}
          <Link href="/task-creation">7. RAPOR DÜZENLEME</Link> |{' '}
          <Link href="/erp-errors">8. SAHADA GELEN HATALAR</Link>
        </nav>
        <main style={{ padding: '1rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}