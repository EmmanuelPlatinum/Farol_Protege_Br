import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { councils } from "@/lib/cuiaba-councils";

function FlyTo({ id }: { id: string }) {
  const map = useMap();
  useEffect(() => {
    const c = councils.find((x) => x.id === id);
    if (c) map.flyTo([c.lat, c.lng], 12, { duration: 0.6 });
  }, [id, map]);
  return null;
}

export default function CitizenCouncilMap({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <MapContainer center={[-15.58, -56.1]} zoom={11} className="h-full w-full rounded-lg" scrollWheelZoom={false}>
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
      <FlyTo id={selected} />
      {councils.map((c) => (
        <CircleMarker
          key={c.id}
          center={[c.lat, c.lng]}
          radius={selected === c.id ? 16 : 11}
          pathOptions={{
            color: selected === c.id ? "#1d4ed8" : "#334155",
            fillColor: selected === c.id ? "#2563eb" : "#f59e0b",
            fillOpacity: 0.8,
            weight: selected === c.id ? 4 : 2,
          }}
          eventHandlers={{ click: () => onSelect(c.id) }}
        >
          <Popup>
            <strong>{c.name}</strong>
            <br />
            {c.address}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
