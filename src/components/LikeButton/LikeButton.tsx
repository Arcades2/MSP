import { Button } from "~/components/ui/button";
import { PiHeartStraightBold, PiHeartStraightFill } from "react-icons/pi";
import { api, type RouterOutputs } from "~/utils/api";
import { useSession } from "next-auth/react";

export type LikeButtonProps = {
  postId: string;
  likes: Array<{
    id: string;
    user: {
      id: string;
      image?: string | null;
      name: string;
    };
  }>;
};

export default function LikeButton({ postId, likes }: LikeButtonProps) {
  const session = useSession();
  const me = session.data?.user;

  const utils = api.useContext();
  const liked = !!likes.find((like) => like.user.id === me?.id);

  const likePostMutation = api.like.likePost.useMutation({
    onMutate: async (variable) => {
      await utils.post.infiniteFollowedPosts.cancel();

      const prevPosts = utils.post.infiniteFollowedPosts.getInfiniteData({});

      utils.post.infiniteFollowedPosts.setInfiniteData({}, (prev) => {
        if (!prev)
          return {
            pages: [],
            pageParams: [],
          };

        return {
          ...prev,
          pages: prev.pages.map((page) => ({
            ...page,
            posts: page.posts.map((post) => {
              if (post.id === variable.postId) {
                return {
                  ...post,
                  likes: variable.like
                    ? [
                        ...post.likes,
                        {
                          id: "tempId",
                          user: {
                            id: me?.id ?? "",
                            image: me?.image ?? null,
                            name: me?.name ?? "",
                          },
                        },
                      ]
                    : post.likes.filter((like) => like.user.id !== me?.id),
                };
              }
              return post;
            }),
          })),
        };
      });

      const prevPost = utils.post.getPost.getData({ postId: variable.postId });

      utils.post.getPost.setData({ postId: variable.postId }, (prev) => {
        if (!prev) {
          return undefined;
        }

        return {
          ...prev,
          likes: variable.like
            ? [
                ...prev.likes,
                {
                  id: "tempId",
                  user: {
                    id: me?.id ?? "",
                    image: me?.image ?? null,
                    name: me?.name ?? "",
                  },
                },
              ]
            : prev.likes.filter((like) => like.user.id !== me?.id),
        };
      });

      return {
        prevPosts,
        prevPost,
      };
    },
    onError: (_, variables, context) => {
      if (context) {
        utils.post.infiniteFollowedPosts.setInfiniteData({}, context.prevPosts);
        utils.post.getPost.setData(
          { postId: variables.postId },
          context.prevPost
        );
      }
    },
    onSettled: async (_, __, variables) => {
      void utils.post.getPost.invalidate();
      await utils.post.infiniteFollowedPosts.refetch(
        {},
        {
          refetchPage(page) {
            const pageData =
              page as RouterOutputs["post"]["infiniteFollowedPosts"];

            return !!pageData.posts.find(
              (post) => post.id === variables.postId
            );
          },
        }
      );
    },
  });

  return (
    <div className="flex items-baseline">
      <Button
        variant="ghost"
        size="icon"
        className="text-lg transition-transform hover:scale-110 hover:bg-transparent "
        onClick={(e) => {
          e.stopPropagation();
          return likePostMutation.mutate({
            postId,
            like: !liked,
          });
        }}
      >
        {liked ? <PiHeartStraightFill /> : <PiHeartStraightBold />}
      </Button>
      <span className="text-lg">{likes.length}</span>
    </div>
  );
}
