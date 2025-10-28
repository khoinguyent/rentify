'use client';

import { Card, CardContent } from '@/components/ui/card';
import { FileText, Upload } from 'lucide-react';

interface DocumentsSectionProps {
  hasDocuments: boolean;
}

export function DocumentsSection({ hasDocuments }: DocumentsSectionProps) {
  return (
    <Card className="rounded-2xl shadow-sm bg-white mb-10">
      <CardContent className="p-8">
        {hasDocuments ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
              <button className="flex items-center gap-2 text-sm text-[#5BA0A4] hover:text-[#4A8D90] font-medium">
                <Upload className="h-4 w-4" />
                Upload
              </button>
            </div>
            <p className="text-gray-600 text-sm">Your documents will appear here</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-[#E9F5F6] rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-[#5BA0A4]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No documents uploaded yet
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Your contracts and receipts will appear here
            </p>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#5BA0A4] text-white rounded-lg hover:bg-[#4A8D90] transition-colors text-sm font-medium">
              <Upload className="h-4 w-4" />
              Upload Documents
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

