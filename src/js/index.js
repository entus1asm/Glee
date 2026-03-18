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

  // Product list one mobile filters
  safeInit(qs(".product-list-one"), () => {
    const productList = qs(".product-list-one");
    const sidebar = qs(".product-list-one__sidebar", productList);
    const content = qs(".product-list-one__content", productList);

    if (!sidebar || !content) return;

    let overlay = qs(".product-list-one__overlay", productList);
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "product-list-one__overlay";
      productList.prepend(overlay);
    }

    let toolbar = qs(".product-list-one__toolbar", content);
    if (!toolbar) {
      toolbar = document.createElement("div");
      toolbar.className = "product-list-one__toolbar";
      toolbar.innerHTML = `
        <button class="product-list-one__filters-btn" type="button" aria-expanded="false" aria-label="Open filters">
          Filters
        </button>
      `;
      content.prepend(toolbar);
    }

    let sidebarTop = qs(".product-list-one__sidebar-top", sidebar);
    if (!sidebarTop) {
      sidebarTop = document.createElement("div");
      sidebarTop.className = "product-list-one__sidebar-top";
      sidebarTop.innerHTML = `
        <span class="product-list-one__sidebar-name">Filters</span>
        <button class="product-list-one__sidebar-close" type="button" aria-label="Close filters">×</button>
      `;
      sidebar.prepend(sidebarTop);
    }

    qsa(".filter-block", sidebar).forEach((block) => {
      const title = qs(".filter-block__title", block);
      if (!title) return;

      if (title.textContent.trim().toLowerCase() === "recent products") {
        block.classList.add("filter-block--recent");
      }
    });

    const openBtn = qs(".product-list-one__filters-btn", content);
    const closeBtn = qs(".product-list-one__sidebar-close", sidebar);

    const toggleFilters = (isOpen) => {
      const shouldOpen = window.innerWidth <= 992 ? isOpen : false;

      sidebar.classList.toggle("is-open", shouldOpen);
      overlay.classList.toggle("is-active", shouldOpen);
      document.body.classList.toggle("no-scroll", shouldOpen);
      sidebar.setAttribute("aria-hidden", String(!shouldOpen));

      if (openBtn) {
        openBtn.setAttribute("aria-expanded", String(shouldOpen));
      }
    };

    toggleFilters(false);

    if (openBtn) {
      openBtn.addEventListener("click", () => {
        toggleFilters(true);
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        toggleFilters(false);
      });
    }

    overlay.addEventListener("click", () => {
      toggleFilters(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sidebar.classList.contains("is-open")) {
        toggleFilters(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 992) {
        toggleFilters(false);
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

function initializeProjectEnhancements() {
  const activeMap = {
    home: ["index.html"],
    about: ["about-us.html"],
    shop: ["product-list-one.html"],
    "product-details": ["product-list-one.html"],
    blog: ["blog-page.html"],
    "blog-details": ["blog-page.html"],
    contact: ["contact-info.html"],
    login: ["login.html"],
    terms: ["terms.html", "login.html"],
    docs: ["docs.html"],
  };

  const getFocusables = (root) =>
    qsa(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      root
    ).filter((el) => el.offsetParent !== null);

  const setLinkActiveState = () => {
    const pageKey = document.body.dataset.page || "";
    const activeHrefs = activeMap[pageKey] || [];

    qsa(".nav__link, .mobile-nav__link, .footer__link, .footer__menu-link").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;

      const isActive = activeHrefs.includes(href);
      link.classList.toggle("is-active", isActive);

      if (isActive && link.matches(".nav__link, .mobile-nav__link, .footer__menu-link")) {
        link.setAttribute("aria-current", "page");
      } else if (link.getAttribute("aria-current") === "page") {
        link.removeAttribute("aria-current");
      }
    });
  };

  const improvePlaceholderLinks = () => {
    qsa('a[href="#"]').forEach((link) => {
      link.classList.add("is-placeholder-link");
      link.setAttribute("aria-disabled", "true");
      link.addEventListener("click", (e) => e.preventDefault());
    });
  };

  const enhanceForms = () => {
    const forms = qsa(".footer__form, .login__form, .blog-details__form");

    const getStatusNode = (form) => {
      let node = qs(".form-status", form);
      if (!node) {
        node = document.createElement("div");
        node.className = "form-status";
        node.setAttribute("role", "status");
        node.setAttribute("aria-live", "polite");
        form.append(node);
      }
      return node;
    };

    const getSuccessMessage = (form) => {
      if (form.classList.contains("login__form")) {
        return "Demo validation passed. Connect backend authentication when ready.";
      }

      if (form.classList.contains("footer__form")) {
        return "Demo subscription form passed validation. Connect backend storage when ready.";
      }

      return "Demo form passed validation. Connect backend handling when ready.";
    };

    const getErrorMessage = (field) => {
      if (field.validity.valueMissing) return "Please fill out this field.";
      if (field.validity.typeMismatch) return "Please enter a valid email address.";
      if (field.validity.tooShort) return `Please enter at least ${field.minLength} characters.`;
      return "Please check this field.";
    };

    const setFieldState = (field, invalid) => {
      field.classList.toggle("is-invalid", invalid);
      field.setAttribute("aria-invalid", String(invalid));
    };

    forms.forEach((form) => {
      form.noValidate = true;
      const fields = qsa("input, textarea, select", form);
      const status = getStatusNode(form);

      fields.forEach((field) => {
        field.addEventListener("input", () => {
          if (field.validity.valid) {
            setFieldState(field, false);
            if (status.classList.contains("form-status--error")) {
              status.textContent = "";
              status.className = "form-status";
            }
          }
        });

        field.addEventListener("blur", () => {
          setFieldState(field, !field.validity.valid);
        });
      });

      form.addEventListener("submit", (e) => {
        e.preventDefault();

        let firstInvalid = null;
        fields.forEach((field) => {
          const invalid = !field.validity.valid;
          setFieldState(field, invalid);
          if (!firstInvalid && invalid) firstInvalid = field;
        });

        if (firstInvalid) {
          status.className = "form-status form-status--error";
          status.textContent = getErrorMessage(firstInvalid);
          firstInvalid.focus();
          return;
        }

        status.className = "form-status form-status--success";
        status.textContent = getSuccessMessage(form);

        if (!form.classList.contains("login__form")) {
          form.reset();
          fields.forEach((field) => setFieldState(field, false));
        }
      });
    });
  };

  const enhanceMobileNav = () => {
    const nav = qs(".mobile-nav");
    const panel = qs(".mobile-nav__panel", nav);
    const menuBtn = qs(".header__menu-btn");
    const closeBtn = qs(".mobile-nav__close", nav);

    if (!nav || !panel || !menuBtn || !closeBtn) return;

    let lastFocused = menuBtn;

    const syncState = () => {
      const isOpen = nav.classList.contains("mobile-nav--open");
      menuBtn.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");

      if (isOpen) {
        lastFocused = document.activeElement || menuBtn;
        requestAnimationFrame(() => closeBtn.focus());
      }
    };

    const observer = new MutationObserver(syncState);
    observer.observe(nav, { attributes: true, attributeFilter: ["class"] });
    syncState();

    document.addEventListener("keydown", (e) => {
      if (!nav.classList.contains("mobile-nav--open") || e.key !== "Tab") return;

      const focusables = getFocusables(panel);
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    [closeBtn, ...qsa(".mobile-nav__link", nav)].forEach((el) => {
      el.addEventListener("click", () => {
        requestAnimationFrame(() => lastFocused.focus());
      });
    });
  };

  setLinkActiveState();
  improvePlaceholderLinks();
  enhanceForms();
  enhanceMobileNav();
}

document.addEventListener("DOMContentLoaded", initializeProjectEnhancements);
