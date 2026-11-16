import type {Entry} from './data';
export function migrateLocation(entry:Entry):Entry {
 if(entry.section!=='personal'||!entry.values.city)return entry;
 const {city,...values}=entry.values;
 if(!values.location)return {...entry,values:{...values,location:city}};
 if(values.location===city)return {...entry,values};
 return entry;
}
export function showProfileField(entry:Entry,id:string):boolean {
 if(entry.section==='personal'&&id==='city')return !!entry.values.city&&entry.values.city!==entry.values.location;
 if(entry.section==='personal'&&id==='languages')return !!entry.values.languages;
 if(entry.section==='selfDescription'&&(id==='languageType'||id==='languageAbility'))return !!entry.values[id];
 return true;
}
