import { NextResponse } from 'next/server';

export async function GET() {
  const points = [
    { id: 1, lat: 41.0, lng: 28.6 },
    { id: 2, lat: 41.1, lng: 28.7 },
  ];
  return NextResponse.json(points);
}
