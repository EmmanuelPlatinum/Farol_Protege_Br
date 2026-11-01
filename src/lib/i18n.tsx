import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export const languages = [
  { code: "pt", label: "Português (Brasil)", short: "PT" },
  { code: "en", label: "English (US)", short: "EN" },
  { code: "es", label: "Español", short: "ES" },
  { code: "fr", label: "Français", short: "FR" },
  { code: "ja", label: "日本語", short: "JA" },
  { code: "zh", label: "中文", short: "ZH" },
  { code: "ko", label: "한국어", short: "KO" },
] as const;
export type Lang = (typeof languages)[number]["code"];

const dict = {
  pt: {
    nav: { dashboard: "Dashboard", cases: "Casos", shifts: "Plantões", reports: "Relatórios ECA", settings: "Configurações", workspace: "Conselho" },
    search: "Buscar casos, famílias, ofícios...",
    profile: "Perfil", logout: "Sair", notifications: "Notificações", language: "Idioma",
    greeting: "Boa tarde, Ana", greetingSub: "Resumo dos casos e prazos do conselho hoje.",
    kpi: { active: "Casos Ativos", activeD: "+3 nesta semana", visits: "Visitas Pendentes", urgent: "Urgente", visitsD: "3 com prazo hoje", reports: "Relatórios no Prazo", reportsD: "Meta: 90%" },
    chartTitle: "Volume de Denúncias", chartSub: "Denúncias recebidas nos últimos 7 dias", chartLabel: "Denúncias",
    days: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
    updates: "Últimas Atualizações de Casos", updatesSub: "Movimentações recentes nos casos",
    updateItems: ["Visita realizada na residência da Família Silva", "Novo ofício recebido do Ministério Público", "Encaminhamento ao CRAS registrado — Caso #1042", "Audiência agendada na Vara da Infância", "Relatório ECA enviado — Família Souza"],
    ago: ["há 10 min", "há 35 min", "há 1 h", "há 3 h", "há 5 h"],
    cases: { title: "Casos", sub: "Casos sigilosos acompanhados pelo conselho.", new: "Novo Caso", created: "Novo caso criado", id: "Caso", family: "Família", type: "Tipo", counselor: "Conselheiro(a)", status: "Status" },
    caseTypes: ["Negligência", "Evasão escolar", "Violência doméstica", "Trabalho infantil", "Abandono"],
    status: { open: "Em andamento", urgent: "Urgente", closed: "Arquivado" },
    shifts: { title: "Plantões", sub: "Escala de plantão integrada da semana.", day: "Dia", counselor: "Conselheiro(a)", period: "Período", today: "Hoje" },
    periods: ["Diurno (08h–18h)", "Noturno (18h–08h)"],
    reports: { title: "Relatórios ECA", sub: "Relatórios e ofícios gerados conforme o ECA.", generate: "Gerar Ofício", generated: "Ofício gerado automaticamente", due: "Prazo", onTime: "No prazo", late: "Atrasado", sent: "Enviado" },
    reportNames: ["Relatório de acompanhamento — Família Silva", "Ofício ao Ministério Público — Caso #1038", "Relatório de visita — Família Souza", "Requisição de serviço — Saúde (Art. 136)"],
    settings: { title: "Configurações", sub: "Automações e notificações.", card: "Automações", cardSub: "Ative ou desative recursos.",
      opts: [["Alertas de prazo", "Avisar 48h antes do vencimento de relatórios."], ["Ofícios automáticos", "Gerar rascunhos de ofícios a partir dos casos."], ["Resumo diário", "Receber um resumo do plantão toda noite."]] },
    landing: { badge: "Feito para Conselhos Tutelares de todo o Brasil", hero: "Gestão Inteligente e Segura para", heroHi: "Conselhos Tutelares", sub: "O Farol Protege organiza casos sigilosos, ofícios e escalas de plantão em um só lugar — para que o conselho foque na proteção de crianças e adolescentes.", login: "Entrar", go: "Ir para o Dashboard", cta: "Começar Agora", note: "Dados protegidos e sigilosos",
      features: [["Gestão de Casos Sigilosos", "Prontuários protegidos com acesso restrito, histórico completo e registro de cada atendimento."], ["Geração de Ofícios Automáticos", "Ofícios e requisições prontos a partir dos dados do caso, conforme o ECA."], ["Escalas de Plantão Integradas", "Monte a escala de plantão e saiba sempre quem está de sobreaviso."]],
      mock: ["Ativos", "Visitas", "No prazo", "Ofícios"], rights: "Todos os direitos reservados." },
  },
  en: {
    nav: { dashboard: "Dashboard", cases: "Cases", shifts: "Shifts", reports: "ECA Reports", settings: "Settings", workspace: "Council" },
    search: "Search cases, families, letters...",
    profile: "Profile", logout: "Log out", notifications: "Notifications", language: "Language",
    greeting: "Good afternoon, Ana", greetingSub: "Today's summary of the council's cases and deadlines.",
    kpi: { active: "Active Cases", activeD: "+3 this week", visits: "Pending Visits", urgent: "Urgent", visitsD: "3 due today", reports: "Reports on Time", reportsD: "Target: 90%" },
    chartTitle: "Report Volume", chartSub: "Reports received in the last 7 days", chartLabel: "Reports",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    updates: "Latest Case Updates", updatesSub: "Recent activity across cases",
    updateItems: ["Home visit completed for the Silva Family", "New official letter received from the Public Prosecutor", "Referral to CRAS logged — Case #1042", "Hearing scheduled at the Juvenile Court", "ECA report sent — Souza Family"],
    ago: ["10 min ago", "35 min ago", "1 h ago", "3 h ago", "5 h ago"],
    cases: { title: "Cases", sub: "Confidential cases followed by the council.", new: "New Case", created: "New case created", id: "Case", family: "Family", type: "Type", counselor: "Counselor", status: "Status" },
    caseTypes: ["Neglect", "School dropout", "Domestic violence", "Child labor", "Abandonment"],
    status: { open: "In progress", urgent: "Urgent", closed: "Archived" },
    shifts: { title: "Shifts", sub: "This week's integrated on-call schedule.", day: "Day", counselor: "Counselor", period: "Period", today: "Today" },
    periods: ["Day (8am–6pm)", "Night (6pm–8am)"],
    reports: { title: "ECA Reports", sub: "Reports and official letters generated under the ECA.", generate: "Generate Letter", generated: "Letter generated automatically", due: "Due", onTime: "On time", late: "Late", sent: "Sent" },
    reportNames: ["Follow-up report — Silva Family", "Letter to the Public Prosecutor — Case #1038", "Visit report — Souza Family", "Service request — Health (Art. 136)"],
    settings: { title: "Settings", sub: "Automations and notifications.", card: "Automations", cardSub: "Turn features on or off.",
      opts: [["Deadline alerts", "Warn 48h before reports are due."], ["Automatic letters", "Draft official letters from case data."], ["Daily summary", "Get an on-call summary every evening."]] },
    landing: { badge: "Built for Child Protection Councils across Brazil", hero: "Smart, Secure Management for", heroHi: "Child Protection Councils", sub: "Farol Protege keeps confidential cases, official letters and on-call schedules in one place — so the council can focus on protecting children and teens.", login: "Log in", go: "Go to Dashboard", cta: "Get Started", note: "Protected, confidential data",
      features: [["Confidential Case Management", "Protected records with restricted access, full history and a log of every service."], ["Automatic Letter Generation", "Official letters and requests ready from case data, following the ECA."], ["Integrated On-Call Schedules", "Build the on-call schedule and always know who is on duty."]],
      mock: ["Active", "Visits", "On time", "Letters"], rights: "All rights reserved." },
  },
  es: {
    nav: { dashboard: "Panel", cases: "Casos", shifts: "Guardias", reports: "Informes ECA", settings: "Configuración", workspace: "Consejo" },
    search: "Buscar casos, familias, oficios...",
    profile: "Perfil", logout: "Cerrar sesión", notifications: "Notificaciones", language: "Idioma",
    greeting: "Buenas tardes, Ana", greetingSub: "Resumen de los casos y plazos del consejo hoy.",
    kpi: { active: "Casos Activos", activeD: "+3 esta semana", visits: "Visitas Pendientes", urgent: "Urgente", visitsD: "3 vencen hoy", reports: "Informes a Tiempo", reportsD: "Meta: 90%" },
    chartTitle: "Volumen de Denuncias", chartSub: "Denuncias recibidas en los últimos 7 días", chartLabel: "Denuncias",
    days: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    updates: "Últimas Actualizaciones de Casos", updatesSub: "Movimientos recientes en los casos",
    updateItems: ["Visita realizada en la residencia de la Familia Silva", "Nuevo oficio recibido del Ministerio Público", "Derivación al CRAS registrada — Caso #1042", "Audiencia programada en el Juzgado de Menores", "Informe ECA enviado — Familia Souza"],
    ago: ["hace 10 min", "hace 35 min", "hace 1 h", "hace 3 h", "hace 5 h"],
    cases: { title: "Casos", sub: "Casos confidenciales acompañados por el consejo.", new: "Nuevo Caso", created: "Nuevo caso creado", id: "Caso", family: "Familia", type: "Tipo", counselor: "Consejero(a)", status: "Estado" },
    caseTypes: ["Negligencia", "Abandono escolar", "Violencia doméstica", "Trabajo infantil", "Abandono"],
    status: { open: "En curso", urgent: "Urgente", closed: "Archivado" },
    shifts: { title: "Guardias", sub: "Turnos de guardia integrados de la semana.", day: "Día", counselor: "Consejero(a)", period: "Período", today: "Hoy" },
    periods: ["Diurno (08h–18h)", "Nocturno (18h–08h)"],
    reports: { title: "Informes ECA", sub: "Informes y oficios generados según el ECA.", generate: "Generar Oficio", generated: "Oficio generado automáticamente", due: "Plazo", onTime: "A tiempo", late: "Atrasado", sent: "Enviado" },
    reportNames: ["Informe de seguimiento — Familia Silva", "Oficio al Ministerio Público — Caso #1038", "Informe de visita — Familia Souza", "Solicitud de servicio — Salud (Art. 136)"],
    settings: { title: "Configuración", sub: "Automatizaciones y notificaciones.", card: "Automatizaciones", cardSub: "Activa o desactiva funciones.",
      opts: [["Alertas de plazo", "Avisar 48h antes del vencimiento de informes."], ["Oficios automáticos", "Generar borradores de oficios a partir de los casos."], ["Resumen diario", "Recibir un resumen de la guardia cada noche."]] },
    landing: { badge: "Hecho para Consejos Tutelares de todo Brasil", hero: "Gestión Inteligente y Segura para", heroHi: "Consejos Tutelares", sub: "Farol Protege organiza casos confidenciales, oficios y turnos de guardia en un solo lugar — para que el consejo se enfoque en proteger a niños y adolescentes.", login: "Ingresar", go: "Ir al Panel", cta: "Comenzar Ahora", note: "Datos protegidos y confidenciales",
      features: [["Gestión de Casos Confidenciales", "Expedientes protegidos con acceso restringido, historial completo y registro de cada atención."], ["Generación Automática de Oficios", "Oficios y solicitudes listos a partir de los datos del caso, según el ECA."], ["Turnos de Guardia Integrados", "Arma el turno de guardia y sabe siempre quién está disponible."]],
      mock: ["Activos", "Visitas", "A tiempo", "Oficios"], rights: "Todos los derechos reservados." },
  },
};

export type Dict = (typeof dict)["pt"];
const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({ lang: "pt", setLang: () => {}, t: dict.pt });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");
  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved && languages.some((l) => l.code === saved)) setLangState(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : lang === "en" ? "en-US" : lang;
  }, [lang]);
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };
  const t = (lang === "es" ? dict.es : lang === "pt" ? dict.pt : dict.en) as Dict;
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);

/** Picks Portuguese for "pt", Spanish when one is given, otherwise English (dashboard strings). */
export function useTx() {
  const { lang } = useContext(Ctx);
  return (pt: string, en: string, es?: string) => (lang === "pt" ? pt : lang === "es" ? (es ?? en) : en);
}
