import 'fake-indexeddb/auto';
import {beforeEach, describe, expect, it} from 'vitest';
import {db,deleteEntry,exportBackup,listEntries,newEntry,replaceBackup,saveEntry,validValue,validateBackup} from '../src/data';
beforeEach(async()=>{await db.records.clear()});
describe('本地档案',()=>{
 it('保存、更新、重新读取和删除记录',async()=>{const entry=newEntry('education');entry.values.school='Example U';await saveEntry(entry);expect((await listEntries())[0].values.school).toBe('Example U');entry.values.school='Example University';await saveEntry(entry);expect((await listEntries())).toHaveLength(1);expect((await listEntries())[0].values.school).toBe('Example University');await deleteEntry(entry.id);expect(await listEntries()).toHaveLength(0)});
 it('自定义字段改名保留 ID 和值',async()=>{const entry=newEntry('work');entry.customFields.push({id:'field-1',label:'样本量',type:'number',options:[],value:'100'});await saveEntry(entry);entry.customFields[0].label='研究样本量';await saveEntry(entry);expect((await listEntries())[0].customFields[0]).toMatchObject({id:'field-1',label:'研究样本量',value:'100'})});
 it('备份往返恢复，错误导入不改变现有数据',async()=>{const entry=newEntry('projects');entry.values.name='项目';await saveEntry(entry);const backup=await exportBackup();await db.records.clear();await replaceBackup(JSON.parse(JSON.stringify(backup)));expect(await listEntries()).toEqual(backup.records);await expect(replaceBackup({schemaVersion:1,records:[{id:'broken'}]})).rejects.toThrow();expect(await listEntries()).toEqual(backup.records)});
 it('拒绝重复 ID 和无效字段',()=>{const entry=newEntry('skills');expect(()=>validateBackup({schemaVersion:1,records:[entry,entry]})).toThrow();entry.values.years='abc';expect(()=>validateBackup({schemaVersion:1,records:[entry]})).toThrow()});
 it('验证类型转换和链接日期',()=>{expect(validValue('number','abc')).toBe(false);expect(validValue('number','12')).toBe(true);expect(validValue('date','2024-02-30')).toBe(false);expect(validValue('url','javascript:alert(1)')).toBe(false);expect(validValue('select','A',['B'])).toBe(false)})
});
