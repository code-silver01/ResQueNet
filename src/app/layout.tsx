import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RESQNET — Supervised Browser-Agent Disaster Rescue Coordination",
  description:
    "Supervised AI browser agent for disaster rescue coordination. Visibly navigates official portals, compares resources deterministically, and prepares requests requiring explicit human approval.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('resqnet-theme');
                if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F8F9FA] dark:bg-[#121316] text-[#202124] dark:text-[#E8EAED] transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
