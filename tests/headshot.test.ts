import {afterEach,describe,expect,it,vi} from 'vitest';
import {checkPhoto,editHeadshot} from '../src/headshot/api';
import {headshotStyles} from '../src/headshot/styles';
const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRNsAAAAASUVORK5CYII=';
const input=`data:image/png;base64,${png}`;
afterEach(()=>vi.unstubAllGlobals());
describe('职业形象照',()=>{
 it('六种风格均强调以原照片保留身份，第三种不指定年龄性别族裔',()=>{expect(headshotStyles).toHaveLength(6);for(const style of headshotStyles){expect(style.prompt).toContain('ONLY identity reference');expect(style.prompt).toContain('Do not change their age, ethnicity')}expect(headshotStyles[2].prompt).not.toMatch(/young Asian woman|mid-20s/i)});
 it('限制上传格式与大小',()=>{expect(()=>checkPhoto({type:'image/png',size:100})).not.toThrow();expect(()=>checkPhoto({type:'image/heic',size:100})).toThrow('格式');expect(()=>checkPhoto({type:'image/jpeg',size:11*1024*1024})).toThrow('10 MB')});
 it('只将用户照片和所选提示词发送给 OpenAI 图片编辑接口',async()=>{const fetchMock=vi.fn(async()=>new Response(JSON.stringify({data:[{b64_json:png}]})));vi.stubGlobal('fetch',fetchMock);const blob=await editHeadshot({image:input,styleId:'editorial',apiKey:'secret-key',model:'gpt-image-2',quality:'medium'});expect(blob.type).toBe('image/png');const [url,request]=fetchMock.mock.calls[0] as unknown as [string,RequestInit];expect(url).toBe('https://api.openai.com/v1/images/edits');const body=JSON.parse(String(request.body));expect(body.images).toEqual([{image_url:input}]);expect(body.prompt).toBe(headshotStyles[2].prompt);expect(body.model).toBe('gpt-image-2');expect(body.input_fidelity).toBeUndefined();expect(String(request.body)).not.toContain('secret-key');expect((request.headers as Record<string,string>).Authorization).toBe('Bearer secret-key')});
 it('拒绝无效风格、缺失密钥和非图片响应',async()=>{const params={image:input,styleId:'white',apiKey:'key',model:'gpt-image-2',quality:'medium' as const};await expect(editHeadshot({...params,styleId:'bad'})).rejects.toThrow('风格');await expect(editHeadshot({...params,apiKey:''})).rejects.toThrow('密钥');vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({data:[{b64_json:'YWJj'}]}))));await expect(editHeadshot(params)).rejects.toThrow('图片数据无效');vi.stubGlobal('fetch',vi.fn(async()=>new Response('{}',{status:401})));await expect(editHeadshot(params)).rejects.toThrow('密钥无效')});
});
