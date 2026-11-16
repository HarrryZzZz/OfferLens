import React from 'react';
import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {Report} from '../src/ai/Report';
import type {MatchResult,LegacyMatchResult} from '../src/ai/core';
const result:MatchResult={assessment:'部分匹配',summary:'示例',requirements:[{requirement:'数据处理',category:'技能',importance:'必需',status:'匹配',explanation:'有经验',evidenceIds:['one']},{requirement:'数据建模',category:'技能',importance:'必需',status:'未匹配',explanation:'档案未体现',evidenceIds:[]}],suggestions:[],limitations:[]};
describe('匹配报告',()=>{
 it('展示评分、进度条和折叠的匹配详情',()=>{const html=renderToStaticMarkup(<Report result={result} evidence={[{id:'one',section:'技能',label:'工具',value:'Excel'}]}/>);expect(html).toContain('岗位综合匹配度');expect(html).toContain('50%');expect(html).toContain('aria-valuenow="50"');expect(html).toContain('查看匹配详情');expect(html).toContain('未匹配情况');expect(html).toContain('档案未体现')});
 it('简洁模式只展示综合百分比与简短说明',()=>{const html=renderToStaticMarkup(<Report mode="simple" result={result} evidence={[{id:'one',section:'技能',label:'工具',value:'Excel'}]}/>);expect(html).toContain('50%');expect(html).toContain('示例');expect(html).not.toContain('查看匹配详情');expect(html).not.toContain('技能匹配度');expect(html).not.toContain('数据处理')});
 it('证据异常单独展示，隐藏未经核对的判断并标明评分范围',()=>{const partial:MatchResult={...result,summary:'未核对摘要',requirements:[result.requirements[0],{...result.requirements[1],status:'匹配',explanation:'不可靠结论',evidenceIssues:['unknown_reference','missing_reference']}]};const html=renderToStaticMarkup(<Report result={partial} evidence={[{id:'one',section:'技能',label:'工具',value:'Excel'}]}/>);expect(html).toContain('正常项匹配度');expect(html).toContain('基于 1 / 2 项要求');expect(html).toContain('证据异常（未计分）');expect(html).toContain('AI 引用了本次未提供的字段编号');expect(html).toContain('没有附上可核对的证据');expect(html).not.toContain('未核对摘要');expect(html).not.toContain('不可靠结论')});
 it('旧结果保留原内容，不伪造历史百分比',()=>{const old:LegacyMatchResult={...result,requirements:[{requirement:'数据处理',status:'待确认',explanation:'没有记录',evidenceIds:[]}]};const html=renderToStaticMarkup(<Report result={old} evidence={[]}/>);expect(html).toContain('此记录没有可计算的评分');expect(html).toContain('数据处理');expect(html).not.toContain('role="progressbar"')});
});
