import type { Review } from '@/lib/placeholder-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

interface ReviewsProps {
  productId: string;
  reviews: Review[];
  averageRating: number;
}

export function Reviews({ reviews }: ReviewsProps) {
  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">No reviews yet for this product.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map(review => (
        <Card key={review.id}>
          <CardHeader>
            <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={review.avatar} alt={review.author} data-ai-hint="person face" />
                  <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{review.title}</CardTitle>
                  <CardDescription>{review.author} on {new Date(review.date).toLocaleDateString()}</CardDescription>
                </div>
              </div>
              <div className="flex items-center sm:ml-auto">
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
  );
}
