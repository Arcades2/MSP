import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const likeRouter = createTRPCRouter({
  likePost: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        like: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.like) {
        const createdLike = await ctx.prisma.like.create({
          data: {
            user: {
              connect: {
                id: ctx.session.user.id,
              },
            },
            post: {
              connect: {
                id: input.postId,
              },
            },
          },
        });

        return {
          id: createdLike.id,
        };
      }

      await ctx.prisma.like.deleteMany({
        where: {
          postId: input.postId,
          userId: ctx.session.user.id,
        },
      });

      return {
        id: input.postId,
      };
    }),
  getPostLikes: protectedProcedure
    .input(
      z.object({
        postId: z.string().nonempty(),
      })
    )
    .query(async ({ ctx, input }) =>
      ctx.prisma.like.findMany({
        where: {
          postId: input.postId,
        },
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
      })
    ),
});
