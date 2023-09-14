import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { type RouterOutputs } from "~/utils/api";
import { usePlayersActions, usePlayerState } from "~/stores/players";
import { Avatar } from "~/components/ui/avatar";
import LocalDate from "~/components/LocalDate";
import LikeButton from "~/components/LikeButton/LikeButton";
import { Skeleton } from "~/components/ui/skeleton";
import Link from "next/link";

const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
  loading: () => <Skeleton className="h-[360px] w-full" />,
});

type MusicPostProps = {
  post: RouterOutputs["post"]["infiniteFollowedPosts"]["posts"][number];
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
    <Link href={`/posts/${post.id}`} className="flex flex-col gap-4 p-2">
      <div className="mb-4 flex items-center gap-2">
        <Avatar image={post.user.image} name={post.user.name} />
        <span className="text-gray-400">·</span>
        <LocalDate date={post.createdAt} className="text-sm text-gray-400" />
      </div>
      <p>{post.description}</p>
      <div className="h-[360px] w-full">
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
      </div>
      <LikeButton postId={post.id} likes={post.likes} />
    </Link>
  );
};

export default MusicPost;
