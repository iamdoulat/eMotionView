import { RecommendationForm } from '@/components/recommendation-form';

export default function RecommendationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold text-foreground sm:text-5xl">
          AI Product Recommendations
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Describe your needs, interests, or a scenario, and let our AI find the perfect products for you from our catalog.
        </p>
      </header>
      <main>
        <RecommendationForm />
      </main>
    </div>
  );
}
