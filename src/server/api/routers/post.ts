import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createPostInput } from "~/common/validation/post";

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
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  ),
  createPost: protectedProcedure
    .input(createPostInput)
    .mutation(({ ctx, input }) =>
      ctx.prisma.post.create({
        data: {
          ...input,
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      })
    ),
});
