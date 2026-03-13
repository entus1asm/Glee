// /src/js/index.js (или твой главный entry)

import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

import mixitup from "mixitup";

import Swiper from "swiper/bundle";
import "swiper/css/bundle";

import StarRating from "star-rating.js";
import "star-rating.js/dist/star-rating.css";

import $ from "jquery";
import "ion-rangeslider";
import "ion-rangeslider/css/ion.rangeSlider.min.css";

const fmt2 = (v) => Number(v).toFixed(2);

const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const safeInit = (condition, initFn) => {
  if (!condition) return null;
  try {
    return initFn();
  } catch (e) {
    console.warn("[init skipped/error]", e);
    return null;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // Fancybox
  safeInit(qs("[data-fancybox]"), () =>
    Fancybox.bind("[data-fancybox]", {
      // options
    })
  );

  // Ion.RangeSlider (jQuery plugin)
  safeInit($(".filter-price__input").length, () => {
    $(".filter-price__input").ionRangeSlider({
      type: "double",
      prefix: "$",
      prettify_enabled: true,
      prettify: (num) => fmt2(num),

      onStart: (data) => {
        $(".filter-price__from").text(fmt2(data.from));
        $(".filter-price__to").text(fmt2(data.to));
      },

      onChange: (data) => {
        $(".filter-price__from").text(fmt2(data.from));
        $(".filter-price__to").text(fmt2(data.to));
      },
    });
  });

  // MixItUp
  safeInit(qs(".products__controls"), () =>
    mixitup(".products__controls", {
      selectors: { target: ".product-card" },
      controls: { scope: "local" },
      animation: { duration: 300 },
    })
  );

  safeInit(qs(".designs__controls"), () =>
    mixitup(".designs__controls", {
      selectors: { target: ".design-card" },
      controls: { scope: "local" },
      animation: { duration: 300 },
    })
  );

  // Swiper (hero)
  safeInit(qs(".hero__slider"), () => {
    const heroSlider = new Swiper(".hero__slider", {
      direction: "horizontal",
      slidesPerView: 1,
      effect: "fade",
      fadeEffect: { crossFade: true },
      speed: 800,
      loop: true,
      autoplay: { delay: 4000, disableOnInteraction: false },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
        renderBullet: (index, className) =>
          `<span class="${className}">${index + 1}</span>`,
      },
    });

    return heroSlider;
  });

  // Swiper (product details: thumbs -> main)
  safeInit(
    qs(".product-details__thumbs-swiper") && qs(".product-details__main-swiper"),
    () => {
      const thumbsSelector = ".product-details__thumbs-swiper";
      const mainSelector = ".product-details__main-swiper";

      const getThumbsDir = () =>
        window.matchMedia("(max-width: 768px)").matches
          ? "horizontal"
          : "vertical";

      const thumbsSwiper = new Swiper(thumbsSelector, {
        direction: getThumbsDir(),
        slidesPerView: "auto",
        spaceBetween: 18,
        freeMode: true,
        watchSlidesProgress: true,
        slideToClickedSlide: true,
      });

      const mainSwiper = new Swiper(mainSelector, {
        spaceBetween: 24,
        autoHeight: true,
        thumbs: { swiper: thumbsSwiper },
      });

      window.addEventListener("resize", () => {
        const nextDir = getThumbsDir();
        if (thumbsSwiper.params.direction !== nextDir) {
          thumbsSwiper.changeDirection(nextDir);
        }
      });

      return { thumbsSwiper, mainSwiper };
    }
  );

  // StarRating (инициализируем все селекты на странице)
  safeInit(qsa(".star-rating").length, () => {
    qsa(".star-rating").forEach((el) => {
      new StarRating(el, {
        maxStars: 5,
        clearable: false,
        tooltip: false,
        readOnly: true,
      });
    });
  });

  // Tabs (.tabs__btn / .tabs__panel)
  safeInit(qsa(".tabs").length, () => {
    qsa(".tabs").forEach((root) => {
      const tabs = qsa('.tabs__btn[role="tab"]', root);
      const panels = qsa('.tabs__panel[role="tabpanel"]', root);
      if (!tabs.length || !panels.length) return;

      const activate = (nextTab, focus = false) => {
        tabs.forEach((t) => {
          const isActive = t === nextTab;
          t.classList.toggle("tabs__btn--active", isActive);
          t.setAttribute("aria-selected", String(isActive));
          t.tabIndex = isActive ? 0 : -1;
        });

        panels.forEach((p) => {
          const isActive = p.id === nextTab.getAttribute("aria-controls");
          p.classList.toggle("tabs__panel--active", isActive);
          p.hidden = !isActive;
        });

        if (focus) nextTab.focus();
      };

      tabs.forEach((tab) => {
        tab.addEventListener("click", () => activate(tab));
        tab.addEventListener("keydown", (e) => {
          const i = tabs.indexOf(tab);
          if (e.key === "ArrowRight") {
            e.preventDefault();
            activate(tabs[(i + 1) % tabs.length], true);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            activate(tabs[(i - 1 + tabs.length) % tabs.length], true);
          }
        });
      });

      const initiallyActive =
        tabs.find((t) => t.classList.contains("tabs__btn--active")) || tabs[0];
      activate(initiallyActive);
    });
  });

  // Mobile nav
  safeInit(qs(".header__menu-btn") && qs(".mobile-nav"), () => {
    const menuBtn = qs(".header__menu-btn");
    const mobileNav = qs(".mobile-nav");
    const closeBtn = qs(".mobile-nav__close", mobileNav);
    const overlay = qs(".mobile-nav__overlay", mobileNav);
    const links = qsa(".mobile-nav__link", mobileNav);

    const toggleMobileNav = (isOpen) => {
      mobileNav.classList.toggle("mobile-nav--open", isOpen);
      document.body.classList.toggle("no-scroll", isOpen);
      menuBtn.setAttribute("aria-expanded", String(isOpen));
      mobileNav.setAttribute("aria-hidden", String(!isOpen));
    };

    menuBtn.addEventListener("click", () => {
      const isOpen = mobileNav.classList.contains("mobile-nav--open");
      toggleMobileNav(!isOpen);
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        toggleMobileNav(false);
      });
    }

    if (overlay) {
      overlay.addEventListener("click", () => {
        toggleMobileNav(false);
      });
    }

    links.forEach((link) => {
      link.addEventListener("click", () => {
        toggleMobileNav(false);
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        toggleMobileNav(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 992) {
        toggleMobileNav(false);
      }
    });
  });

  // Quantity (.qty__btn--plus / .qty__btn--minus)
  safeInit(qsa(".qty").length, () => {
    qsa(".qty").forEach((wrap) => {
      const input = qs(".qty__input", wrap);
      const minus = qs(".qty__btn--minus", wrap);
      const plus = qs(".qty__btn--plus", wrap);
      if (!input || !minus || !plus) return;

      const min = Number(input.getAttribute("min")) || 1;

      const setVal = (v) => {
        const n = Number(v);
        const safe = Number.isFinite(n) ? Math.max(min, Math.floor(n)) : min;
        input.value = String(safe);
        input.dispatchEvent(new Event("change", { bubbles: true }));
      };

      minus.addEventListener("click", () =>
        setVal(Number(input.value || min) - 1)
      );
      plus.addEventListener("click", () =>
        setVal(Number(input.value || min) + 1)
      );

      input.addEventListener("input", () => {
        if (input.value === "") return;
        input.value = input.value.replace(/[^0-9]/g, "");
      });

      input.addEventListener("blur", () => setVal(input.value));
    });
  });
});

// Zoom follow cursor for product image
safeInit(qsa(".product-details__main").length, () => {
  qsa(".product-details__main").forEach((box) => {
    const img = qs("img", box);
    if (!img) return;

    const onMove = (e) => {
      const r = box.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      box.style.setProperty("--zoom-x", `${x}%`);
      box.style.setProperty("--zoom-y", `${y}%`);
    };

    box.addEventListener("mouseenter", () => box.classList.add("is-zoom"));
    box.addEventListener("mouseleave", () => box.classList.remove("is-zoom"));
    box.addEventListener("mousemove", onMove);
  });
});

// Related products slider
safeInit(qs(".related-products__slider"), () => {
  const slider = new Swiper(".related-products__slider", {
    slidesPerView: 4,
    spaceBetween: 30,
    speed: 600,

    navigation: {
      nextEl: ".related-products__btn--next",
      prevEl: ".related-products__btn--prev",
    },

    breakpoints: {
      0: { slidesPerView: 1, spaceBetween: 14 },
      520: { slidesPerView: 2, spaceBetween: 16 },
      900: { slidesPerView: 3, spaceBetween: 24 },
      1200: { slidesPerView: 4, spaceBetween: 30 },
    },
  });

  return slider;
});