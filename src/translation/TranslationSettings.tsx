import React,{useState} from 'react';
import {db,type Entry} from '../data';
import {recordTitle} from '../recordTitle';
import {loadAIConfig} from '../ai/storage';
import {batches,translateBatch} from './api';
import {removeExtraHeading} from './headings';
import {changedFields,defaultSelection,selectFields,translationFields,type Language,type Translation,type TranslationField} from './model';
import {applyTranslations,setLanguage} from './store';

type Preview={updates:Translation[];before:Translation[];fields:TranslationField[];removed:Set<string>};
export function TranslationSettings({entries,translations,language}:{entries:Entry[];translations:Translation[];language:Language}){
 const [busy,setBusy]=useState(false);const [status,setStatus]=useState('');const [preview,setPreview]=useState<Preview|null>(null);const [choosing,setChoosing]=useState(false);const [destination,setDestination]=useState<{provider:string;model:string;effort:string}|null>(null);const [selected,setSelected]=useState<Map<string,string>>(new Map());
 const allFields=translationFields(entries);const fields=changedFields(allFields,translations);const chosen=selectFields(allFields,selected);

 function selectGroup(items:TranslationField[],checked:boolean){setSelected(old=>{const next=new Map(old);items.forEach(f=>checked?next.set(f.id,f.source):next.delete(f.id));return next})}
 async function openSelection(){setPreview(null);setStatus('');setSelected(defaultSelection(allFields,translations));try{const config=await loadAIConfig();setDestination({provider:config.provider,model:config.model,effort:config.reasoningEffort||'auto'});setChoosing(true)}catch{setStatus('无法读取 AI 服务设置。')}}
 async function run(){if(!chosen.length){setStatus('请选择要发送给 AI 的字段。');return}setBusy(true);setStatus('');try{
  // Re-read immediately before sending: a different page may have changed data
  // since the user reviewed it. Never upload a value they did not select.
  const [currentEntries,currentTranslations,config]=await Promise.all([db.records.toArray(),db.translations.toArray(),loadAIConfig()]);
  if(!config.apiKey.trim()||!config.model.trim())throw new Error('请先填写所选 AI 服务商的模型和 API 密钥。');if(!destination||destination.provider!==config.provider||destination.model!==config.model||destination.effort!==(config.reasoningEffort||'auto'))throw new Error('AI 服务设置已变化，请重新选择字段后发送。');
  const current=new Map(translationFields(currentEntries).map(f=>[f.id,f]));
  if(chosen.some(f=>current.get(f.id)?.source!==f.source))throw new Error('所选内容在检查期间已发生变化，请重新检查后再发送。');
  const updates:Translation[]=[];const removed=new Set<string>();const groups=batches(chosen);
  for(let i=0;i<groups.length;i++){setStatus(`正在翻译 ${i+1} / ${groups.length} 批…`);const values=await translateBatch(groups[i],config);groups[i].forEach((f,j)=>{const clean=removeExtraHeading(f,values[j]);if(clean.removed)removed.add(f.id);updates.push({id:f.id,entryId:f.entryId,fieldKey:f.fieldKey,source:f.source,value:clean.value})})}
  setPreview({updates,before:currentTranslations,fields:chosen,removed});setChoosing(false);setStatus(`已生成 ${updates.length} 项翻译，请检查后保存。`)
 }catch(e){setStatus(e instanceof Error?e.message:'翻译失败，原有内容未改变。')}finally{setBusy(false)}}

 async function accept(){if(!preview)return;try{await applyTranslations(preview.updates,preview.before);setPreview(null);setStatus('英文内容已保存。可切换至英文版本查看和编辑。')}catch(e){setStatus(e instanceof Error?e.message:'保存失败，原有内容未改变。')}}
 const groups=Array.from(new Set(allFields.map(f=>f.section))).map(section=>({section,fields:allFields.filter(f=>f.section===section)}));
 return <div className="panel ai-settings"><div className="ai-card-header"><div><p className="eyebrow">RESUME LANGUAGE</p><h2>档案语言与翻译</h2><p className="muted">中英文内容分别保存；侧边栏与这里选择的版本同步。</p></div></div><div className="ai-actions"><button className={'button '+(language==='zh'?'primary':'secondary')} disabled={busy} onClick={()=>setLanguage('zh').catch(()=>setStatus('切换失败，请重试。'))}>中文版本</button><button className={'button '+(language==='en'?'primary':'secondary')} disabled={busy} onClick={()=>setLanguage('en').catch(()=>setStatus('切换失败，请重试。'))}>英文版本</button><button className="button secondary" disabled={busy||!allFields.length} onClick={openSelection}>选择字段并翻译</button></div><p className="ai-hint">当前有 {fields.length} 个字段需要翻译或更新。选择后仅发送勾选内容；未勾选的字段可以切换至英文版本手动填写。日期、网址、联系方式等保持原样。</p>{status&&<p className="ai-feedback" role="status">{status}</p>}
 {choosing&&<section className="preview"><h3>选择要发送给 AI 的字段</h3><p className="muted">已自动勾选新增、变更或英文为空的字段；所有其他字段也可选择重新翻译。请检查并取消不愿发送的内容；字段及其分类和标题将发送给 {destination?.provider==='openai'?'OpenAI':'DeepSeek'}（{destination?.model || '未设置模型'}），可能产生费用。</p>{groups.map(group=><div className="translation-selection-group" key={group.section}><div className="translation-group-head"><strong>{group.section}</strong><button type="button" className="button secondary" disabled={busy} onClick={()=>selectGroup(group.fields,!group.fields.every(f=>selected.get(f.id)===f.source))}>{group.fields.every(f=>selected.get(f.id)===f.source)?'取消全选':'全选本分类'}</button></div>{group.fields.map(f=>{const entry=entries.find(e=>e.id===f.entryId);const english=translations.find(t=>t.id===f.id)?.value;return <label className="translation-choice" key={f.id}><input type="checkbox" checked={selected.get(f.id)===f.source} disabled={busy} onChange={e=>selectGroup([f],e.target.checked)}/><span><strong>{entry&&recordTitle(entry)} · {f.label}{fields.some(changed=>changed.id===f.id)?'（待更新）':''}</strong><span className="translation-source">原文：{f.text}</span>{english&&<span className="translation-source">当前英文：{english}</span>}</span></label>})}</div>)}<div className="ai-actions"><button className="button secondary" disabled={busy} onClick={()=>setChoosing(false)}>取消</button><button className="button primary" disabled={busy||chosen.length===0} onClick={run}>发送所选 {chosen.length} 个字段并翻译</button></div></section>}
 {preview&&<div className="preview"><h3>检查翻译结果</h3>{preview.updates.map(item=>{const f=preview.fields.find(x=>x.id===item.id);return <div className="field" key={item.id}><label>{f?.section} · {f?.label}</label><p className="muted">原文：{f?.text}</p>{preview.removed.has(item.id)&&<p className="muted">已移除疑似重复的字段标题，请确认正文完整。</p>}<textarea rows={3} value={item.value} onChange={e=>{const value=e.target.value;setPreview(p=>p?{...p,updates:p.updates.map(x=>x.id===item.id?{...x,value}:x)}:p)}}/></div>})}<div className="ai-actions"><button className="button secondary" onClick={()=>setPreview(null)}>放弃结果</button><button className="button primary" disabled={!preview.updates.length||preview.updates.some(x=>!x.value.trim())} onClick={accept}>保存英文内容</button></div></div>}</div>
}
