import type { SearchItem } from '../data/search-item';

export const formatSearchItemLabel = ({ title, artist }: SearchItem): string =>
  `${title} — ${artist}`;

export const filterItems = (
  items: ReadonlyArray<SearchItem>,
  query: string
): SearchItem[] => {
  const normalizedQuery = query.trim().toLowerCase();

  return items.filter(({ title, artist }) =>
    `${title} ${artist}`.toLowerCase().includes(normalizedQuery)
  );
};

export const normalizeItemName = (value: string): string =>
  value.trim().replace(/\s+/g, ' ');

export const normalizeSearchItem = (item: SearchItem): SearchItem => ({
  title: normalizeItemName(item.title),
  artist: normalizeItemName(item.artist)
});

export const hasItem = (
  items: ReadonlyArray<SearchItem>,
  candidate: string
): boolean => {
  const normalizedCandidate = normalizeItemName(candidate).toLowerCase();

  return items.some(
    ({ title }) => normalizeItemName(title).toLowerCase() === normalizedCandidate
  );
};

export const hasItemWithArtist = (
  items: ReadonlyArray<SearchItem>,
  candidate: SearchItem
): boolean => {
  const normalizedCandidate = normalizeSearchItem(candidate);
  const normalizedTitle = normalizedCandidate.title.toLowerCase();
  const normalizedArtist = normalizedCandidate.artist.toLowerCase();

  return items.some((item) => {
    const normalizedItem = normalizeSearchItem(item);

    return (
      normalizedItem.title.toLowerCase() === normalizedTitle &&
      normalizedItem.artist.toLowerCase() === normalizedArtist
    );
  });
};

export const getResultsStatusMessage = (count: number): string => {
  if (count === 0) {
    return 'Geen resultaten gevonden.';
  }

  const resultLabel = count === 1 ? 'resultaat' : 'resultaten';
  return `${count} ${resultLabel} beschikbaar.`;
};

export const clampActiveIndex = (
  index: number,
  itemCount: number
): number => {
  if (itemCount === 0) {
    return -1;
  }

  return Math.max(0, Math.min(index, itemCount - 1));
};

export const getNextActiveIndex = (
  currentIndex: number,
  direction: -1 | 1,
  itemCount: number
): number => {
  if (itemCount === 0) {
    return -1;
  }

  if (currentIndex === -1) {
    return direction === 1 ? 0 : itemCount - 1;
  }

  return clampActiveIndex(currentIndex + direction, itemCount);
};