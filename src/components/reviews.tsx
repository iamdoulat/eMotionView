
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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ReviewsProps {
  productId: string;
  reviews: Review[];
  averageRating: number;
}

export function Reviews({ reviews: approvedReviews, productId }: ReviewsProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast({
            variant: "destructive",
            title: "Not Logged In",
            description: "You must be logged in to submit a review."
        });
        return;
    }

    if (rating === 0 || !title || !comment) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please provide a rating, title, and comment."
        });
        return;
    }

    setIsSubmitting(true);
    
    try {
      const newReview = {
        productId,
        userId: user.uid,
        author: user.displayName || 'Anonymous',
        avatar: user.photoURL || `https://placehold.co/100x100.png?text=${user.displayName?.charAt(0) || 'A'}`,
        rating,
        title,
        comment,
        date: new Date().toISOString(),
        status: 'pending'
      };

      await addDoc(collection(db, 'reviews'), newReview);
      
      setRating(0);
      setTitle('');
      setComment('');
      toast({
          title: "Review Submitted",
          description: "Thank you! Your review is pending approval."
      });
    } catch (error) {
        console.error("Error submitting review:", error);
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: "Could not submit your review. Please try again."
        });
    } finally {
        setIsSubmitting(false);
    }
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
                      className={`h-6 w-6 cursor-pointer transition-colors ${starValue <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill={starValue <= (hoverRating || rating) ? 'currentColor' : 'transparent'}
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
              <Button type="submit" disabled={isLoading || isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
          </CardFooter>
        </form>
      </Card>
      
      <Separator />

      <h3 className="text-xl font-bold">Customer Reviews ({approvedReviews.length})</h3>

      {approvedReviews.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">No reviews yet for this product. Be the first to write one!</p>
      ) : (
        <div className="space-y-6">
          {approvedReviews.map(review => (
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
                        className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill={i < review.rating ? 'currentColor' : 'transparent'}
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{review.comment}</p>
                {review.reply && (
                    <div className="mt-4 ml-4 md:ml-8 pl-4 border-l-2 border-primary bg-secondary/50 rounded-r-lg">
                        <div className="flex items-center gap-2 pt-3">
                            <p className="font-semibold text-sm">Reply from {review.reply.author}</p>
                            <p className="text-xs text-muted-foreground">on {new Date(review.reply.date).toLocaleDateString()}</p>
                        </div>
                        <p className="text-muted-foreground pb-3 pt-1">{review.reply.text}</p>
                    </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
