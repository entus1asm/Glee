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

  // Swiper
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
});
