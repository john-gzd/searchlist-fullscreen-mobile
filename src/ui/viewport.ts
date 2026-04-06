export const syncViewportHeight = (): void => {
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;

  document.documentElement.style.setProperty(
    '--visual-viewport-height',
    `${Math.round(viewportHeight)}px`
  );
};

export const registerViewportSync = (): void => {
  syncViewportHeight();

  window.visualViewport?.addEventListener('resize', syncViewportHeight);
  window.visualViewport?.addEventListener('scroll', syncViewportHeight);
  window.addEventListener('resize', syncViewportHeight);
};