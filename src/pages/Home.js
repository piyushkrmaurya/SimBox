import Hero from "components/Hero";
import Simulations from "components/Simulations";

function Home() {
  return (
    <main className="xl:sm:w-8/12 mx-auto">
      <Hero />
      <Simulations />
      <section className="connect py-12">
        {/* ways to connect with you here */}
      </section>
    </main>
  );
}

export default Home;
