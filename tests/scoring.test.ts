import {describe,it,expect} from 'vitest';
import {calculateScores} from '../src/ai/scoring';
import type {MatchResult,LegacyMatchResult} from '../src/ai/core';
const result:MatchResult={assessment:'部分匹配',summary:'参考',suggestions:[],limitations:[],requirements:[
 {requirement:'Excel',category:'技能',importance:'必需',status:'匹配',explanation:'有',evidenceIds:['1']},
 {requirement:'Python',category:'技能',importance:'加分',status:'未匹配',explanation:'未找到',evidenceIds:[]},
 {requirement:'工作经验',category:'经验',importance:'必需',status:'部分匹配',explanation:'部分',evidenceIds:['2']},
]};
describe('匹配度计算',()=>{
 it('必需项权重为加分项两倍，部分匹配按一半计分',()=>{expect(calculateScores(result)).toEqual({overall:60,dimensions:[{category:'技能',score:67},{category:'经验',score:50}],verified:3,total:3})});
 it('无 JD 要求的维度不纳入，全部未匹配时为零',()=>{const r:MatchResult={...result,requirements:[{...result.requirements[1],importance:'必需'}]};expect(calculateScores(r)).toEqual({overall:0,dimensions:[{category:'技能',score:0}],verified:1,total:1})});
 it('证据异常项从分母中排除，不视作未匹配或直接计零分',()=>{const r:MatchResult={...result,requirements:[{...result.requirements[0],evidenceIssues:['missing_reference']},result.requirements[1],result.requirements[2]]};expect(calculateScores(r)).toEqual({overall:33,dimensions:[{category:'技能',score:0},{category:'经验',score:50}],verified:2,total:3})});
 it('全部证据异常时不显示虚假的零分',()=>{const r:MatchResult={...result,requirements:[{...result.requirements[0],evidenceIssues:['unknown_reference']}]};expect(calculateScores(r)).toEqual({overall:null,dimensions:[{category:'技能',score:null}],verified:0,total:1})});
 it('旧记录或无要求不凭空产生评分',()=>{const old:LegacyMatchResult={...result,requirements:[{requirement:'Excel',status:'匹配',explanation:'有',evidenceIds:['1']}]};expect(calculateScores(old)).toBeNull();expect(calculateScores({...result,requirements:[]})).toBeNull()});
});
