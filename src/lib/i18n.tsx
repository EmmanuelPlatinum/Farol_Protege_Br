import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export const languages = [
  { code: "pt", label: "Português (Brasil)", short: "PT" },
  { code: "en", label: "English (US)", short: "EN" },
  { code: "es", label: "Español", short: "ES" },
  { code: "fr", label: "Français", short: "FR" },
  { code: "ja", label: "日本語", short: "日本" },
  { code: "zh", label: "中文（简体）", short: "中文" },
  { code: "ko", label: "한국어", short: "한국" },
] as const;
export type Lang = (typeof languages)[number]["code"];

const dict = {
  pt: {
    nav: { dashboard: "Painel", cases: "Casos", shifts: "Plantões", reports: "Relatórios ECA", settings: "Configurações", workspace: "Conselho" },
    search: "Buscar casos, famílias, ofícios...",
    profile: "Perfil", logout: "Sair", notifications: "Notificações", language: "Idioma",
    brand: "Farol Infantil", brandPrefix: "Farol", brandSuffix: "Infantil",
    brandSubtitle: "Portal de Proteção à Infância",
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
    landing: { badge: "Feito para Conselhos Tutelares de todo o Brasil", hero: "Gestão Inteligente e Segura para", heroHi: "Conselhos Tutelares", sub: "O Farol Infantil organiza casos sigilosos, ofícios e escalas de plantão em um só lugar — para que o conselho foque na proteção de crianças e adolescentes.", login: "Entrar", go: "Ir para o painel", cta: "Começar Agora", note: "Dados protegidos e sigilosos",
      features: [["Gestão de Casos Sigilosos", "Prontuários protegidos com acesso restrito, histórico completo e registro de cada atendimento."], ["Geração de Ofícios Automáticos", "Ofícios e requisições prontos a partir dos dados do caso, conforme o ECA."], ["Escalas de Plantão Integradas", "Monte a escala de plantão e saiba sempre quem está de sobreaviso."]],
      mock: ["Ativos", "Visitas", "No prazo", "Ofícios"], rights: "Todos os direitos reservados." },
  },
  en: {
    nav: { dashboard: "Dashboard", cases: "Cases", shifts: "Shifts", reports: "ECA Reports", settings: "Settings", workspace: "Council" },
    search: "Search cases, families, letters...",
    profile: "Profile", logout: "Log out", notifications: "Notifications", language: "Language",
    brand: "Children's Lighthouse", brandPrefix: "Children's", brandSuffix: "Lighthouse",
    brandSubtitle: "Child Protection Portal",
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
    landing: { badge: "Built for Child Protection Councils across Brazil", hero: "Smart, Secure Management for", heroHi: "Child Protection Councils", sub: "Farol Infantil keeps confidential cases, official letters and on-call schedules in one place — so the council can focus on protecting children and teens.", login: "Log in", go: "Go to Dashboard", cta: "Get Started", note: "Protected, confidential data",
      features: [["Confidential Case Management", "Protected records with restricted access, full history and a log of every service."], ["Automatic Letter Generation", "Official letters and requests ready from case data, following the ECA."], ["Integrated On-Call Schedules", "Build the on-call schedule and always know who is on duty."]],
      mock: ["Active", "Visits", "On time", "Letters"], rights: "All rights reserved." },
  },
  es: {
    nav: { dashboard: "Panel", cases: "Casos", shifts: "Guardias", reports: "Informes ECA", settings: "Configuración", workspace: "Consejo" },
    search: "Buscar casos, familias, oficios...",
    profile: "Perfil", logout: "Cerrar sesión", notifications: "Notificaciones", language: "Idioma",
    brand: "Faro Infantil", brandPrefix: "Faro", brandSuffix: "Infantil",
    brandSubtitle: "Portal de Protección de la Infancia",
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
    landing: { badge: "Hecho para Consejos Tutelares de todo Brasil", hero: "Gestión Inteligente y Segura para", heroHi: "Consejos Tutelares", sub: "Farol Infantil organiza casos confidenciales, oficios y turnos de guardia en un solo lugar — para que el consejo se enfoque en proteger a niños y adolescentes.", login: "Ingresar", go: "Ir al Panel", cta: "Comenzar Ahora", note: "Datos protegidos y confidenciales",
      features: [["Gestión de Casos Confidenciales", "Expedientes protegidos con acceso restringido, historial completo y registro de cada atención."], ["Generación Automática de Oficios", "Oficios y solicitudes listos a partir de los datos del caso, según el ECA."], ["Turnos de Guardia Integrados", "Arma el turno de guardia y sabe siempre quién está disponible."]],
      mock: ["Activos", "Visitas", "A tiempo", "Oficios"], rights: "Todos los derechos reservados." },
  },
};

