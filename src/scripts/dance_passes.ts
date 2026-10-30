for (const card of document.querySelectorAll<HTMLElement>("[data-pass]")) {
  const classInput = card.querySelector<HTMLInputElement>("[data-class]");
  const classOptions = card.querySelectorAll<HTMLButtonElement>("[data-class-option]");
  const buy = card.querySelector<HTMLButtonElement>("[data-buy]");
  const error = card.querySelector<HTMLElement>("[data-checkout-error]");
  if (!buy || !error) continue;
  const buttonLabel = buy.textContent?.trim() ?? "Buy Pass";
  let busy = false;
  let requestId = crypto.randomUUID();
  const updateButton = () => {
    buy.disabled = busy || Boolean(classInput && !classInput.value);
  };
  for (const option of classOptions) {
    option.addEventListener("click", () => {
      if (!classInput) return;
      classInput.value = classInput.value === option.value ? "" : option.value;
      for (const button of classOptions) {
        button.setAttribute("aria-pressed", String(button.value === classInput.value));
      }
      requestId = crypto.randomUUID();
      error.hidden = true;
      updateButton();
    });
  }
  const resetButton = () => {
    busy = false;
    buy.textContent = buttonLabel;
    for (const option of classOptions) option.disabled = false;
    updateButton();
  };
  window.addEventListener("pageshow", resetButton);
  updateButton();
  buy.addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    updateButton();
    buy.textContent = "Opening checkout...";
    error.hidden = true;
    for (const option of classOptions) option.disabled = true;
    try {
      const response = await fetch("/api/checkout/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pass: card.dataset.pass,
          class: classInput?.value,
          requestId,
        }),
      });
      const result: unknown = await response.json();
      if (!result || typeof result !== "object") {
        throw new Error("Unable to open checkout. Please try again.");
      }
      if (!response.ok || !("url" in result) || typeof result.url !== "string") {
        throw new Error(
          "error" in result && typeof result.error === "string"
            ? result.error
            : "Unable to open checkout. Please try again.",
        );
      }
      window.location.assign(result.url);
    } catch (failure) {
      error.textContent =
        failure instanceof Error ? failure.message : "Unable to open checkout. Please try again.";
      error.hidden = false;
      resetButton();
    }
  });
}
