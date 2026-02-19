
'use client';

import { useState } from 'react';
import { setImpersonation } from './actions';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

function getInitials(name: string) {
    if (!name) return '';
    const words = name.split(' ');
    if (words.length > 1) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

export default function SelectAnchorClient({ anchors }: { anchors: User[] }) {
    const [loadingAnchorId, setLoadingAnchorId] = useState<string | null>(null);
    
    const handleSelectAnchor = async (anchor: User) => {
        setLoadingAnchorId(anchor.id);
        await setImpersonation({ 
            externalId: anchor.externalId, 
            leadExternalId: anchor.leadExternalId,
            userName: anchor.userName,
            logoImage: anchor.logoImage,
            region: anchor.region,
        });
    };
    
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <CardTitle>Select an Anchor</CardTitle>
                    <CardDescription>Choose an anchor account to view their dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {anchors.length > 0 ? anchors.map(anchor => (
                            <Button
                                key={anchor.id}
                                variant="outline"
                                onClick={() => handleSelectAnchor(anchor)}
                                className="w-full h-auto p-3 flex items-center justify-start gap-4 transition-colors"
                                disabled={!!loadingAnchorId}
                            >
                                <Avatar>
                                    <AvatarFallback>{getInitials(anchor.userName)}</AvatarFallback>
                                </Avatar>
                                <div className="text-left">
                                    <p className="font-semibold">{anchor.userName}</p>
                                    <p className="text-sm text-muted-foreground">{anchor.emailAddress}</p>
                                </div>
                                {loadingAnchorId === anchor.id && <Loader2 className="ml-auto h-5 w-5 animate-spin" />}
                            </Button>
                        )) : (
                            <p className="text-center text-sm text-muted-foreground py-4">No anchor accounts found.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
