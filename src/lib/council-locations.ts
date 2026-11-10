export type CouncilLocation = {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  address: string;
  contacts: { label: string; phone: string }[];
  locationNote: string;
  searchTerms: string[];
};

export const councilLocations: CouncilLocation[] = [
  {
    id: "center",
    name: "Plantão e 1º Conselho Tutelar — Centro",
    region: "Centro Sul",
    lat: -15.598317,
    lng: -56.0948957,
    address: "Av. Getúlio Vargas, nº 997, Centro Sul, Cuiabá — MT",
    contacts: [
      { label: "Plantão", phone: "(65) 99206-6741" },
      { label: "1º Conselho Tutelar", phone: "(65) 3317-6733" },
      { label: "1º Conselho Tutelar", phone: "(65) 99217-7873" },
    ],
    locationNote: "Pino localizado na via; confirme o número 997 no mapa antes do deslocamento.",
    searchTerms: ["plantão", "1º conselho", "centro"],
  },
  {
    id: "pedra-90",
    name: "2º Conselho Tutelar — Pedra 90",
    region: "Pedra 90",
    lat: -15.6306513,
    lng: -55.9623868,
    address: "Av. Nilton Rabelo de Castro, s/nº, Pedra 90, Cuiabá — MT",
    contacts: [
      { label: "2º Conselho Tutelar", phone: "(65) 3617-1950" },
      { label: "2º Conselho Tutelar", phone: "(65) 99244-8766" },
    ],
    locationNote:
      "Pino localizado na via; confirme o ponto exato com a unidade antes do deslocamento.",
    searchTerms: ["pedra 90", "sul"],
  },
  {
    id: "cpa",
    name: "3º Conselho Tutelar — CPA II",
    region: "CPA II",
    lat: -15.559357,
    lng: -56.0464566,
    address: "Rua Jornalista Caramuru de Campos Maciel, nº 4, qd. 19, CPA II, Cuiabá — MT",
    contacts: [
      { label: "3º Conselho Tutelar", phone: "(65) 3616-6872" },
      { label: "3º Conselho Tutelar", phone: "(65) 99215-5608" },
    ],
    locationNote:
      "Pino de referência do bairro CPA II; a rua e o número não foram localizados com precisão no mapa.",
    searchTerms: ["cpa", "cpa ii", "norte"],
  },
  {
    id: "cidade-alta",
    name: "4º Conselho Tutelar — Cidade Alta",
    region: "Cidade Alta",
    lat: -15.6088928,
    lng: -56.1227264,
    address: "Rua Maurício Cardoso, nº 744, Cidade Alta, Cuiabá — MT",
    contacts: [
      { label: "4º Conselho Tutelar", phone: "(65) 3617-1405" },
      { label: "4º Conselho Tutelar", phone: "(65) 99238-6890" },
    ],
    locationNote: "Pino localizado na via; confirme o número 744 no mapa antes do deslocamento.",
    searchTerms: ["cidade alta", "oeste"],
  },
  {
    id: "coxipo",
    name: "5º Conselho Tutelar — Coxipó",
    region: "Coophema",
    lat: -15.6395957,
    lng: -56.0658186,
    address: "Rua Antônio Dorileo, nº 116, Coophema, Cuiabá — MT",
    contacts: [
      { label: "5º Conselho Tutelar", phone: "(65) 3313-3155" },
      { label: "5º Conselho Tutelar", phone: "(65) 99209-7377" },
    ],
    locationNote: "Pino localizado na via; confirme o número 116 no mapa antes do deslocamento.",
    searchTerms: ["coxipó", "coophema", "sul"],
  },
  {
    id: "planalto",
    name: "6º Conselho Tutelar — Planalto",
    region: "Planalto",
    lat: -15.5852347,
    lng: -56.0431454,
    address: "Av. Parecis, nº 168, Planalto, Cuiabá — MT",
    contacts: [
      { label: "6º Conselho Tutelar", phone: "(65) 3617-1712" },
      { label: "6º Conselho Tutelar", phone: "(65) 99209-7377" },
    ],
    locationNote: "Pino localizado na via; confirme o número 168 no mapa antes do deslocamento.",
    searchTerms: ["planalto", "leste"],
  },
];
