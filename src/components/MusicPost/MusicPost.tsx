import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { type RouterOutputs } from "~/utils/api";
import Avatar from "~/components/Avatar";
import { usePlayersActions, usePlayerState } from "~/stores/players";
import { api } from "~/utils/api";
import classnames from "classnames";
import { useSession } from "next-auth/react";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

type MusicPostProps = {
  post: RouterOutputs["post"]["getFollowingPosts"][number];
};

const MusicPost = ({ post }: MusicPostProps) => {
  const playerState = usePlayerState(post.id);
  const playersActions = usePlayersActions();

  useEffect(() => {
    playersActions.addPlayer(post.id);

    return () => {
      playersActions.removePlayer(post.id);
    };
  }, [playersActions, post.id]);

  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="mb-4 flex items-center gap-2">
        <Avatar user={post.user} />
        <span className="text-gray-400">·</span>
        <LocalDate date={post.createdAt} className="text-sm text-gray-400" />
      </div>
      <p>{post.description}</p>
      <ReactPlayer
        light
        url={post.url}
        controls
        width="100%"
        playing={playerState.playing}
        style={{
          borderRadius: "0.5rem",
          overflow: "hidden",
        }}
        onPlay={() => {
          playersActions.playPlayer(post.id);
        }}
        onPause={() => {
          playersActions.pausePlayer(post.id);
        }}
      />
      <Reactions reactions={post.reactions} postId={post.id} />
    </div>
  );
};

type LocalDateProps = {
  date: Date;
  className?: string;
};

function LocalDate({ date, className }: LocalDateProps) {
  return <div className={className}>{date.toLocaleDateString("fr-fr")}</div>;
}

type ReactionsProps = {
  reactions: RouterOutputs["reaction"]["getPostReactions"];
  postId: string;
};

function Reactions({ reactions, postId }: ReactionsProps) {
  const session = useSession();
  const me = session.data?.user;

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
            <button
              type="button"
              disabled={isDisabled}
              className={classnames(
                "rounded-full p-2",
                myReaction?.type.value === reactionType &&
                  "bg-neutral-400 bg-opacity-10",
                isDisabled
                  ? "opacity-50 grayscale filter"
                  : "hover:bg-neutral-400 hover:bg-opacity-10 active:bg-opacity-20"
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
            </button>
            <span>{reactionsQuery.data.global[reactionType]?.length ?? 0}</span>
          </div>
        );
      })}
    </div>
  );
}

export default MusicPost;
