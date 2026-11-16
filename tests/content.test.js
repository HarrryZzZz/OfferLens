import {describe,it,expect,beforeEach,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const script=readFileSync(new URL('../public/content.js',import.meta.url),'utf8');
let listeners, onMessage, messages;
class Element {constructor(){this.isConnected=true;this.isContentEditable=false;this.events=[]}dispatchEvent(e){this.events.push(e.type)}}
class Input extends Element {constructor(type='text'){super();this.type=type;this.disabled=false;this.readOnly=false;this._value=''}get value(){return this._value}set value(v){this._value=this.type==='date'&&!/^\d{4}-\d{2}-\d{2}$/.test(v)?'':v}}
class Textarea extends Input {}
class Select extends Element {constructor(){super();this.disabled=false;this.multiple=false;this.options=[];this.value=''}}
beforeEach(()=>{listeners={};messages=[];const chrome={runtime:{id:'test-extension',sendMessage:vi.fn(msg=>{messages.push(msg);return Promise.resolve()}),onMessage:{addListener:fn=>{onMessage=fn}}}};const document={addEventListener:(name,fn)=>{listeners[name]=fn}};runInNewContext(script,{chrome,document,HTMLElement:Element,HTMLInputElement:Input,HTMLTextAreaElement:Textarea,HTMLSelectElement:Select,Event:class{constructor(type){this.type=type}}})});
const focus=el=>listeners.focusin({composedPath:()=>[el]});
const fill=value=>{let result;onMessage({type:'offerlens-insert',value},{id:'test-extension'},r=>{result=r});return result};
describe('网页填写',()=>{
 it('只向最近选择的输入框写入并触发网页表单事件',()=>{const input=new Input();focus(input);expect(messages.at(-1).editable).toBe(true);expect(fill('测试内容').ok).toBe(true);expect(input.value).toBe('测试内容');expect(input.events).toEqual(['input','change'])});
 it('不填写密码或失效的输入框',()=>{const password=new Input('password');focus(password);expect(messages.at(-1).editable).toBe(false);expect(fill('secret').ok).toBe(false);const input=new Input();focus(input);input.isConnected=false;expect(fill('内容').ok).toBe(false)});
 it('不兼容日期时保留原值',()=>{const input=new Input('date');input.value='2024-05-06';focus(input);expect(fill('无效日期').ok).toBe(false);expect(input.value).toBe('2024-05-06')});
 it('下拉框仅在选项文本或值匹配时填写',()=>{const input=new Select();input.options=[{value:'masters',text:'硕士',disabled:false}];focus(input);expect(fill('硕士').ok).toBe(true);expect(input.value).toBe('masters');expect(fill('博士').ok).toBe(false)});
});
