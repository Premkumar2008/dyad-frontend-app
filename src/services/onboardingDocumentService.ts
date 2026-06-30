import { buildAuthorizationHeader, getApiAccessToken, restoreOnboardingApiAccessToken } from '../utils/apiAuth';
import {
  DUE_DILIGENCE_DOCS,
  type DueDiligenceDocId,
  type DueDiligenceDocMeta,
} from '../components/onboarding/step4/dueDiligenceConstants';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export interface UploadDueDiligenceDocumentsRequest {
  onboardingId: string;
  contactEmail?: string;
  reportAvailabilityNotes?: string;
  files: Partial<Record<DueDiligenceDocId, File>>;
}

export interface UploadDueDiligenceDocumentsResult {
  success: boolean;
  message?: string;
  onboardingId: string;
  documents: Record<DueDiligenceDocId, DueDiligenceDocMeta | null>;
}

const buildApiUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

const buildDueDiligenceUploadFormData = (
  payload: UploadDueDiligenceDocumentsRequest,
): FormData => {
  const formData = new FormData();
  formData.append('onboardingId', payload.onboardingId.trim());

  if (payload.contactEmail?.trim()) {
    formData.append('contactEmail', payload.contactEmail.trim());
  }
  if (payload.reportAvailabilityNotes?.trim()) {
    formData.append('reportAvailabilityNotes', payload.reportAvailabilityNotes.trim());
  }

  let fileCount = 0;
  DUE_DILIGENCE_DOCS.forEach((doc) => {
    const file = payload.files[doc.id];
    if (file instanceof File && file.size > 0) {
      formData.append(doc.id, file);
      fileCount += 1;
    }
  });

  formData.append('documentCount', String(fileCount));
  return formData;
};

/** In-memory cache so View still works after submit clears React file state. */
const dueDiligenceFileCache = new Map<string, File>();

const buildFileCacheKey = (onboardingId: string, docId: DueDiligenceDocId): string => {
  const trimmedId = onboardingId.trim();
  return trimmedId ? `${trimmedId}:${docId}` : `local:${docId}`;
};

export const cacheDueDiligenceDocumentFile = (
  onboardingId: string,
  docId: DueDiligenceDocId,
  file: File,
): void => {
  if (file instanceof File && file.size > 0) {
    dueDiligenceFileCache.set(buildFileCacheKey(onboardingId, docId), file);
  }
};

const getCachedDueDiligenceDocumentFile = (
  onboardingId: string,
  docId: DueDiligenceDocId,
): File | undefined => (
  dueDiligenceFileCache.get(buildFileCacheKey(onboardingId, docId))
  ?? dueDiligenceFileCache.get(buildFileCacheKey('', docId))
);

const resolveLocalDueDiligenceFile = (
  file: File | undefined,
  onboardingId: string | undefined,
  docId: DueDiligenceDocId,
): File | undefined => {
  if (file instanceof File && file.size > 0) return file;
  return getCachedDueDiligenceDocumentFile(onboardingId ?? '', docId);
};

const asRecord = (value: unknown): Record<string, unknown> => (
  value && typeof value === 'object' ? value as Record<string, unknown> : {}
);

const readString = (record: Record<string, unknown>, ...keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
};

const parseDocumentMeta = (
  docId: DueDiligenceDocId,
  raw: unknown,
  fallbackFile?: File,
): DueDiligenceDocMeta | null => {
  const record = asRecord(raw);
  const fileName = readString(record, 'fileName', 'file_name') ?? fallbackFile?.name;
  if (!fileName) return null;

  const fileSizeRaw = record.fileSize ?? record.file_size;
  const fileSize = typeof fileSizeRaw === 'number'
    ? fileSizeRaw
    : Number.parseInt(String(fileSizeRaw ?? fallbackFile?.size ?? 0), 10);

  return {
    fileName,
    fileSize: Number.isFinite(fileSize) ? fileSize : (fallbackFile?.size ?? 0),
    uploadedAt: readString(record, 'uploadedAt', 'uploaded_at') ?? new Date().toISOString(),
    mimeType: readString(record, 'mimeType', 'mime_type') ?? fallbackFile?.type,
    documentId: readString(record, 'documentId', 'document_id', 'id'),
    storagePath: readString(record, 'storagePath', 'storage_path', 'url'),
  };
};

const parseUploadResponse = (
  data: unknown,
  files: Partial<Record<DueDiligenceDocId, File>>,
): UploadDueDiligenceDocumentsResult => {
  const root = asRecord(data);
  const nested = asRecord(root.data ?? root);
  const documentsRaw = asRecord(nested.documents ?? root.documents);
  const success = root.success !== false && nested.success !== false;

  const documents = DUE_DILIGENCE_DOCS.reduce((acc, doc) => {
    const parsed = parseDocumentMeta(doc.id, documentsRaw[doc.id], files[doc.id]);
    acc[doc.id] = parsed;
    return acc;
  }, {} as Record<DueDiligenceDocId, DueDiligenceDocMeta | null>);

  return {
    success,
    message: readString(nested, 'message') ?? readString(root, 'message'),
    onboardingId: readString(nested, 'onboardingId', 'onboarding_id')
      ?? readString(root, 'onboardingId', 'onboarding_id')
      ?? '',
    documents,
  };
};

