'use client';

import { useState } from 'react';
import { setImpersonation } from './actions';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, PlusCircle } from 'lucide-react';
import Link from 'next/link';

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
        <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
            <Card className="w-full max-w-lg shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="text-left space-y-1">
                        <CardTitle className="text-xl font-bold">Select an Anchor</CardTitle>
                        <CardDescription>Choose an account to view dashboard.</CardDescription>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/add-dealer">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Dealer
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {anchors.length > 0 ? anchors.map(anchor => (
                            <Button
                                key={anchor.id}
                                variant="outline"
                                onClick={() => handleSelectAnchor(anchor)}
                                className="w-full h-auto p-3 flex items-center justify-start gap-4 transition-colors hover:bg-muted"
                                disabled={!!loadingAnchorId}
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{getInitials(anchor.userName)}</AvatarFallback>
                                </Avatar>
                                <div className="text-left overflow-hidden">
                                    <p className="font-semibold truncate">{anchor.userName}</p>
                                    <p className="text-xs text-muted-foreground truncate">{anchor.emailAddress}</p>
                                </div>
                                {loadingAnchorId === anchor.id && <Loader2 className="ml-auto h-5 w-5 animate-spin" />}
                            </Button>
                        )) : (
                            <p className="text-center text-sm text-muted-foreground py-8">No anchor accounts found.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
