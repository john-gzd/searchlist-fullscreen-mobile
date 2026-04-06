import titles from './titles.json';
import type { SearchItem } from './search-item';

export const searchItems: ReadonlyArray<SearchItem> = titles as SearchItem[];