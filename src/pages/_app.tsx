import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "~/components/ThemeProvider";

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
  const content = <Component {...pageProps} />;

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className={`${poppins.variable} font-sans`}>
        <SessionProvider session={session}>{content}</SessionProvider>
      </div>
    </ThemeProvider>
  );
};

export default api.withTRPC(MyApp);