/**
 * Upload Step 4 due-diligence documents when the user clicks Submit for Review.
 *
 * Backend: POST /api/onboarding/step/4/documents (multipart/form-data)
 */
export const uploadDueDiligenceDocuments = async (
  payload: UploadDueDiligenceDocumentsRequest,
): Promise<UploadDueDiligenceDocumentsResult> => {
  if (!payload.onboardingId.trim()) {
    throw new Error('Onboarding ID is required before uploading documents');
  }

  if (!getApiAccessToken() && !restoreOnboardingApiAccessToken()) {
    throw new Error('Your session has expired. Please log in again with your verification code.');
  }

  const formData = buildDueDiligenceUploadFormData(payload);
  const fileCount = Number(formData.get('documentCount'));
  if (!Number.isFinite(fileCount) || fileCount <= 0) {
    throw new Error('No document files found to upload. Please re-select your files and try again.');
  }

  const headers: Record<string, string> = {
    ...buildAuthorizationHeader(),
  };

  const response = await fetch(buildApiUrl('/onboarding/step/4/documents'), {
    method: 'POST',
    headers,
    body: formData,
  });

  const data: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const record = asRecord(data);
    const message = readString(record, 'message') ?? `Document upload failed (${response.status})`;
    throw new Error(message);
  }

  const parsed = parseUploadResponse(data, payload.files);
  if (!parsed.success) {
    throw new Error(parsed.message ?? 'Document upload failed');
  }

  DUE_DILIGENCE_DOCS.forEach((doc) => {
    const file = payload.files[doc.id];
    if (file instanceof File && file.size > 0) {
      cacheDueDiligenceDocumentFile(payload.onboardingId, doc.id, file);
      cacheDueDiligenceDocumentFile('', doc.id, file);
    }
  });

  return parsed;
};

const isJsonLikeBlob = async (blob: Blob): Promise<boolean> => {
  if (blob.type.includes('json')) return true;
  const first = await blob.slice(0, 1).text();
  return first === '{' || first === '[';
};

const extractDownloadUrlFromMetadata = (data: unknown): string | undefined => {
  const root = asRecord(data);
  const nested = asRecord(root.data ?? root);
  const document = asRecord(nested.document ?? nested);

  return readString(document, 'downloadUrl', 'download_url', 'signedUrl', 'signed_url', 'fileUrl', 'file_url')
    ?? readString(nested, 'downloadUrl', 'download_url', 'signedUrl', 'signed_url', 'fileUrl', 'file_url')
    ?? (() => {
      const storagePath = readString(document, 'storagePath', 'storage_path')
        ?? readString(nested, 'storagePath', 'storage_path');
      return storagePath && /^https?:\/\//i.test(storagePath) ? storagePath : undefined;
    })();
};

const buildDocumentFetchCandidates = (
  onboardingId: string,
  docId: DueDiligenceDocId,
  documentId?: string,
  storagePath?: string,
): string[] => {
  const oid = encodeURIComponent(onboardingId.trim());
  const type = encodeURIComponent(docId);
  const paths: string[] = [
    `/onboarding/step/4/documents/${oid}/${type}/file`,
    `/onboarding/step/4/documents/${oid}/${type}/download`,
    `/onboarding/step/4/documents/${oid}/${type}`,
  ];

  if (documentId?.trim()) {
    const did = encodeURIComponent(documentId.trim());
    paths.push(`/onboarding/step/4/documents/${oid}/${did}/file`);
    paths.push(`/onboarding/step/4/documents/${oid}/${did}/download`);
    paths.push(`/onboarding/step/4/documents/${oid}/${did}`);
  }

  if (storagePath?.trim() && !/^https?:\/\//i.test(storagePath)) {
    const encodedPath = encodeURIComponent(storagePath.trim());
    paths.push(`/onboarding/step/4/documents/file?path=${encodedPath}`);
    paths.push(`/onboarding/step/4/documents/download?path=${encodedPath}`);
  }

  return [...new Set(paths)];
};

const fetchDocumentBlob = async (
  path: string,
  mimeType?: string,
): Promise<{ blob: Blob; isJson: boolean; json?: unknown; notFound?: boolean }> => {
  const accept = mimeType
    ? `${mimeType},application/octet-stream;q=0.9,*/*;q=0.8`
    : 'application/octet-stream,application/pdf,image/*,*/*;q=0.8';

  const response = await fetch(buildApiUrl(path), {
    headers: {
      ...buildAuthorizationHeader(),
      Accept: accept,
    },
  });

  const blob = await response.blob();

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Your session has expired. Please log in again with your verification code.');
    }
    if (response.status === 404) {
      return { blob, isJson: false, notFound: true };
    }
    if (blob.type.includes('json') || await isJsonLikeBlob(blob)) {
      const record = asRecord(JSON.parse(await blob.text()));
      const message = readString(record, 'message') ?? `Document fetch failed (${response.status})`;
      throw new Error(message);
    }
    throw new Error(`Document fetch failed (${response.status})`);
  }

  const contentType = response.headers.get('content-type') ?? blob.type ?? '';
  const isJson = contentType.includes('application/json') || await isJsonLikeBlob(blob);
  if (isJson) {
    return { blob, isJson: true, json: JSON.parse(await blob.text()) };
  }

  const typedBlob = mimeType && !blob.type
    ? new Blob([blob], { type: mimeType })
    : blob;

  return { blob: typedBlob, isJson: false };
};

