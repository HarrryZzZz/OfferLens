import 'fake-indexeddb/auto';
import {beforeEach,describe,expect,it} from 'vitest';
import {db,exportBackup,listEntries,newEntry,replaceBackup,saveEntry,validateBackup} from '../src/data';
import {recordTitle} from '../src/recordTitle';
beforeEach(async()=>{await db.records.clear()});
describe('字段移除和教育经历标题',()=>{
 it('移除字段后保存并备份，恢复字段时原内容仍在',async()=>{const entry=newEntry('personal');entry.values.phone='123456789';entry.hiddenFields=['phone'];await saveEntry(entry);const backup=await exportBackup();await db.records.clear();await replaceBackup(backup);const restored=(await listEntries())[0];expect(restored.hiddenFields).toEqual(['phone']);expect(restored.values.phone).toBe('123456789');restored.hiddenFields=[];await saveEntry(restored);expect((await listEntries())[0].values.phone).toBe('123456789')});
 it('旧备份缺少隐藏字段时仍能导入',()=>{const entry=newEntry('education');const old={...entry,hiddenFields:undefined};delete old.hiddenFields;expect(validateBackup({schemaVersion:1,records:[old]}).records[0].hiddenFields).toEqual([])});
 it('拒绝未知或重复的隐藏字段',()=>{const entry=newEntry('education');entry.hiddenFields=['unknown'];expect(()=>validateBackup({schemaVersion:1,records:[entry]})).toThrow();entry.hiddenFields=['school','school'];expect(()=>validateBackup({schemaVersion:1,records:[entry]})).toThrow()});
 it('教育标题包含学校和学历，单项缺失时显示已有内容',()=>{const entry=newEntry('education');entry.values.school='示例大学甲';entry.values.educationLevel='硕士';expect(recordTitle(entry)).toBe('示例大学甲 · 硕士');entry.values.educationLevel='';entry.values.degree='Master';expect(recordTitle(entry)).toBe('示例大学甲 · Master');entry.hiddenFields=['school'];expect(recordTitle(entry)).toBe('Master')});
});
