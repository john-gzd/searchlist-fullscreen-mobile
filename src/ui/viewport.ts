export const syncViewportHeight = (): void => {
  const visualViewport = window.visualViewport;
  const viewportHeight = visualViewport?.height ?? window.innerHeight;
  const viewportOffsetTop = visualViewport?.offsetTop ?? 0;

  document.documentElement.style.setProperty(
    '--visual-viewport-height',
    `${Math.round(viewportHeight)}px`
  );

  document.documentElement.style.setProperty(
    '--visual-viewport-offset-top',
    `${Math.round(viewportOffsetTop)}px`
  );
};

export const registerViewportSync = (): void => {
  syncViewportHeight();

  window.visualViewport?.addEventListener('resize', syncViewportHeight);
  window.visualViewport?.addEventListener('scroll', syncViewportHeight);
  window.addEventListener('resize', syncViewportHeight);
};