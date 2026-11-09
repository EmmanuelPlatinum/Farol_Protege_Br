import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FolderLock,
  CalendarClock,
  FileText,
  Settings,
  ShieldCheck,
  Radar,
  Building2,
  ClipboardList,
  Map,
} from "lucide-react";
import { FarolProtegeLogo } from "@/components/farol-logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useI18n, useTx } from "@/lib/i18n";

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { t } = useI18n();
  const tx = useTx();
  const items = [
    { title: t.nav.dashboard, url: "/dashboard", icon: LayoutDashboard },
    { title: t.nav.cases, url: "/cases", icon: FolderLock },
    {
      title: tx("Alertas Digitais (API)", "Digital API Alerts", "Alertas Digitales (API)"),
      url: "/alerts",
      icon: Radar,
    },
    {
      title: tx("Vagas em Abrigos", "Shelter vacancies", "Plazas en acogida"),
      url: "/shelters",
      icon: Building2,
    },
    {
      title: tx("Gestão de Operações", "Operations management", "Gestión de operaciones"),
      url: "/operations",
      icon: ClipboardList,
    },
    {
      title: tx("Mapa Territorial", "Territorial map", "Mapa territorial"),
      url: "/territory",
      icon: Map,
    },
    { title: t.nav.shifts, url: "/shifts", icon: CalendarClock },
    { title: t.nav.reports, url: "/reports", icon: FileText },
    { title: t.nav.settings, url: "/settings", icon: Settings },
  ] as const;
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 px-2 py-3">
          <FarolProtegeLogo size="sm" showSubtitle={false} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t.nav.workspace}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      path === item.url || (item.url === "/cases" && path.startsWith("/case/"))
                    }
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
