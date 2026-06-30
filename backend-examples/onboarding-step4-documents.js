/**
 * Step 4 due-diligence document upload — reference implementation.
 *
 *   POST /api/onboarding/step/4/documents
 *
 * Multipart form fields:
 *   onboardingId          (required)
 *   contactEmail          (optional)
 *   reportAvailabilityNotes (optional)
 *   documentCount         (optional, number of files attached)
 *   claimsSummary         (file, optional)
 *   payerMixReport        (file, optional)
 *   arAging               (file, optional)
 *   paymentsAdjustments   (file, optional)
 *   encounterVolume       (file, optional)
 *
 * Accepted file types: .pdf, .xlsx, .csv — max 10 MB each.
 *
 * Backend must parse multipart/form-data (e.g. multer), NOT JSON body.
 * Example multer fields:
 *   upload.fields([
 *     { name: 'claimsSummary', maxCount: 1 },
 *     { name: 'payerMixReport', maxCount: 1 },
 *     { name: 'arAging', maxCount: 1 },
 *     { name: 'paymentsAdjustments', maxCount: 1 },
 *     { name: 'encounterVolume', maxCount: 1 },
 *   ])
 */

const DOCUMENT_FIELDS = [
  'claimsSummary',
  'payerMixReport',
  'arAging',
  'paymentsAdjustments',
  'encounterVolume',
];

const DOCUMENT_LABELS = {
  claimsSummary: 'Claims Summary Report',
  payerMixReport: 'Payer Mix Report',
  arAging: 'Accounts Receivable Aging by Payer Report',
  paymentsAdjustments: 'Payments and Adjustments by Payer Report',
  encounterVolume: 'Encounter / Case Volume and Production Report',
};

/**
 * Example success response:
 *
 * {
 *   "success": true,
 *   "data": {
 *     "onboardingId": "OB-12345",
 *     "documents": {
 *       "claimsSummary": {
 *         "documentId": "doc_abc123",
 *         "fileName": "claims-summary.pdf",
 *         "fileSize": 245760,
 *         "mimeType": "application/pdf",
 *         "storagePath": "onboarding/OB-12345/claimsSummary/claims-summary.pdf",
 *         "uploadedAt": "2026-06-30T12:00:00.000Z"
 *       }
 *     }
 *   }
 * }
 *
 * Example error response:
 *
 * {
 *   "success": false,
 *   "message": "onboardingId is required"
 * }
 *
 * View / download a stored document (must return file bytes, not JSON metadata):
 *
 *   GET /api/onboarding/step/4/documents/{onboardingId}/{docType}/file
 *   GET /api/onboarding/step/4/documents/{onboardingId}/{docType}/download
 *   GET /api/onboarding/step/4/documents/{onboardingId}/{docType}
 *   GET /api/onboarding/step/4/documents/{onboardingId}/{documentId}/file
 *
 * Response headers for file routes:
 *   Content-Type: application/pdf (or actual mime)
 *   Content-Disposition: inline; filename="..."
 *
 * Do NOT return JSON metadata on file download routes — that breaks in-browser PDF preview.
 */

module.exports = {
  DOCUMENT_FIELDS,
  DOCUMENT_LABELS,
};
