"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { togglePsbxStatus } from "./actions";
import type { Program } from "@/types";
import { Badge } from "@/components/ui/badge";

export default function PsbxTable({ initialPrograms }: { initialPrograms: Program[] }) {
  const [programs, setPrograms] = useState(initialPrograms);
  const { toast } = useToast();

  const handleToggle = async (programId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    // Optimistic update
    setPrograms(prev => prev.map(p => p.id === programId ? { ...p, psbxEnabled: newStatus } : p));

    const result = await togglePsbxStatus(programId, newStatus);
    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
      // Revert on error
      setPrograms(prev => prev.map(p => p.id === programId ? { ...p, psbxEnabled: currentStatus } : p));
    } else {
      toast({
        title: "Success",
        description: `PSBX functionality ${newStatus ? 'enabled' : 'disabled'} for program.`,
      });
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Program ID</TableHead>
            <TableHead>Lender Name</TableHead>
            <TableHead>Lender Type</TableHead>
            <TableHead className="text-right">PSBX Functionality</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {programs.map((program) => (
            <TableRow key={program.id}>
              <TableCell className="font-mono text-xs">{program.programId}</TableCell>
              <TableCell className="font-medium">{program.lenderName}</TableCell>
              <TableCell>
                <Badge variant={program.lenderType === 'Supermoney' ? 'default' : 'secondary'}>
                  {program.lenderType}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                    <span className="text-xs text-muted-foreground">{program.psbxEnabled ? 'On' : 'Off'}</span>
                    <Switch
                        checked={!!program.psbxEnabled}
                        onCheckedChange={() => handleToggle(program.id, !!program.psbxEnabled)}
                    />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
