import type {TranslationField} from './model';
// Only remove headings we can identify for this field, and only when separated
// from the body. The original text may intentionally include its own heading.
const labels:Record<string,string[]>={
 '项目背景':['project background','background'], '项目描述':['project description','description'], '项目中职责':['project responsibilities','responsibilities in the project','responsibilities'], '描述和职责':['description and responsibilities'], '项目目标':['project objectives','project objective','project goals','project goal'], '个人角色':['personal role','role'], '个人职责':['personal responsibilities','responsibilities'], '解决方案':['solution','solutions'], '项目成果':['project outcomes','project results','outcomes','results'], '技术栈':['technology stack','tech stack'],
 '工作职责':['job responsibilities','work responsibilities','responsibilities'], '具体工作行动':['work actions','actions'], '量化成果（每行一项）':['quantifiable achievements','key achievements','achievements'], '其他补充说明':['additional information','additional notes'],
 '自我描述':['self description','self-description','personal statement'], '专业技能':['professional skills','skills'], '个人特长':['personal strengths','strengths'], '兴趣爱好':['interests and hobbies','hobbies and interests','interests','hobbies'],
 '学校名称':['school name','university name'], '学院名称':['college name','faculty name'], '学历':['education level'], '学位':['degree'], '专业名称':['major'], '核心课程':['core courses','coursework'], '相关说明':['additional information','notes'],
 '项目名称':['project name'], '公司名称':['company name'], '所在部门':['department'], '职位名称':['job title','position title'], '语言':['language'], '流利程度':['proficiency','language proficiency'], '奖项名称':['award name'], '获奖时间':['date received'], '其他说明':['other information','additional information','notes'],
};
function escapeRegex(value:string){return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
export function removeExtraHeading(field:TranslationField,value:string):{value:string;removed:boolean}{
 const known=[field.label,...(labels[field.label]??[])].filter(Boolean).sort((a,b)=>b.length-a.length);if(!known.length)return {value,removed:false};
 const heading=known.map(escapeRegex).join('|');const re=new RegExp(`^\\s*(?:#{1,6}\\s*)?(?:\\*\\*)?(?:${heading})(?:\\*\\*)?\\s*(?:[:：]\\s*|\\n+)(?:\\*\\*)?\\s*`,'i');
 // If a heading is present in the original, it belongs to the content.
 if(re.test(field.text))return {value,removed:false};const cleaned=value.replace(re,'');return cleaned!==value&&cleaned.trim()?{value:cleaned,removed:true}:{value,removed:false};
}
