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
      <Avatar user={post.user} />
      <p>{post.createdAt.toLocaleDateString("fr-fr")}</p>
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

export default MusicPost;
