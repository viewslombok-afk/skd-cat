const TM={"TWK": ["Implementasi Pancasila", "Implementasi UUD 1945", "Nasionalisme", "Pilar NKRI", "Integritas", "Bela Negara", "Gagasan Utama", "Kalimat Efektif"], "TIU": ["Perkalian Setara", "Perbandingan Kuantitatif", "Deret Angka Bentuk Tabel", "Nilai Suku ke-n dari Tabel", "Pola Operasi Baris Tabel", "Kecukupan Data", "Optimasi Paling Hemat", "Analisis Data Tabel", "Silogisme", "Penalaran Analitis", "Analogi Kata dan Kalimat", "Figural"], "TKP": ["Pelayanan Publik", "Profesionalisme", "Jejaring Kerja", "Teknologi Informasi dan Komunikasi", "Sosial Budaya", "Anti Radikalisme"]};
const enc=new TextEncoder(),FULL={TWK:150,TIU:175,TKP:225},PG={TWK:65,TIU:80,TKP:156},QN={TWK:30,TIU:35,TKP:45};
const b64=b=>btoa(String.fromCharCode(...new Uint8Array(b))),ub64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json'}});
const E=(m,s=400)=>J({error:m},s);
async function hmac(k,d){const key=await crypto.subtle.importKey('raw',enc.encode(k),{name:'HMAC',hash:'SHA-256'},false,['sign']);return b64(await crypto.subtle.sign('HMAC',key,enc.encode(d)))}
const sign=async(env,o)=>{const p=btoa(JSON.stringify(o));return p+'.'+await hmac(env.ADMIN_PASSWORD,p)};
async function verify(env,req){const t=(req.headers.get('authorization')||'').slice(7),[p,s]=t.split('.');if(!p||!s||s!==await hmac(env.ADMIN_PASSWORD,p))return null;try{const o=JSON.parse(atob(p));return o.e>Date.now()?o:null}catch(x){return null}}
async function pbk(pw,salt){const k=await crypto.subtle.importKey('raw',enc.encode(pw),'PBKDF2',false,['deriveBits']);return b64(await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:100000,hash:'SHA-256'},k,256))}
const okName=u=>/^[a-z0-9_.-]{3,20}$/.test(u);
function clean(q){if(!q||!['TWK','TIU','TKP'].includes(q.cat)||typeof q.text!='string'||!q.text.trim())return null;const o=q.options;if(!Array.isArray(o)||o.length!=5)return null;
 let a=null,w=null;if(q.cat=='TKP'){w=q.weights;if(!Array.isArray(w)||w.length!=5||w.some(x=>!(x>=1&&x<=5)))return null}else{a=Number(q.answer);if(!(a>=0&&a<=4))return null}
 return[q.cat,q.theme||'',nm(q.text.trim()),nm(JSON.stringify(o.map(String))),a,w?JSON.stringify(w):null,nm(q.explain||''),nm(q.trick||'')]}
/* Nama "Citra" (huruf besar di awal, kata utuh) diganti "Luluk". Kata biasa "citra" (huruf kecil) dibiarkan. */
const nm=s=>typeof s=='string'?s.replace(/\bCitra\b/g,'Luluk').replace(/\bCITRA\b/g,'LULUK'):s,nj=s=>JSON.parse(nm(s));
let MIG=0;
async function ensure(DB){if(MIG)return;try{const c=await DB.prepare('PRAGMA table_info(results)').all();if(!c.results.some(x=>x.name=='review'))await DB.prepare('ALTER TABLE results ADD COLUMN review TEXT').run();MIG=1}catch(x){}
 try{const fx=c=>`REPLACE(REPLACE(${c},'Citra','Luluk'),'CITRA','LULUK')`,g=c=>`${c} GLOB '*Citra*' OR ${c} GLOB '*CITRA*'`;
  await DB.prepare(`UPDATE questions SET text=${fx('text')},options=${fx('options')},explain=${fx('explain')},trick=${fx('trick')} WHERE ${['text','options','explain','trick'].map(g).join(' OR ')}`).run();
  await DB.prepare(`UPDATE results SET review=${fx('review')} WHERE ${g('review')}`).run()}catch(x){}}