export type Dict = (typeof dict)["pt"];
const additionalDicts: Record<"fr" | "ja" | "zh" | "ko", Dict> = {
  fr: {
    ...dict.en,
    language: "Langue",
    brand: "Phare des enfants",
    brandPrefix: "Phare des",
    brandSuffix: "enfants",
    brandSubtitle: "Portail de protection de l’enfance",
    nav: { dashboard: "Tableau de bord", cases: "Dossiers", shifts: "Permanences", reports: "Rapports ECA", settings: "Paramètres", workspace: "Conseil" },
    search: "Rechercher des dossiers, familles, courriers...",
    profile: "Profil", logout: "Se déconnecter", notifications: "Notifications",
    greeting: "Bonjour, Ana", greetingSub: "Résumé des dossiers et échéances du conseil aujourd’hui.",
    kpi: { active: "Dossiers actifs", activeD: "+3 cette semaine", visits: "Visites en attente", urgent: "Urgent", visitsD: "3 prévues aujourd’hui", reports: "Rapports dans les délais", reportsD: "Objectif : 90 %" },
    chartTitle: "Volume des signalements", chartSub: "Signalements reçus au cours des 7 derniers jours", chartLabel: "Signalements",
    days: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
    updates: "Dernières mises à jour des dossiers", updatesSub: "Activité récente des dossiers",
    updateItems: ["Visite effectuée au domicile de la famille Silva", "Nouveau courrier reçu du ministère public", "Orientation vers le CRAS enregistrée — dossier nº 1042", "Audience fixée au tribunal pour mineurs", "Rapport ECA envoyé — famille Souza"],
    ago: ["il y a 10 min", "il y a 35 min", "il y a 1 h", "il y a 3 h", "il y a 5 h"],
    cases: { title: "Dossiers", sub: "Dossiers confidentiels suivis par le conseil.", new: "Nouveau dossier", created: "Nouveau dossier créé", id: "Dossier", family: "Famille", type: "Type", counselor: "Conseiller·ère", status: "Statut" },
    caseTypes: ["Négligence", "Décrochage scolaire", "Violence domestique", "Travail des enfants", "Abandon"],
    status: { open: "En cours", urgent: "Urgent", closed: "Archivé" },
    shifts: { title: "Permanences", sub: "Planning de permanence de la semaine.", day: "Jour", counselor: "Conseiller·ère", period: "Période", today: "Aujourd’hui" },
    periods: ["Jour (8 h–18 h)", "Nuit (18 h–8 h)"],
    reports: { title: "Rapports ECA", sub: "Rapports et courriers établis conformément à l’ECA.", generate: "Générer un courrier", generated: "Courrier généré automatiquement", due: "Échéance", onTime: "Dans les délais", late: "En retard", sent: "Envoyé" },
    reportNames: ["Rapport de suivi — famille Silva", "Courrier au ministère public — dossier nº 1038", "Rapport de visite — famille Souza", "Demande de service — santé (art. 136)"],
    settings: { title: "Paramètres", sub: "Automatisations et notifications.", card: "Automatisations", cardSub: "Activer ou désactiver des fonctions.", opts: [["Alertes d’échéance", "Avertir 48 h avant l’échéance des rapports."], ["Courriers automatiques", "Créer des brouillons à partir des dossiers."], ["Résumé quotidien", "Recevoir un résumé de permanence chaque soir."]] },
  },
  ja: {
    ...dict.en,
    language: "言語",
    brand: "子どもの灯台",
    brandPrefix: "子どもの",
    brandSuffix: "灯台",
    brandSubtitle: "子ども保護ポータル",
    nav: { dashboard: "ダッシュボード", cases: "ケース", shifts: "当番", reports: "ECA レポート", settings: "設定", workspace: "相談窓口" },
    search: "ケース、家族、文書を検索...",
    profile: "プロフィール", logout: "ログアウト", notifications: "通知",
    greeting: "こんにちは、Ana さん", greetingSub: "本日のケースと期限の概要です。",
    kpi: { active: "対応中のケース", activeD: "今週 +3 件", visits: "未完了の訪問", urgent: "緊急", visitsD: "本日期限 3 件", reports: "期限内の報告書", reportsD: "目標：90%" },
    chartTitle: "通報件数", chartSub: "過去7日間に受け付けた通報", chartLabel: "通報",
    days: ["月", "火", "水", "木", "金", "土", "日"],
    updates: "ケースの最新情報", updatesSub: "最近のケース対応",
    updateItems: ["Silva 家の訪問を実施", "検察庁から新しい文書を受領", "CRAS への紹介を記録 — ケース #1042", "少年家庭裁判所の審理を予定", "ECA 報告書を送信 — Souza 家"],
    ago: ["10分前", "35分前", "1時間前", "3時間前", "5時間前"],
    cases: { title: "ケース", sub: "相談窓口が対応する機密ケース。", new: "新規ケース", created: "ケースを作成しました", id: "ケース", family: "家族", type: "種類", counselor: "相談員", status: "状態" },
    caseTypes: ["ネグレクト", "不登校", "家庭内暴力", "児童労働", "遺棄"],
    status: { open: "対応中", urgent: "緊急", closed: "終了" },
    shifts: { title: "当番", sub: "今週の当番スケジュール。", day: "曜日", counselor: "相談員", period: "時間帯", today: "今日" },
    periods: ["昼間（8時〜18時）", "夜間（18時〜翌8時）"],
    reports: { title: "ECA レポート", sub: "ECA に基づく報告書と公文書。", generate: "文書を作成", generated: "文書を自動作成しました", due: "期限", onTime: "期限内", late: "期限超過", sent: "送信済み" },
    reportNames: ["支援報告 — Silva 家", "検察庁宛て文書 — ケース #1038", "訪問報告 — Souza 家", "サービス依頼 — 医療（第136条）"],
    settings: { title: "設定", sub: "自動化と通知。", card: "自動化", cardSub: "機能の有効・無効を設定します。", opts: [["期限通知", "報告期限の48時間前に通知します。"], ["文書の自動作成", "ケース情報から文書の下書きを作成します。"], ["日次概要", "毎晩、当番の概要を受け取ります。"]] },
  },
  zh: {
    ...dict.en,
    language: "语言",
    brand: "儿童灯塔",
    brandPrefix: "儿童",
    brandSuffix: "灯塔",
    brandSubtitle: "儿童保护门户",
    nav: { dashboard: "控制台", cases: "案件", shifts: "值班", reports: "ECA 报告", settings: "设置", workspace: "委员会" },
    search: "搜索案件、家庭、文书...",
    profile: "个人资料", logout: "退出登录", notifications: "通知",
    greeting: "下午好，Ana", greetingSub: "今日委员会案件与期限摘要。",
    kpi: { active: "进行中的案件", activeD: "本周 +3", visits: "待处理家访", urgent: "紧急", visitsD: "今日到期 3 项", reports: "按时提交的报告", reportsD: "目标：90%" },
    chartTitle: "举报数量", chartSub: "过去 7 天收到的举报", chartLabel: "举报",
    days: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    updates: "案件最新动态", updatesSub: "近期案件活动",
    updateItems: ["已到 Silva 家进行家访", "收到检察机关的新文书", "已记录转介至 CRAS — 案件 #1042", "已安排少年法院听证会", "已发送 ECA 报告 — Souza 家"],
    ago: ["10 分钟前", "35 分钟前", "1 小时前", "3 小时前", "5 小时前"],
    cases: { title: "案件", sub: "委员会跟进的保密案件。", new: "新建案件", created: "案件已创建", id: "案件", family: "家庭", type: "类型", counselor: "工作人员", status: "状态" },
    caseTypes: ["疏忽照护", "辍学", "家庭暴力", "童工", "遗弃"],
    status: { open: "处理中", urgent: "紧急", closed: "已归档" },
    shifts: { title: "值班", sub: "本周值班安排。", day: "日期", counselor: "工作人员", period: "时段", today: "今天" },
    periods: ["白班（08:00–18:00）", "夜班（18:00–08:00）"],
    reports: { title: "ECA 报告", sub: "依据 ECA 生成的报告和公文。", generate: "生成公文", generated: "公文已自动生成", due: "期限", onTime: "按时", late: "逾期", sent: "已发送" },
    reportNames: ["跟进报告 — Silva 家", "致检察机关的公文 — 案件 #1038", "家访报告 — Souza 家", "服务申请 — 医疗（第 136 条）"],
    settings: { title: "设置", sub: "自动化与通知。", card: "自动化", cardSub: "启用或停用功能。", opts: [["期限提醒", "在报告到期前 48 小时提醒。"], ["自动生成公文", "根据案件信息生成公文草稿。"], ["每日摘要", "每晚接收值班摘要。"]] },
  },
  ko: {
    ...dict.en,
    language: "언어",
    brand: "어린이 등대",
    brandPrefix: "어린이",
    brandSuffix: "등대",
    brandSubtitle: "아동 보호 포털",
    nav: { dashboard: "대시보드", cases: "사례", shifts: "당직", reports: "ECA 보고서", settings: "설정", workspace: "위원회" },
    search: "사례, 가족, 공문 검색...",
    profile: "프로필", logout: "로그아웃", notifications: "알림",
    greeting: "안녕하세요, Ana님", greetingSub: "오늘의 위원회 사례 및 기한 요약입니다.",
    kpi: { active: "진행 중인 사례", activeD: "이번 주 +3", visits: "예정된 방문", urgent: "긴급", visitsD: "오늘 기한 3건", reports: "기한 내 보고서", reportsD: "목표: 90%" },
    chartTitle: "신고 건수", chartSub: "최근 7일간 접수된 신고", chartLabel: "신고",
    days: ["월", "화", "수", "목", "금", "토", "일"],
    updates: "최근 사례 업데이트", updatesSub: "사례의 최근 활동",
    updateItems: ["Silva 가족 가정 방문 완료", "검찰청에서 새 공문 접수", "CRAS 연계 기록 — 사례 #1042", "소년법원 심리 일정 등록", "ECA 보고서 발송 — Souza 가족"],
    ago: ["10분 전", "35분 전", "1시간 전", "3시간 전", "5시간 전"],
    cases: { title: "사례", sub: "위원회가 관리하는 기밀 사례입니다.", new: "새 사례", created: "새 사례가 생성되었습니다", id: "사례", family: "가족", type: "유형", counselor: "상담원", status: "상태" },
    caseTypes: ["방임", "학업 중단", "가정 폭력", "아동 노동", "유기"],
    status: { open: "진행 중", urgent: "긴급", closed: "보관됨" },
    shifts: { title: "당직", sub: "이번 주 통합 당직 일정입니다.", day: "요일", counselor: "상담원", period: "시간대", today: "오늘" },
    periods: ["주간 (08시–18시)", "야간 (18시–08시)"],
    reports: { title: "ECA 보고서", sub: "ECA에 따른 보고서 및 공문입니다.", generate: "공문 생성", generated: "공문이 자동 생성되었습니다", due: "기한", onTime: "기한 내", late: "지연", sent: "발송됨" },
    reportNames: ["지원 보고서 — Silva 가족", "검찰청 공문 — 사례 #1038", "방문 보고서 — Souza 가족", "서비스 요청 — 보건 (제136조)"],
    settings: { title: "설정", sub: "자동화 및 알림입니다.", card: "자동화", cardSub: "기능을 켜거나 끕니다.", opts: [["기한 알림", "보고서 기한 48시간 전에 알립니다."], ["공문 자동 작성", "사례 정보를 바탕으로 공문 초안을 만듭니다."], ["일일 요약", "매일 저녁 당직 요약을 받습니다."]] },
  },
};
const dictionaries: Record<Lang, Dict> = { ...dict, ...additionalDicts };

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Dict;
};

