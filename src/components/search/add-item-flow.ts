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

const associateFeedbackWithInput = (
  input: HTMLInputElement,
  feedbackElementId: string
): void => {
  const describedBy = input.getAttribute('aria-describedby') ?? '';
  const describedByIds = describedBy
    .split(/\s+/)
    .filter((id) => id.length > 0 && id !== feedbackElementId);

  describedByIds.push(feedbackElementId);
  input.setAttribute('aria-describedby', describedByIds.join(' '));
};

const removeFeedbackAssociationFromInput = (
  input: HTMLInputElement,
  feedbackElementId: string
): void => {
  const describedBy = input.getAttribute('aria-describedby') ?? '';
  const describedByIds = describedBy
    .split(/\s+/)
    .filter((id) => id.length > 0 && id !== feedbackElementId);

  if (describedByIds.length === 0) {
    input.removeAttribute('aria-describedby');
    return;
  }

  input.setAttribute('aria-describedby', describedByIds.join(' '));
};

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
    associateFeedbackWithInput(input, target.id);
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
    removeFeedbackAssociationFromInput(input, target.id);
  });
};

const clearCustomValidity = (...inputs: HTMLInputElement[]): void => {
  inputs.forEach((input) => {
    input.setCustomValidity('');
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
    clearCustomValidity(titleInput, artistInput);
    clearFeedback(feedback, titleInput, artistInput);
  };

  const bindValidationReset = ({
    titleInput,
    artistInput,
    feedback
  }: AddItemFormControls): void => {
    const handleInput = (): void => {
      clearCustomValidity(titleInput, artistInput);

      if (!feedback.classList.contains('visually-hidden')) {
        clearFeedback(feedback, titleInput, artistInput);
      }
    };

    titleInput.addEventListener('input', handleInput);
    artistInput.addEventListener('input', handleInput);
  };

  const resetAddItemForms = (): void => {
    mobileFormControls.form.reset();
    dialogFormControls.form.reset();

    clearFormFeedback(mobileFormControls);
    clearFormFeedback(dialogFormControls);
  };

  const commitNewItem = (
    { form, titleInput, artistInput, feedback }: AddItemFormControls
  ): boolean => {
    clearCustomValidity(titleInput, artistInput);
    clearFeedback(feedback, titleInput, artistInput);

    if (!form.reportValidity()) {
      return false;
    }

    const rawTitle = titleInput.value;
    const rawArtist = artistInput.value;
    const nextItem = normalizeSearchItem({
      title: rawTitle,
      artist: rawArtist
    });

    if (hasItemWithArtist(getItems(), nextItem)) {
      const duplicateMessage = 'Dit nummer met deze artiest staat al in de lijst.';

      titleInput.setCustomValidity(duplicateMessage);
      artistInput.setCustomValidity(duplicateMessage);
      showFeedback(
        feedback,
        duplicateMessage,
        titleInput,
        artistInput
      );

      form.reportValidity();
      return false;
    }

    clearFeedback(feedback, titleInput, artistInput);

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

  const closeAddItemFlowFromKeyboard = (): void => {
    closeResults();
    focusSearchInput();
  };

  elements.addItemAction.addEventListener('click', () => {
    openAddItemStep();
  });

  elements.addItemBackButton.addEventListener('click', () => {
    showResultsStep({ focusInput: true });
  });

  elements.addItemMobileForm.addEventListener('submit', (submitEvent) => {
    submitEvent.preventDefault();

    commitNewItem(mobileFormControls);
  });

  elements.addItemDialogForm.addEventListener('submit', (submitEvent) => {
    submitEvent.preventDefault();

    const success = commitNewItem(dialogFormControls);

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

  elements.mobileStepPanel.addEventListener('keydown', (keyboardEvent) => {
    if (keyboardEvent.key !== 'Escape') {
      return;
    }

    keyboardEvent.preventDefault();
    closeAddItemFlowFromKeyboard();
  });

  elements.addItemDialog.addEventListener('keydown', (keyboardEvent) => {
    if (keyboardEvent.key !== 'Escape') {
      return;
    }

    keyboardEvent.preventDefault();
    elements.addItemDialog.close();
  });

  bindValidationReset(mobileFormControls);
  bindValidationReset(dialogFormControls);

  const currentState = getState();
  if (!currentState.isOpen) {
    resetAddItemForms();
  }
};