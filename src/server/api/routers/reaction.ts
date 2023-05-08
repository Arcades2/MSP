import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import formatReactions from "~/server/helpers/formatReactions";

export const reactionRouter = createTRPCRouter({
  getReactionTypes: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.reactionType.findMany({
      where: {
        enabled: true,
      },
      select: {
        value: true,
      },
    })
  ),
  getPostReactions: protectedProcedure
    .input(z.string().nonempty())
    .query(async ({ ctx, input }) => {
      const reactions = await ctx.prisma.reaction.findMany({
        where: {
          postId: input,
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
          type: {
            select: {
              value: true,
            },
          },
        },
      });

      return formatReactions(reactions, ctx.session.user.id);
    }),
  addReaction: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        value: z.string(),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.reaction.create({
        data: {
          post: {
            connect: {
              id: input.postId,
            },
          },
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          type: {
            connect: {
              value: input.value,
            },
          },
        },
      })
    ),
  removeReaction: protectedProcedure
    .input(
      z.object({
        reactionId: z.string().nonempty(),
        value: z.string().nonempty(),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.reaction.deleteMany({
        where: {
          id: input.reactionId,
          userId: ctx.session.user.id,
        },
      })
    ),
});
