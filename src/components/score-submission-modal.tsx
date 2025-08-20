"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trophy, Upload, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { api } from "@/lib/api";

interface ScoreSubmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScoreSubmitted?: () => void;
  canSubmit?: boolean;
}

const challengeTypes = [
  { value: "algorithm", label: "Algorithm Challenge" },
  { value: "data-structure", label: "Data Structure" },
  { value: "system-design", label: "System Design" },
  { value: "coding-contest", label: "Coding Contest" },
  { value: "hackathon", label: "Hackathon" },
  { value: "bug-fix", label: "Bug Fix Challenge" },
  { value: "optimization", label: "Code Optimization" },
  { value: "other", label: "Other" },
];

export function ScoreSubmissionModal({ open, onOpenChange, onScoreSubmitted, canSubmit = true }: ScoreSubmissionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    score: "",
    challengeType: "",
    description: "",
    proofUrl: "",
  });

  const { idToken } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idToken || !formData.score) return;

    setIsSubmitting(true);
    setError("");
    
    try {
      const scoreValue = parseInt(formData.score);
      if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 1000000) {
        throw new Error("Score must be a number between 0 and 1,000,000");
      }

      const result = await api.submitScore(scoreValue, idToken);
      
      // Show success message
      setSuccess(true);
      
      // Call callback to refresh data
      if (onScoreSubmitted) {
        onScoreSubmitted();
      }

      // Close modal after short delay
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
        // Reset form
        setFormData({
          score: "",
          challengeType: "",
          description: "",
          proofUrl: "",
        });
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to submit score");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleInputChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Submit Your Score
          </DialogTitle>
          <DialogDescription>
            Share your latest achievement and climb the leaderboard! Make sure to provide proof of your score.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
              Score Submitted Successfully!
            </h3>
            <p className="text-muted-foreground">
              Your score of {formData.score} points has been recorded.
            </p>
          </div>
        ) : (
          <>
            {!canSubmit && (
              <div className="mb-4 p-3 rounded-md bg-muted border border-border">
                <p className="text-sm text-muted-foreground">
                  You have already submitted a score. Each player can only submit once.
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Score Input */}
              <div className="space-y-2">
                <Label htmlFor="score">Score *</Label>
                <Input
                  id="score"
                  type="number"
                  placeholder="e.g., 1250"
                  value={formData.score}
                  onChange={(e) => handleInputChange("score", e.target.value)}
                  required
                  min="0"
                  max="1000000"
                  disabled={!canSubmit}
                />
              </div>

          {/* Challenge Type */}
          <div className="space-y-2">
            <Label htmlFor="challengeType">Challenge Type *</Label>
            <Select
              value={formData.challengeType}
              onValueChange={(value) => handleInputChange("challengeType", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select challenge type" />
              </SelectTrigger>
              <SelectContent>
                {challengeTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Briefly describe your achievement (optional)"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {formData.description.length}/500
            </div>
          </div>

          {/* Proof URL */}
          <div className="space-y-2">
            <Label htmlFor="proofUrl">Proof URL</Label>
            <Input
              id="proofUrl"
              type="url"
              placeholder="e.g., GitHub link, screenshot, platform URL"
              value={formData.proofUrl}
              onChange={(e) => handleInputChange("proofUrl", e.target.value)}
            />
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>
                Providing proof helps maintain leaderboard integrity. This can be a link to your solution, 
                screenshot, or platform profile.
              </span>
            </div>
          </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting || !canSubmit}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.score || !canSubmit}
                  className="flex-1 gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Submit Score
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}