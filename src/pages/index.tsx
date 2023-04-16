import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

const Home: NextPage = function HomePage() {
  const session = useSession();

  return (
    <>
      <Head>
        <title>MSP</title>
        <meta name="description" content="MSProject" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            MSP
          </h1>
          <div>
            <Link className="text-white" href="/feed">
              Feed
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={session.data ? () => void signOut() : () => void signIn()}
        >
          {session.data ? "Log out" : "Log in"}
        </button>
      </main>
    </>
  );
};

export default Home;
