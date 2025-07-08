
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, FileUp, Trash2, AlertCircle } from "lucide-react";
import type { OnboardingPartner, OnboardingStatus } from "@/types";
import { Textarea } from "@/components/ui/textarea";

const mandatoryDocs = [
  { id: 'pan', name: 'PAN Card' },
  { id: 'gst', name: 'GST Certificate' },
  { id: 'address', name: 'Business Address Proof' },
  { id: 'cheque', name: 'Cancelled Cheque' },
];

type DocumentManagerProps = {
  partner: OnboardingPartner;
  onUpdateStatus: (status: OnboardingStatus) => void;
  isValidator?: boolean;
};

export default function DocumentManager({ partner, onUpdateStatus, isValidator = false }: DocumentManagerProps) {
  // Simulate uploaded documents state. This would come from the partner object in a real app.
  const [uploaded, setUploaded] = useState({
      pan: partner.status !== 'Pending Document Collection',
      gst: partner.status !== 'Pending Document Collection' && partner.status !== 'Awaiting Resubmission',
      address: false,
      cheque: false
  });

  const allDocsUploaded = Object.values(uploaded).every(Boolean);

  const handleUpload = (docId: keyof typeof uploaded) => {
    setUploaded(prev => ({...prev, [docId]: true}));
  }

  const handleDelete = (docId: keyof typeof uploaded) => {
    setUploaded(prev => ({...prev, [docId]: false}));
  }

  if (isValidator) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>Document Validation</CardTitle>
                  <CardDescription>Review the submitted documents for clarity and correctness.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  {mandatoryDocs.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span className="font-medium">{doc.name}</span>
                          </div>
                          <Button variant="outline" size="sm">View Document</Button>
                      </div>
                  ))}
                  <Textarea placeholder="Enter rejection reasons here if returning for correction..." />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onUpdateStatus('Awaiting Resubmission')}>Return for Correction</Button>
                    <Button onClick={() => onUpdateStatus('Pending HQ Business Review')}>Approve Documents</Button>
                  </div>
              </CardContent>
          </Card>
      )
  }
  
  return (
    <div className="space-y-6">
        <Card>
            <CardContent className="p-4">
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-secondary transition-colors">
                    <FileUp className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 font-semibold">Click to upload or drag &amp; drop</p>
                    <p className="text-xs text-muted-foreground">PDF, JPG, PNG (up to 10MB)</p>
                </div>
            </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Mandatory Document Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {mandatoryDocs.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                {uploaded[doc.id as keyof typeof uploaded] ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                                <span>{doc.name}</span>
                            </div>
                            {uploaded[doc.id as keyof typeof uploaded] ? (
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(doc.id as keyof typeof uploaded)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button variant="outline" size="sm" className="h-6" onClick={() => handleUpload(doc.id as keyof typeof uploaded)}>Upload</Button>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            {partner.status === 'Awaiting Resubmission' && (
                <Card className="border-orange-500 bg-orange-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-600"><AlertCircle /> Issues Identified</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-sm space-y-2 list-disc pl-5 text-muted-foreground">
                            <li>PAN Card: Image is blurry and unreadable.</li>
                            <li>Business Address Proof: Document provided is expired.</li>
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>

        <div className="flex justify-end">
            <Button size="lg" disabled={!allDocsUploaded} onClick={() => onUpdateStatus('Pending RM Document Validation')}>Submit for Validation</Button>
        </div>
    </div>
  );
}
