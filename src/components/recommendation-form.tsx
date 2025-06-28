
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getProductRecommendations, GetProductRecommendationsOutput } from '@/ai/flows/product-recommendations';
import type { Product } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ProductCard } from './product-card';

const formSchema = z.object({
  userProfile: z.string().min(20, {
    message: "Please describe your needs in at least 20 characters.",
  }),
});

export function RecommendationForm({ allProducts }: { allProducts: Product[] }) {
  const [recommendation, setRecommendation] = useState<GetProductRecommendationsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productCatalogString = allProducts.map(p => `- ${p.name}: ${p.description}`).join('\n');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userProfile: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRecommendation(null);
    setError(null);

    try {
      const result = await getProductRecommendations({
        userProfile: values.userProfile,
        productCatalog: productCatalogString,
      });
      setRecommendation(result);
    } catch (e) {
      setError("Sorry, we couldn't generate recommendations at this time. Please try again later.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  const recommendedProducts = allProducts.filter(p => recommendation?.recommendedProducts.includes(p.name));

  return (
    <div>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Tell us what you're looking for</CardTitle>
          <CardDescription>
            For example: "I'm a college student who needs a new laptop for classes and some light gaming. My budget is around $1200."
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="userProfile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Your Profile and Needs</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your profile, needs, and preferences here..."
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Recommendations
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {error && (
         <Alert variant="destructive" className="mt-8 max-w-4xl mx-auto">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      {recommendation && (
        <div className="mt-12">
            <h2 className="font-headline text-3xl font-bold text-center mb-8">Your Personalized Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {recommendedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            
            <Card className="max-w-4xl mx-auto bg-card">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <Lightbulb className="h-6 w-6 text-yellow-400" />
                        AI Reasoning
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{recommendation.reasoning}</p>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
