import { type NextPage } from "next";
import Navbar from "~/partials/Navbar";

const Home: NextPage = () => {
  return (
    <main className="h-full w-full">
      <Navbar />
    </main>
  );
};

export default Home;
