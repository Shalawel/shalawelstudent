import type { ProblemAttachment, StartSessionInput } from '../types/dashboard';

export const MAX_PROBLEM_FILE_BYTES = 8 * 1024 * 1024; // 8 MB

const SUPPORTED_TEXT_EXTENSIONS = ['.txt', '.md', '.csv'];
const SUPPORTED_MIME_PREFIXES = ['image/'];
const SUPPORTED_EXACT_MIMES = new Set([
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
]);

export function isSupportedProblemFile(fileName: string, mimeType: string): boolean {
  const lowerMime = (mimeType || '').toLowerCase();
  if (SUPPORTED_MIME_PREFIXES.some((prefix) => lowerMime.startsWith(prefix))) {
    return true;
  }
  if (SUPPORTED_EXACT_MIMES.has(lowerMime)) {
    return true;
  }
  const lowerName = (fileName || '').toLowerCase();
  return (
    SUPPORTED_TEXT_EXTENSIONS.some((ext) => lowerName.endsWith(ext)) ||
    lowerName.endsWith('.pdf') ||
    lowerName.endsWith('.png') ||
    lowerName.endsWith('.jpg') ||
    lowerName.endsWith('.jpeg') ||
    lowerName.endsWith('.webp')
  );
}

export function isTextProblemFile(fileName: string, mimeType: string): boolean {
  const lowerMime = (mimeType || '').toLowerCase();
  const lowerName = (fileName || '').toLowerCase();
  return (
    lowerMime.startsWith('text/') ||
    SUPPORTED_TEXT_EXTENSIONS.some((ext) => lowerName.endsWith(ext))
  );
}

export function validateProblemFileMeta(file: {
  name: string;
  type: string;
  size: number;
}): { valid: boolean; error?: string } {
  if (!isSupportedProblemFile(file.name, file.type)) {
    return {
      valid: false,
      error: 'Please upload an image (PNG, JPG, WEBP), PDF, or text file (.txt, .md).',
    };
  }
  if (file.size > MAX_PROBLEM_FILE_BYTES) {
    return {
      valid: false,
      error: 'File is larger than 8 MB. Please upload a smaller question file.',
    };
  }
  return { valid: true };
}

export function validateProblemSubmission(input: {
  problemText: string;
  attachment: ProblemAttachment | null;
}): { valid: boolean; error?: string } {
  const trimmed = input.problemText.trim();
  if (!trimmed && !input.attachment) {
    return {
      valid: false,
      error: 'Upload a question file or write your problem to get started.',
    };
  }
  if (!input.attachment && trimmed.length < 3) {
    return {
      valid: false,
      error: 'Please write a little more detail about your problem (at least 3 characters).',
    };
  }
  return { valid: true };
}

export function deriveProblemSessionTitle(
  problemText: string,
  fileName?: string
): string {
  const clean = problemText.replace(/\s+/g, ' ').trim();
  if (clean.length > 0) {
    return clean.length > 54 ? `${clean.slice(0, 51).trimEnd()}...` : clean;
  }
  if (fileName) {
    const stem = fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
    return stem ? `Problem: ${stem}` : `Problem: ${fileName}`;
  }
  return 'Solve My Problem';
}

export function shouldTriggerEnterSubmit(event: {
  key: string;
  shiftKey: boolean;
  isComposing?: boolean;
}): boolean {
  return event.key === 'Enter' && !event.shiftKey && !event.isComposing;
}

export function isProblemSolverSession(session: StartSessionInput): boolean {
  return Boolean(session.problemSolver);
}

export function formatFileSizeLabel(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
