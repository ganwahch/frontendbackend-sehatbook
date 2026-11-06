import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarInput } from "./StarRating";
import { createReview } from "@/services/reviewService";
import { getApiErrorMessage } from "@/services/api";

interface Props {
  doctorId: string;
  doctorName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewDialog({ doctorId, doctorName, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1) {
      toast.error("Please select a rating");
      return;
    }
    setLoading(true);
    try {
      await createReview({ doctorId, rating, comment });
      toast.success("Thank you for your review!");
      queryClient.invalidateQueries({ queryKey: ["doctor", doctorId] });
      setComment("");
      setRating(5);
      onOpenChange(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate your experience</DialogTitle>
          <DialogDescription>
            Share your feedback about {doctorName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Your rating</Label>
            <StarInput value={rating} onChange={setRating} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              placeholder="How was your visit?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
