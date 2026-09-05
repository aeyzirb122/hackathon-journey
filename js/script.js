// Interactive timeline: accessible tab pattern (WAI-ARIA APG).
// Mouse click AND arrow-key/Home/End keyboard navigation both work;
// only one panel is visible/rendered at a time so screen readers and
// sighted users see the same thing.
(function () {
  const timeline = document.querySelector('[data-timeline]');
  if (!timeline) return;

  const tabs = Array.from(timeline.querySelectorAll('[role="tab"]'));
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));

  function selectTab(newIndex) {
    tabs.forEach((tab, i) => {
      const selected = i === newIndex;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    });
    tabs[newIndex].focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(index));

    tab.addEventListener('keydown', (event) => {
      let newIndex = null;
      if (event.key === 'ArrowRight') newIndex = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') newIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') newIndex = 0;
      else if (event.key === 'End') newIndex = tabs.length - 1;

      if (newIndex !== null) {
        event.preventDefault();
        selectTab(newIndex);
      }
    });
  });
})();
