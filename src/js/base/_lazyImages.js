const getImgsLazy = function () {
  const imgsLazy = document.querySelector(`[loading="lazy"]`);
  if (!imgsLazy) return;
  const lazyLoadInstance = new LazyLoad({
    container: document.querySelector("body"),
    elements_selector: `[loading="lazy"]`,
  });
  lazyLoadInstance.update();
};

getImgsLazy();
