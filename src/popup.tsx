import React, {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {listEntries} from './data';
import './style.css';
function Popup(){
 const [count,setCount]=useState<number|null>(null);const [failed,setFailed]=useState(false);const [windowId,setWindowId]=useState<number|null>(null);const [openError,setOpenError]=useState('');
 useEffect(()=>{listEntries().then(x=>setCount(x.length)).catch(()=>setFailed(true));chrome.windows.getCurrent().then((w:{id?:number})=>setWindowId(w.id??null)).catch(()=>setOpenError('无法获取浏览器窗口。'))},[]);
 function openPanel(){if(windowId===null){setOpenError('侧边栏尚未准备好，请稍后重试。');return}chrome.sidePanel.open({windowId}).then(()=>globalThis.close()).catch(()=>setOpenError('无法打开侧边栏，请确认 Chrome 版本并重新加载插件。'))}
 return <main className="popup"><div className="brand"><span className="brand-icon">O</span><strong>OfferLens</strong></div><p className="eyebrow">YOUR CAREER, IN ONE PLACE</p><h1>你的经历，<br/>值得被好好记录。</h1><p className="muted">把分散的职业经历整理成一份持续成长的个人档案。</p><div className="popup-status"><span className="status-dot"/>{failed?'无法读取本地档案':count===null?'正在读取档案…':count?`已有 ${count} 条档案记录`:'从创建第一条档案开始'}</div><button className="button primary full" onClick={openPanel}>打开快捷填写侧边栏 <span>↗</span></button><a className="button secondary full popup-manage" href="index.html" target="_blank">管理个人档案 <span>↗</span></a>{openError&&<p className="error" role="alert">{openError}</p>}<p className="popup-foot">✳ 数据仅保存在当前浏览器</p></main>
}
createRoot(document.getElementById('root')!).render(<Popup/>);
