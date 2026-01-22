import { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { MapPin } from 'lucide-react';
import { getStoredCleanups } from '@/lib/mockData';
import L from 'leaflet';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const cleanups = getStoredCleanups();

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Brest, France
    const map = L.map(mapRef.current).setView([48.3905, -4.4516], 11);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Create custom icon
    const greenIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Add markers for each cleanup
    cleanups.forEach((cleanup) => {
      const marker = L.marker([cleanup.latitude, cleanup.longitude], { icon: greenIcon })
        .addTo(map)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold text-sm mb-1">${cleanup.location}</h3>
            <p class="text-xs text-gray-600 mb-1">${cleanup.userName}</p>
            <p class="text-xs"><strong>${cleanup.quantity} kg</strong> collectés</p>
            <p class="text-xs text-gray-500">${new Date(cleanup.date).toLocaleDateString('fr-FR')}</p>
          </div>
        `);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#2E2E2E] mb-2">Carte interactive</h1>
        <p className="text-gray-600">Visualisez toutes les zones de ramassage sur la rade de Brest</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Zones nettoyées</CardTitle>
              <CardDescription>Chaque marqueur représente une action de ramassage</CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                ref={mapRef} 
                className="w-full h-[600px] rounded-lg overflow-hidden border border-gray-200"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Légende</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                <span className="text-sm">Zone nettoyée</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dernières actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cleanups.slice(0, 5).map((cleanup) => (
                  <div key={cleanup.id} className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-[#3FA796] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-[#2E2E2E] line-clamp-1">{cleanup.location}</p>
                      <p className="text-xs text-gray-600">{cleanup.quantity} kg</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}