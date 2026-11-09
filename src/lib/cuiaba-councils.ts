// Fictitious demo data. Coordinates are approximate neighbourhood centres in Cuiabá-MT.
export type Violation = "neglect" | "dropout" | "violence" | "labor";

export type Council = {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  address: string;
  neighborhoods: { name: string; cases: number; main: Violation }[];
  counselors: { name: string; shift: string }[];
};

export const councils: Council[] = [
  {
    id: "r1", name: "1ª Região — CPA", region: "Norte", lat: -15.556, lng: -56.07,
    address: "Av. Fictícia das Torres, 100 — CPA I",
    neighborhoods: [
      { name: "CPA I", cases: 18, main: "dropout" }, { name: "CPA III", cases: 22, main: "dropout" },
      { name: "Morada da Serra", cases: 15, main: "neglect" }, { name: "Três Barras", cases: 9, main: "violence" },
    ],
    counselors: [
      { name: "Helena Ramos", shift: "Seg/Qua 08h–18h" }, { name: "Paulo Arruda", shift: "Ter/Qui 08h–18h" },
      { name: "Carla Siqueira", shift: "Sex 08h–18h" }, { name: "Diego Moura", shift: "Sobreaviso noturno" },
      { name: "Lívia Campos", shift: "Fim de semana" },
    ],
  },
  {
    id: "r2", name: "2ª Região — Pedra 90", region: "Sul", lat: -15.662, lng: -56.04,
    address: "Rua Exemplo, 290 — Pedra 90",
    neighborhoods: [
      { name: "Pedra 90", cases: 27, main: "neglect" }, { name: "Tijucal", cases: 14, main: "violence" },
      { name: "Osmar Cabral", cases: 11, main: "neglect" }, { name: "Pascoal Ramos", cases: 8, main: "labor" },
    ],
    counselors: [
      { name: "Marcos Leite", shift: "Seg/Qua 08h–18h" }, { name: "Joana Prado", shift: "Ter/Qui 08h–18h" },
      { name: "Rita Fontes", shift: "Sex 08h–18h" }, { name: "Bruno Assis", shift: "Sobreaviso noturno" },
      { name: "Tânia Lobo", shift: "Fim de semana" },
    ],
  },
  {
    id: "r3", name: "3ª Região — Planalto", region: "Leste", lat: -15.585, lng: -56.04,
    address: "Av. Demonstração, 33 — Planalto",
    neighborhoods: [
      { name: "Planalto", cases: 12, main: "violence" }, { name: "Bela Vista", cases: 7, main: "neglect" },
      { name: "Pedregal", cases: 16, main: "violence" }, { name: "Jardim Renascer", cases: 10, main: "dropout" },
    ],
    counselors: [
      { name: "Sônia Duarte", shift: "Seg/Qua 08h–18h" }, { name: "Felipe Rondon", shift: "Ter/Qui 08h–18h" },
      { name: "Aline Barros", shift: "Sex 08h–18h" }, { name: "Igor Pinheiro", shift: "Sobreaviso noturno" },
      { name: "Clara Nunes", shift: "Fim de semana" },
    ],
  },
  {
    id: "r4", name: "4ª Região — Santa Izabel", region: "Oeste", lat: -15.585, lng: -56.12,
    address: "Rua Modelo, 44 — Santa Izabel",
    neighborhoods: [
      { name: "Santa Izabel", cases: 13, main: "neglect" }, { name: "Cidade Alta", cases: 6, main: "dropout" },
      { name: "Goiabeiras", cases: 4, main: "violence" }, { name: "Quilombo", cases: 9, main: "labor" },
    ],
    counselors: [
      { name: "Renato Gomes", shift: "Seg/Qua 08h–18h" }, { name: "Beatriz Lima", shift: "Ter/Qui 08h–18h" },
      { name: "Otávio Reis", shift: "Sex 08h–18h" }, { name: "Patrícia Melo", shift: "Sobreaviso noturno" },
      { name: "Vítor Alves", shift: "Fim de semana" },
    ],
  },
  {
    id: "r5", name: "5ª Região — Centro / Dom Aquino", region: "Centro", lat: -15.601, lng: -56.093,
    address: "Praça Ilustrativa, 5 — Centro",
    neighborhoods: [
      { name: "Centro Histórico", cases: 11, main: "labor" }, { name: "Dom Aquino", cases: 8, main: "neglect" },
      { name: "Porto", cases: 19, main: "labor" }, { name: "Poção", cases: 5, main: "violence" },
    ],
    counselors: [
      { name: "Fernanda Costa", shift: "Seg/Qua 08h–18h" }, { name: "Gustavo Brito", shift: "Ter/Qui 08h–18h" },
      { name: "Mariana Teles", shift: "Sex 08h–18h" }, { name: "André Paes", shift: "Sobreaviso noturno" },
      { name: "Luana Freitas", shift: "Fim de semana" },
    ],
  },
  {
    id: "r6", name: "6ª Região — Distritos / Zona Rural", region: "Rural", lat: -15.39, lng: -56.23,
    address: "Estrada Fictícia, km 6 — N. S. da Guia",
    neighborhoods: [
      { name: "N. S. da Guia", cases: 5, main: "labor" }, { name: "Coxipó do Ouro", cases: 4, main: "dropout" },
      { name: "Aguaçu", cases: 3, main: "neglect" },
    ],
    counselors: [
      { name: "Sebastião Cruz", shift: "Seg/Qua 08h–18h" }, { name: "Nair Benedita", shift: "Ter/Qui 08h–18h" },
      { name: "Edson Prates", shift: "Sex 08h–18h" }, { name: "Rosa Amorim", shift: "Sobreaviso noturno" },
      { name: "Hugo Taques", shift: "Fim de semana" },
    ],
  },
];

export const totalCases = (c: Council) => c.neighborhoods.reduce((s, n) => s + n.cases, 0);

/** Neighbourhoods at or above the threshold are "blind spots" needing preventive action. */
export const HOTSPOT_THRESHOLD = 15;
export const hotspots = () =>
  councils.flatMap((c) => c.neighborhoods.filter((n) => n.cases >= HOTSPOT_THRESHOLD).map((n) => ({ ...n, council: c.name })))
    .sort((a, b) => b.cases - a.cases);
