
"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const CopyButton = ({ text }: { text: string }) => {
    const { toast } = useToast();
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: "Sample JSON copied to clipboard.",
        });
    };
    return <Button onClick={handleCopy} size="sm">Copy Sample JSON</Button>;
}

export default CopyButton;
