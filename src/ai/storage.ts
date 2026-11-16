import type {ProviderConfig} from './core';
const KEY='offerlens_ai_config';
export const defaultConfig:ProviderConfig={provider:'openai',model:'gpt-4o-mini',apiKey:''};
export async function loadAIConfig():Promise<ProviderConfig>{await chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});const stored=(await chrome.storage.local.get(KEY))[KEY];if(!stored||typeof stored!=='object')return {...defaultConfig};return {provider:'openai',model:typeof stored.model==='string'?stored.model:defaultConfig.model,apiKey:typeof stored.apiKey==='string'?stored.apiKey:''};}
export async function saveAIConfig(config:ProviderConfig){await chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});await chrome.storage.local.set({[KEY]:{provider:'openai',model:config.model.trim(),apiKey:config.apiKey.trim()}})}
export async function clearAIConfig(){await chrome.storage.local.remove(KEY)}

export type ReportMode='simple'|'full';
export type MatchPreferences={reportMode:ReportMode;allowedIds:string[]|null};
const MATCH_KEY='offerlens_match_preferences';
export const defaultMatchPreferences:MatchPreferences={reportMode:'full',allowedIds:null};
export async function loadMatchPreferences():Promise<MatchPreferences>{await chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});const stored=(await chrome.storage.local.get(MATCH_KEY))[MATCH_KEY];if(!stored||typeof stored!=='object')return {...defaultMatchPreferences};return {reportMode:stored.reportMode==='simple'?'simple':'full',allowedIds:stored.allowedIds===null?null:Array.isArray(stored.allowedIds)&&stored.allowedIds.every((x:unknown)=>typeof x==='string')?stored.allowedIds:[]};}
export async function saveMatchPreferences(value:MatchPreferences){await chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});await chrome.storage.local.set({[MATCH_KEY]:{reportMode:value.reportMode,allowedIds:value.allowedIds}})}
