import type { Review } from '@/lib/placeholder-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ReviewsProps {
  productId: string;
  reviews: Review[];
  averageRating: number;
}

export function Reviews({ productId, reviews, averageRating }: ReviewsProps) {
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length;
    return { star, count, percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0 };
  });

  return (
    <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
      <div className="md:col-span-1">
        <h2 className="font-headline text-2xl font-bold mb-4">Customer Reviews</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-6 w-6 ${i < Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <p className="font-bold text-lg">{averageRating.toFixed(1)} out of 5</p>
        </div>
        <p className="text-muted-foreground text-sm mt-1">Based on {reviews.length} reviews</p>
        
        <div className="space-y-2 mt-6">
          {ratingDistribution.map(({ star, percentage, count }) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-sm w-12">{star} star</span>
              <Progress value={percentage} className="w-full h-2" />
              <span className="text-sm w-6 text-right">{count}</span>
            </div>
          ))}
        </div>

        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="font-headline text-lg">Leave a Review</CardTitle>
                <CardDescription>Share your thoughts with other customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="review-title">Review Title</Label>
                    <Input id="review-title" placeholder="e.g. Best purchase ever!"/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="review-comment">Your Review</Label>
                    <Textarea id="review-comment" placeholder="Tell us more about your experience..."/>
                </div>
                <Button className="w-full">Submit Review</Button>
            </CardContent>
        </Card>

      </div>
      <div className="md:col-span-2 space-y-6">
        {reviews.map(review => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={review.avatar} alt={review.author} data-ai-hint="person face" />
                  <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{review.title}</CardTitle>
                  <CardDescription>{review.author} on {new Date(review.date).toLocaleDateString()}</CardDescription>
                </div>
                <div className="flex items-center ml-auto">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{review.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
