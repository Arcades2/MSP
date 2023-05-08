import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createPostInput } from "~/common/validation/post";
import formatReactions from "~/server/helpers/formatReactions";

export const postRouter = createTRPCRouter({
  getFollowingPosts: protectedProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
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
        reactions: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                image: true,
                name: true,
              },
            },
            type: {
              select: {
                value: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return posts.map((post) => ({
      ...post,
      reactions: formatReactions(post.reactions, ctx.session.user.id),
    }));
  }),
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
