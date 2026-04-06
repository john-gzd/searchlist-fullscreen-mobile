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

export const getSearchElements = (): SearchElements => {
  const shell = document.querySelector<HTMLElement>('#search-shell');
  const form = document.querySelector<HTMLFormElement>('#search-form');
  const input = document.querySelector<HTMLInputElement>('#search-input');
  const clearButton = document.querySelector<HTMLButtonElement>('#search-clear');
  const panel = document.querySelector<HTMLElement>('#results-panel');
  const mobileStepPanel = document.querySelector<HTMLElement>('#add-item-mobile-panel');
  const list = document.querySelector<HTMLUListElement>('#results');
  const status = document.querySelector<HTMLElement>('#results-status');
  const addItemAction = document.querySelector<HTMLButtonElement>('#add-item-action');
  const addItemBackButton = document.querySelector<HTMLButtonElement>('#add-item-back');
  const addItemMobileForm = document.querySelector<HTMLFormElement>('#add-item-mobile-form');
  const addItemMobileInput = document.querySelector<HTMLInputElement>('#add-item-mobile-input');
  const addItemMobileArtistInput = document.querySelector<HTMLInputElement>('#add-item-mobile-artist-input');
  const addItemMobileFeedback = document.querySelector<HTMLElement>('#add-item-mobile-feedback');
  const addItemDialog = document.querySelector<HTMLDialogElement>('#add-item-dialog');
  const addItemDialogForm = document.querySelector<HTMLFormElement>('#add-item-dialog-form');
  const addItemDialogInput = document.querySelector<HTMLInputElement>('#add-item-dialog-input');
  const addItemDialogArtistInput = document.querySelector<HTMLInputElement>('#add-item-dialog-artist-input');
  const addItemDialogFeedback = document.querySelector<HTMLElement>('#add-item-dialog-feedback');
  const addItemDialogCancel = document.querySelector<HTMLButtonElement>('#add-item-dialog-cancel');
  const closeTriggers = Array.from(
    document.querySelectorAll<HTMLElement>('[data-close-search]')
  );

  if (
    !shell ||
    !form ||
    !input ||
    !clearButton ||
    !panel ||
    !mobileStepPanel ||
    !list ||
    !status ||
    !addItemAction ||
    !addItemBackButton ||
    !addItemMobileForm ||
    !addItemMobileInput ||
    !addItemMobileArtistInput ||
    !addItemMobileFeedback ||
    !addItemDialog ||
    !addItemDialogForm ||
    !addItemDialogInput ||
    !addItemDialogArtistInput ||
    !addItemDialogFeedback ||
    !addItemDialogCancel
  ) {
    throw new Error('Vereiste elementen zijn niet gevonden in de DOM.');
  }

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