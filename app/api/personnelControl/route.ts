import { NextResponse } from 'next/server';

export async function GET() {
  const tasks = [
    { id: 1, personnel: 'Ali Veli', task: 'Sayaç Değişim', status: 'Tamamlandı' },
    { id: 2, personnel: 'Ayşe Yılmaz', task: 'Kesme-Ödeme', status: 'Beklemede' },
    { id: 3, personnel: 'Mehmet Demir', task: 'Açma', status: 'Sürüyor' },
  ];
  return NextResponse.json(tasks);
}
