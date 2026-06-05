import React, { useRef } from 'react';
import { FileText, Shield, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { KYC_MAX_FILE_BYTES, type KycDocId, type KycDocMeta } from './bankingConstants';

const ICONS: Record<KycDocId, React.ReactNode> = {
  photoId: <FileText size={16} color="#0a2d6e" />,
  articles: <FileText size={16} color="#0a2d6e" />,
  goodStanding: <Shield size={16} color="#0a2d6e" />,
  einLetter: <FileText size={16} color="#0a2d6e" />,
  beneficialOwnership: <Users size={16} color="#0a2d6e" />,
};

interface KycUploadBarProps {
  docId: KycDocId;
  name: string;
  desc: string;
  accept: string;
  meta: KycDocMeta | null;
  onUpload: (id: KycDocId, meta: KycDocMeta) => void;
  onRemove: (id: KycDocId) => void;
}

export const KycUploadBar: React.FC<KycUploadBarProps> = ({
  docId, name, desc, accept, meta, onUpload, onRemove,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const exts = accept.split(',').map(e => e.trim().replace('.', '').toLowerCase());
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!exts.includes(ext)) {
      toast.error(`Accepted formats: ${accept}`);
      return;
    }
    if (file.size > KYC_MAX_FILE_BYTES) {
      toast.error('Max file size is 10MB');
      return;
    }
    onUpload(docId, { fileName: file.name, fileSize: file.size, uploadedAt: new Date().toISOString() });
    toast.success('Document uploaded');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      className={`ob-bank-kyc-bar${meta ? ' ob-bank-kyc-bar-done' : ''}`}
      onClick={() => !meta && inputRef.current?.click()}
      onKeyDown={e => e.key === 'Enter' && !meta && inputRef.current?.click()}
      role="button"
      tabIndex={0}
    >
      <div className="ob-bank-kyc-icon">{ICONS[docId]}</div>
      <div className="ob-bank-kyc-info">
        <div className="ob-bank-kyc-name">{name} <span className="ob-req">*</span></div>
        <div className="ob-bank-kyc-desc">{desc}</div>
        {meta && (
          <div className="ob-bank-kyc-file">
            {meta.fileName}
            <button type="button" className="ob-bank-kyc-change" onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}>Change</button>
            <button type="button" className="ob-bank-kyc-remove" onClick={e => { e.stopPropagation(); onRemove(docId); }}>Remove</button>
          </div>
        )}
      </div>
      <span className={`ob-bank-kyc-status${meta ? ' ob-bank-kyc-status-done' : ''}`}>
        {meta ? 'Uploaded ✓' : 'Pending'}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="ob-bank-kyc-input"
        onChange={e => handleFile(e.target.files?.[0])}
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
};
