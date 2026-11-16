// Only the location of the last focused field is stored; page contents are never read.
let focusUpdates = Promise.resolve();
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'offerlens-focus' && sender.tab?.id != null && sender.frameId != null) {
    const key = `focus:${sender.tab.id}`;
    focusUpdates = focusUpdates.catch(()=>{}).then(() => chrome.storage.session.set({[key]: message.editable ? sender.frameId : null}));
    focusUpdates.then(() => sendResponse({ok:true})).catch(() => sendResponse({ok:false}));
    return true;
  }
  const panelUrl = chrome.runtime.getURL('sidepanel.html');
  if (message?.type === 'offerlens-fill' && sender.id === chrome.runtime.id && sender.url?.split('#')[0].split('?')[0] === panelUrl && typeof message.value === 'string' && Number.isInteger(message.tabId)) {
    (async () => {
      const tab = await chrome.tabs.get(message.tabId);
      if (!tab.active) return {ok:false,error:'当前网页已切换，请重新选择要填写的输入框。'};
      await focusUpdates;
      const key = `focus:${tab.id}`;
      const state = await chrome.storage.session.get(key);
      if (typeof state[key] !== 'number') return {ok:false,error:'请先点击网页上要填写的输入框；更新插件后请刷新网页。'};
      try { return await chrome.tabs.sendMessage(tab.id, {type:'offerlens-insert',value:message.value}, {frameId:state[key]}); }
      catch { return {ok:false,error:'无法访问该输入框，请刷新网页后重试；浏览器内部页面不支持填写。'}; }
    })().then(sendResponse).catch(() => sendResponse({ok:false,error:'无法访问当前网页，请刷新后重试。'}));
    return true;
  }
});
chrome.tabs.onRemoved.addListener(tabId => { chrome.storage.session.remove(`focus:${tabId}`); });
chrome.tabs.onUpdated.addListener((tabId, change) => { if (change.status === 'loading') chrome.storage.session.remove(`focus:${tabId}`); });
