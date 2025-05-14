import { NextResponse } from 'next/server';

export async function GET() {
  const tasks = [
    { id: 1, personnel: 'Arayüz tasarlanıyor yakında kullanıma sunulacaktır.', task: 'Personel Rotalama', status: 'Bekleniyor.' },
  ];
  return NextResponse.json(tasks);
}
