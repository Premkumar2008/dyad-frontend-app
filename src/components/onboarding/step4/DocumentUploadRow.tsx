import React, { useRef, useState } from 'react';
import { CheckCircle2, ExternalLink, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { openDueDiligenceDocument } from '../../../services/onboardingDocumentService';
import {
  DD_ACCEPTED_FILE_TYPES,
  DD_MAX_FILE_BYTES,
  type DueDiligenceDocId,
  type DueDiligenceDocMeta,
} from './dueDiligenceConstants';

interface DocumentUploadRowProps {
  docId: DueDiligenceDocId;
  label: string;
  period: string;
  meta: DueDiligenceDocMeta | null;
  onboardingId?: string;
  file?: File;
  onUpload: (docId: DueDiligenceDocId, meta: DueDiligenceDocMeta, file: File) => void;
  onRemove: (docId: DueDiligenceDocId) => void;
}

const isAcceptedFile = (file: File) => {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return ['xlsx', 'csv', 'pdf'].includes(ext);
};

const formatFileSize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const DocumentUploadRow: React.FC<DocumentUploadRowProps> = ({
  docId,
  label,
  period,
  meta,
  onboardingId = '',
  file,
  onUpload,
  onRemove,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isViewing, setIsViewing] = useState(false);

  const handleFile = (selectedFile: File | undefined) => {
    if (!selectedFile) return;
    if (!isAcceptedFile(selectedFile)) {
      toast.error('Accepted formats: XLSX, CSV, PDF');
      return;
    }
    if (selectedFile.size > DD_MAX_FILE_BYTES) {
      toast.error('Max file size is 10MB');
      return;
    }
    onUpload(docId, {
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      uploadedAt: new Date().toISOString(),
      mimeType: selectedFile.type || undefined,
    }, selectedFile);
    toast.success('Document uploaded');
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleView = async () => {
    if (!meta || isViewing) return;

    setIsViewing(true);
    try {
      await openDueDiligenceDocument({
        meta,
        docId,
        onboardingId,
        file,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message);
    } finally {
      setIsViewing(false);
    }
  };

  const fileSizeLabel = meta ? formatFileSize(meta.fileSize) : '';

  return (
    <div className="ob-dd-doc-card">
      <div className="ob-dd-doc-card-head">
        <div className="ob-dd-doc-card-title">{label}</div>
        <div className="ob-dd-doc-card-period">{period}</div>
      </div>

      <div className="ob-dd-doc-card-body">
        {meta ? (
          <div className="ob-dd-doc-uploaded">
            <div className="ob-dd-doc-file-info">
              <span className="ob-dd-doc-status ob-dd-doc-status-done">
                <CheckCircle2 size={14} aria-hidden />
                Uploaded
              </span>
              <button
                type="button"
                className="ob-dd-doc-filename ob-dd-doc-filename-btn"
                title={`View ${meta.fileName}`}
                onClick={handleView}
                disabled={isViewing}
              >
                {meta.fileName}
              </button>
              {fileSizeLabel && (
                <span className="ob-dd-doc-filesize">{fileSizeLabel}</span>
              )}
            </div>
            <div className="ob-dd-doc-actions">
              <button
                type="button"
                className="ob-dd-doc-btn"
                onClick={handleView}
                disabled={isViewing}
              >
                <ExternalLink size={12} aria-hidden />
                {isViewing ? 'Opening…' : 'View'}
              </button>
              <button
                type="button"
                className="ob-dd-doc-btn"
                onClick={() => inputRef.current?.click()}
              >
                Change
              </button>
              <button
                type="button"
                className="ob-dd-doc-btn ob-dd-doc-btn-remove"
                onClick={() => onRemove(docId)}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="ob-dd-doc-upload-btn"
            onClick={() => inputRef.current?.click()}
          >
            <Upload size={14} aria-hidden />
            Upload
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          className="ob-dd-file-input"
          accept={DD_ACCEPTED_FILE_TYPES}
          onChange={e => handleFile(e.target.files?.[0])}
          aria-label={`Upload ${label}`}
        />
      </div>
    </div>
  );
};
