# Farol Infantil

> Iluminando caminhos e protegendo a infância.

**Site no ar:** [https://farolinfantil.lovable.app](https://farolinfantil.lovable.app)

O **Farol Infantil** (antes chamado *Protege*, *Tutele Protege* e *Farol Protege*) é uma plataforma GovTech **demonstrativa** para apoiar os Conselhos Tutelares e a rede de proteção à criança e ao adolescente (ECA), com foco em Cuiabá/MT. Ela une um portal público para o cidadão e um painel de trabalho para conselheiros.

> ⚠️ **Projeto de demonstração.** Nomes, fotos, endereços, casos, alertas e conselheiros são fictícios. Integrações institucionais, telefones e funcionalidades operacionais precisam ser validados com as autoridades responsáveis antes de qualquer uso real. Em emergências, ligue **Disque 100** (gratuito, 24h).

## Funcionalidades

### Portal público
| Página | Rota | O que faz |
|---|---|---|
| Início | `/` | Apresentação, cards "Entenda o Conselho Tutelar", equipe, atalhos de emergência |
| Denúncia anônima | `/report` | Formulário guiado que gera um protocolo (ex.: `#PROT-8921`) |
| Consulta de protocolo | `/tracking` | Acompanha a denúncia pelo código, sem expor dados pessoais |
| Encontre seu Conselho | `/conselhos` | Busca por bairro, "usar minha localização", mapa com as 6 regionais, copiar endereço e rota no Google Maps |
| Plantões públicos | `/public-shifts` | Escala de plantão para a população |
| Transparência | `/transparency` | Estatísticas consolidadas |
| Educa | `/educa` | Conteúdo educativo sobre direitos |
| Kid Shield | `/citizen/kid-shield` | Orientações de segurança digital para famílias |
| Sobre | `/about` | Sobre o projeto |
| Acesso | `/login` | Tela GovTech com animação do farol; acesso de demonstração sem senha |

### Painel do conselheiro
| Página | Rota | O que faz |
|---|---|---|
| Painel geral | `/dashboard` | Indicadores, gráfico de denúncias, últimas atualizações |
| Análise preditiva | `/dashboard/predictive-analytics` | Tendências e riscos (simulado) |
| Casos | `/cases` | Busca, filtros, triagem por risco, novo caso, exportação CSV para o CMDCA |
| Detalhe do caso | `/case/$caseId` | Linha do tempo, medidas protetivas (ECA art. 101/129), gerador de ofícios A4 timbrados, comunicação interinstitucional |
| Linha do tempo auditável | `/case/$caseId/blockchain-timeline` | Trilha de registros do caso (demonstração) |
| Alertas digitais | `/alerts` | Alertas simulados de plataformas (Discord, Roblox) → "Converter em Caso Ativo" |
| Abrigos | `/shelters` | Vagas em acolhimento institucional |
| Operações | `/operations` | Planejamento e segurança de visitas |
| Mapa territorial | `/territory` | 6 regionais de Cuiabá, pontos críticos e ações preventivas |
| Plantões | `/shifts` | Escala semanal, plantonista do dia, troca de turno com aprovação |
| Relatórios ECA | `/reports` | Indicadores para prestação de contas |
| Configurações | `/settings` | Preferências e "Restaurar dados de exemplo" |

### Recursos transversais
- **7 idiomas:** Português, English, Español, Français, 日本語, 中文, 한국어 (o painel usa PT/EN/ES; os demais caem para inglês). Ofícios permanecem em português por serem documentos oficiais brasileiros.
- **Tema claro/escuro** e barra de acessibilidade.
- **Modo Sigilo LGPD:** mascara nomes (iniciais) e endereços (só o bairro) nas telas e exportações; registro de auditoria LGPD.
- **Persistência local:** casos e alertas ficam salvos no navegador (`farol_cases`, `farol_alerts_converted`).

## Limitações conhecidas
- Login é apenas demonstrativo (sem validação de senha). Contas reais exigem implementação no Lovable Cloud.
- Dados ficam no navegador de cada usuário; não há banco compartilhado ainda.
- Telefones dos conselhos não foram informados — botões de ligar/WhatsApp ficam desativados até um número oficial ser cadastrado.
- Endereços e coordenadas das regionais são aproximados/fictícios.

## Tecnologia
- TanStack Start v1 (React 19, SSR) + Vite 7, publicado em Cloudflare Workers
- Tailwind CSS v4 + shadcn/ui, Recharts, Leaflet / React-Leaflet (mapas OpenStreetMap)
- Vitest + Testing Library

### Estrutura
```
src/routes/      páginas (prefixo _public = portal, _dashboard = painel)
src/components/  componentes (mapas, gerador de ofícios, cena do farol...)
src/lib/         lógica pura e stores (casos, plantões, privacidade, i18n, conselhos de Cuiabá)
src/test/        testes automatizados
```

## Desenvolvimento
Requer Node.js (ou Bun).

```sh
git clone <url-do-repositorio>
cd farol-infantil
npm i
npm run dev      # servidor local
npm test         # testes
npm run build    # build de produção
```

## Lovable
Editor do projeto: [lovable.dev/projects/58b05289-74b2-4ec2-bcd5-982458590d15](https://lovable.dev/projects/58b05289-74b2-4ec2-bcd5-982458590d15). Alterações feitas no Lovable são enviadas para este repositório e vice-versa.
