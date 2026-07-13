import HeroSection from "@/components/home/HeroSection";
import QuickCategories from "@/components/home/QuickCategories";
import WeatherBar from "@/components/home/WeatherBar";
import FeaturedDestinations from "@/components/home/FeaturedDestinations";
import WhyNepalWander from "@/components/home/WhyNepalWander";
import TravelerReviews from "@/components/home/TravelerReviews";
import PlanMyTripCTA from "@/components/home/PlanMyTripCTA";
import FeaturedPackages from "@/components/home/FeaturedPackages";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <QuickCategories />
      <WeatherBar />
      <FeaturedDestinations />
      <FeaturedPackages />
      <WhyNepalWander />
      <TravelerReviews />
      <PlanMyTripCTA />
    </main>
  );
}