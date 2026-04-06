import {
  hasItemWithArtist,
  normalizeItemName,
  normalizeSearchItem
} from '../../business/search-service';
import type { SearchItem } from '../../data/search-item';
import type { SearchElements } from '../../ui/search-dom';

interface AddItemFlowState {
  isOpen: boolean;
}

interface AddItemFlowDependencies {
  elements: SearchElements;
  getState: () => AddItemFlowState;
  setCurrentView: (view: 'results' | 'add-item') => void;
  syncPanels: () => void;
  openResults: () => void;
  closeResults: () => void;
  focusSearchInput: () => void;
  getItems: () => SearchItem[];
  setItems: (items: SearchItem[]) => void;
  renderList: (query?: string) => void;
}

const invalidInputClassName = 'search__input--invalid';

const showFeedback = (
  target: HTMLElement,
  message: string,
  ...inputs: HTMLInputElement[]
): void => {
  target.textContent = message;
  target.classList.remove('visually-hidden');

  inputs.forEach((input) => {
    input.classList.add(invalidInputClassName);
    input.setAttribute('aria-invalid', 'true');
  });
};

const clearFeedback = (
  target: HTMLElement,
  ...inputs: HTMLInputElement[]
): void => {
  target.textContent = '';
  target.classList.add('visually-hidden');

  inputs.forEach((input) => {
    input.classList.remove(invalidInputClassName);
    input.removeAttribute('aria-invalid');
  });
};

export const setupAddItemFlow = ({
  elements,
  getState,
  setCurrentView,
  syncPanels,
  openResults,
  closeResults,
  focusSearchInput,
  getItems,
  setItems,
  renderList
}: AddItemFlowDependencies): void => {
  const resetAddItemForms = (): void => {
    elements.addItemMobileForm.reset();
    elements.addItemDialogForm.reset();

    clearFeedback(
      elements.addItemMobileFeedback,
      elements.addItemMobileInput,
      elements.addItemMobileArtistInput
    );
    clearFeedback(
      elements.addItemDialogFeedback,
      elements.addItemDialogInput,
      elements.addItemDialogArtistInput
    );
  };

  const commitNewItem = (
    rawTitle: string,
    rawArtist: string,
    feedbackTarget: HTMLElement,
    titleInput: HTMLInputElement,
    artistInput: HTMLInputElement
  ): boolean => {
    const nextItem = normalizeSearchItem({
      title: normalizeItemName(rawTitle),
      artist: normalizeItemName(rawArtist)
    });

    if (!nextItem.title || !nextItem.artist) {
      showFeedback(
        feedbackTarget,
        'Vul zowel een titel als artiest in.',
        titleInput,
        artistInput
      );
      return false;
    }

    if (hasItemWithArtist(getItems(), nextItem)) {
      showFeedback(
        feedbackTarget,
        'Dit nummer met deze artiest staat al in de lijst.',
        titleInput,
        artistInput
      );
      return false;
    }

    clearFeedback(feedbackTarget, titleInput, artistInput);

    setItems([...getItems(), nextItem]);
    elements.input.value = nextItem.title;
    renderList(nextItem.title);
    openResults();
    setCurrentView('results');
    syncPanels();

    return true;
  };

  const openAddItemStep = (): void => {
    const initialTitle = normalizeItemName(elements.input.value);

    if (elements.mobileMediaQuery.matches) {
      setCurrentView('add-item');
      syncPanels();
      elements.addItemMobileInput.value = initialTitle;
      elements.addItemMobileArtistInput.value = '';
      clearFeedback(
        elements.addItemMobileFeedback,
        elements.addItemMobileInput,
        elements.addItemMobileArtistInput
      );
      elements.addItemMobileInput.focus();
      return;
    }

    closeResults();
    elements.addItemDialogInput.value = initialTitle;
    elements.addItemDialogArtistInput.value = '';
    clearFeedback(
      elements.addItemDialogFeedback,
      elements.addItemDialogInput,
      elements.addItemDialogArtistInput
    );
    elements.addItemDialog.showModal();
    elements.addItemDialogInput.focus();
  };

  const showResultsStep = ({ focusInput = false } = {}): void => {
    setCurrentView('results');
    syncPanels();

    if (focusInput) {
      focusSearchInput();
    }
  };

  elements.addItemAction.addEventListener('click', () => {
    openAddItemStep();
  });

  elements.addItemBackButton.addEventListener('click', () => {
    showResultsStep({ focusInput: true });
  });

  elements.addItemMobileForm.addEventListener('submit', (event) => {
    event.preventDefault();

    commitNewItem(
      elements.addItemMobileInput.value,
      elements.addItemMobileArtistInput.value,
      elements.addItemMobileFeedback,
      elements.addItemMobileInput,
      elements.addItemMobileArtistInput
    );
  });

  elements.addItemDialogForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const success = commitNewItem(
      elements.addItemDialogInput.value,
      elements.addItemDialogArtistInput.value,
      elements.addItemDialogFeedback,
      elements.addItemDialogInput,
      elements.addItemDialogArtistInput
    );

    if (success) {
      elements.addItemDialog.close();
    }
  });

  elements.addItemDialogCancel.addEventListener('click', () => {
    elements.addItemDialog.close();
    focusSearchInput();
  });

  elements.addItemDialog.addEventListener('close', () => {
    focusSearchInput();
  });

  const currentState = getState();
  if (!currentState.isOpen) {
    resetAddItemForms();
  }
};