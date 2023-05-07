import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import groupReactions from "~/server/helpers/groupReactions";

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
        include: {
          type: true,
        },
      });

      return {
        global: groupReactions(reactions),
        myReaction: reactions.find(
          (reaction) => reaction.userId === ctx.session.user.id
        )?.type.value,
      };
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
        postId: z.string().nonempty(),
        value: z.string().nonempty(),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.reaction.deleteMany({
        where: {
          postId: input.postId,
          userId: ctx.session.user.id,
        },
      })
    ),
});
