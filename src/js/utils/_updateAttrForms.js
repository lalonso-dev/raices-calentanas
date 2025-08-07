const updateAttrForm = async function (handle, form) {
  try {
    if (!handle || !form) return;

    const response = await fetch(`/freeform/form/properties/${handle}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const { csrf, freeform_payload, hash, honeypot } = await response.json();

    const honeypot_input = form.querySelector(
      "input[name^='freeform_form_handle']"
    );
    const payload_input = form.querySelector("input[name='freeform_payload']");

    const hash_input = form.querySelector("input[name='formHash']");
    const token_input = form.querySelector("input[name='CRAFT_CSRF_TOKEN']");

    if (!honeypot_input || !payload_input || !hash_input || !token_input)
      return;

    // Set new honeypot
    honeypot_input.setAttribute("name", honeypot.name);
    honeypot_input.setAttribute("value", honeypot.value);

    // Set others new values
    payload_input.value = freeform_payload;
    hash_input.value = hash;
    token_input.value = csrf.token;
    return;
  } catch (Exception) {
    console.warn("Exception in updateAttrForm => " + Exception);
  }
};

export default updateAttrForm;
