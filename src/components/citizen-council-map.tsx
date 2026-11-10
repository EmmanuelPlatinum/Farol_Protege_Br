import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { councilLocations } from "@/lib/council-locations";
import { useTx } from "@/lib/i18n";

function FlyTo({ id }: { id: string }) {
  const map = useMap();
  useEffect(() => {
    const c = councilLocations.find((x) => x.id === id);
    if (c) map.flyTo([c.lat, c.lng], 12, { duration: 0.6 });
  }, [id, map]);
  return null;
}

export default function CitizenCouncilMap({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  const tx = useTx();

  return (
    <div
      role="region"
      aria-label={tx(
        "Mapa de referências regionais em Cuiabá",
        "Map of regional references in Cuiabá",
        "Mapa de referencias regionales en Cuiabá",
      )}
      className="h-full w-full"
    >
      <MapContainer
        center={[-15.598317, -56.0948957]}
        zoom={11}
        className="h-full w-full rounded-lg"
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <FlyTo id={selected} />
        {councilLocations.map((c) => (
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
              <br />
              {c.locationNote}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
