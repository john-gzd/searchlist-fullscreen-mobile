import {
  clampActiveIndex,
  filterItems,
  formatSearchItemLabel,
  getNextActiveIndex,
  getResultsStatusMessage
} from '../../business/search-service';
import type { SearchItem } from '../../data/search-item';
import { setupAddItemFlow } from './add-item-flow';
import {
  getOptionElements,
  searchStateClasses,
  type SearchElements
} from '../../ui/search-dom';

interface SearchComponentOptions {
  elements: SearchElements;
  items: ReadonlyArray<SearchItem>;
}

interface SearchComponentState {
  items: SearchItem[];
  filteredItems: SearchItem[];
  activeIndex: number;
  isOpen: boolean;
  currentView: 'results' | 'add-item';
}

interface CloseResultsOptions {
  restoreFocus?: boolean;
}

const getOptionId = (index: number): string => `result-option-${index}`;

export const initializeSearchComponent = ({
  elements,
  items
}: SearchComponentOptions): void => {
  const state: SearchComponentState = {
    items: [...items],
    filteredItems: [...items],
    activeIndex: -1,
    isOpen: false,
    currentView: 'results'
  };

  const syncPanels = (): void => {
    const isMobile = elements.mobileMediaQuery.matches;
    const showAddStep = state.isOpen && isMobile && state.currentView === 'add-item';
    const showResults = state.isOpen && (!isMobile || state.currentView === 'results');

    elements.shell.classList.toggle(searchStateClasses.mobileStepOpen, showAddStep);
    elements.panel.hidden = !showResults;
    elements.mobileStepPanel.hidden = !showAddStep;
  };

  const updateActiveDescendant = (): void => {
    const options = getOptionElements(elements.list);

    options.forEach((option, index) => {
      const isActive = index === state.activeIndex;

      option.setAttribute('aria-selected', String(isActive));
      option.classList.toggle(searchStateClasses.activeOption, isActive);

      if (isActive) {
        elements.input.setAttribute('aria-activedescendant', option.id);
        option.scrollIntoView({ block: 'nearest' });
      }
    });

    if (state.activeIndex < 0) {
      elements.input.removeAttribute('aria-activedescendant');
    }
  };

  const updateOpenState = (nextOpen: boolean): void => {
    state.isOpen = nextOpen;

    const isMobileOpen = nextOpen && elements.mobileMediaQuery.matches;

    elements.shell.classList.toggle(searchStateClasses.open, nextOpen);
    elements.shell.classList.toggle(searchStateClasses.mobileOpen, isMobileOpen);
    document.body.classList.toggle(searchStateClasses.bodyLocked, isMobileOpen);

    elements.input.setAttribute('aria-expanded', String(nextOpen));
    syncPanels();

    if (!nextOpen) {
      state.activeIndex = -1;
      state.currentView = 'results';
      updateActiveDescendant();
      syncPanels();
    }
  };

  const setActiveIndex = (nextIndex: number): void => {
    state.activeIndex = clampActiveIndex(nextIndex, state.filteredItems.length);
    updateActiveDescendant();
  };

  const openResults = (): void => {
    updateOpenState(true);
  };

  const syncClearButtonState = (): void => {
    const hasValue = elements.input.value.trim().length > 0;
    elements.clearButton.hidden = !hasValue;
    elements.clearButton.disabled = !hasValue;
  };

  const closeResults = ({ restoreFocus = false }: CloseResultsOptions = {}): void => {
    updateOpenState(false);

    if (restoreFocus) {
      elements.input.focus();
    }
  };

  const renderList = (query = elements.input.value): void => {
    syncClearButtonState();
    state.filteredItems = filterItems(state.items, query);
    elements.list.innerHTML = '';

    if (state.filteredItems.length === 0) {
      const emptyState = document.createElement('li');
      emptyState.className = 'search__empty';
      emptyState.setAttribute('role', 'presentation');
      emptyState.textContent = 'Geen resultaten gevonden.';

      elements.list.appendChild(emptyState);
      elements.status.textContent = getResultsStatusMessage(0);
      state.activeIndex = -1;
      updateActiveDescendant();
      return;
    }

    state.filteredItems.forEach((item, index) => {
      const listItem = document.createElement('li');
      const title = document.createElement('span');
      const artist = document.createElement('span');

      listItem.id = getOptionId(index);
      listItem.className = 'search__option';
      listItem.setAttribute('role', 'option');
      listItem.setAttribute('aria-label', formatSearchItemLabel(item));
      listItem.setAttribute('aria-selected', 'false');
      listItem.dataset.index = String(index);

      title.className = 'search__option-title';
      title.textContent = item.title;

      artist.className = 'search__option-artist';
      artist.textContent = item.artist;

      listItem.append(title, artist);

      elements.list.appendChild(listItem);
    });

    elements.status.textContent = getResultsStatusMessage(
      state.filteredItems.length
    );

    state.activeIndex = clampActiveIndex(
      state.activeIndex,
      state.filteredItems.length
    );

    updateActiveDescendant();
  };

  const selectItem = (index: number): void => {
    const selectedItem = state.filteredItems[index];

    if (!selectedItem) {
      return;
    }

    elements.input.value = selectedItem.title;
    renderList(selectedItem.title);
    closeResults({ restoreFocus: true });
  };

  const moveActiveIndex = (direction: -1 | 1): void => {
    if (!state.isOpen) {
      openResults();
    }

    state.activeIndex = getNextActiveIndex(
      state.activeIndex,
      direction,
      state.filteredItems.length
    );

    updateActiveDescendant();
  };

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (state.activeIndex >= 0) {
      selectItem(state.activeIndex);
      return;
    }

    openResults();
  });

  elements.input.addEventListener('focus', () => {
    renderList();
    openResults();
  });

  elements.input.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement;

    renderList(target.value);
    openResults();
  });

  elements.clearButton.addEventListener('click', () => {
    if (!elements.input.value) {
      return;
    }

    elements.input.value = '';
    state.activeIndex = -1;
    renderList('');
    openResults();
    elements.input.focus();
  });

  elements.input.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveActiveIndex(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveActiveIndex(-1);
        break;
      case 'Enter':
        if (state.isOpen && state.activeIndex >= 0) {
          event.preventDefault();
          selectItem(state.activeIndex);
        }
        break;
      case 'Escape':
        if (state.isOpen) {
          event.preventDefault();
          closeResults({ restoreFocus: true });
        }
        break;
      default:
        break;
    }
  });

  elements.list.addEventListener('pointerdown', (event) => {
    const option = (event.target as HTMLElement).closest<HTMLElement>('[data-index]');

    if (!option) {
      return;
    }

    event.preventDefault();

    const optionIndex = Number(option.dataset.index);
    setActiveIndex(optionIndex);
    selectItem(optionIndex);
  });

  elements.list.addEventListener('pointermove', (event) => {
    const option = (event.target as HTMLElement).closest<HTMLElement>('[data-index]');

    if (!option) {
      return;
    }

    setActiveIndex(Number(option.dataset.index));
  });

  setupAddItemFlow({
    elements,
    getState: () => ({
      isOpen: state.isOpen
    }),
    setCurrentView: (view) => {
      state.currentView = view;
    },
    syncPanels,
    openResults,
    closeResults,
    focusSearchInput: () => {
      elements.input.focus();
    },
    getItems: () => state.items,
    setItems: (nextItems) => {
      state.items = nextItems;
    },
    renderList
  });

  syncClearButtonState();

  elements.closeTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      closeResults();
      elements.input.blur();
    });
  });

  elements.shell.addEventListener('focusout', (event) => {
    const nextFocusedElement = event.relatedTarget as Node | null;

    if (nextFocusedElement && elements.shell.contains(nextFocusedElement)) {
      return;
    }

    window.setTimeout(() => {
      const activeElement = document.activeElement;

      if (activeElement instanceof Node && elements.shell.contains(activeElement)) {
        return;
      }

      closeResults();
    }, 0);
  });

  document.addEventListener('pointerdown', (event) => {
    const target = event.target as Node;

    if (!state.isOpen || elements.shell.contains(target)) {
      return;
    }

    closeResults();
  });

  elements.mobileMediaQuery.addEventListener('change', () => {
    if (state.isOpen) {
      if (!elements.mobileMediaQuery.matches) {
        state.currentView = 'results';
      }

      updateOpenState(true);
    }
  });

  renderList();
};