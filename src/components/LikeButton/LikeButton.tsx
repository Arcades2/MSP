import { Button } from "~/components/ui/button";
import { PiHeartStraightBold, PiHeartStraightFill } from "react-icons/pi";
import { api } from "~/utils/api";

export type LikeButtonProps = {
  postId: string;
  likes: number;
  liked: boolean;
};

export default function LikeButton({ postId, likes, liked }: LikeButtonProps) {
  const utils = api.useContext();
  const likesQuery = api.like.getPostLikes.useQuery(
    {
      postId,
    },
    {
      initialData: {
        likes,
        liked,
      },
    }
  );
  const likePostMutation = api.like.likePost.useMutation({
    onMutate: async () => {
      await utils.like.getPostLikes.cancel();

      const prevLikes = utils.like.getPostLikes.getData();

      utils.like.getPostLikes.setData(
        {
          postId,
        },
        (prev) => ({
          likes: prev?.liked ? (prev?.likes ?? 0) - 1 : (prev?.likes ?? 0) + 1,
          liked: !prev?.liked,
        })
      );

      return { prevLikes };
    },
    onError(_, __, context) {
      if (context) {
        utils.like.getPostLikes.setData({ postId }, context.prevLikes);
      }
    },
    onSettled: async () => {
      await utils.like.getPostLikes.invalidate({
        postId,
      });
    },
  });

  return (
    <div className="flex items-baseline">
      <Button
        variant="ghost"
        size="icon"
        className="text-lg transition-transform hover:scale-110 hover:bg-transparent "
        onClick={() =>
          likePostMutation.mutate({
            postId,
            like: !likesQuery.data.liked,
          })
        }
      >
        {likesQuery.data.liked ? (
          <PiHeartStraightFill />
        ) : (
          <PiHeartStraightBold />
        )}
      </Button>
      <span className="text-lg">{likesQuery.data.likes}</span>
    </div>
  );
}
