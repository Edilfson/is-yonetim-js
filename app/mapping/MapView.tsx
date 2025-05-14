'use client';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';

const L = require('leaflet');
require('leaflet-draw');

const userColors: Record<string, string> = {
  Mehmet: '#1f77b4',
  FERDİ: '#ff7f0e',
  Atalay: '#2ca02c',
};

/**
 * DrawControls: Leaflet Draw ile seçim araçlarını ekler
 */
function DrawControls({ jobs, onBulkSelect }: { jobs: any[]; onBulkSelect: (ids: number[]) => void }) {
  const map = useMap();

  useEffect(() => {
    // FeatureGroup to store layers for editing
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // Draw control
    const drawControl = new L.Control.Draw({
      draw: {
        polyline: false,
        polygon: true,
        rectangle: true,
        circle: true,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawnItems,
        remove: true,
      },
    });
    map.addControl(drawControl);

    // On created
    map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);

      // Determine selected job IDs
      let ids: number[] = [];
      if (layer.getBounds) {
        const bounds = layer.getBounds();
        ids = jobs
          .filter(job => {
            const lat = parseFloat(job.enlem);
            const lng = parseFloat(job.boylam);
            return bounds.contains([lat, lng]);
          })
          .map(j => j.id);
      }
      onBulkSelect(ids);
    });

    // On delete: clear selection
    map.on(L.Draw.Event.DELETED, () => {
      onBulkSelect([]);
    });

    // Cleanup
    return () => {
      map.off(L.Draw.Event.CREATED);
      map.off(L.Draw.Event.DELETED);
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
    };
  }, [map, jobs, onBulkSelect]);

  return null;
}

export default function MapView({ jobs, onBulkSelect, selectedIds }: {
  jobs: any[];
  onBulkSelect: (ids: number[]) => void;
  selectedIds: Set<number>;
}) {
  const defaultCenter: [number, number] = jobs.length
    ? [parseFloat(jobs[0].enlem), parseFloat(jobs[0].boylam)]
    : [41.0286, 28.9848];

  return (
    <MapContainer center={defaultCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <DrawControls jobs={jobs} onBulkSelect={onBulkSelect} />

      {jobs
        .filter(job => job.enlem && job.boylam && !isNaN(parseFloat(job.enlem)) && !isNaN(parseFloat(job.boylam)))
        .map(job => {
          const lat = parseFloat(job.enlem);
          const lng = parseFloat(job.boylam);
          let fillColor = '#d62728'; // unassigned
          if (selectedIds.has(job.id)) fillColor = '#9467bd'; // bulk selected
          else if (job.justAssigned) fillColor = '#2ca02c'; // newly assigned
          else if (job.assignedUser) fillColor = userColors[job.assignedUser] || '#9467bd';

          return (
            <CircleMarker
              key={job.id}
              center={[lat, lng]}
              radius={8}
              fillColor={fillColor}
              color="#fff"
              weight={1}
              fillOpacity={0.9}
            >
              <Popup>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <strong>SON OKUMA:</strong> {job.SON_OKUMA}<br />
                  <strong>OPER MERKEZİ:</strong> {job.OPER_MERKEZI}<br />
                  <strong>PERSONEL:</strong> {job.PERSONEL}<br />
                  <strong>TARİH:</strong> {job.TARİH}<br />
                  <strong>AÇIKLAMA:</strong> {job.AÇIKLAMA}<br />
                  <strong>DÖNGÜ:</strong> {job.DÖNGÜ}<br />
                  <strong>İLÇE:</strong> {job.İLÇE}<br />
                  <strong>ÜRÜN YILI:</strong> {job.ÜR_YILI}<br />
                  <strong>HİZMET:</strong> {job.HİZMET}<br />
                  <strong>KF ADET:</strong> {job["KF ADET"]}<br />
                  <strong>ROTA:</strong> {job.ROTA}<br />
                  <strong>SIRA:</strong> {job.SIRA}<br />
                  <strong>MARKA:</strong> {job.MARKA}<br />
                  <strong>SAYAÇ TİPİ:</strong> {job["SAYAÇ TİPİ"]}<br />
                  <strong>K. GÜÇ:</strong> {job["K. GÜÇ"]}<br />
                  <strong>B GÜÇ:</strong> {job["B GÜÇ"]}<br />
                  <strong>SERİ:</strong> {job.SERİ}<br />
                  <strong>HİZMET TİPİ:</strong> {job["HİZMET TİPİ"]}<br />
                  <strong>ADRES:</strong> {job.ADRES}<br />
                  <strong>KOFRA:</strong> {job.KOFRA}<br />
                  <strong>ENLEM:</strong> {job.enlem}<br />
                  <strong>BOYLAM:</strong> {job.boylam}<br />
                  {/* ... diğer alanlar */}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
    </MapContainer>
  );
}
