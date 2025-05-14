"use client";

import React, { useState, ChangeEvent } from 'react';
import * as XLSX from 'xlsx';

interface Coord { lat: number; lng: number; }
interface RowData { PERSONEL: string; ENLEM: number; BOYLAM: number; }

// Haversine distance in kilometers
const haversine = (a: Coord, b: Coord): number => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
};

// Nearest Neighbor heuristic
const nearestNeighborOrder = (points: Coord[]): number[] => {
  const n = points.length;
  const visited = new Array(n).fill(false);
  const order = [0];
  visited[0] = true;

  for (let i = 1; i < n; i++) {
    const last = order[order.length - 1];
    let nearest = -1;
    let minDist = Infinity;
    for (let j = 0; j < n; j++) {
      if (!visited[j]) {
        const d = haversine(points[last], points[j]);
        if (d < minDist) { minDist = d; nearest = j; }
      }
    }
    if (nearest >= 0) {
      order.push(nearest);
      visited[nearest] = true;
    }
  }

  return order;
};

// 2-opt swap improvement
const twoOpt = (points: Coord[], order: number[]): number[] => {
  const n = order.length;
  let improved = true;

  while (improved) {
    improved = false;
    for (let i = 1; i < n - 1; i++) {
      for (let k = i + 1; k < n; k++) {
        const newOrder = order.slice();
        newOrder.splice(i, k - i + 1, ...order.slice(i, k + 1).reverse());

        let oldDist = 0;
        let newDist = 0;
        for (let m = 0; m < n - 1; m++) {
          oldDist += haversine(points[order[m]], points[order[m + 1]]);
          newDist += haversine(points[newOrder[m]], points[newOrder[m + 1]]);
        }

        if (newDist + 1e-6 < oldDist) {
          order = newOrder;
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }

  return order;
};

// Combined TSP: Nearest Neighbor + 2-opt
const computeShortestRoute = (points: Coord[]): Coord[] => {
  const n = points.length;
  if (n <= 2) return points;

  let order = nearestNeighborOrder(points);
  order = twoOpt(points, order);
  return order.map(i => points[i]);
};

const Page: React.FC = () => {
  const [links, setLinks] = useState<Record<string, string[]>>({});
  const MAX_WAYPOINTS = 10;

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const data = new Uint8Array(reader.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];

      const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      const headers = raw[0] as string[];
      const idx: Record<string, number> = {};
      headers.forEach((h, i) => { idx[h.trim()] = i; });

      const grouped: Record<string, Coord[]> = {};
      raw.slice(1).forEach(row => {
        const person = String(row[idx['PERSONEL']] || '').trim();
        const lat = Number(row[idx['ENLEM']] || 0);
        const lng = Number(row[idx['BOYLAM']] || 0);
        if (!person || !lat || !lng) return;
        if (!grouped[person]) grouped[person] = [];
        grouped[person].push({ lat, lng });
      });

      const newLinks: Record<string, string[]> = {};
      Object.entries(grouped).forEach(([person, pts]) => {
        if (!pts.length) return;
        const orderedPts = computeShortestRoute(pts);

        // Split into chunks of MAX_WAYPOINTS
        const chunks: Coord[][] = [];
        for (let i = 0; i < orderedPts.length; i += MAX_WAYPOINTS) {
          chunks.push(orderedPts.slice(i, i + MAX_WAYPOINTS));
        }

        newLinks[person] = chunks.map(chunk => {
          const origin = chunk[0];
          const waypoints = chunk.slice(1).map(c => `${c.lat},${c.lng}`).join('|');
          return `https://www.google.com/maps/dir/?api=1` +
                 `&origin=${origin.lat},${origin.lng}` +
                 `&travelmode=driving` +
                 (waypoints ? `&waypoints=${waypoints}` : '');
        });
      });

      setLinks(newLinks);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Excel'den Personel Rotaları (Parçalı TSP)</h1>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="mb-4" />
      {Object.entries(links).map(([person, urls]) => (
        <div key={person} className="mb-4">
          <h2 className="font-semibold">{person} ({urls.length} link)</h2>
          <ul className="list-disc list-inside">
            {urls.map((url, idx) => (
              <li key={idx}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  Rota parça {idx + 1}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Page;