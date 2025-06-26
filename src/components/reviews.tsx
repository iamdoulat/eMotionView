"use client";

import type { Review } from '@/lib/placeholder-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

interface ReviewsProps {
  productId: string;
  reviews: Review[];
  averageRating: number;
}

export function Reviews({ reviews, productId }: ReviewsProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would submit this data to your backend
    console.log({
      productId,
      rating,
      title,
      comment,
    });
    // Here you would typically show a success message or toast
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
          <CardDescription>Share your thoughts about this product with other customers.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Your Rating</Label>
              <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                {[...Array(5)].map((_, i) => {
                  const starValue = i + 1;
                  return (
                    <Star
                      key={i}
                      className={`h-6 w-6 cursor-pointer transition-colors ${starValue <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      onMouseEnter={() => setHoverRating(starValue)}
                      onClick={() => setRating(starValue)}
                    />
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-title">Review Title</Label>
              <Input
                id="review-title"
                placeholder="e.g. Best purchase ever!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-comment">Your Comments</Label>
              <Textarea
                id="review-comment"
                placeholder="Tell us more about your experience..."
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
              <Button type="submit">Submit Review</Button>
          </CardFooter>
        </form>
      </Card>
      
      <Separator />

      <h3 className="text-xl font-bold">Customer Reviews ({reviews.length})</h3>

      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">No reviews yet for this product. Be the first to write one!</p>
      ) : (
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
      )}
    </div>
  );
}
