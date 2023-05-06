import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import Layout from "~/components/Layout";
import { useRouter } from "next/router";
import { Poppins } from "next/font/google";

import { api } from "~/utils/api";

import "~/styles/globals.css";

const poppins = Poppins({
  weight: "400",
  subsets: ["latin-ext"],
  variable: "--font-poppins",
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
    <div className={`${poppins.variable} font-sans`}>
      <SessionProvider session={session}>{content}</SessionProvider>
    </div>
  );
};

export default api.withTRPC(MyApp);
