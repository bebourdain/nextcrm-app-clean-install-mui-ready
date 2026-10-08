import "./globals.css";

import { Inter } from "next/font/google";

import { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { getTranslations, getMessages } from "next-intl/server";

import { MuiToastProvider } from "@/components/mui/MuiToastProvider";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { MuiProvider } from "@/app/providers/MuiProvider";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;

  const { locale } = params;

  const t = await getTranslations({ locale, namespace: "RootLayout" });

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
    title: t("title"),
    description: t("description"),
    openGraph: {
      images: [
        {
          url: "/images/opengraph-image.png",
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
    },
    twitter: {
      cardType: "summary_large_image",
      image: "/images/opengraph-image.png",
      width: 1200,
      height: 630,
      alt: t("title"),
    },
  };
}

export default async function RootLayout(props: Props) {
  const params = await props.params;

  const { locale } = params;

  const { children } = props;

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className + " " + inter.variable + " min-h-screen"}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <MuiProvider>{children}<MuiToastProvider /></MuiProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
