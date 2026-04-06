import {
  clampActiveIndex,
  getNextActiveIndex
} from '../../business/search-service';
import type { SearchItem } from '../../data/search-item';
import type { SearchElements } from '../../ui/search-dom';
import { setupAddItemFlow } from './add-item-flow';
import {
  createInitialSearchState,
  createSearchComponentView
} from './search-component-view';

interface SearchComponentOptions {
  elements: SearchElements;
  items: ReadonlyArray<SearchItem>;
}

interface CloseResultsOptions {
  restoreFocus?: boolean;
}

const getOptionFromEvent = (event: Event): HTMLElement | null =>
  (event.target as HTMLElement).closest<HTMLElement>('[data-index]');

export const initializeSearchComponent = ({
  elements,
  items
}: SearchComponentOptions): void => {
  const state = createInitialSearchState(items);
  const searchView = createSearchComponentView({ elements, state });

  const updateOpenState = (isOpen: boolean): void => {
    state.isOpen = isOpen;

    if (!isOpen) {
      state.activeIndex = -1;
      state.currentView = 'results';
      searchView.updateActiveDescendant();
    }

    searchView.syncOpenState();
  };

  const setActiveIndex = (nextIndex: number): void => {
    state.activeIndex = clampActiveIndex(nextIndex, state.filteredItems.length);
    searchView.updateActiveDescendant();
  };

  const openResults = (): void => {
    updateOpenState(true);
  };

  const closeResults = ({ restoreFocus = false }: CloseResultsOptions = {}): void => {
    updateOpenState(false);

    if (restoreFocus) {
      elements.input.focus();
    }
  };

  const renderList = (query = elements.input.value): void => {
    searchView.renderList(query);
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

    searchView.updateActiveDescendant();
  };

  elements.form.addEventListener('submit', (submitEvent) => {
    submitEvent.preventDefault();

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

  elements.input.addEventListener('input', (inputEvent) => {
    const inputElement = inputEvent.target as HTMLInputElement;
    renderList(inputElement.value);
    openResults();
  });

  elements.input.addEventListener('keydown', (keyboardEvent) => {
    switch (keyboardEvent.key) {
      case 'ArrowDown':
        keyboardEvent.preventDefault();
        moveActiveIndex(1);
        break;
      case 'ArrowUp':
        keyboardEvent.preventDefault();
        moveActiveIndex(-1);
        break;
      case 'Enter':
        if (state.isOpen && state.activeIndex >= 0) {
          keyboardEvent.preventDefault();
          selectItem(state.activeIndex);
        }
        break;
      case 'Escape':
        if (state.isOpen) {
          keyboardEvent.preventDefault();
          closeResults({ restoreFocus: true });
        }
        break;
      default:
        break;
    }
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

  elements.list.addEventListener('click', (mouseEvent) => {
    const optionElement = getOptionFromEvent(mouseEvent);

    if (!optionElement) {
      return;
    }

    const optionIndex = Number(optionElement.dataset.index);
    setActiveIndex(optionIndex);
    selectItem(optionIndex);
  });

  elements.list.addEventListener('mousedown', (mouseEvent) => {
    const optionElement = getOptionFromEvent(mouseEvent);

    if (!optionElement) {
      return;
    }

    // Keep focus on the input so the focusout handler does not close the panel before click.
    mouseEvent.preventDefault();
    setActiveIndex(Number(optionElement.dataset.index));
  });

  elements.list.addEventListener('mouseover', (mouseEvent) => {
    const optionElement = getOptionFromEvent(mouseEvent);

    if (!optionElement) {
      return;
    }

    setActiveIndex(Number(optionElement.dataset.index));
  });

  elements.closeTriggers.forEach((closeTriggerElement) => {
    closeTriggerElement.addEventListener('click', () => {
      closeResults();
      elements.input.blur();
    });
  });

  elements.shell.addEventListener('focusout', (focusEvent) => {
    const nextFocusedElement = focusEvent.relatedTarget as Node | null;

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

  document.addEventListener('click', (mouseEvent) => {
    const clickTarget = mouseEvent.target as Node;

    if (!state.isOpen || elements.shell.contains(clickTarget)) {
      return;
    }

    closeResults();
  });

  elements.mobileMediaQuery.addEventListener('change', () => {
    if (!state.isOpen) {
      return;
    }

    if (!elements.mobileMediaQuery.matches) {
      state.currentView = 'results';
    }

    updateOpenState(true);
  });

  setupAddItemFlow({
    elements,
    getState: () => ({
      isOpen: state.isOpen
    }),
    setCurrentView: (view) => {
      state.currentView = view;
    },
    syncPanels: searchView.syncPanels,
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

  searchView.syncClearButtonState();

  renderList();
};