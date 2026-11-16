import {db} from '../data';
import type {Evidence,StoredMatchResult} from './core';
import type {ReportMode} from './storage';
export type AnalysisHistory={id:string;createdAt:string;jd:string;provider:string;model:string;reportMode?:ReportMode;evidence:Evidence[];result:StoredMatchResult};
export async function getHistory(){return db.analyses.orderBy('createdAt').reverse().toArray()}
export async function saveHistory(item:AnalysisHistory){await db.analyses.put(item)}
export async function deleteHistory(id:string){await db.analyses.delete(id)}
