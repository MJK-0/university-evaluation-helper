// غيّر الرقم حسب الخيار المطلوب:
// 0 = لا أوافق بشدة
// 1 = لا أوافق
// 2 = محايد
// 3 = أوافق
// 4 = أوافق بشدة
const choiceIndex = 4;

// إذا كانت الاختيارات تظهر بعكس الترتيب في صفحة جامعتك، غيّرها إلى true
const reverseOrder = false;

// يجمع كل مجموعات radio حسب اسم السؤال
const groups = {};

document.querySelectorAll('input[type="radio"]').forEach((radio, index) => {
  const name = radio.name || radio.getAttribute("data-name") || `radio_without_name_${index}`;

  if (!groups[name]) {
    groups[name] = [];
  }

  groups[name].push(radio);
});

// اختيار الخيار المطلوب في كل سؤال
Object.values(groups).forEach(group => {
  const targetIndex = reverseOrder ? 4 - choiceIndex : choiceIndex;
  const target = group[targetIndex];

  if (target) {
    target.click();

    if (!target.checked) {
      target.checked = true;
    }

    target.dispatchEvent(new Event("input", { bubbles: true }));
    target.dispatchEvent(new Event("change", { bubbles: true }));
  }
});

console.log("تم تحديد الخيارات. راجع الإجابات قبل الإرسال.");
