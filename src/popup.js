const choiceSelect = document.getElementById("choice");
const reverseCheckbox = document.getElementById("reverse");
const fillButton = document.getElementById("fill");
const clearButton = document.getElementById("clear");
const statusBox = document.getElementById("status");

fillButton.addEventListener("click", async () => {
  const choiceIndex = Number(choiceSelect.value);
  const reverseOrder = reverseCheckbox.checked;

  await runOnCurrentTab(fillRadioGroups, [choiceIndex, reverseOrder], (result) => {
    statusBox.textContent =
      `تم تحديد ${result.filled} من ${result.found} سؤال. ` +
      `راجع الإجابات قبل الإرسال.`;
  });
});

clearButton.addEventListener("click", async () => {
  await runOnCurrentTab(clearRadioGroups, [], (result) => {
    statusBox.textContent = `تم إلغاء تحديد ${result.cleared} اختيار.`;
  });
});

async function runOnCurrentTab(func, args, onSuccess) {
  setLoading(true);
  statusBox.textContent = "";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
      statusBox.textContent = "لم يتم العثور على تبويب نشط.";
      return;
    }

    const [executionResult] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func,
      args
    });

    onSuccess(executionResult.result);
  } catch (error) {
    statusBox.textContent =
      "تعذر تشغيل الإضافة على هذه الصفحة. افتح صفحة التقييم وحاول مرة أخرى.";
    console.error(error);
  } finally {
    setLoading(false);
  }
}

function setLoading(isLoading) {
  fillButton.disabled = isLoading;
  clearButton.disabled = isLoading;
}

function fillRadioGroups(choiceIndex, reverseOrder) {
  const radios = Array.from(document.querySelectorAll('input[type="radio"]'))
    .filter((radio) => !radio.disabled);

  const groups = new Map();

  radios.forEach((radio, index) => {
    const groupName = radio.name || radio.getAttribute("data-name") || `radio_without_name_${index}`;

    if (!groups.has(groupName)) {
      groups.set(groupName, []);
    }

    groups.get(groupName).push(radio);
  });

  let filled = 0;
  let skipped = 0;
  const normalizedChoiceIndex = reverseOrder ? 4 - choiceIndex : choiceIndex;

  for (const group of groups.values()) {
    const target = group[normalizedChoiceIndex];

    if (!target) {
      skipped += 1;
      continue;
    }

    try {
      target.focus({ preventScroll: true });
    } catch (_) {
      // Older pages may not support focus options.
    }

    target.click();

    if (!target.checked) {
      target.checked = true;
    }

    target.dispatchEvent(new Event("input", { bubbles: true }));
    target.dispatchEvent(new Event("change", { bubbles: true }));

    filled += 1;
  }

  return {
    found: groups.size,
    filled,
    skipped
  };
}

function clearRadioGroups() {
  const radios = Array.from(document.querySelectorAll('input[type="radio"]'));
  let cleared = 0;

  radios.forEach((radio) => {
    if (radio.checked) {
      radio.checked = false;
      radio.dispatchEvent(new Event("input", { bubbles: true }));
      radio.dispatchEvent(new Event("change", { bubbles: true }));
      cleared += 1;
    }
  });

  return { cleared };
}
