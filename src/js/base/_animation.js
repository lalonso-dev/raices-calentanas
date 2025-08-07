try {
  if (typeof AOS !== "undefined") {
    AOS.init({ once: true });
  } else {
    console.log("AOS is not loaded in the project.");
  }
} catch (Exception) {
  console.warn("Exception in animation.js => " + Exception);
}
