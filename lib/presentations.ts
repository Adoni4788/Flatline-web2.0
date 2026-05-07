export const PRESENTATION_CONTENT_KIND = 'presentation_v1';

export type PresentationSourceType = 'embed' | 'upload';

export interface PresentationLessonContent {
  kind: typeof PRESENTATION_CONTENT_KIND;
  sourceType: PresentationSourceType;
  embedUrl?: string;
  fileName?: string;
  fileDataUrl?: string;
  mimeType?: string;
}

export const parsePresentationLessonContent = (content?: string | null): PresentationLessonContent | null => {
  if (!content) return null;

  try {
    const parsed = JSON.parse(content);

    if (
      parsed &&
      parsed.kind === PRESENTATION_CONTENT_KIND &&
      (parsed.sourceType === 'embed' || parsed.sourceType === 'upload')
    ) {
      return parsed as PresentationLessonContent;
    }
  } catch {
    return null;
  }

  return null;
};

export const serializePresentationLessonContent = (presentation: PresentationLessonContent): string => {
  return JSON.stringify(presentation);
};