export default{async fetch(req,env){const u=new URL(req.url),p=u.pathname;if(!p.startsWith('/api/'))return env.ASSETS.fetch(req);
 if(!env.ADMIN_PASSWORD||!env.DB)return E('Server belum dikonfigurasi (ADMIN_PASSWORD / DB).',500);
 const body=req.method=='POST'?await req.json().catch(()=>({})):{},DB=env.DB;await ensure(DB);
 try{
 if(p=='/api/register'){const n=String(body.u||'').toLowerCase();if(!okName(n)||String(body.p||'').length<4)return E('Username 3-20 huruf kecil/angka/._- dan password min. 4 karakter.');
  if(await DB.prepare('SELECT 1 FROM users WHERE username=?').bind(n).first())return E('Username sudah dipakai.');
  const s=crypto.getRandomValues(new Uint8Array(16));await DB.prepare('INSERT INTO users(username,pass_hash,status,last_login) VALUES(?,?,?,?)').bind(n,b64(s)+':'+await pbk(body.p,s),'ok',new Date().toISOString()).run();
  return J({token:await sign(env,{u:n,r:'u',e:Date.now()+30*864e5}),u:n})}
 if(p=='/api/login'){const n=String(body.u||'').toLowerCase(),r=await DB.prepare('SELECT * FROM users WHERE username=?').bind(n).first();if(!r)return E('Username atau password salah.',401);
  const[s,h]=r.pass_hash.split(':');if(await pbk(String(body.p||''),ub64(s))!==h)return E('Username atau password salah.',401);if(r.status!='ok')return E('Akun diblokir atau menunggu persetujuan pemilik.',403);
  await DB.prepare('UPDATE users SET last_login=? WHERE username=?').bind(new Date().toISOString(),n).run();return J({token:await sign(env,{u:n,r:'u',e:Date.now()+30*864e5}),u:n})}
 if(p=='/api/admin/login'){if(body.p!==env.ADMIN_PASSWORD)return E('Password salah.',401);return J({token:await sign(env,{r:'a',e:Date.now()+12*36e5})})}
 const me=await verify(env,req);if(!me)return E('Sesi habis, silakan masuk lagi.',401);
 if(p.startsWith('/api/admin/')){if(me.r!='a')return E('Ditolak.',403);
  if(p=='/api/admin/stats'){const r=await DB.prepare('SELECT cat,COUNT(*) n FROM questions GROUP BY cat').all();return J({c:r.results})}
  if(p=='/api/admin/questions'){const c=u.searchParams.get('cat'),r=await DB.prepare('SELECT id,cat,theme,text FROM questions WHERE cat=? ORDER BY id DESC LIMIT 300').bind(c).all();return J({rows:r.results})}
  if(p=='/api/admin/question'){const q=await DB.prepare('SELECT * FROM questions WHERE id=?').bind(Number(u.searchParams.get('id'))).first();if(!q)return E('Soal tidak ditemukan.',404);return J({q:{id:q.id,cat:q.cat,theme:q.theme,text:nm(q.text),options:nj(q.options),answer:q.answer,weights:q.weights?JSON.parse(q.weights):null,explain:nm(q.explain||''),trick:nm(q.trick||'')}})}
  if(p=='/api/admin/settheme'){await DB.prepare('UPDATE questions SET theme=? WHERE id=?').bind(body.theme,body.id).run();return J({ok:1})}
  if(p=='/api/admin/delq'){await DB.prepare('DELETE FROM questions WHERE id=?').bind(body.id).run();return J({ok:1})}
  if(p=='/api/admin/import'){const qs=Array.isArray(body.qs)?body.qs:[],rows=qs.map(clean),bad=rows.findIndex(x=>!x);if(bad>=0)return E('Soal nomor '+(bad+1)+' tidak valid (cek cat, 5 opsi, answer 0-4 atau weights 5 angka 1-5). Tidak ada yang disimpan.');
   const st=rows.map(r=>DB.prepare('INSERT INTO questions(cat,theme,text,options,answer,weights,explain,trick) VALUES(?,?,?,?,?,?,?,?)').bind(...r));
   if(body.mode=='replace')await DB.prepare('DELETE FROM questions').run();else if(body.mode=='replace_cat'){for(const c of new Set(rows.map(r=>r[0])))await DB.prepare('DELETE FROM questions WHERE cat=?').bind(c).run()}for(let i=0;i<st.length;i+=40)await DB.batch(st.slice(i,i+40));const asing=[...new Set(rows.filter(r=>r[1]&&!TM[r[0]].includes(r[1])).map(r=>r[0]+': '+r[1]))];return J({n:rows.length,asing})}
  if(p=='/api/admin/results'){const r=await DB.prepare('SELECT id,username,twk,tiu,tkp,total,passed,duration,created_at FROM results WHERE username=? ORDER BY id DESC LIMIT 50').bind(u.searchParams.get('u')).all();return J({rows:r.results})}
  if(p=='/api/admin/users'){const r=await DB.prepare('SELECT u.username,u.status,u.last_login,COUNT(r.id) n,MAX(r.total) best FROM users u LEFT JOIN results r ON r.username=u.username GROUP BY u.username').all();return J({rows:r.results})}
  if(p=='/api/admin/user'){if(body.del){await DB.prepare('DELETE FROM users WHERE username=?').bind(body.u).run();await DB.prepare('DELETE FROM results WHERE username=?').bind(body.u).run()}else await DB.prepare('UPDATE users SET status=? WHERE username=?').bind(body.st,body.u).run();return J({ok:1})}
  return E('Tidak ditemukan.',404)}
 if(me.r!='u')return E('Ditolak.',403);
 const us=await DB.prepare('SELECT status FROM users WHERE username=?').bind(me.u).first();if(!us||us.status!='ok')return E('Akun tidak aktif.',403);
 if(p=='/api/me'){const r=await DB.prepare('SELECT id,twk,tiu,tkp,total,passed,duration,created_at FROM results WHERE username=? ORDER BY id').bind(me.u).all();return J({u:me.u,hist:r.results.map(x=>({id:x.id,d:x.created_at,tw:x.twk,ti:x.tiu,tk:x.tkp,tot:x.total,ok:!!x.passed,dur:x.duration}))})}
 if(p=='/api/ranking'){const r=await DB.prepare('SELECT username,MAX(total) best,COUNT(*) n FROM results GROUP BY username ORDER BY best DESC LIMIT 50').all();return J({rows:r.results})}
 if(p=='/api/exam'){const qs=[];for(const c of['TWK','TIU','TKP']){let rs;if(c=='TIU'){const MN={'Silogisme':2,'Penalaran Analitis':2,'Analogi Kata dan Kalimat':2,'Figural':3,'Kecukupan Data':3},got=[];for(const[t,n]of Object.entries(MN)){const g=await DB.prepare('SELECT id,cat,theme,text,options FROM questions WHERE cat=? AND active=1 AND theme=? ORDER BY RANDOM() LIMIT ?').bind(c,t,n).all();got.push(...g.results)}const ids=got.map(x=>x.id),m=await DB.prepare('SELECT id,cat,theme,text,options FROM questions WHERE cat=? AND active=1'+(ids.length?' AND id NOT IN ('+ids.map(()=>'?').join(',')+')':'')+' ORDER BY RANDOM() LIMIT ?').bind(c,...ids,QN[c]-ids.length).all();rs=[...got,...m.results].sort(()=>Math.random()-.5)}else rs=(await DB.prepare('SELECT id,cat,theme,text,options FROM questions WHERE cat=? AND active=1 ORDER BY RANDOM() LIMIT ?').bind(c,QN[c]).all()).results;rs.forEach(x=>qs.push({id:x.id,c:x.cat,tm:x.theme,t:nm(x.text),o:nj(x.options)}))}return J({qs})}
 if(p=='/api/submit'){const ans=Array.isArray(body.ans)?body.ans:[];if(!ans.length)return E('Data kosong.');const ids=ans.map(a=>Number(a.id)).filter(Number.isInteger).slice(0,200);
  const M={};for(let i=0;i<ids.length;i+=80){const part=ids.slice(i,i+80),r=await DB.prepare(`SELECT * FROM questions WHERE id IN (${part.map(()=>'?').join(',')})`).bind(...part).all();r.results.forEach(x=>M[x.id]=x)}
  const s={TWK:0,TIU:0,TKP:0},n={TWK:0,TIU:0,TKP:0},rev=[],snq=[],sna=[];
  for(const a of ans){const q=M[a.id];if(!q)continue;const w=q.weights?JSON.parse(q.weights):null;n[q.cat]+=5;const given=a.a!=null&&a.a>=0&&a.a<=4;
   if(given)s[q.cat]+=q.cat=='TKP'?w[a.a]:(a.a==q.answer?5:0);rev.push({id:q.id,k:q.answer,w,p:nm(q.explain),tr:nm(q.trick)});
   snq.push({id:q.id,c:q.cat,tm:q.theme,t:nm(q.text),o:nj(q.options)});sna.push(given?Number(a.a):null)}
  const f=c=>n[c]?Math.round(s[c]/n[c]*FULL[c]):0,tw=f('TWK'),ti=f('TIU'),tk=f('TKP'),ok=tw>=PG.TWK&&ti>=PG.TIU&&tk>=PG.TKP,d=new Date().toLocaleString('id-ID',{timeZone:'Asia/Makassar'}),dur=String(body.dur||'').slice(0,8);
  const ins=await DB.prepare('INSERT INTO results(username,twk,tiu,tkp,total,passed,duration,created_at,review) VALUES(?,?,?,?,?,?,?,?,?)').bind(me.u,tw,ti,tk,tw+ti+tk,ok?1:0,dur,d,JSON.stringify({qs:snq,a:sna,rev})).run();
  return J({h:{id:ins.meta&&ins.meta.last_row_id,d,tw,ti,tk,tot:tw+ti+tk,ok,dur},rev})}
 if(p=='/api/review'){const id=u.searchParams.get('id');
  const r=id?await DB.prepare('SELECT * FROM results WHERE id=? AND username=?').bind(Number(id),me.u).first():await DB.prepare('SELECT * FROM results WHERE username=? AND review IS NOT NULL ORDER BY id DESC LIMIT 1').bind(me.u).first();
  if(!r)return E('Belum ada ujian.',404);if(!r.review)return E('Pembahasan ujian ini tidak tersimpan (dikerjakan sebelum fitur ini ada).',404);
  const v=nj(r.review);return J({h:{id:r.id,d:r.created_at,tw:r.twk,ti:r.tiu,tk:r.tkp,tot:r.total,ok:!!r.passed,dur:r.duration},qs:v.qs,a:v.a,rev:v.rev})}
 if(p=='/api/themes'){const r=await DB.prepare('SELECT cat,theme,COUNT(*) n FROM questions WHERE active=1 GROUP BY cat,theme ORDER BY cat,theme').all();return J({rows:r.results})}
 if(p=='/api/practice'){const c=u.searchParams.get('cat'),t=u.searchParams.get('theme');let q='SELECT id,cat,theme,text,options FROM questions WHERE active=1 AND cat=?';const a=[c];if(t){q+=' AND theme=?';a.push(t)}const r=await DB.prepare(q+' ORDER BY RANDOM() LIMIT 20').bind(...a).all();return J({qs:r.results.map(x=>({id:x.id,c:x.cat,tm:x.theme,t:nm(x.text),o:nj(x.options)}))})}
 if(p=='/api/check'){const q=await DB.prepare('SELECT * FROM questions WHERE id=?').bind(body.id).first();if(!q)return E('Soal tidak ada.',404);const w=q.weights?JSON.parse(q.weights):null,a=Number(body.a);return J({k:q.answer,w,p:nm(q.explain),tr:nm(q.trick),pt:q.cat=='TKP'?w[a]:(a==q.answer?5:0)})}
 return E('Tidak ditemukan.',404)}catch(x){return E('Kesalahan server: '+x.message,500)}}}
