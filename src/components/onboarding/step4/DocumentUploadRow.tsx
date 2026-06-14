import React, { useRef } from 'react';
import { CheckCircle2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
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
  onUpload: (docId: DueDiligenceDocId, meta: DueDiligenceDocMeta) => void;
  onRemove: (docId: DueDiligenceDocId) => void;
}

const isAcceptedFile = (file: File) => {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return ['xlsx', 'csv', 'pdf'].includes(ext);
};

export const DocumentUploadRow: React.FC<DocumentUploadRowProps> = ({
  docId,
  label,
  period,
  meta,
  onUpload,
  onRemove,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!isAcceptedFile(file)) {
      toast.error('Accepted formats: XLSX, CSV, PDF');
      return;
    }
    if (file.size > DD_MAX_FILE_BYTES) {
      toast.error('Max file size is 10MB');
      return;
    }
    onUpload(docId, {
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
    });
    toast.success('Document uploaded');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <tr>
      <td>{label}</td>
      <td>{period}</td>
      <td className="ob-dd-doc-cell">
        {meta ? (
          <div className="ob-dd-doc-uploaded">
            <span className="ob-dd-doc-status ob-dd-doc-status-done">
              <CheckCircle2 size={14} aria-hidden />
              Uploaded
            </span>
            <span className="ob-dd-doc-filename" title={meta.fileName}>
              {meta.fileName}
            </span>
            <div className="ob-dd-doc-actions">
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
      </td>
    </tr>
  );
};
