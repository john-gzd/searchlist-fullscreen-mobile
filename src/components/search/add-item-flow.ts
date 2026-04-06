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

interface AddItemFormControls {
  form: HTMLFormElement;
  titleInput: HTMLInputElement;
  artistInput: HTMLInputElement;
  feedback: HTMLElement;
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
  const mobileFormControls: AddItemFormControls = {
    form: elements.addItemMobileForm,
    titleInput: elements.addItemMobileInput,
    artistInput: elements.addItemMobileArtistInput,
    feedback: elements.addItemMobileFeedback
  };

  const dialogFormControls: AddItemFormControls = {
    form: elements.addItemDialogForm,
    titleInput: elements.addItemDialogInput,
    artistInput: elements.addItemDialogArtistInput,
    feedback: elements.addItemDialogFeedback
  };

  const clearFormFeedback = ({ feedback, titleInput, artistInput }: AddItemFormControls): void => {
    clearFeedback(feedback, titleInput, artistInput);
  };

  const resetAddItemForms = (): void => {
    mobileFormControls.form.reset();
    dialogFormControls.form.reset();

    clearFormFeedback(mobileFormControls);
    clearFormFeedback(dialogFormControls);
  };

  const commitNewItem = (
    rawTitle: string,
    rawArtist: string,
    feedbackTarget: HTMLElement,
    titleInput: HTMLInputElement,
    artistInput: HTMLInputElement
  ): boolean => {
    const nextItem = normalizeSearchItem({
      title: rawTitle,
      artist: rawArtist
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
      mobileFormControls.titleInput.value = initialTitle;
      mobileFormControls.artistInput.value = '';
      clearFormFeedback(mobileFormControls);
      mobileFormControls.titleInput.focus();
      return;
    }

    closeResults();
    dialogFormControls.titleInput.value = initialTitle;
    dialogFormControls.artistInput.value = '';
    clearFormFeedback(dialogFormControls);
    elements.addItemDialog.showModal();
    dialogFormControls.titleInput.focus();
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

  elements.addItemMobileForm.addEventListener('submit', (submitEvent) => {
    submitEvent.preventDefault();

    commitNewItem(
      mobileFormControls.titleInput.value,
      mobileFormControls.artistInput.value,
      mobileFormControls.feedback,
      mobileFormControls.titleInput,
      mobileFormControls.artistInput
    );
  });

  elements.addItemDialogForm.addEventListener('submit', (submitEvent) => {
    submitEvent.preventDefault();

    const success = commitNewItem(
      dialogFormControls.titleInput.value,
      dialogFormControls.artistInput.value,
      dialogFormControls.feedback,
      dialogFormControls.titleInput,
      dialogFormControls.artistInput
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