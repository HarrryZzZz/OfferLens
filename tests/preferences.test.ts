import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {defaultMatchPreferences,loadMatchPreferences,saveMatchPreferences} from '../src/ai/storage';
let store:Record<string,unknown>;
beforeEach(()=>{store={};vi.stubGlobal('chrome',{storage:{local:{setAccessLevel:vi.fn(async()=>{}),get:vi.fn(async(key:string)=>({[key]:store[key]})),set:vi.fn(async(data:Record<string,unknown>)=>{Object.assign(store,data)})}}})});
afterEach(()=>vi.unstubAllGlobals());
describe('匹配设置',()=>{
 it('旧用户无设置时保持原有的详细模式',async()=>{expect(await loadMatchPreferences()).toEqual(defaultMatchPreferences)});
 it('模式与字段选择能保存和读取',async()=>{await saveMatchPreferences({reportMode:'simple',allowedIds:['work:one']});expect(await loadMatchPreferences()).toEqual({reportMode:'simple',allowedIds:['work:one']})});
 it('损坏的字段选择不会默认为全部发送',async()=>{store.offerlens_match_preferences={reportMode:'simple',allowedIds:'bad'};expect((await loadMatchPreferences()).allowedIds).toEqual([])});
});
