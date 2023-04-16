import { GetServerSidePropsContext, type NextPage } from "next";
import { Button } from "~/components/Button";
import EventCard from "~/components/EventCard";
import Navbar from "~/partials/Navbar";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const meets = api.meets.events.useInfiniteQuery(
    {
      limit: 10,
      registered: true,
    },
    {
      getNextPageParam: (data) => data.cursor,
    }
  );

  const numLoaded = meets.data?.pages.reduce((acc, page) => {
    return acc + page.data.length;
  }, 0);

  return (
    <main className="h-full w-full">
      <Navbar />

      <div className="mx-auto flex max-w-3xl flex-col gap-8 pt-8">
        {!meets.isLoading && numLoaded === 0 && (
          <div className="text-center text-gray-500">No events found</div>
        )}

        {meets.data?.pages.map((page) =>
          page.data.map((event) => <EventCard event={event} key={event.id} />)
        )}

        {meets.isFetching && (
          <div className="text-center text-gray-500">Loading...</div>
        )}

        {meets.data &&
          meets.data.pages[meets.data.pages.length - 1]!.hasMore && (
            <Button
              className="mx-auto text-center"
              onClick={() => {
                meets.fetchNextPage();
              }}
            >
              Load More
            </Button>
          )}
      </div>
    </main>
  );
};

export default Home;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },

      props: {},
    };
  }

  return {
    props: {},
  };
};
