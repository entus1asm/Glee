import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import mixitup from "mixitup";
import Swiper from "swiper/bundle";
import "swiper/css/bundle";
import $ from 'jquery';
import 'ion-rangeslider';
import 'ion-rangeslider/css/ion.rangeSlider.min.css';


Fancybox.bind('[data-fancybox]', {
	// Your custom options
});

// // Мобильная навигация
// import mobileNav from './modules/mobile-nav.js';
// mobileNav();

const fmt2 = (v) => Number(v).toFixed(2);

$('.filter-price__input').ionRangeSlider({
  type: 'double',
  prefix: '$',
  prettify_enabled: true,
  prettify: (num) => fmt2(num),

  onStart: (data) => {
    $('.filter-price__from').text(fmt2(data.from));
    $('.filter-price__to').text(fmt2(data.to));
  },

  onChange: (data) => {
    $('.filter-price__from').text(fmt2(data.from));
    $('.filter-price__to').text(fmt2(data.to));
  },
});

mixitup('.products__controls', {
  selectors: {
    target: '.product-card'
  },
  controls: {
    scope: 'local'
  },
  animation: {
    duration: 300
  }
});

mixitup('.designs__controls', {
  selectors: {
    target: '.design-card'
  },
  controls: {
    scope: 'local'
  },
  animation: {
    duration: 300
  }
});



//////////////////////////////////////// SWIPER JS ////////////////////////////////////////



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
