(() => {
  let target = null;
  const allowedInput = new Set(['text','search','email','tel','url','number','date','month','time','datetime-local']);
  function eligible(el) {
    if (!(el instanceof HTMLElement) || !el.isConnected) return false;
    if (el instanceof HTMLInputElement) return allowedInput.has(el.type) && !el.disabled && !el.readOnly;
    if (el instanceof HTMLTextAreaElement) return !el.disabled && !el.readOnly;
    if (el instanceof HTMLSelectElement) return !el.disabled && !el.multiple;
    return el.isContentEditable;
  }
  function selectTarget(event) {
    const el = event.composedPath().find(item => item instanceof HTMLElement && eligible(item));
    target = el || null;
    chrome.runtime.sendMessage({type:'offerlens-focus',editable:!!target}).catch(()=>{});
  }
  document.addEventListener('focusin', selectTarget, true);
  document.addEventListener('pointerdown', selectTarget, true);
  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (sender.id !== chrome.runtime.id || message?.type !== 'offerlens-insert' || typeof message.value !== 'string') return;
    if (!eligible(target)) { respond({ok:false,error:'请重新点击网页上要填写的输入框。'}); return; }
    const el = target;
    if (el instanceof HTMLSelectElement) {
      const option = [...el.options].find(o => !o.disabled && (o.value === message.value || o.text.trim() === message.value.trim()));
      if (!option) { respond({ok:false,error:'该下拉选框没有与字段内容匹配的选项。'}); return; }
      el.value = option.value;
    } else if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      const previous = el.value;
      const proto = el instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      setter.call(el, message.value);
      if (el.value !== message.value) { setter.call(el, previous); respond({ok:false,error:'内容与输入框格式不兼容，请使用右键复制后手动填写。'}); return; }
    } else { el.textContent = message.value; }
    el.dispatchEvent(new Event('input', {bubbles:true, composed:true}));
    el.dispatchEvent(new Event('change', {bubbles:true, composed:true}));
    respond({ok:true});
  });
})();
