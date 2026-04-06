import './styles.scss';
import { initializeSearchComponent } from './components/search/search-component';
import { searchItems } from './data/search-items';
import { getSearchElements } from './ui/search-dom';
import { registerViewportSync } from './ui/viewport';

registerViewportSync();

initializeSearchComponent({
  elements: getSearchElements(),
  items: searchItems
});
