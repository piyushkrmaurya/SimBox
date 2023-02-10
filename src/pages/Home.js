import Hero from "components/Hero";
import Features from "components/Features";
import Simulations from "components/Simulations";

function Home() {
  return (
    <main className="xl:sm:w-8/12 mx-auto">
      <Hero />
      <Features />
      <section className="testimonials py-12">
        {/* testimonials here */}
      </section>
      <Simulations />
      <section className="cta py-12">{/* call to action here */}</section>
      <section className="connect py-12">
        {/* ways to connect with you here */}
      </section>
    </main>
  );
}

export default Home;
