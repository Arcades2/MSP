import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { type RouterOutputs } from "~/utils/api";
import { cn } from "~/utils/shadcn";
import invariant from "tiny-invariant";

export type ReactionsProps = {
  reactions: RouterOutputs["reaction"]["getPostReactions"];
  postId: string;
};

export default function Reactions({ reactions, postId }: ReactionsProps) {
  const session = useSession();
  const me = session.data?.user;

  invariant(me, "You must be logged in.");

  const reactionTypesQuery = api.reaction.getReactionTypes.useQuery(undefined, {
    select: (data) => data.map((type) => type.value),
    staleTime: Infinity,
  });
  const reactionsQuery = api.reaction.getPostReactions.useQuery(postId, {
    initialData: reactions,
    staleTime: 10 * 1000, // 10 seconds
  });

  const utils = api.useContext();
  const addReactionMutation = api.reaction.addReaction.useMutation({
    onMutate: async (newReaction) => {
      await utils.reaction.getPostReactions.cancel();

      const prevReactions = utils.reaction.getPostReactions.getData();

      utils.reaction.getPostReactions.setData(postId, (prev) => ({
        global: {
          ...prev?.global,
          [newReaction.value]: [
            ...(prev?.global[newReaction.value] ?? []),
            {
              id: "tempId",
              type: newReaction,
              user: {
                id: "tempId",
                name: "tempName",
                image: "tempImage",
              },
            },
          ],
        },
        myReaction: {
          id: "tempId",
          type: newReaction,
          user: {
            id: me?.id ?? "tempId",
            name: me?.name ?? "tempName",
            image: me?.image ?? "tempImage",
          },
        },
      }));

      return {
        prevReactions,
      };
    },
    onError: (_, __, context) => {
      if (context) {
        utils.reaction.getPostReactions.setData(postId, context.prevReactions);
      }
    },
    onSettled: async () => {
      await utils.reaction.getPostReactions.invalidate(postId);
    },
  });

  const removeReactionMutation = api.reaction.removeReaction.useMutation({
    onMutate: async (newReaction) => {
      await utils.reaction.getPostReactions.cancel();

      const prevReactions = utils.reaction.getPostReactions.getData();

      utils.reaction.getPostReactions.setData(postId, (prev) => ({
        global: {
          ...prev?.global,
          [newReaction.value]:
            prev?.global[newReaction.value]?.filter(
              (reaction) => reaction.id !== newReaction.reactionId
            ) ?? [],
        },
        myReaction: undefined,
      }));

      return {
        prevReactions,
      };
    },
    onError: (_, __, context) => {
      if (context) {
        utils.reaction.getPostReactions.setData(postId, context.prevReactions);
      }
    },
    onSettled: async () => {
      await utils.reaction.getPostReactions.invalidate(postId);
    },
  });

  if (
    reactionTypesQuery.status === "loading" ||
    reactionTypesQuery.status === "error"
  )
    return null;

  const { myReaction } = reactionsQuery.data;

  return (
    <div className="flex items-center gap-8">
      {reactionTypesQuery.data.map((reactionType) => {
        const isDisabled =
          !!myReaction && myReaction?.type.value !== reactionType;
        return (
          <div key={reactionType} className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              rounded
              disabled={isDisabled}
              className={cn(
                myReaction?.type.value === reactionType && "bg-primary"
              )}
              onClick={() => {
                if (myReaction) {
                  removeReactionMutation.mutate({
                    reactionId: myReaction.id,
                    value: myReaction.type.value,
                  });
                } else {
                  addReactionMutation.mutate({ postId, value: reactionType });
                }
              }}
            >
              {reactionType}
            </Button>
            <span>{reactionsQuery.data.global[reactionType]?.length ?? 0}</span>
          </div>
        );
      })}
    </div>
  );
}
