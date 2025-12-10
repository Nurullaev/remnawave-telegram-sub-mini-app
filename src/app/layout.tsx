import type { PropsWithChildren } from 'react';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { Fira_Mono, Montserrat, Unbounded } from 'next/font/google';

import { Root } from '@/components/Root/Root';
import {mantineHtmlProps} from "@mantine/core";
import { I18nProvider } from '@/core/i18n/provider';

import './_assets/globals.css';

const firaMono = Fira_Mono({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-fira-mono',
  display: 'swap',
});

const montserrat = Montserrat({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const unbounded = Unbounded({
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-unbounded',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Subscription Mini App',
  description: 'Subscription Mini App',
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const locale = await getLocale();

  return (
    <html lang={locale} {...mantineHtmlProps} data-mantine-color-scheme='dark' className={`${firaMono.variable} ${montserrat.variable} ${unbounded.variable}`}>
    <body>
    <I18nProvider>
      <Root>
        {children}
      </Root>
    </I18nProvider>
    </body>
    </html>
  );
}
