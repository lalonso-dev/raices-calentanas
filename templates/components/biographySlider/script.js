import "./style.scss";

const biographySlider = document.querySelector(".biographySlider__slider");

if (biographySlider) {
  const slider = new Swiper(biographySlider, {
    slidesPerView: 1,
    spaceBetween: 30,
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
    },
  });
}
