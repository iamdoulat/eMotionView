
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { products, reviews as initialReviews, type Review } from "@/lib/placeholder-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, MessageSquare, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

type FilterStatus = "all" | Review['status'];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [reviewToReply, setReviewToReply] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const { toast } = useToast();

  const filteredReviews = useMemo(() => {
    return reviews
      .filter(review => filter === 'all' || review.status === filter)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [reviews, filter]);

  const handleStatusChange = (reviewId: string, newStatus: boolean) => {
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, status: newStatus ? 'approved' : 'pending' } : r));
    toast({
      title: "Status Updated",
      description: `Review status has been changed.`,
    });
  };

  const handleDeleteReview = () => {
    if (!reviewToDelete) return;
    setReviews(reviews.filter(r => r.id !== reviewToDelete.id));
    setReviewToDelete(null);
     toast({
      title: "Review Deleted",
      description: "The review has been permanently deleted.",
      variant: "destructive"
    });
  };
  
  const handleOpenReplyDialog = (review: Review) => {
    setReviewToReply(review);
    setReplyText(review.reply?.text || "");
  };
  
  const handleSaveReply = () => {
    if (!reviewToReply) return;
    setReviews(reviews.map(r => r.id === reviewToReply.id ? { 
        ...r, 
        reply: { text: replyText, date: new Date().toISOString(), author: 'Admin' } 
    } : r));
    setReviewToReply(null);
    setReplyText("");
    toast({
      title: "Reply Saved",
      description: "Your reply has been saved successfully.",
    });
  };

  const getStatusIcon = (status: Review['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Product Reviews</CardTitle>
          <CardDescription>Manage and moderate customer reviews.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterStatus)}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({reviews.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({reviews.filter(r=>r.status === 'pending').length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({reviews.filter(r=>r.status === 'approved').length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({reviews.filter(r=>r.status === 'rejected').length})</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            {filteredReviews.length > 0 ? filteredReviews.map(review => {
              const product = products.find(p => p.id === review.productId);
              return (
                <Card key={review.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.avatar} alt={review.author} data-ai-hint="person face" />
                      <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{review.author}</p>
                          <p className="text-sm text-muted-foreground">{new Date(review.date).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={review.status === 'approved'} 
                            onCheckedChange={(checked) => handleStatusChange(review.id, checked)}
                            aria-label="Approve review"
                          />
                           <Button variant="ghost" size="icon" onClick={() => handleOpenReplyDialog(review)}>
                                <MessageSquare className="h-4 w-4" />
                            </Button>
                           <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setReviewToDelete(review)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 my-2">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />)}
                      </div>
                      
                      <p className="font-medium">{review.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>

                      <div className="text-sm mt-3">
                        <span className="text-muted-foreground">Product: </span>
                        <Link href={`/products/${product?.id}`} className="font-medium text-primary hover:underline">{product?.name}</Link>
                      </div>

                      {review.reply && (
                        <div className="mt-4 ml-8 pl-4 border-l-2 border-primary bg-secondary/50 rounded-r-lg">
                            <div className="flex items-center gap-2 pt-3">
                                <p className="font-semibold text-sm">Reply from {review.reply.author}</p>
                                <p className="text-xs text-muted-foreground">on {new Date(review.reply.date).toLocaleDateString()}</p>
                            </div>
                            <p className="text-muted-foreground pb-3 pt-1">{review.reply.text}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            }) : (
              <div className="text-center py-12 text-muted-foreground">No reviews found for this filter.</div>
            )}
          </div>
        </CardContent>
         <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>{filteredReviews.length}</strong> of <strong>{reviews.length}</strong> reviews.
          </div>
        </CardFooter>
      </Card>

      <Dialog open={!!reviewToReply} onOpenChange={(open) => !open && setReviewToReply(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Reply to Review</DialogTitle>
                <DialogDescription>
                    Replying to {reviewToReply?.author}'s review of "{products.find(p=>p.id === reviewToReply?.productId)?.name}".
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <blockquote className="border-l-4 pl-4 italic text-sm text-muted-foreground bg-secondary/50 p-2 rounded-r-md">
                    "{reviewToReply?.comment}"
                </blockquote>
                <div className="space-y-2">
                    <Label htmlFor="reply-text">Your Reply</Label>
                    <Textarea 
                        id="reply-text" 
                        rows={5} 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your response here..."
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setReviewToReply(null)}>Cancel</Button>
                <Button onClick={handleSaveReply}>Save Reply</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!reviewToDelete} onOpenChange={(open) => !open && setReviewToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the review from {reviewToDelete?.author}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReview} className="bg-destructive hover:bg-destructive/90">Delete Review</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
