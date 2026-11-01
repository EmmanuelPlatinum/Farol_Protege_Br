# Farol Protege

Build a modern, responsive SaaS web application dashboard for a local business automation platform. The primary users are local business owners who need to manage their appointments, customer messages, and online reputation.

Use React, Tailwind CSS, and shadcn/ui components. The design should be clean, professional, and minimalist, utilizing a color palette of slate grays, crisp white, and an electric blue for primary actions.

Please generate the following core views:

1. Layout & Navigation:

A collapsible sidebar navigation containing: Dashboard, Appointments, Messages, Reviews, and Settings.

A top header with a global search bar, a notification bell, and an avatar profile dropdown.

2. Main Dashboard View:

KPI Summary Cards: "Appointments Today", "New Reviews", "Unread Messages", and "Total Revenue".

A simple, elegant line chart showing "Customer Engagement" over the last 7 days.

A "Recent Activity" feed showing events like "João confirmed his appointment" or "New 5-star review from Maria".

3. Appointments View (Agendamentos):

A table or list view of upcoming client appointments.

Columns for: Client Name, Service Type, Time, and a Status Badge (Confirmed, Pending, Cancelled).

A prominent "New Appointment" primary button.

4. Reviews View (Avaliações):

A list of recent Google Business-style reviews with star ratings (1-5).

A quick "Reply" button next to each review to simulate automated reputation management.

Ensure the UI looks polished, uses proper spacing (padding/margins), and looks great on both desktop and mobile screens.

This project was built with [Lovable](https://lovable.dev).

**Live app**: [https://tutele-protege-br.lovable.app](https://farolprotege.lovable.app)

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/58b05289-74b2-4ec2-bcd5-982458590d15).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