const Ctx = createContext<I18nContextValue>({
  lang: "pt",
  setLang: () => undefined,
  t: dict.pt,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("lang");
    if (languages.some((language) => language.code === savedLanguage)) {
      setLangState(savedLanguage as Lang);
    }
  }, []);

  useEffect(() => {
    const locale = {
      pt: "pt-BR",
      en: "en-US",
      es: "es",
      fr: "fr",
      ja: "ja",
      zh: "zh-CN",
      ko: "ko",
    } satisfies Record<Lang, string>;
    document.documentElement.lang = locale[lang];

    const brandNames = Object.values(dictionaries).map((dictionary) => dictionary.brand);
    const updateTitleBrand = () => {
      const title = document.querySelector("title");
      if (!title) return;
      const heading = document.querySelector("main h1")?.textContent?.trim();
      const localizedTitle = heading
        ? `${heading} — ${dictionaries[lang].brand}`
        : brandNames.reduce(
            (value, name) => value.replaceAll(name, dictionaries[lang].brand),
            title.textContent ?? "",
          );
      if (title.textContent !== localizedTitle) title.textContent = localizedTitle;
    };
    updateTitleBrand();
    const observer = new MutationObserver(updateTitleBrand);
    observer.observe(document.head, { childList: true, characterData: true, subtree: true });
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [lang]);

  const setLang = (nextLanguage: Lang) => {
    window.localStorage.setItem("lang", nextLanguage);
    setLangState(nextLanguage);
  };
  const t = dictionaries[lang];

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);

export function useTx() {
  const { lang } = useContext(Ctx);
  return (
    pt: string,
    en: string,
    es?: string,
    fr?: string,
    ja?: string,
    zh?: string,
    ko?: string,
  ) => {
    const translations: Record<Lang, string | undefined> = {
      pt,
      en,
      es,
      fr,
      ja,
      zh,
      ko,
    };
    return translations[lang] ?? (lang === "pt" ? pt : en);
  };
}
