import dynamic from "next/dynamic";
import { type RouterOutputs } from "~/utils/api";
import Avatar from "~/components/Avatar";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

type MusicPostProps = {
  post: RouterOutputs["post"]["getFollowingPosts"][number];
};

const MusicPost = ({ post }: MusicPostProps) => (
  <div className="flex flex-col gap-4 p-2">
    <Avatar user={post.user} />
    <p>{post.description}</p>
    <ReactPlayer
      url={post.url}
      controls
      width="100%"
      style={{
        borderRadius: "0.5rem",
        overflow: "hidden",
      }}
    />
  </div>
);

export default MusicPost;
