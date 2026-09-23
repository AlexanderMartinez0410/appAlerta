import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

export interface ReporteIncident {
  id: string;
  categoriaCodigo: 'SEGURIDAD' | 'TRANSITO' | 'TRANSPORTE';
  tipoLabel: string;
  hora: string;
  sector: string;
  ciudad: string;
  lat: number;
  lng: number;
  detalle: string;
  campoExtra?: string;
  foto?: string | null;
}

export interface HotspotZone {
  id: string;
  nombreZona: string;
  ciudad: string;
  lat: number;
  lng: number;
  categoriaCodigo: 'SEGURIDAD' | 'TRANSITO' | 'TRANSPORTE';
  colorHex: string;
  totalReportes: number;
  reportes: ReporteIncident[];
}

interface OpenStreetMapProps {
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  filtroCategoria?: string;
  onSelectHotspot?: (zone: HotspotZone) => void;
  onSelectIncident?: (incident: ReporteIncident) => void;
}

export const MOCK_HOTSPOTS: HotspotZone[] = [
  {
    id: 'ZONE-UIO-MARISCAL',
    nombreZona: 'La Mariscal / Foch',
    ciudad: 'Quito',
    lat: -0.2025,
    lng: -78.4908,
    categoriaCodigo: 'SEGURIDAD',
    colorHex: '#DA291C',
    totalReportes: 3,
    reportes: [
      {
        id: 'REP-01',
        categoriaCodigo: 'SEGURIDAD',
        tipoLabel: 'Robo a persona / Asalto',
        hora: 'Hace 8 minutos',
        sector: 'Av. Amazonas y Calama',
        ciudad: 'Quito',
        lat: -0.2018,
        lng: -78.4912,
        detalle: 'Vi un robo hace pocos minutos. Dos sujetos a pie interceptaron a una persona.',
      },
      {
        id: 'REP-02',
        categoriaCodigo: 'SEGURIDAD',
        tipoLabel: 'Asalto a local',
        hora: 'Hace 45 minutos',
        sector: 'Plaza Foch y Reina Victoria',
        ciudad: 'Quito',
        lat: -0.2029,
        lng: -78.4901,
        detalle: 'Me robaron el teléfono hace 45 minutos saliendo del local.',
      },
      {
        id: 'REP-03',
        categoriaCodigo: 'SEGURIDAD',
        tipoLabel: 'Robo a transeúnte',
        hora: 'Hace 2 horas',
        sector: 'Av. 6 de Diciembre y Wilson',
        ciudad: 'Quito',
        lat: -0.2038,
        lng: -78.4925,
        detalle: 'Me robaron hace 2 horas mientras esperaba el transporte público.',
      },
    ],
  },
  {
    id: 'ZONE-UIO-AMERICA',
    nombreZona: 'Av. América y Colón',
    ciudad: 'Quito',
    lat: -0.198,
    lng: -78.498,
    categoriaCodigo: 'TRANSPORTE',
    colorHex: '#D97706',
    totalReportes: 2,
    reportes: [
      {
        id: 'REP-04',
        categoriaCodigo: 'TRANSPORTE',
        tipoLabel: 'Bus dañado / Varado',
        hora: 'Hace 12 minutos',
        sector: 'Av. América y Mercadillo',
        ciudad: 'Quito',
        lat: -0.1975,
        lng: -78.4975,
        detalle: 'Bus de Línea 14 varado por falla de motor en carril central.',
        campoExtra: 'Línea 14 - Disco 38',
      },
      {
        id: 'REP-05',
        categoriaCodigo: 'TRANSPORTE',
        tipoLabel: 'Parada colapsada',
        hora: 'Hace 25 minutos',
        sector: 'Parada Seminario Mayor',
        ciudad: 'Quito',
        lat: -0.1988,
        lng: -78.4986,
        detalle: 'Parada repleta de pasajeros esperando más de 30 minutos.',
      },
    ],
  },
  {
    id: 'ZONE-UIO-SHYRIS',
    nombreZona: 'Av. De los Shyris y Naciones Unidas',
    ciudad: 'Quito',
    lat: -0.1784,
    lng: -78.4839,
    categoriaCodigo: 'TRANSITO',
    colorHex: '#EA580C',
    totalReportes: 2,
    reportes: [
      {
        id: 'REP-06',
        categoriaCodigo: 'TRANSITO',
        tipoLabel: 'Semáforo apagado / Dañado',
        hora: 'Hace 18 minutos',
        sector: 'Intersección Shyris y NNUU',
        ciudad: 'Quito',
        lat: -0.1779,
        lng: -78.4842,
        detalle: 'Semáforo intermitente provocando congestión en todos los sentidos.',
      },
      {
        id: 'REP-07',
        categoriaCodigo: 'TRANSITO',
        tipoLabel: 'Trancón / Tráfico pesado',
        hora: 'Hace 40 minutos',
        sector: 'Túnel Guayasamín - Salida',
        ciudad: 'Quito',
        lat: -0.1791,
        lng: -78.4831,
        detalle: 'Fila de autos detenida por más de 20 minutos.',
      },
    ],
  },
  {
    id: 'ZONE-GYE-MALECON',
    nombreZona: 'Malecón 2000 y 9 de Octubre',
    ciudad: 'Guayaquil',
    lat: -2.1962,
    lng: -79.8862,
    categoriaCodigo: 'SEGURIDAD',
    colorHex: '#DA291C',
    totalReportes: 1,
    reportes: [
      {
        id: 'REP-08',
        categoriaCodigo: 'SEGURIDAD',
        tipoLabel: 'Robo en motocicleta',
        hora: 'Hace 30 minutos',
        sector: '9 de Octubre y Pichincha',
        ciudad: 'Guayaquil',
        lat: -2.1962,
        lng: -79.8862,
        detalle: 'Dos personas en motocicleta sustrajeron celular a un transeúnte.',
      },
    ],
  },
];

