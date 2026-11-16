import React,{useState} from 'react';
import {sections} from '../config';
import type {Entry} from '../data';
import {showProfileField} from '../profileFields';
import {translatable,translationFields,translationId,type Translation} from './model';
import {saveEnglish} from './store';
export function EnglishEditor({entry,translations,onDone,onCancel}:{entry:Entry;translations:Translation[];onDone:()=>void;onCancel:()=>void}){
 const section=sections.find(s=>s.id===entry.section)!;const sources=new Map(translationFields([entry]).map(f=>[f.id,f.source]));
 const specs=[...section.fields.filter(f=>!(entry.hiddenFields??[]).includes(f.id)&&showProfileField(entry,f.id)&&translatable(f.type,f.id)).map(f=>({key:'preset:'+f.id,label:entry.labels[f.id]||f.label})),...entry.customFields.filter(f=>translatable(f.type)).map(f=>({key:'custom:'+f.id,label:f.label}))];
 const [values,setValues]=useState<Record<string,string>>(()=>Object.fromEntries(specs.map(f=>[f.key,translations.find(t=>t.id===translationId(entry.id,f.key))?.value||''])));const [initial]=useState(values);const [before]=useState(translations);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);try{const updates=specs.filter(f=>(values[f.key]??'')!==(initial[f.key]??'')).map(f=>({id:translationId(entry.id,f.key),entryId:entry.id,fieldKey:f.key,source:sources.get(translationId(entry.id,f.key))??JSON.stringify([f.label,'']),value:values[f.key]??''}));await saveEnglish(entry,updates,before);onDone()}catch(e){setError(e instanceof Error?e.message:'保存失败。')}finally{setBusy(false)}}
 return <form className="editor" onSubmit={submit}><p className="muted">编辑英文内容不会修改中文原文。日期、联系方式等共享字段请在中文版本修改。</p><div className="form-grid">{specs.map(f=><div className="field wide" key={f.key}><label>{f.label}</label><textarea rows={3} value={values[f.key]||''} onChange={e=>setValues({...values,[f.key]:e.target.value})}/></div>)}</div>{error&&<p className="error">{error}</p>}<div className="form-actions"><button type="button" className="button secondary" onClick={onCancel}>取消</button><button className="button primary" disabled={busy}>保存英文</button></div></form>
}
