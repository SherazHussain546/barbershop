import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// Ensure data is typed and fallback to empty array
const rawImages = (data as any)?.placeholderImages || [];

export const PlaceHolderImages: ImagePlaceholder[] = Array.isArray(rawImages) ? rawImages : [];

/**
 * Safely retrieves a placeholder image by its ID.
 * Returns undefined if not found or if the list is not initialized.
 */
export function getPlaceholderImage(id: string): ImagePlaceholder | undefined {
  if (!PlaceHolderImages || !Array.isArray(PlaceHolderImages)) return undefined;
  return PlaceHolderImages.find(img => img.id === id);
}
