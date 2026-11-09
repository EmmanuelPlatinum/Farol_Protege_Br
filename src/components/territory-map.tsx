import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import { councils, totalCases } from "@/lib/cuiaba-councils";

export default function TerritoryMap({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <MapContainer center={[-15.56, -56.1]} zoom={11} className="h-full w-full rounded-lg" scrollWheelZoom={false}>
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
      {councils.map((c) => {
        const total = totalCases(c);
        return (
          <CircleMarker
            key={c.id}
            center={[c.lat, c.lng]}
            radius={10 + total / 4}
            pathOptions={{
              color: selected === c.id ? "#1d4ed8" : "#64748b",
              fillColor: total >= 50 ? "#dc2626" : total >= 30 ? "#f97316" : "#16a34a",
              fillOpacity: 0.45,
              weight: selected === c.id ? 4 : 2,
            }}
            eventHandlers={{ click: () => onSelect(c.id) }}
          >
            <Tooltip>{c.name} · {total}</Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
