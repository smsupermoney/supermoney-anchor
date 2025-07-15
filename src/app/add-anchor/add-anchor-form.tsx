
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addAnchors } from "./actions";

export default function AddAnchorForm() {
  const [jsonInput, setJsonInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!jsonInput.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Text area cannot be empty.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addAnchors(jsonInput);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error adding anchors",
          description: result.error,
        });
      } else {
        toast({
          title: "Success!",
          description: result.message,
        });
        setJsonInput(""); // Clear textarea on success
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "An unexpected error occurred.",
        description: "Please check the console for more details.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder='[{"id": "USR001", "externalId": "ANC001", "userName": "Stark Industries", "password": "password", ...}, {...}]'
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        rows={15}
        className="font-mono text-xs"
        disabled={isSubmitting}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Anchors"}
        </Button>
      </div>
    </form>
  );
}
