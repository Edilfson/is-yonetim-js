'use client';
// // Ensure you uninstall react-leaflet-draw and install Geoman:
// npm uninstall react-leaflet-draw
// npm install @geoman-io/leaflet-geoman


// In next.config.js, allow leaflet.pm access via webpack if needed


// page.tsx
import * as XLSX from 'xlsx';
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

export default function MappingPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<Set<number>>(new Set());
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [showSummary, setShowSummary] = useState<boolean>(false);

  const users = ['Mehmet', 'FERDİ', 'ATALAY'];

  // Excel yükleme
  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const parsed = XLSX.utils.sheet_to_json(sheet).map((job: any, i: number) => ({
      ...job,
      id: i,
      assignedUser: '',
      justAssigned: false,
    }));
    setJobs(parsed);
  };

  // Atama işlemi
  const handleAssign = () => {
    if (!selectedUser) return;
    setJobs(prev => prev.map(job => selectedJobs.has(job.id)
      ? { ...job, assignedUser: selectedUser, justAssigned: true }
      : job
    ));
    setSelectedJobs(new Set());
    setShowSummary(false);
  };

  // Güncel Excel indir
  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(jobs);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Jobs');
    XLSX.writeFile(wb, 'updated_jobs.xlsx');
  };

  // Summary hesaplama
  const summary = useMemo(() => {
    const selected = jobs.filter(j => selectedJobs.has(j.id));
    const total = selected.length;
    const typesCount: Record<string, number> = {};
    selected.forEach(j => {
      const type = j['SAYAÇ TİPİ'] || 'Unknown';
      typesCount[type] = (typesCount[type] || 0) + 1;
    });
    return { total, typesCount };
  }, [jobs, selectedJobs]);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: 300, padding: '1rem', overflowY: 'auto', borderRight: '1px solid #ccc' }}>
        <h2>Excel Yükle</h2>
        <input type="file" accept=".xlsx, .xls" onChange={handleFile} />
        <button style={{ marginTop: 10 }} onClick={downloadExcel} disabled={!jobs.length}>Excel İndir</button>

        <hr />
        <h3>Kullanıcı Seç & Atama</h3>
        <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
          <option value="">-- Seçiniz --</option>
          {users.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <button
          style={{ display: 'block', marginTop: 10 }}
          onClick={() => setShowSummary(true)}
          disabled={!selectedUser || selectedJobs.size === 0}
        >
          Atama Özeti & Onayla
        </button>

        {/* Özet Popup */}
        {showSummary && (
          <div style={{ position: 'absolute', top: '20%', left: '20%', background: '#fff', padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            <h4>Seçili İş Özeti</h4>
            <p>Toplam iş: {summary.total}</p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ccc', padding: 4 }}>Sayaç Tipi</th>
                  <th style={{ border: '1px solid #ccc', padding: 4 }}>Adet</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(summary.typesCount).map(([type, count]) => (
                  <tr key={type}>
                    <td style={{ border: '1px solid #ccc', padding: 4 }}>{type}</td>
                    <td style={{ border: '1px solid #ccc', padding: 4 }}>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleAssign} style={{ marginTop: 10 }}>Onayla ve Ata</button>
            <button onClick={() => setShowSummary(false)} style={{ marginLeft: 10 }}>İptal</button>
          </div>
        )}
      </div>

      <div style={{ flex: 1 }}>
        {jobs.length
          ? <MapView jobs={jobs} onBulkSelect={ids => setSelectedJobs(new Set(ids))} selectedIds={selectedJobs} />
          : <p style={{ padding: '1rem' }}>Harita için önce Excel yükleyin.</p>
        }
      </div>
    </div>
  );
}
