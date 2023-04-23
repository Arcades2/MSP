import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import Layout from "~/components/Layout";
import { useRouter } from "next/router";
import localFont from "next/font/local";

import { api } from "~/utils/api";

import "~/styles/globals.css";

const firaCode = localFont({
  src: "../styles/Fira_code/woff2/FiraCode-Regular.woff2",
  variable: "--font-fira-code",
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const path = useRouter().pathname;

  let content = <Component {...pageProps} />;

  if (path !== "/") {
    content = (
      <Layout>
        <Component {...pageProps} />
      </Layout>
    );
  }

  return (
    <div className={`${firaCode.variable} font-sans`}>
      <SessionProvider session={session}>{content}</SessionProvider>
    </div>
  );
};

export default api.withTRPC(MyApp);
