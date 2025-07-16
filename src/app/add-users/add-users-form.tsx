
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addUsersFromJson } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Upload } from "lucide-react";

export default function AddUsersForm() {
  const [jsonInput, setJsonInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!jsonInput.trim()) {
      setError("JSON input cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addUsersFromJson(jsonInput);
      if (result.error) {
        setError(result.error);
      } else {
        toast({
          title: "Success!",
          description: result.message,
        });
        setJsonInput("");
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
      setError(errorMessage);
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
    <form onSubmit={handleSubmit} className="space-y-6">
       <Textarea
        placeholder='Paste your JSON array of user objects here...'
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        rows={20}
        className="font-mono text-xs"
        disabled={isSubmitting}
      />
      {error && (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          <Upload className="mr-2 h-4 w-4" />
          {isSubmitting ? "Uploading..." : "Upload Users"}
        </Button>
      </div>
    </form>
  );
}
