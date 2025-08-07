import updateAttrForm from "../utils/_updateAttrForms";

(function () {
  // Search in the dom for the form with the id
  const formContact = document.querySelector("#testForm");
  if (formContact) {
    const { handle } = formContact.dataset;
    if (!handle) return;
    return updateAttrForm(handle, formContact);
  }
})();
