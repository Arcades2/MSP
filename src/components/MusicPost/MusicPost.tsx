import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { type RouterOutputs } from "~/utils/api";
import Avatar from "~/components/Avatar";
import { usePlayersActions, usePlayerState } from "~/stores/players";

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

export default MusicPost;
