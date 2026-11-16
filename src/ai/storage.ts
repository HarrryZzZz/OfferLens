import type {ProviderConfig} from './core';
const KEY='offerlens_ai_config';
const PROVIDERS_KEY='offerlens_ai_providers_v2';
export const defaultConfig:ProviderConfig={provider:'openai',model:'gpt-4o-mini',apiKey:'',reasoningEffort:'auto'};
export const defaultDeepSeek:ProviderConfig={provider:'deepseek',model:'deepseek-flash',apiKey:'',reasoningEffort:'auto'};
export type ProviderSettings={selected:ProviderConfig['provider'];providers:Record<ProviderConfig['provider'],ProviderConfig>};
export async function loadProviderSettings():Promise<ProviderSettings>{
 await chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});
 const stored=await chrome.storage.local.get([KEY,PROVIDERS_KEY]);const v=stored[PROVIDERS_KEY];const old=stored[KEY];
 const clean=(raw:any,defaults:ProviderConfig):ProviderConfig=>({provider:defaults.provider,model:typeof raw?.model==='string'?raw.model:defaults.model,apiKey:typeof raw?.apiKey==='string'?raw.apiKey:'',reasoningEffort:['auto','none','low','medium','high','max'].includes(raw?.reasoningEffort)?raw.reasoningEffort:'auto'});
 return {selected:v?.selected==='deepseek'?'deepseek':'openai',providers:{openai:clean(v?.providers?.openai??old,defaultConfig),deepseek:clean(v?.providers?.deepseek,defaultDeepSeek)}};
}
export async function loadAIConfig():Promise<ProviderConfig>{const settings=await loadProviderSettings();return settings.providers[settings.selected]}
export async function saveProviderSettings(settings:ProviderSettings){await chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});await chrome.storage.local.set({[PROVIDERS_KEY]:settings})}
export async function clearAIConfig(){await chrome.storage.local.remove([KEY,PROVIDERS_KEY])}

export type ReportMode='simple'|'full';
export type MatchPreferences={reportMode:ReportMode;allowedIds:string[]|null};
const MATCH_KEY='offerlens_match_preferences';
export const defaultMatchPreferences:MatchPreferences={reportMode:'full',allowedIds:null};
export async function loadMatchPreferences():Promise<MatchPreferences>{await chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});const stored=(await chrome.storage.local.get(MATCH_KEY))[MATCH_KEY];if(!stored||typeof stored!=='object')return {...defaultMatchPreferences};return {reportMode:stored.reportMode==='simple'?'simple':'full',allowedIds:stored.allowedIds===null?null:Array.isArray(stored.allowedIds)&&stored.allowedIds.every((x:unknown)=>typeof x==='string')?stored.allowedIds:[]};}
export async function saveMatchPreferences(value:MatchPreferences){await chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});await chrome.storage.local.set({[MATCH_KEY]:{reportMode:value.reportMode,allowedIds:value.allowedIds}})}
