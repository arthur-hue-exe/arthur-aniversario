import { AboutSection } from "@/components/site/about";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/site/hero";
import { Marquee } from "@/components/site/marquee";
import { RsvpSection } from "@/components/site/rsvp";
import { getPublicRsvpData } from "@/lib/guest-service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialData = await getPublicRsvpData();

  return (
    <main id="conteudo">
      <Hero />
      <Marquee />
      <AboutSection />
      <RsvpSection initialData={initialData} />
      <Footer />
    </main>
  );
}
