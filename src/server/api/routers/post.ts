import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createPostInput } from "~/common/validation/post";
import groupReactions from "~/server/helpers/groupReactions";

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
            userId: true,
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
      reactions: {
        global: groupReactions(post.reactions),
        myReaction: post.reactions.find(
          (reaction) => reaction.userId === ctx.session.user.id
        )?.type.value,
      },
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
