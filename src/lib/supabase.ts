import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"];
const supabasePublishableKey = import.meta.env["VITE_SUPABASE_ANON_KEY"];

export const isLovableCloudConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase =
  isLovableCloudConfigured
    ? createClient(supabaseUrl!, supabasePublishableKey!, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
        realtime: { params: { eventsPerSecond: 5 } },
      })
    : null;

export type CouncilRegion =
  | "north"
  | "south"
  | "east"
  | "west"
  | "central"
  | "rural";

export const councilRegions: { id: CouncilRegion; label: string }[] = [
  { id: "north", label: "1ª Regional · Norte / CPA" },
  { id: "south", label: "2ª Regional · Sul / Pedra 90" },
  { id: "east", label: "3ª Regional · Leste / Planalto" },
  { id: "west", label: "4ª Regional · Oeste / Santa Izabel" },
  { id: "central", label: "5ª Regional · Centro / Dom Aquino" },
  { id: "rural", label: "6ª Regional · Distritos / Zona Rural" },
];
