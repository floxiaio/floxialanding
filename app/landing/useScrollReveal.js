import { useEffect } from 'react';

// Progressive enhancement: content remains visible if motion is unavailable.
export function useScrollReveal(pageRef) {
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    const elements = [...page.querySelectorAll('[data-reveal]')];
    const replayElements = elements.filter((element) => element.matches('.chapter-media, [data-reveal="step"]'));
    const onceElements = elements.filter((element) => !replayElements.includes(element));
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer;
    let resizeObserver;
    let frame = 0;
    let motionEnabled = false;
    let needsMeasurement = true;
    let replayGeometry = [];

    // Layout offsets exclude our transforms. Reading the moving bounding box
    // would feed the animation back into its own scroll progress.
    const layoutTop = (element) => {
      let top = 0;
      for (let node = element; node; node = node.offsetParent) top += node.offsetTop;
      return top;
    };

    const updateReplays = () => {
      frame = 0;
      if (!motionEnabled) return;
      if (needsMeasurement) {
        replayGeometry = replayElements.map((element) => ({
          element,
          top: layoutTop(element),
          height: element.offsetHeight,
        }));
        needsMeasurement = false;
      }

      const viewport = window.innerHeight;
      const scroll = window.scrollY;
      replayGeometry.forEach(({ element, top, height }) => {
        const position = top - scroll;
        const bottom = position + height;
        const isScene = element.matches('.chapter-media');
        const focused = element.contains(document.activeElement);
        const outside = position > viewport + 80 || bottom < -80;
        // Hold fully hidden until it is well inside the screen, then let the
        // timed CSS entrance finish even if scrolling stops at the threshold.
        const reachedEntry = position >= 0
          ? position <= viewport * (isScene ? .68 : .80)
          : bottom >= viewport * .24;

        if (focused || (!outside && reachedEntry)) {
          element.dataset.revealState = 'entered';
          element.classList.add('is-revealed');
        } else if (outside) {
          element.dataset.revealState = 'armed';
          element.classList.remove('is-revealed');
          element.style.setProperty('--reveal-y', `${bottom < 0 ? -64 : isScene ? 124 : 46}px`);
        }
      });
    };

    const scheduleUpdate = () => {
      if (motionEnabled && !frame) frame = window.requestAnimationFrame(updateReplays);
    };

    const refreshGeometry = () => {
      needsMeasurement = true;
      scheduleUpdate();
    };

    const reveal = (element) => {
      element.dataset.revealState = 'visible';
      element.classList.add('is-revealed');
      observer?.unobserve(element);
    };

    const setup = () => {
      observer?.disconnect();
      resizeObserver?.disconnect();
      window.cancelAnimationFrame(frame);
      frame = 0;
      motionEnabled = !preference.matches;
      if (!motionEnabled) {
        elements.forEach(reveal);
        return;
      }

      replayElements.forEach((element) => {
        element.dataset.revealState = 'armed';
        element.classList.remove('is-revealed');
        element.style.setProperty('--reveal-y', element.matches('.chapter-media') ? '124px' : '46px');
        element.style.setProperty('--reveal-scale', element.matches('.chapter-media') ? '.88' : '1');
      });
      needsMeasurement = true;
      updateReplays();

      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) reveal(entry.target);
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });

        onceElements.forEach((element) => {
          if (element.dataset.revealState === 'visible') return;
          element.dataset.revealState = 'pending';
          observer.observe(element);
        });
      } else {
        onceElements.forEach(reveal);
      }

      if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(refreshGeometry);
        resizeObserver.observe(page);
        replayElements.forEach((element) => {
          resizeObserver.observe(element);
          resizeObserver.observe(element.parentElement);
        });
      }
    };

    const revealFocused = (event) => {
      const element = event.target.closest('[data-reveal]');
      if (element && replayElements.includes(element) && motionEnabled) scheduleUpdate();
      else if (element) reveal(element);
    };

    setup();
    preference.addEventListener('change', setup);
    page.addEventListener('focusin', revealFocused);
    page.addEventListener('focusout', scheduleUpdate);
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', refreshGeometry);
    window.addEventListener('pageshow', refreshGeometry);
    return () => {
      motionEnabled = false;
      observer?.disconnect();
      resizeObserver?.disconnect();
      window.cancelAnimationFrame(frame);
      preference.removeEventListener('change', setup);
      page.removeEventListener('focusin', revealFocused);
      page.removeEventListener('focusout', scheduleUpdate);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', refreshGeometry);
      window.removeEventListener('pageshow', refreshGeometry);
      elements.forEach((element) => {
        delete element.dataset.revealState;
        element.classList.remove('is-revealed');
        ['--reveal-y', '--reveal-scale'].forEach((property) => element.style.removeProperty(property));
      });
    };
  }, [pageRef]);
}
