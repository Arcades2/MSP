import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createPostInput } from "~/common/validation/post";
// import formatReactions from "~/server/helpers/formatReactions";

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
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        likes: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                image: true,
                name: true,
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
      likes: post.likes.length,
      liked: !!post.likes.find((like) => like.user.id === ctx.session.user.id),
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
