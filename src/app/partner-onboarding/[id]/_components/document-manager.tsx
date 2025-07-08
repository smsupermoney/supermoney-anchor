
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Trash2, AlertCircle, UploadCloud, Eye, CircleDashed } from "lucide-react";
import type { OnboardingPartner, OnboardingStatus } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

const mandatoryDocs = [
  { id: 'pan', name: 'PAN Card', rejectionReason: 'Image is blurry and unreadable.' },
  { id: 'gst', name: 'GST Certificate', rejectionReason: null },
  { id: 'address', name: 'Business Address Proof', rejectionReason: 'Document provided is expired.' },
  { id: 'cheque', name: 'Cancelled Cheque', rejectionReason: null },
];

type DocStatus = 'missing' | 'uploaded' | 'rejected';
type DocState = Record<string, { status: DocStatus }>;

type DocumentManagerProps = {
  partner: OnboardingPartner;
  onUpdateStatus: (status: OnboardingStatus) => void;
  isValidator?: boolean;
};

export default function DocumentManager({ partner, onUpdateStatus, isValidator = false }: DocumentManagerProps) {

  const getInitialStatus = (docId: string): DocStatus => {
    if (partner.status === 'Pending Document Collection') return 'missing';

    if (partner.status === 'Awaiting Resubmission') {
      // Simulate that PAN and Address proof were rejected
      if (docId === 'pan' || docId === 'address') return 'rejected';
      return 'uploaded';
    }

    // For other statuses, assume all documents are uploaded
    return 'uploaded';
  };

  const [documents, setDocuments] = useState<DocState>(() => {
    const initialState: DocState = {};
    for (const doc of mandatoryDocs) {
      initialState[doc.id] = { status: getInitialStatus(doc.id) };
    }
    return initialState;
  });

  const uploadedCount = Object.values(documents).filter(d => d.status === 'uploaded').length;
  const totalDocs = mandatoryDocs.length;
  const allDocsUploaded = uploadedCount === totalDocs;

  const handleUpload = (docId: string) => {
    setDocuments(prev => ({...prev, [docId]: { status: 'uploaded' }}));
  };

  const handleDelete = (docId: string) => {
    setDocuments(prev => ({...prev, [docId]: { status: 'missing' }}));
  };

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
    <Card>
        <CardHeader>
            <CardTitle>Document Collection</CardTitle>
            <CardDescription>
                {partner.status === 'Awaiting Resubmission' 
                    ? 'Some documents require re-submission. Please upload the corrected files.'
                    : 'Upload all mandatory documents to proceed with the validation.'
                }
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <div className="flex justify-between items-center mb-2 text-sm text-muted-foreground">
                    <span>Progress</span>
                    <span>{uploadedCount} / {totalDocs} files uploaded</span>
                </div>
                <Progress value={(uploadedCount / totalDocs) * 100} className="h-2" />
            </div>
            
            <div className="space-y-3">
                {mandatoryDocs.map(doc => {
                    const docState = documents[doc.id];
                    const status = docState.status;

                    return (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg transition-colors data-[status=rejected]:border-orange-500/50 data-[status=rejected]:bg-orange-50/20" data-status={status}>
                            <div className="flex items-start gap-4">
                                {status === 'uploaded' && <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />}
                                {status === 'missing' && <CircleDashed className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />}
                                {status === 'rejected' && <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />}
                                <div>
                                    <p className="font-medium">{doc.name}</p>
                                    {status === 'rejected' && doc.rejectionReason && (
                                        <p className="text-xs text-orange-600 mt-1">{doc.rejectionReason}</p>
                                    )}
                                     {status === 'uploaded' && (
                                        <p className="text-xs text-muted-foreground mt-1">Uploaded: {new Date().toLocaleDateString()}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {status === 'missing' && (
                                    <Button size="sm" onClick={() => handleUpload(doc.id)}>
                                        <UploadCloud className="mr-2 h-4 w-4" /> Upload
                                    </Button>
                                )}
                                {status === 'rejected' && (
                                     <Button size="sm" variant="outline" className="border-orange-300 hover:bg-orange-100/50" onClick={() => handleUpload(doc.id)}>
                                        <UploadCloud className="mr-2 h-4 w-4" /> Re-upload
                                    </Button>
                                )}
                                {status === 'uploaded' && (
                                    <>
                                        <Button size="sm" variant="ghost">
                                            <Eye className="mr-2 h-4 w-4" /> View
                                        </Button>
                                         <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(doc.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
             <Button size="lg" disabled={!allDocsUploaded} onClick={() => onUpdateStatus('Pending RM Document Validation')}>Submit for Validation</Button>
        </CardFooter>
    </Card>
  );
}