const fetchRemoteDueDiligenceDocumentBlob = async (options: {
  onboardingId: string;
  docId: DueDiligenceDocId;
  meta: DueDiligenceDocMeta;
}): Promise<Blob> => {
  const { onboardingId, docId, meta } = options;
  const candidates = buildDocumentFetchCandidates(
    onboardingId,
    docId,
    meta.documentId,
    meta.storagePath,
  );

  let lastMetadata: unknown;

  for (const path of candidates) {
    const result = await fetchDocumentBlob(path, meta.mimeType);
    if (result.notFound) continue;
    if (!result.isJson) {
      return result.blob;
    }
    lastMetadata = result.json;
    const directUrl = extractDownloadUrlFromMetadata(result.json);
    if (directUrl) {
      const urlResponse = await fetch(directUrl, {
        headers: buildAuthorizationHeader(),
      });
      if (urlResponse.ok) {
        const urlBlob = await urlResponse.blob();
        if (!(urlBlob.type.includes('json') || await isJsonLikeBlob(urlBlob))) {
          return meta.mimeType && !urlBlob.type
            ? new Blob([urlBlob], { type: meta.mimeType })
            : urlBlob;
        }
      }
    }
  }

  const record = asRecord(lastMetadata);
  const message = readString(record, 'message')
    ?? readString(asRecord(record.data), 'message')
    ?? 'Document file is not available. The server returned metadata instead of the file — please re-upload.';
  throw new Error(message);
};

const openBlobInNewTab = (blob: Blob): void => {
  const url = URL.createObjectURL(blob);
  const tab = window.open(url, '_blank', 'noopener,noreferrer');
  if (!tab) {
    URL.revokeObjectURL(url);
    throw new Error('Pop-up blocked. Allow pop-ups to view the document.');
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export const buildDueDiligenceDocumentViewPath = (
  onboardingId: string,
  docId: DueDiligenceDocId,
  documentId?: string,
): string => {
  const encodedOnboardingId = encodeURIComponent(onboardingId.trim());
  if (documentId?.trim()) {
    return `/onboarding/step/4/documents/${encodedOnboardingId}/${encodeURIComponent(documentId.trim())}`;
  }
  return `/onboarding/step/4/documents/${encodedOnboardingId}/${encodeURIComponent(docId)}`;
};

/** Open an uploaded due-diligence document in a new browser tab. */
export const openDueDiligenceDocument = async (options: {
  meta: DueDiligenceDocMeta;
  docId: DueDiligenceDocId;
  onboardingId?: string;
  file?: File;
}): Promise<void> => {
  const { meta, docId, onboardingId, file } = options;

  const localFile = resolveLocalDueDiligenceFile(file, onboardingId, docId);

  if (localFile) {
    openBlobInNewTab(localFile);
    return;
  }

  if (meta.storagePath && /^https?:\/\//i.test(meta.storagePath)) {
    window.open(meta.storagePath, '_blank', 'noopener,noreferrer');
    return;
  }

  const hasPersistedRemoteDoc = Boolean(meta.documentId?.trim() || meta.storagePath?.trim());

  if (!hasPersistedRemoteDoc) {
    throw new Error('Document is not available to view. Please select the file again.');
  }

  if (!onboardingId?.trim()) {
    throw new Error('Save onboarding progress first — onboarding ID is required to view this document.');
  }

  const blob = await fetchRemoteDueDiligenceDocumentBlob({
    onboardingId: onboardingId.trim(),
    docId,
    meta,
  });

  openBlobInNewTab(blob);
};

export const mergeUploadedDueDiligenceDocuments = (
  current: Record<DueDiligenceDocId, DueDiligenceDocMeta | null>,
  uploaded: Record<DueDiligenceDocId, DueDiligenceDocMeta | null>,
  files: Partial<Record<DueDiligenceDocId, File>>,
): Record<DueDiligenceDocId, DueDiligenceDocMeta | null> => {
  const merged = { ...current };

  DUE_DILIGENCE_DOCS.forEach((doc) => {
    const fromApi = uploaded[doc.id];
    if (fromApi) {
      merged[doc.id] = fromApi;
      return;
    }
    if (files[doc.id] && current[doc.id]) {
      merged[doc.id] = current[doc.id];
    }
  });

  return merged;
};