export const OpenStreetMap: React.FC<OpenStreetMapProps> = ({
  centerLat = -0.195,
  centerLng = -78.488,
  zoom = 13,
  filtroCategoria = 'TODAS',
  onSelectHotspot,
  onSelectIncident,
}) => {
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleMessage = (event: MessageEvent) => {
        if (!event.data) return;

        if (event.data.type === 'SELECT_HOTSPOT') {
          const zoneId = event.data.zoneId;
          const found = MOCK_HOTSPOTS.find((h) => h.id === zoneId);
          if (found && onSelectHotspot) {
            onSelectHotspot(found);
          }
        }

        if (event.data.type === 'SELECT_INCIDENT') {
          const incId = event.data.incidentId;
          let foundInc: ReporteIncident | undefined;
          for (const z of MOCK_HOTSPOTS) {
            foundInc = z.reportes.find((r) => r.id === incId);
            if (foundInc) break;
          }
          if (foundInc && onSelectIncident) {
            onSelectIncident(foundInc);
          }
        }
      };

      window.addEventListener('message', handleMessage);
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [onSelectHotspot, onSelectIncident]);

  const hotspotsJson = JSON.stringify(MOCK_HOTSPOTS);

  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body, #map { width: 100%; height: 100%; background: #e5e3df; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          .leaflet-control-attribution { font-size: 9px !important; }
          
          /* Burbuja macro (Zoom Lejano) */
          .hotspot-bubble {
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: 800;
            border-radius: 50%;
            cursor: pointer;
            transition: transform 0.2s ease;
            border: 3px solid #ffffff;
          }
          .hotspot-bubble:hover {
            transform: scale(1.18);
          }

          /* Marcador específico de calle (Zoom Cercano) */
          .street-marker {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 2.5px solid #ffffff;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.35);
            transition: transform 0.2s ease;
          }
          .street-marker:hover {
            transform: scale(1.35);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const allHotspots = ${hotspotsJson};
          const filtro = "${filtroCategoria}";

          const filteredHotspots = allHotspots.filter(h => {
            if (filtro === 'TODAS') return true;
            return h.categoriaCodigo === filtro;
          });

          const map = L.map('map', {
            zoomControl: false,
          }).setView([${centerLat}, ${centerLng}], ${zoom});

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);

          L.control.zoom({ position: 'bottomright' }).addTo(map);

          const clusterLayer = L.layerGroup().addTo(map);
          const streetLayer = L.layerGroup().addTo(map);

          function renderMapElements() {
            clusterLayer.clearLayers();
            streetLayer.clearLayers();

            const currentZoom = map.getZoom();
            // Zoom < 15: Vista Macro de Zonas (Burbujas grandes agrupadas)
            // Zoom >= 15: Vista Específica de Calle (Marcadores individuales en cada esquina)
            const isStreetView = currentZoom >= 15;

            filteredHotspots.forEach(zone => {
              if (!isStreetView) {
                // Renderizar Burbuja Macro
                let size = 26;
                if (zone.totalReportes >= 4) size = 44;
                else if (zone.totalReportes >= 2) size = 34;

                const hex = zone.colorHex || '#DA291C';
                const shadow = '0 0 0 8px ' + hex + '40, 0 4px 12px rgba(0,0,0,0.3)';

                const icon = L.divIcon({
                  className: '',
                  html: '<div class="hotspot-bubble" style="width:' + size + 'px; height:' + size + 'px; background:' + hex + '; box-shadow:' + shadow + '; font-size:' + (size > 30 ? 14 : 11) + 'px;">' + zone.totalReportes + '</div>',
                  iconSize: [size, size],
                  iconAnchor: [size / 2, size / 2]
                });

                const marker = L.marker([zone.lat, zone.lng], { icon: icon });
                marker.on('click', () => {
                  window.parent.postMessage({
                    type: 'SELECT_HOTSPOT',
                    zoneId: zone.id
                  }, '*');
                });
                clusterLayer.addLayer(marker);
              } else {
                // Renderizar Puntos Específicos Individuales en cada calle sin popup emergente superior
                zone.reportes.forEach(rep => {
                  const hex = zone.colorHex || '#DA291C';
                  const icon = L.divIcon({
                    className: '',
                    html: '<div class="street-marker" style="background:' + hex + '; box-shadow: 0 0 0 5px ' + hex + '35;"></div>',
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                  });

                  const marker = L.marker([rep.lat, rep.lng], { icon: icon });
                  marker.on('click', () => {
                    window.parent.postMessage({
                      type: 'SELECT_INCIDENT',
                      incidentId: rep.id
                    }, '*');
                  });
                  streetLayer.addLayer(marker);
                });
              }
            });
          }

          renderMapElements();
          map.on('zoomend', renderMapElements);
        </script>
      </body>
    </html>
  `;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          key={filtroCategoria}
          srcDoc={mapHtml}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="OpenStreetMap Ecuador"
        />
      </View>
    );
  }

  return <View style={styles.container} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
