
"use client";

import * as xlsx from 'xlsx';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

type DownloadSampleExcelProps = {
    data: any[];
    fileName: string;
};

export default function DownloadSampleExcel({ data, fileName }: DownloadSampleExcelProps) {
  
  const handleDownload = () => {
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    xlsx.writeFile(workbook, fileName);
  };

  return (
    <Button variant="link" size="sm" onClick={handleDownload} className="text-primary h-auto p-0">
        <Download className="mr-2 h-3 w-3"/>
        Download Sample
    </Button>
  );
}
