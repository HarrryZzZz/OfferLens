import type {ProviderConfig} from '../ai/core';
export async function requestJson(config:ProviderConfig,name:string,schema:object,instructions:string,input:unknown,signal?:AbortSignal):Promise<unknown>{
 if(!config.apiKey.trim()||!config.model.trim())throw new Error('请先在设置中填写 AI 服务商的模型和 API 密钥。');
 const effort=config.reasoningEffort&&config.reasoningEffort!=='auto'?config.reasoningEffort:undefined;
 const body=config.provider==='openai'?{model:config.model.trim(),store:false,instructions,input:JSON.stringify(input),text:{format:{type:'json_schema',name,strict:true,schema}},...(effort?{reasoning:{effort}}:{})}:{model:config.model.trim(),messages:[{role:'system',content:instructions+' 仅输出符合此 JSON Schema 的 JSON：'+JSON.stringify(schema)},{role:'user',content:JSON.stringify(input)}],response_format:{type:'json_object'},...(effort?{reasoning_effort:effort}:{})};
 let response:Response;try{response=await fetch(config.provider==='openai'?'https://api.openai.com/v1/responses':'https://api.deepseek.com/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${config.apiKey.trim()}`},body:JSON.stringify(body),signal})}catch(e){if(e instanceof Error&&e.name==='AbortError')throw e;throw new Error('无法连接 AI 服务商，请检查网络。')}
 if(!response.ok)throw new Error(`AI 请求失败（HTTP ${response.status}），请检查密钥、额度和模型设置。`);
 let raw:any;try{raw=await response.json()}catch{throw new Error('无法读取 AI 响应。')}
 let output='';if(config.provider==='openai'){if(raw.status!=='completed')throw new Error('AI 输出未完成，请重试。');const content=raw.output?.flatMap((x:any)=>x.content||[])||[];if(content.some((x:any)=>x.type==='refusal'))throw new Error('AI 未能完成请求。');output=content.filter((x:any)=>x.type==='output_text'&&typeof x.text==='string').map((x:any)=>x.text).join('')}else{const c=raw.choices?.[0];if(c?.finish_reason==='length')throw new Error('AI 输出被截断，请减少所选字段后重试。');if(c?.message?.refusal)throw new Error('AI 未能完成请求。');output=c?.message?.content||''}
 try{return JSON.parse(output)}catch{throw new Error('AI 返回格式无法读取，请重试。')}
}
