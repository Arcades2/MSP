import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { type RouterOutputs } from "~/utils/api";
import Avatar from "~/components/Avatar";
import { usePlayersActions, usePlayerState } from "~/stores/players";
import { api } from "~/utils/api";

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
  reactions: Record<string, number>;
  postId: string;
};

function Reactions({ reactions, postId }: ReactionsProps) {
  const reactionTypesQuery = api.reaction.getReactionTypes.useQuery(undefined, {
    select: (data) => data.map((type) => type.value),
  });
  const reactionsQuery = api.reaction.getPostReactions.useQuery(postId, {
    initialData: reactions,
    staleTime: 10 * 1000, // 10 seconds
  });

  const utils = api.useContext();
  const reactionMutation = api.reaction.addReaction.useMutation({
    onMutate: async (newReaction) => {
      await utils.reaction.getPostReactions.cancel();

      const prevReactions = utils.reaction.getPostReactions.getData();

      utils.reaction.getPostReactions.setData(postId, (prev = {}) => ({
        ...prev,
        [newReaction.value]: (prev[newReaction.value] ?? 0) + 1,
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
      await utils.reaction.getPostReactions.invalidate();
    },
  });

  if (
    reactionTypesQuery.status === "loading" ||
    reactionTypesQuery.status === "error"
  )
    return null;

  return (
    <div className="flex items-center gap-8">
      {reactionTypesQuery.data.map((reactionType) => (
        <div key={reactionType} className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full p-2 hover:bg-neutral-400 hover:bg-opacity-10 active:bg-opacity-20"
            onClick={() =>
              reactionMutation.mutate({ postId, value: reactionType })
            }
          >
            {reactionType}
          </button>
          <span>{reactionsQuery.data[reactionType] ?? 0}</span>
        </div>
      ))}
    </div>
  );
}

export default MusicPost;
