import { createTRPCRouter } from "~/server/api/trpc";
import { postRouter } from "~/server/api/routers/post";
import { reactionRouter } from "~/server/api/routers/reaction";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  reaction: reactionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
