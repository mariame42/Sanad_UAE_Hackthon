import type { Metadata } from "next";
import { Literata, Noto_Naskh_Arabic, Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const reading = Literata({
  variable: "--font-reading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const arabic = Noto_Naskh_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sanad — Early help, without labels",
  description:
    "Early learning support and referral for Student Accessibility Services. Consent-first, no diagnosis, human-owned.",
};

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('sanad-theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    var locale = localStorage.getItem('sanad-locale') || 'en';
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${reading.variable} ${arabic.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-[#F4F6F9] font-[family-name:var(--font-body)] text-[#1B2A4A] dark:bg-[#0C1220] dark:text-[#E8ECF8]">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
