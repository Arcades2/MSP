import { type GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { z } from "zod";
import MusicPost from "~/components/MusicPost";
import { getServerAuthSession } from "~/server/auth";
import invariant from "tiny-invariant";
import { getServerSideHelpers } from "~/server/helpers/ssHelpers";
import { type NextPageWithLayout } from "~/pages/_app";
import React from "react";
import AppLayout from "~/components/AppLayout/AppLayout";

const querySchema = z.object({
  postId: z.string(),
});

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  invariant(session, "Session should be defined");

  const query = querySchema.parse(ctx.params);

  const ssr = getServerSideHelpers(session);

  await ssr.post.getPost.prefetch({
    postId: query.postId,
  });

  return {
    props: {
      trpcState: ssr.dehydrate(),
    },
  };
};

const PostPage: NextPageWithLayout = () => {
  const router = useRouter();

  const query = querySchema.parse(router.query);
  const utils = api.useContext();

  const postQuery = api.post.getPost.useQuery(
    {
      postId: query.postId,
    },
    {
      initialData: () => {
        utils.post.infiniteFollowedPosts
          .getInfiniteData()
          ?.pages.flatMap((page) => page.posts)
          .find((post) => post.id === query.postId);
      },
      staleTime: 30 * 1000,
      refetchInterval: 30 * 1000,
    }
  );

  if (postQuery.data) {
    return (
      <>
        <MusicPost post={postQuery.data} />
        <div className="my-4 w-full border-t border-neutral-400 border-opacity-25" />
      </>
    );
  }

  return <>test</>;
};

PostPage.getLayout = (page: React.ReactElement) => (
  <AppLayout>{page}</AppLayout>
);

export default PostPage;
