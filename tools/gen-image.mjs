// KTN 인사이트용 이미지 생성 (OpenAI gpt-image-1)
// 사용법: node tools/gen-image.mjs "<프롬프트>" <저장파일명(확장자 제외)> [size]
//   size: 1536x1024(기본, 가로) | 1024x1024 | 1024x1536
// API 키: geo-tracker/measure/.env 의 OPENAI_API_KEY 사용
import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const env = fs.readFileSync(path.join(root, 'geo-tracker/measure/.env'), 'utf8');
const key = env.match(/OPENAI_API_KEY\s*=\s*(\S+)/)?.[1];
if (!key) { console.error('OPENAI_API_KEY not found in geo-tracker/measure/.env'); process.exit(1); }

const [prompt, name, size = '1536x1024'] = process.argv.slice(2);
if (!prompt || !name) { console.error('usage: node tools/gen-image.mjs "<prompt>" <filename> [size]'); process.exit(1); }

const res = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ model: 'gpt-image-1', prompt, size, quality: 'medium', n: 1 })
});
const data = await res.json();
if (!res.ok) { console.error('API error:', JSON.stringify(data.error || data)); process.exit(1); }

const b64 = data.data[0].b64_json;
const out = path.join(root, 'images', `${name}.png`);
fs.writeFileSync(out, Buffer.from(b64, 'base64'));
console.log('saved:', out, `(${Math.round(Buffer.from(b64, 'base64').length / 1024)}KB)`);
