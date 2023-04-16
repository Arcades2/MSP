import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  getFollowingPosts: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.post.findMany({
      where: {
        OR: [
          {
            user: {
              followedBy: {
                some: {
                  id: ctx.session.user.id,
                },
              },
            },
          },
          {
            user: {
              id: ctx.session.user.id,
            },
          },
        ],
      },
    })
  ),
});
