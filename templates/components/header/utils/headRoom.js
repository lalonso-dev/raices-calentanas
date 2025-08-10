import Headroom from "headroom.js";

let headroom;
const header = document.querySelector("header");
const headerSpacer = document.querySelectorAll(".header-spacing-top");

const setHeaderSpacerHeight = function (height) {
  //document.documentElement.style.setProperty("--header-spacing", `${height}px`);
  headerSpacer.forEach((i) => {
    i.style.height = `${height}px`;
  });
};

const init_Headroom = () => {
  try {
    if (!header) return;

    headroom = new Headroom(header, {
      offset: 120,
      onTop: function () {
        setHeaderSpacerHeight(header.offsetHeight);
      },
      onNotTop: function () {
        setHeaderSpacerHeight(header.offsetHeight);
      },
    });
    headroom.init();
  } catch (exc) {
    console.warn(`Exception in headroom => ${exc}`);
  }
};

init_Headroom();

window.onload = () => {
  setHeaderSpacerHeight(header.offsetHeight);
};
window.onresize = () => {
  setHeaderSpacerHeight(header.offsetHeight);
};
const timeout = function (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const sideBar = document.querySelector("#sideBar");

if (sideBar) {
  const siderSpace = sideBar.querySelector(".spacing__sidebar");
  if (siderSpace) {
    siderSpace.style.height = `${header.offsetHeight}px`;
  }

  const eventNavbar = async (event, element) => {
    try {
      event.preventDefault();

      const { state } = element.dataset;
      const { search } = document.body.dataset;

      if (!state) return;
      if (state === "true") {
        element.dataset.state = "false";
        element.classList.remove("is-active");

        sideBar.classList.remove("v-show");
        sideBar.classList.add("v-hidden");

        if (search !== "true") {
          document.body.removeAttribute("data-body");
        }

        document.body.removeAttribute("data-side-bar");

        await timeout(300);

        sideBar.classList.remove("v-hidden");
        sideBar.classList.add("d-none");
        headroom.unfreeze();
      } else {
        document.body.setAttribute("data-body", "hidden");
        document.body.setAttribute("data-side-bar", true);
        headroom.freeze();
        sideBar.classList.remove("d-none", "v-hidden");
        sideBar.classList.add("v-show");
        element.classList.add("is-active", "d-block");
        element.dataset.state = "true";
      }
    } catch (Exception) {
      console.warn("Exception in  => eventNavbar " + Exception);
    }
  };
  sideBar.addEventListener("click", function (event) {
    const sideBarBody = document.querySelector(".sideBar__body");
    const sideBarBottom = document.querySelector(".sideBar__bottom");
    if (event.target.closest("a")) return;
    if (
      (sideBarBody && sideBarBody.contains(event.target)) ||
      (sideBarBottom && sideBarBottom.contains(event.target))
    ) {
      return;
    }
    if (sideBar.classList.contains("v-show")) {
      const hamburgerButton = document.querySelector(".hamburger");
      eventNavbar(event, hamburgerButton);
    }
  });

  window.eventNavbar = eventNavbar;
}
