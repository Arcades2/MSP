import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createPostInput } from "~/common/validation/post";
import { z } from "zod";
// import formatReactions from "~/server/helpers/formatReactions";

export const postRouter = createTRPCRouter({
  infiniteFollowedPosts: protectedProcedure
    .input(
      z.object({
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor } = input;
      const LIMIT = 5;

      const posts = await ctx.prisma.post.findMany({
        take: LIMIT + 1,
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
        cursor: cursor ? { id: cursor } : undefined,
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

      let nextCursor: typeof cursor;

      if (posts.length > LIMIT) {
        const nextPost = posts.pop();
        nextCursor = nextPost?.id;
      }

      return {
        posts: posts.map((post) => ({
          ...post,
          likes: post.likes.length,
          liked: !!post.likes.find(
            (like) => like.user.id === ctx.session.user.id
          ),
        })),
        nextCursor,
      };
    }),
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
