import { type NextPageWithLayout } from "~/pages/_app";
import { useRouter } from "next/router";
import { z } from "zod";
import React from "react";
import AppLayout from "~/components/AppLayout";
import { api } from "~/utils/api";
import MusicPost from "~/components/MusicPost";
import { Button } from "~/components/ui/button";
import { useInView } from "react-intersection-observer";
import { type GetServerSideProps } from "next";
import { getServerAuthSession } from "~/server/auth";
import invariant from "tiny-invariant";
import { getServerSideHelpers } from "~/server/helpers/ssHelpers";

const paramsSchema = z.object({
  userId: z.string(),
});

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  invariant(session, "Session should be defined");

  const ssr = getServerSideHelpers(session);
  const params = paramsSchema.parse(ctx.params);

  await ssr.post.getUserPosts.prefetchInfinite({ userId: params.userId });

  return {
    props: {
      trpcState: ssr.dehydrate(),
    },
  };
};

const ProfilePage: NextPageWithLayout = () => {
  const router = useRouter();

  const query = paramsSchema.parse(router.query);
  const userPosts = api.post.getUserPosts.useInfiniteQuery(
    {
      userId: query.userId,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 30 * 1000,
      refetchInterval: 30 * 1000,
    }
  );

  const { ref, inView } = useInView();
  const { fetchNextPage } = userPosts;

  React.useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  if (userPosts.status === "error") {
    return <div>{userPosts.error.message}</div>;
  }

  return (
    <div>
      <div>
        {userPosts.data?.pages
          .flatMap((page) => page.posts)
          .map((post) => (
            <div
              key={post.id}
              className="border-y border-neutral-400 border-opacity-25"
            >
              <MusicPost post={post} />
            </div>
          ))}
        <div className="my-8 text-center">
          <Button
            ref={ref}
            onClick={() => userPosts.fetchNextPage()}
            disabled={!userPosts.hasNextPage || userPosts.isFetchingNextPage}
          >
            {(() => {
              if (userPosts.isFetchingNextPage) return "Loading more...";
              if (userPosts.hasNextPage) return "Load older";
              return "Nothing more to load";
            })()}
          </Button>
        </div>
      </div>
    </div>
  );
};

ProfilePage.getLayout = (page: React.ReactElement) => (
  <AppLayout>{page}</AppLayout>
);

export default ProfilePage;
