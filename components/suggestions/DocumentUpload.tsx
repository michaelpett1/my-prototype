'use client';
import { useState, useRef, useCallback } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { useSuggestionsStore } from '@/lib/store/suggestionsStore';
import { useToastStore } from '@/lib/store/toastStore';
import type { RoadmapSuggestion, Priority } from '@/lib/types';

interface DocumentUploadProps {
  onComplete?: (count: number) => void;
}

export function DocumentUpload({ onComplete }: DocumentUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const validExtensions = ['.txt', '.csv', '.md', '.json', '.pdf', '.docx', '.xlsx'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!validExtensions.includes(ext)) {
      useToastStore.getState().addToast('Unsupported file type. Please upload a text, CSV, JSON, PDF, DOCX, or XLSX file.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      useToastStore.getState().addToast('File too large. Maximum size is 5MB.', 'error');
      return;
    }

    setFileName(file.name);
    setProcessing(true);

    try {
      // Send to server-side Claude CLI for AI-powered extraction
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/parse-document', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok || !data.ok || !Array.isArray(data.items) || data.items.length === 0) {
        const errorMsg = data.error || 'No actionable items found in this document.';
        useToastStore.getState().addToast(errorMsg, res.ok ? 'info' : 'error');
        setProcessing(false);
        setFileName(null);
        return;
      }

      const now = new Date().toISOString();
      const fileExt = file.name.split('.').pop()?.toLowerCase() ?? '';

      const suggestions: RoadmapSuggestion[] = data.items.map((item: {
        title: string; description: string; priority: string;
        type: string; tags: string[]; relevanceScore?: number;
      }) => ({
        id: `sug-doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: item.title,
        description: item.description || '',
        source: {
          type: 'document' as const,
          documentFileName: file.name,
          documentFileType: fileExt,
        },
        suggestedPriority: (['p0', 'p1', 'p2', 'p3'].includes(item.priority) ? item.priority : 'p2') as Priority,
        suggestedType: (['project', 'milestone', 'task'].includes(item.type) ? item.type : 'task') as 'project' | 'milestone' | 'task',
        suggestedGroupId: '',
        relevanceScore: typeof item.relevanceScore === 'number' ? item.relevanceScore : 75,
        duplicateOfId: null,
        duplicateConfidence: 0,
        status: 'pending' as const,
        deferredUntil: null,
        reviewedAt: null,
        scannedAt: now,
        createdAt: now,
        tags: [...(item.tags || []), 'document-upload'],
      }));

      useSuggestionsStore.getState().addSuggestions(suggestions);
      useToastStore.getState().addToast(
        `Found ${suggestions.length} suggestion${suggestions.length > 1 ? 's' : ''} from "${file.name}"`,
        'success'
      );
      onComplete?.(suggestions.length);
    } catch {
      useToastStore.getState().addToast('Failed to process document. Check the dev server is running.', 'error');
    } finally {
      setProcessing(false);
      setFileName(null);
    }
  }, [onComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }, [handleFile]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !processing && fileRef.current?.click()}
      style={{
        border: `2px dashed ${dragging ? '#2563EB' : 'var(--border-strong)'}`,
        borderRadius: 10,
        padding: processing ? '16px 20px' : '20px 24px',
        textAlign: 'center',
        cursor: processing ? 'default' : 'pointer',
        background: dragging ? 'var(--info-bg)' : 'var(--bg-secondary)',
        transition: 'all 200ms',
      }}
    >
      <input
        ref={fileRef}
        type="file"
        accept=".txt,.csv,.md,.json,.pdf,.docx,.xlsx"
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      {processing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Loader2 size={18} className="animate-spin" style={{ color: '#2563EB' }} />
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Scanning &ldquo;{fileName}&rdquo; with Claude...
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
              Claude is reading your document and extracting actionable items
            </p>
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: dragging ? '#DBEAFE' : 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
              transition: 'background 200ms',
            }}
          >
            <Upload size={18} style={{ color: dragging ? '#2563EB' : 'var(--text-muted)' }} />
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 4px' }}>
            Drop a document to extract suggestions
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
            Powered by Claude &middot; Supports TXT, CSV, JSON, PDF, DOCX, XLSX &mdash; max 5MB
          </p>
        </>
      )}
    </div>
  );
}
