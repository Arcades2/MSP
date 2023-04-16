import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { type Session } from "next-auth";

export const getServerSideHelpers = (session: Session) =>
  createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, session },
    transformer: superjson, // optional - adds superjson serialization
  });
