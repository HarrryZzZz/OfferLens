import {beforeEach,describe,expect,it,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const script=readFileSync(new URL('../public/background.js',import.meta.url),'utf8');
let listener, storage, sendMessage;
const extensionUrl='chrome-extension://test/sidepanel.html';
beforeEach(()=>{storage={};sendMessage=vi.fn(async()=>({ok:true}));const chrome={runtime:{id:'test',getURL:path=>`chrome-extension://test/${path}`,onMessage:{addListener:fn=>listener=fn}},storage:{session:{set:async data=>Object.assign(storage,data),get:async key=>({[key]:storage[key]}),remove:async key=>delete storage[key]}},tabs:{get:async id=>({id,active:true}),sendMessage,onRemoved:{addListener:()=>{}},onUpdated:{addListener:()=>{}}}};runInNewContext(script,{chrome});});
const call=(message,sender)=>new Promise(resolve=>listener(message,sender,resolve));
describe('侧边栏与网页通信',()=>{
 it('把用户选择的字段发到选中输入框所在的标签页和框架',async()=>{await call({type:'offerlens-focus',editable:true},{tab:{id:42},frameId:3});const result=await call({type:'offerlens-fill',tabId:42,value:'示例'},{id:'test',url:extensionUrl,tab:{id:42}});expect(result.ok).toBe(true);expect(sendMessage).toHaveBeenCalledWith(42,{type:'offerlens-insert',value:'示例'},{frameId:3})});
 it('没有选择输入框时拒绝填写',async()=>{const result=await call({type:'offerlens-fill',tabId:42,value:'示例'},{id:'test',url:extensionUrl});expect(result.ok).toBe(false);expect(sendMessage).not.toHaveBeenCalled()});
 it('不接受来自普通网页的填写请求',()=>{const respond=vi.fn();expect(listener({type:'offerlens-fill',tabId:42,value:'示例'},{id:'test',url:'https://example.com',tab:{id:42}},respond)).toBeUndefined();expect(sendMessage).not.toHaveBeenCalled()});
});
