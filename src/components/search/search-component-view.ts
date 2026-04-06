import {
  clampActiveIndex,
  filterItems,
  formatSearchItemLabel,
  getResultsStatusMessage
} from '../../business/search-service';
import type { SearchItem } from '../../data/search-item';
import { getOptionElements, searchStateClasses, type SearchElements } from '../../ui/search-dom';

export interface SearchComponentState {
  items: SearchItem[];
  filteredItems: SearchItem[];
  activeIndex: number;
  isOpen: boolean;
  currentView: 'results' | 'add-item';
}

export const createInitialSearchState = (
  items: ReadonlyArray<SearchItem>
): SearchComponentState => ({
  items: [...items],
  filteredItems: [...items],
  activeIndex: -1,
  isOpen: false,
  currentView: 'results'
});

const getOptionId = (index: number): string => `result-option-${index}`;

interface SearchComponentViewOptions {
  elements: SearchElements;
  state: SearchComponentState;
}

export interface SearchComponentView {
  syncPanels: () => void;
  syncOpenState: () => void;
  syncClearButtonState: () => void;
  updateActiveDescendant: () => void;
  renderList: (query?: string) => void;
}

export const createSearchComponentView = ({
  elements,
  state
}: SearchComponentViewOptions): SearchComponentView => {
  const syncMobileModalSemantics = (): void => {
    const isMobileModal = state.isOpen && elements.mobileMediaQuery.matches;

    if (isMobileModal) {
      elements.shell.setAttribute('role', 'dialog');
      elements.shell.setAttribute('aria-modal', 'true');
      elements.shell.setAttribute('aria-labelledby', 'search-title');
      return;
    }

    elements.shell.removeAttribute('role');
    elements.shell.removeAttribute('aria-modal');
    elements.shell.removeAttribute('aria-labelledby');
  };

  const syncPanels = (): void => {
    const isMobile = elements.mobileMediaQuery.matches;
    const showAddItemStep = state.isOpen && isMobile && state.currentView === 'add-item';
    const showResultsPanel = state.isOpen && (!isMobile || state.currentView === 'results');

    elements.shell.classList.toggle(searchStateClasses.mobileStepOpen, showAddItemStep);
    elements.panel.hidden = !showResultsPanel;
    elements.mobileStepPanel.hidden = !showAddItemStep;
  };

  const syncOpenState = (): void => {
    const isMobileOpen = state.isOpen && elements.mobileMediaQuery.matches;

    elements.shell.classList.toggle(searchStateClasses.open, state.isOpen);
    elements.shell.classList.toggle(searchStateClasses.mobileOpen, isMobileOpen);
    document.body.classList.toggle(searchStateClasses.bodyLocked, isMobileOpen);
    elements.input.setAttribute('aria-expanded', String(state.isOpen));
    syncMobileModalSemantics();

    syncPanels();
  };

  const syncClearButtonState = (): void => {
    const hasInputValue = elements.input.value.trim().length > 0;
    elements.clearButton.hidden = !hasInputValue;
    elements.clearButton.disabled = !hasInputValue;
  };

  const updateActiveDescendant = (): void => {
    const optionElements = getOptionElements(elements.list);

    optionElements.forEach((optionElement, index) => {
      const isActive = index === state.activeIndex;

      optionElement.setAttribute('aria-selected', String(isActive));
      optionElement.classList.toggle(searchStateClasses.activeOption, isActive);

      if (isActive) {
        elements.input.setAttribute('aria-activedescendant', optionElement.id);
        optionElement.scrollIntoView({ block: 'nearest' });
      }
    });

    if (state.activeIndex < 0) {
      elements.input.removeAttribute('aria-activedescendant');
    }
  };

  const renderList = (query = elements.input.value): void => {
    syncClearButtonState();
    state.filteredItems = filterItems(state.items, query);
    elements.list.innerHTML = '';

    if (state.filteredItems.length === 0) {
      const emptyStateElement = document.createElement('li');
      emptyStateElement.className = 'search__empty';
      emptyStateElement.setAttribute('role', 'presentation');
      emptyStateElement.textContent = 'Geen resultaten gevonden.';
      elements.list.appendChild(emptyStateElement);

      elements.status.textContent = getResultsStatusMessage(0);
      state.activeIndex = -1;
      updateActiveDescendant();
      return;
    }

    state.filteredItems.forEach((item, index) => {
      const optionElement = document.createElement('li');
      const titleElement = document.createElement('span');
      const artistElement = document.createElement('span');

      optionElement.id = getOptionId(index);
      optionElement.className = 'search__option';
      optionElement.setAttribute('role', 'option');
      optionElement.setAttribute('aria-label', formatSearchItemLabel(item));
      optionElement.setAttribute('aria-selected', 'false');
      optionElement.dataset.index = String(index);

      titleElement.className = 'search__option-title';
      titleElement.textContent = item.title;

      artistElement.className = 'search__option-artist';
      artistElement.textContent = item.artist;

      optionElement.append(titleElement, artistElement);
      elements.list.appendChild(optionElement);
    });

    elements.status.textContent = getResultsStatusMessage(state.filteredItems.length);

    state.activeIndex = clampActiveIndex(state.activeIndex, state.filteredItems.length);
    updateActiveDescendant();
  };

  return {
    syncPanels,
    syncOpenState,
    syncClearButtonState,
    updateActiveDescendant,
    renderList
  };
};
