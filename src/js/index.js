// Галерея и лайтбоксы от Fancybox
import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

Fancybox.bind('[data-fancybox]', {
	// Your custom options
});

// // Мобильная навигация
// import mobileNav from './modules/mobile-nav.js';
// mobileNav();

import mixitup from 'mixitup';

const mixer = mixitup('.products__grid', {
  selectors: {
    target: '.product-card',
  },
  animation: {
    duration: 300,
  },
});


//////////////////////////////////////// SWIPER JS ////////////////////////////////////////

import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';

const heroSlider = new Swiper('.hero__slider', {
  direction: 'horizontal',
  slidesPerView: 1,
  effect: 'fade',
  fadeEffect: {
    crossFade: true,
  },
  speed: 800,
  loop: true,

  autoplay: {
    delay: 4000,
    disableOnInteraction: false,
  },

  pagination: {
    el: '.swiper-pagination',
    clickable: true,
    renderBullet: function (index, className) {
      return `<span class="${className}">${index + 1}</span>`;
    },
  },

  // navigation: {
  //   nextEl: '.slider__btn--next',
  //   prevEl: '.slider__btn--prev',
  // },

  // scrollbar: {
  //   el: '.swiper-scrollbar',
  // },
});
