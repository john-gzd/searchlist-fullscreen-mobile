export interface SearchElements {
  shell: HTMLElement;
  form: HTMLFormElement;
  input: HTMLInputElement;
  clearButton: HTMLButtonElement;
  panel: HTMLElement;
  mobileStepPanel: HTMLElement;
  list: HTMLUListElement;
  status: HTMLElement;
  closeTriggers: HTMLElement[];
  addItemAction: HTMLButtonElement;
  addItemBackButton: HTMLButtonElement;
  addItemMobileForm: HTMLFormElement;
  addItemMobileInput: HTMLInputElement;
  addItemMobileArtistInput: HTMLInputElement;
  addItemMobileFeedback: HTMLElement;
  addItemDialog: HTMLDialogElement;
  addItemDialogForm: HTMLFormElement;
  addItemDialogInput: HTMLInputElement;
  addItemDialogArtistInput: HTMLInputElement;
  addItemDialogFeedback: HTMLElement;
  addItemDialogCancel: HTMLButtonElement;
  mobileMediaQuery: MediaQueryList;
}

export const searchStateClasses = {
  open: 'search__shell--open',
  mobileOpen: 'search__shell--mobile-open',
  mobileStepOpen: 'search__shell--mobile-step-open',
  activeOption: 'search__option--active',
  bodyLocked: 'has-search-overlay'
} as const satisfies Record<string, string>;

const requireElement = <ElementType extends Element>(
  selector: string,
  elementName: string
): ElementType => {
  const element = document.querySelector<ElementType>(selector);

  if (!element) {
    throw new Error(`Vereist element ontbreekt: ${elementName} (${selector}).`);
  }

  return element;
};

export const getSearchElements = (): SearchElements => {
  const shell = requireElement<HTMLElement>('#search-shell', 'Search shell');
  const form = requireElement<HTMLFormElement>('#search-form', 'Search form');
  const input = requireElement<HTMLInputElement>('#search-input', 'Search input');
  const clearButton = requireElement<HTMLButtonElement>('#search-clear', 'Search clear button');
  const panel = requireElement<HTMLElement>('#results-panel', 'Results panel');
  const mobileStepPanel = requireElement<HTMLElement>('#add-item-mobile-panel', 'Mobile add-item panel');
  const list = requireElement<HTMLUListElement>('#results', 'Results list');
  const status = requireElement<HTMLElement>('#results-status', 'Results status');
  const addItemAction = requireElement<HTMLButtonElement>('#add-item-action', 'Add-item action button');
  const addItemBackButton = requireElement<HTMLButtonElement>('#add-item-back', 'Add-item back button');
  const addItemMobileForm = requireElement<HTMLFormElement>('#add-item-mobile-form', 'Add-item mobile form');
  const addItemMobileInput = requireElement<HTMLInputElement>('#add-item-mobile-input', 'Add-item mobile title input');
  const addItemMobileArtistInput = requireElement<HTMLInputElement>('#add-item-mobile-artist-input', 'Add-item mobile artist input');
  const addItemMobileFeedback = requireElement<HTMLElement>('#add-item-mobile-feedback', 'Add-item mobile feedback');
  const addItemDialog = requireElement<HTMLDialogElement>('#add-item-dialog', 'Add-item dialog');
  const addItemDialogForm = requireElement<HTMLFormElement>('#add-item-dialog-form', 'Add-item dialog form');
  const addItemDialogInput = requireElement<HTMLInputElement>('#add-item-dialog-input', 'Add-item dialog title input');
  const addItemDialogArtistInput = requireElement<HTMLInputElement>('#add-item-dialog-artist-input', 'Add-item dialog artist input');
  const addItemDialogFeedback = requireElement<HTMLElement>('#add-item-dialog-feedback', 'Add-item dialog feedback');
  const addItemDialogCancel = requireElement<HTMLButtonElement>('#add-item-dialog-cancel', 'Add-item dialog cancel button');
  const closeTriggers = Array.from(
    document.querySelectorAll<HTMLElement>('[data-close-search]')
  );

  return {
    shell,
    form,
    input,
    clearButton,
    panel,
    mobileStepPanel,
    list,
    status,
    closeTriggers,
    addItemAction,
    addItemBackButton,
    addItemMobileForm,
    addItemMobileInput,
    addItemMobileArtistInput,
    addItemMobileFeedback,
    addItemDialog,
    addItemDialogForm,
    addItemDialogInput,
    addItemDialogArtistInput,
    addItemDialogFeedback,
    addItemDialogCancel,
    mobileMediaQuery: window.matchMedia('(max-width: 767px)')
  };
};

export const getOptionElements = (list: HTMLUListElement): HTMLElement[] =>
  Array.from(list.querySelectorAll<HTMLElement>('[role="option"]'));