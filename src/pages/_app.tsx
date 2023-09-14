import { type AppProps } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "~/components/ThemeProvider";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import React from "react";
import { type NextPage } from "next";

const poppins = Poppins({
  weight: "400",
  subsets: ["latin-ext"],
  variable: "--font-poppins",
});

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

type AppPropsWithLayout = AppProps<{ session: Session | null }> & {
  Component: NextPageWithLayout;
};

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
  const content = <Component {...pageProps} />;

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className={`${poppins.variable} font-sans`}>
        <SessionProvider session={session}>
          {getLayout(content)}
        </SessionProvider>
      </div>
    </ThemeProvider>
  );
};

export default api.withTRPC(MyApp);
