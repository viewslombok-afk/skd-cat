
let HX='',LSY=0,RESTORE=false,THC=null,PL={c:'',t:''},PT=null;
let PRT=0;try{PRT=+localStorage.getItem('prt')||0}catch(x){}
const QNF={TWK:30,TIU:35,TKP:45};
const mmss=s=>String(Math.max(0,s)/60|0).padStart(2,'0')+':'+String(Math.max(0,s)%60).padStart(2,'0');

/* ---------- header sticky + navigasi ---------- */
function shell(inner,adm){
 const BK=adm?"V='dash';location.hash=''":({materi:"go('dash')",rank:"go('dash')",brief:"go('dash')",exam:"exitEx()",result:"go('dash')",latihan:"go('dash')"})[V]||'';
 const ic={dash:'🏠',materi:'📚',latihan:'✍️',rank:'🏆'};
 const n=(v,l)=>`<a class="${V==v?'on':''}" onclick="go('${v}')"><i>${ic[v]}</i>${l}</a>`;
 const nav=cur&&!adm&&V!='exam'?`<nav>${n('dash','Dashboard')}${n('materi','Materi')}${n('latihan','Latihan')}${n('rank','Peringkat')}<a onclick="logout()"><i>🚪</i>Keluar</a></nav>`:'';
 const hx=HX;HX='';
 $('app').innerHTML=`<header class="hd"><div class="hd1">${BK?`<button class="back" onclick="${BK}" title="Kembali">${hx?'←':'←'}</button>`:''}<div class="ttl"><b>CAT SKD SIMULATOR</b><span>${adm?'Panel Pemilik':cur?'Halo, '+e(cur):'Silakan masuk'}</span></div>${hx}</div>${nav}</header><main>${inner}</main>`}
function go(v){scrollTo(0,0);V=v;route()}

/* ---------- info passing grade ---------- */
const needSoal=c=>Math.ceil(PG[c]*QNF[c]/FULL[c]);
function pgBox(h){const S={TWK:h.tw,TIU:h.ti,TKP:h.tk};
 return `<div class="pgb">${['TWK','TIU','TKP'].map(c=>{const s=S[c],g=PG[c]-s;
  const msg=g<=0?`<span class="ok">✓ Lulus${g<0?', lebih '+(-g)+' poin':' (tepat di batas)'}</span>`:c=='TKP'?`<span class="no">Kurang <b>${g}</b> poin lagi</span>`:`<span class="no">Kurang ${g} poin = <b>${Math.ceil(g/5)} soal benar lagi</b></span>`;
  return `<div class="pgl"><span><b>${c}</b> ${s} / min ${PG[c]}</span>${msg}</div>`}).join('')}</div>`}
function targetHTML(){const a=needSoal('TWK'),b=needSoal('TIU');
 return `<div class="card"><h3>🎯 Syarat Lulus Passing Grade</h3><p class="mu" style="margin:0">Ketiga bagian wajib terpenuhi sekaligus.</p><div class="pgb"><div class="pgl"><span><b>TWK</b> min ${PG.TWK}</span><span>minimal <b>${a} soal benar</b> dari ${QNF.TWK} (salah maks ${QNF.TWK-a})</span></div><div class="pgl"><span><b>TIU</b> min ${PG.TIU}</span><span>minimal <b>${b} soal benar</b> dari ${QNF.TIU} (salah maks ${QNF.TIU-b})</span></div><div class="pgl"><span><b>TKP</b> min ${PG.TKP}</span><span>rata-rata bobot <b>≥ ${(PG.TKP/QNF.TKP).toFixed(2).replace('.',',')}</b> per soal dari ${QNF.TKP}</span></div></div></div>`}

/* ---------- dashboard ---------- */
function dash(){const h=U[cur].hist,l=h[h.length-1],pr=h[h.length-2],d=l&&pr?l.tot-pr.tot:null;
shell(`<div class="card"><div class="row" style="align-items:center;justify-content:space-between"><h2 style="margin:0">Nilai Terbaru</h2>${l?`<span class="mu" style="flex:0 1 auto">${e(l.d)}</span>`:''}</div>${l?`<div class="row" style="margin-top:10px"><div class="stat">TWK<b class="${l.tw>=PG.TWK?'ok':'no'}">${l.tw}</b></div><div class="stat">TIU<b class="${l.ti>=PG.TIU?'ok':'no'}">${l.ti}</b></div><div class="stat">TKP<b class="${l.tk>=PG.TKP?'ok':'no'}">${l.tk}</b></div><div class="stat">Total<b>${l.tot}</b><span class="${l.ok?'ok':'no'}">${l.ok?'LULUS':'BELUM LULUS'}</span></div></div>${pgBox(l)}${d!==null?`<p style="margin:10px 0 0">${d>0?'📈 Naik':d<0?'📉 Turun':'➖ Stagnan'} ${Math.abs(d)} poin dari tryout sebelumnya.</p>`:''}`:'<p class="mu">Belum ada tryout. Mulai sekarang!</p>'}</div>
${targetHTML()}
<div class="card"><h3>Mulai Belajar</h3><div class="acts"><button class="btn ok" onclick="go('brief')">📝 Ujian CAT (110 soal)</button><button class="btn" onclick="go('latihan')">✍️ Latihan Soal</button><button class="btn g" onclick="go('materi')">📚 Materi</button>${l&&l.id?`<button class="btn y" onclick="openHist(${l.id})">🔍 Pembahasan Terakhir</button>`:''}</div><p class="mu" style="margin:10px 0 0">Ujian 100 menit. Skor diproyeksikan ke skala penuh SKD (TWK 150, TIU 175, TKP 225) bila paket kurang dari 110 soal.</p></div>
<div class="card"><h3>Grafik Riwayat Total Nilai</h3>${chart(h)}</div>
<div class="card sc"><h3>Riwayat</h3><table><tr><th>Tanggal</th><th>TWK</th><th>TIU</th><th>TKP</th><th>Total</th><th>Waktu</th><th>Status</th><th>Pembahasan</th></tr>${h.slice().reverse().map(x=>`<tr><td>${x.d}</td><td>${x.tw}</td><td>${x.ti}</td><td>${x.tk}</td><td>${x.tot}</td><td>${x.dur}</td><td class="${x.ok?'ok':'no'}">${x.ok?'Lulus':'Belum'}</td><td>${x.id?`<button class="btn" onclick="openHist(${x.id})">Lihat</button>`:'-'}</td></tr>`).join('')||'<tr><td colspan="8" class="mu">Belum ada riwayat.</td></tr>'}</table></div>`)}

/* ---------- ujian: timer di header (ikut freeze) ---------- */
function examUI(){const q=ex.qs[ex.i],last=ex.i==ex.qs.length-1,all=ex.a.every(x=>x!==null);HX=`<span class="tm" id="tm">${fmt(ex.left)}</span>`;
shell(`<div class="ex"><div class="card q"><div class="tabs">${['TWK','TIU','TKP'].map(c=>`<button class="${q.c==c?'on':''}" onclick="ex.i=Math.max(0,ex.qs.findIndex(x=>x.c=='${c}'));examUI();scrollTo(0,0)">${c}</button>`).join('')}</div><div class="row" style="justify-content:space-between"><span class="tag">${q.c}${q.tm?' · '+e(q.tm):''}</span><b>Soal ${ex.i+1} dari ${ex.qs.length}</b></div><p style="font-size:17px;margin:14px 0">${rq(q.t)}</p>${q.o.map((o,k)=>`<button class="opt ${ex.a[ex.i]===k?'s':''}" onclick="pick(${k})"><b>${'ABCDE'[k]}.</b> ${ro(o)}</button>`).join('')}<div class="bar"><button class="btn g" onclick="mv(-1)">Sebelumnya</button><button class="btn y" onclick="doubt()">Ragu-Ragu</button>${last?'<button class="btn ok" onclick="askFinish()">Selesai &amp; Kirim</button>':'<button class="btn" onclick="mv(1)">Selanjutnya</button>'}</div>${all&&!last?'<button class="btn ok" style="width:100%;margin-top:10px" onclick="askFinish()">✅ Semua terjawab: Selesai &amp; Kirim Jawaban</button>':''}</div>
<div class="card nv"><div class="grid" style="margin:0 0 12px">${ex.qs.map((_,i)=>`<button class="${ex.s[i]==2?'d':ex.s[i]==1?'a':''} ${i==ex.i?'cur':''}" onclick="ex.i=${i};examUI();scrollTo(0,0)">${i+1}</button>`).join('')}</div><p class="mu">🟦 Dijawab · 🟨 Ragu-ragu · ⬜ Belum</p><button class="btn ${all?'ok':'r'}" style="width:100%" onclick="askFinish()">${all?'Selesai &amp; Kirim Jawaban':'Selesai Ujian'}</button></div></div>`)}
function mv(d){const n=ex.i+d;if(n>=0&&n<ex.qs.length){ex.i=n;examUI();scrollTo(0,0)}}

/* ---------- latihan: menu, waktu, next/back, scroll tersimpan ---------- */
/* ---------- Latihan v4: gerbang Mulai, waktu kustom, alarm, catatan waktu menjawab ---------- */
document.head.insertAdjacentHTML('beforeend','<style>.chips{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.chip{flex:0 0 auto;min-height:40px;padding:8px 14px;border-radius:99px;border:1.5px solid var(--b);background:var(--g);color:var(--tx);font:inherit;font-weight:600;cursor:pointer}.chip.on{background:var(--bl);border-color:var(--bl);color:#fff}.cust{display:flex;gap:8px;align-items:center;margin:6px 0}.cust input{flex:1;min-width:0;margin:0}.rec{background:rgba(37,99,235,.08);border-left:4px solid var(--bl);padding:10px 12px;border-radius:8px;font-size:14px;margin:10px 0}.big{font-size:18px;min-height:54px;width:100%}.tk{display:flex;justify-content:space-between;gap:4px 10px;flex-wrap:wrap;padding:9px 12px;border-radius:10px;background:var(--bg);margin:0 0 8px;font-size:14px}.tb{width:100%;font-size:14px}.tb td,.tb th{padding:5px 6px}</style>');
const PRT_OPT=[[0,'Tanpa batas'],[30,'30 dtk'],[45,'45 dtk'],[50,'50 dtk'],[60,'60 dtk'],[90,'90 dtk']];
let SND=true,AC=null;try{SND=localStorage.getItem('snd')!='0'}catch(x){}
const prtLab=s=>s?(s>=60&&s%60==0?s/60+' menit':s+' detik'):'tanpa batas';
const REC='<div class="rec">💡 <b>Waktu yang disarankan:</b> SKD asli 100 menit untuk 110 soal, rata-rata sekitar 55 detik per soal. Mulai dari <b>60 detik</b>, lalu pindah ke <b>50 detik</b> (paling pas untuk latihan kecepatan), dan <b>45 detik</b> sebagai tantangan. Soal hitungan panjang boleh sedikit lebih lama, soal verbal harus lebih cepat.</div>';
function audioUnlock(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state=='suspended')AC.resume()}catch(x){}}
function beep(t0,f,d){try{const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+t0;o.type='square';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.35,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+.05)}catch(x){}}
function alarm(){if(!SND)return;audioUnlock();[0,.35,.7,1.05].forEach((t,i)=>beep(t,i==3?1100:880,.25));try{navigator.vibrate&&navigator.vibrate([300,120,300,120,600])}catch(x){}}
function timeCtl(){const pre=PRT_OPT.some(o=>o[0]==PRT);
 return `<div class="chips">${PRT_OPT.map(o=>`<button class="chip ${o[0]==PRT?'on':''}" onclick="setPrt(${o[0]})">${o[1]}</button>`).join('')}</div><div class="cust"><input id="prtc" type="number" inputmode="numeric" min="5" max="900" placeholder="Atur sendiri (detik), mis. 75" value="${pre?'':PRT}"><button class="btn" style="flex:0 0 auto" onclick="setPrtC($('prtc').value)">Pakai</button></div><p class="mu" style="margin:0">Dipilih: <b>${prtLab(PRT)}</b> per soal${pre?'':' (kustom)'}</p><label style="display:flex;gap:8px;align-items:center;margin:10px 0 0"><input type="checkbox" style="width:auto;margin:0" ${SND?'checked':''} onchange="setSnd(this.checked)"> 🔔 Alarm bunyi dan getar saat waktu habis</label><button class="btn g" style="margin-top:8px" onclick="audioUnlock();alarm()">🔊 Tes alarm</button>`}
function savePrt(){try{localStorage.setItem('prt',PRT)}catch(x){}const c=$('tctl');if(c)c.innerHTML=timeCtl()}
function setPrt(v){PRT=+v;savePrt()}
function setPrtC(v){v=Math.round(+v);if(!(v>=5&&v<=900))return alert('Isi antara 5 sampai 900 detik.');PRT=v;savePrt()}
function setSnd(b){SND=!!b;try{localStorage.setItem('snd',b?'1':'0')}catch(x){}}
async function latihan(){if(P)return prUI();
 if(!THC){const r=await api('themes');THC=r.rows||[]}
 const g={};THC.forEach(x=>(g[x.cat]=g[x.cat]||[]).push(x));
 shell(`<div class="card"><h2>Mode Latihan</h2><p class="mu" style="margin:0">Pilih tema di bawah. Sebelum soal muncul ada tombol Mulai, dan waktu per soal bisa diatur. Setelah menjawab langsung muncul kunci, pembahasan, cara menjawab, trik cepat, dan lama waktu menjawabmu. Nilai latihan tidak masuk peringkat.</p><label class="lbl">⏱ Waktu per soal</label><div id="tctl">${timeCtl()}</div>${REC}</div>${['TWK','TIU','TKP'].map(c=>`<div class="card"><h3>${c}</h3><button class="btn g th" onclick="startPr('${c}','')"><span>Semua tema ${c}</span></button>${(g[c]||[]).filter(x=>x.theme).map(x=>`<button class="btn g th" onclick="startPr('${c}',decodeURIComponent('${encodeURIComponent(x.theme)}'))"><span>${e(x.theme)}</span><small>${x.n} soal</small></button>`).join('')}</div>`).join('')}`);
 if(RESTORE){RESTORE=false;scrollTo(0,LSY)}}
async function startPr(c,t){const y=scrollY,r=await api('practice?cat='+c+'&theme='+encodeURIComponent(t));if(!r.qs||!r.qs.length)return alert('Belum ada soal.');
 if(!P)LSY=y;PL={c,t};P={qs:r.qs,i:0,fb:[],pt:0,ok:0,tmax:0,used:[],ts:null,started:false,done:false};prStartUI();scrollTo(0,0)}
function prStartUI(){clearInterval(PT);HX='';
 shell(`<div class="card"><h2>Siap berlatih?</h2><p style="margin:0 0 4px"><span class="tag">${PL.c}</span> <b>${PL.t?e(PL.t):'Semua tema'}</b> · ${P.qs.length} soal</p><p class="mu">Soal disembunyikan sampai kamu menekan Mulai. Waktu langsung berjalan bersamaan dengan munculnya soal. Untuk soal berikutnya, waktu berjalan begitu kamu menekan Selanjutnya.</p><label class="lbl">⏱ Waktu per soal</label><div id="tctl">${timeCtl()}</div>${REC}<button class="btn ok big" onclick="prBegin()">▶ Mulai</button><button class="btn g" style="width:100%;margin-top:8px" onclick="exitPr()">↩ Kembali ke menu</button></div>`)}
function prBegin(){const cv=Math.round(+(($('prtc')||{}).value));if(cv>=5&&cv<=900&&cv!=PRT){PRT=cv;try{localStorage.setItem('prt',PRT)}catch(x){}}
 audioUnlock();P.tmax=PRT;P.started=true;P.ts=null;prUI();scrollTo(0,0)}
function exitPr(){clearInterval(PT);P=null;RESTORE=true;latihan()}
function prEl(i){return (P.used[i]||0)+(P.ts!=null&&i==P.i?(Date.now()-P.ts)/1000:0)}
function prFreeze(){if(P&&P.ts!=null){P.used[P.i]=(P.used[P.i]||0)+(Date.now()-P.ts)/1000;P.ts=null}clearInterval(PT)}
function prStat(i){const f=P.fb[i],q=P.qs[i];return !f?'':f.to?'gbad':q.c=='TKP'?(f.pt==5?'gok':f.pt>=3?'gpart':'gbad'):(f.good?'gok':'gbad')}
function prGo(d){const n=P.i+d;if(n>=0&&n<P.qs.length){prFreeze();P.i=n;prUI();scrollTo(0,0)}}
function prJump(n){prFreeze();P.i=n;prUI();scrollTo(0,0)}
const sec=x=>Math.max(1,Math.round(x));
function tkLine(f){if(f.used==null)return '';const u=sec(f.used),T=f.tmax;
 const cmp=f.to?`<span class="no">Waktu habis (batas ${T} detik)</span>`:T?(u<=T?`<span class="ok">${Math.max(0,T-u)} detik lebih cepat dari batas ${T} detik</span>`:`<span class="no">lewat batas</span>`):'<span class="mu">tanpa batas waktu</span>';
 return `<div class="tk"><span>⏱ ${f.to?'Tidak sempat dijawab':'Dijawab dalam <b>'+u+' detik</b>'}</span>${cmp}</div>`}
function prUI(){if(!P.started)return prStartUI();const i=P.i,q=P.qs[i],f=P.fb[i],t=q.c=='TKP',n=P.qs.length,last=i==n-1;clearInterval(PT);
 const run=!f&&!P.done;if(run&&P.ts==null)P.ts=Date.now();
 const el=run?prEl(i):0,rem=P.tmax?Math.max(0,Math.ceil(P.tmax-el)):0;
 HX=run?`<span class="tm ${P.tmax&&rem<=10?'warn':''}" id="ptm">${P.tmax?mmss(rem):'⏱ '+mmss(Math.floor(el))}</span>`:'';
 shell(`<div class="card prc"><div class="pnv">${P.qs.map((_,k)=>`<button class="pn ${prStat(k)} ${k==i?'cur':''}" onclick="prJump(${k})">${k+1}</button>`).join('')}</div>${run&&P.tmax?`<div class="pbar"><i id="ptb" style="width:${rem/P.tmax*100}%"></i></div>`:''}<div class="row" style="justify-content:space-between;align-items:center"><span class="tag" style="flex:0 1 auto">${q.c}${q.tm?' · '+e(q.tm):''}</span><b style="flex:0 0 auto;min-width:0">Soal ${i+1} / ${n}</b></div><p style="font-size:17px;margin:14px 0">${rq(q.t)}</p>${q.o.map((o,k)=>{let st='';if(f){const best=t?f.w[k]==5:k==f.k;if(best)st='border-color:#16a34a;background:rgba(22,163,74,.15)';else if(k===f.a)st='border-color:#dc2626;background:rgba(220,38,38,.15)'}return `<button class="opt" style="${st}" ${f||P.done?'disabled':''} onclick="prPick(${k})"><b>${'ABCDE'[k]}.</b> ${ro(o)}${f&&t?` <span class="mu">(bobot ${f.w[k]})</span>`:''}</button>`}).join('')}${f?`<div class="card" style="margin-top:10px;background:var(--bg)">${tkLine(f)}<b class="${f.good?'ok':'no'}">${f.to?'⏰ Waktu habis!':t?(f.good?'Jawaban terbaik! +5':'Bobot jawabanmu: '+f.pt):(f.good?'Benar! +5':'Salah')}</b><p>${t?'Kunci terbaik: '+'ABCDE'[f.w.indexOf(5)]:'Kunci: '+'ABCDE'[f.k]}</p>${gdHTML(q,f)}</div>`:''}<div class="bar"><button class="btn g" style="flex:0 0 auto" onclick="exitPr()">↩ Menu</button><button class="btn" onclick="prGo(-1)" ${i==0?'disabled':''}>◀ Sebelumnya</button>${last?'<button class="btn ok" onclick="prEnd()">Selesai</button>':'<button class="btn" onclick="prGo(1)">Selanjutnya ▶</button>'}</div></div>`);
 if(run)PT=setInterval(prTick,250)}
function prTick(){if(!P||V!='latihan'||!P.started){clearInterval(PT);return}const i=P.i;if(P.fb[i]||P.done||P.ts==null){clearInterval(PT);return}
 const el=prEl(i),rem=P.tmax?Math.max(0,Math.ceil(P.tmax-el)):0,b=$('ptm'),bar=$('ptb');
 if(b){b.textContent=P.tmax?mmss(rem):'⏱ '+mmss(Math.floor(el));if(P.tmax&&rem<=10)b.classList.add('warn')}if(bar)bar.style.width=Math.max(0,(P.tmax-el)/P.tmax*100)+'%';
 if(P.tmax&&el>=P.tmax){clearInterval(PT);prTimeout(i)}}
async function prTimeout(i){prFreeze();alarm();const q=P.qs[i],r=await api('check',{id:q.id,a:-1});if(!P||P.fb[i])return;if(!r.ok){P.used[i]=Math.max(0,P.tmax-10);return P.i==i&&prUI()}
 r.a=null;r.pt=0;r.good=false;r.to=true;r.used=P.tmax;r.tmax=P.tmax;P.fb[i]=r;P.used[i]=P.tmax;if(P.i==i&&V=='latihan'){const y=scrollY;prUI();scrollTo(0,y)}}
async function prPick(k){const i=P.i;if(P.fb[i]||P.done)return;prFreeze();const used=P.used[i]||0,q=P.qs[i],tm=P.tmax;const r=await api('check',{id:q.id,a:k});
 if(!r.ok){alert(r.error);if(P&&P.i==i)prUI();return}
 r.a=k;r.good=r.pt==5;r.used=used;r.tmax=tm;P.fb[i]=r;P.pt+=r.pt;if(r.good)P.ok++;if(P.i==i){const y=scrollY;prUI();scrollTo(0,y)}}
function prEnd(){const n=P.qs.length,un=n-P.fb.filter(Boolean).length;if(!P.done&&un&&!confirm('Masih '+un+' soal belum dijawab. Tetap selesai?'))return;prFreeze();P.done=true;const x=P;
 const ans=x.fb.map((f,i)=>f&&!f.to?{i,u:sec(f.used||0)}:null).filter(Boolean),avg=ans.length?Math.round(ans.reduce((s,a)=>s+a.u,0)/ans.length):0,fast=ans.length?ans.reduce((a,b)=>b.u<a.u?b:a):null,slow=ans.length?ans.reduce((a,b)=>b.u>a.u?b:a):null,to=x.fb.filter(f=>f&&f.to).length;
 shell(`<div class="card"><h2>Latihan Selesai</h2><div class="row"><div class="stat">Benar<b>${x.ok}/${n}</b></div><div class="stat">Poin<b>${x.pt}/${n*5}</b></div><div class="stat">Belum dijawab<b>${un}</b></div></div><div class="row" style="margin-top:8px"><div class="stat">Rata-rata waktu<b>${avg}<small> dtk</small></b></div><div class="stat">Tercepat<b>${fast?fast.u:'-'}<small> dtk</small></b></div><div class="stat">Terlama<b>${slow?slow.u:'-'}<small> dtk</small></b></div><div class="stat">Waktu habis<b>${to}</b></div></div>${x.tmax?`<p class="mu" style="margin:8px 0 0">Batas waktu: ${prtLab(x.tmax)} per soal. ${avg&&avg<=x.tmax?'Rata-rata kamu '+(x.tmax-avg)+' detik lebih cepat dari batas.':''}</p>`:''}<p class="mu" style="margin:10px 0 6px">Ketuk nomor untuk meninjau soal dan pembahasannya. Hijau benar, merah salah atau waktu habis.</p><div class="pnv" style="flex-wrap:wrap">${x.qs.map((_,i)=>`<button class="pn ${prStat(i)}" onclick="prJump(${i})">${i+1}</button>`).join('')}</div><div class="sc"><table class="tb"><tr><th>No</th><th>Waktu</th><th>Hasil</th></tr>${x.qs.map((_,i)=>{const f=x.fb[i];return `<tr><td>${i+1}</td><td>${f?(f.to?'habis':sec(f.used||0)+' dtk'):'-'}</td><td class="${f?(f.good?'ok':'no'):'mu'}">${f?(f.to?'Waktu habis':f.good?'Benar':'Salah'):'Belum'}</td></tr>`}).join('')}</table></div><div class="acts" style="margin-top:10px"><button class="btn" onclick="prJump(0)">🔍 Tinjau Soal</button><button class="btn ok" onclick="startPr(PL.c,PL.t)">🔁 Ulangi Tema Ini</button><button class="btn g" onclick="exitPr()">↩ Menu Latihan</button><button class="btn g" onclick="P=null;go('dash')">Dashboard</button></div></div>`);scrollTo(0,0)}

/* ---------- Materi TIU lengkap ---------- */
M.TIU.n='Tes Intelegensia Umum · 35 soal · maks 175 · passing grade 80 (min. 16 soal benar)';
M.TIU.d='Materi lengkap TIU: berhitung dan trik cepat, aritmatika sosial, perbandingan, kecepatan, logika, deret, analogi, silogisme, verbal, dan figural. Tips waktu: jangan lebih dari 1,5 menit per soal. Soal yang macet langsung tandai ragu-ragu dan lanjut.';
M.TIU.s=[
{t:'⭐ Strategi TIU: Urutan dan Waktu',i:[
'TARGET: passing grade 80 = minimal 16 dari 35 soal benar (tiap benar 5 poin, salah 0, tidak ada pengurangan). Jadi SELALU isi semua soal, tebak bila perlu.',
'URUTAN PENGERJAAN: kerjakan dulu yang cepat (verbal: sinonim, antonim, analogi; deret sederhana; hitungan pendek). Soal cerita panjang dan figural rumit dikerjakan belakangan.',
'BATAS WAKTU: TIU rata-rata 1,5 menit per soal. Lewat 2 menit, tebak dengan eliminasi lalu pindah.',
'ELIMINASI OPSI: untuk hitungan, perkirakan hasil kasar dulu (pembulatan), lalu coret opsi yang jauh. Cek angka satuan terakhir untuk membuang opsi yang tidak mungkin.'
],k:'Selesaikan soal mudah dulu, tandai ragu pada soal berat, dan jangan pernah mengosongkan jawaban.'},
{t:'1. Pecahan, Desimal, dan Persen (Pecahan Istimewa)',i:[
'PECAHAN ISTIMEWA (hafal): 1/2 = 50% · 1/3 = 33,33% · 2/3 = 66,67% · 1/4 = 25% · 3/4 = 75% · 1/5 = 20% · 2/5 = 40% · 3/5 = 60% · 4/5 = 80% · 1/6 = 16,67% · 1/8 = 12,5% · 3/8 = 37,5% · 5/8 = 62,5% · 7/8 = 87,5% · 1/10 = 10% · 1/12 = 8,33%.',
'Turunan: 1/9 = 11,11% · 1/7 ≈ 14,29% · 1/16 = 6,25% · 1/20 = 5% · 1/25 = 4% · 1/40 = 2,5% · 1/50 = 2%.',
'CARA PAKAI: mencari 37,5% dari 480 → 37,5% = 3/8 → 480 : 8 × 3 = 180. Jauh lebih cepat daripada 480 × 0,375.',
'TRIK PERSEN TUKAR: A% dari B = B% dari A. Contoh: 8% dari 50 = 50% dari 8 = 4. Dan 16% dari 25 = 25% dari 16 = 4. Pilih sisi yang lebih mudah.',
'PERSEN PERUBAHAN: naik x% → kalikan (100+x)/100. Turun x% → kalikan (100−x)/100. Naik 25% lalu turun 20% = 1,25 × 0,8 = 1 (kembali sama, tidak berubah).',
'Persen naik/turun: (selisih : nilai awal) × 100%. Selalu bagi dengan nilai AWAL, bukan nilai akhir.',
'PECAHAN CAMPURAN → biasa: a b/c = (a×c + b)/c. Contoh: 3 2/5 = 17/5.',
'PENJUMLAHAN PECAHAN: samakan penyebut dengan KPK. Pembagian pecahan: kalikan dengan kebalikan pembagi (a/b : c/d = a/b × d/c).',
'DESIMAL: 0,5 × 0,04 → hitung 5 × 4 = 20, lalu beri koma sebanyak total angka di belakang koma (1 + 2 = 3) → 0,020 = 0,02. Dibagi 10 berarti koma geser satu ke kiri.',
'URUTAN OPERASI: kurung → pangkat/akar → kali/bagi (dari kiri) → tambah/kurang (dari kiri).'
],k:'Hafalkan pecahan istimewa lalu ubah persen ke pecahan sebelum menghitung, dan gunakan trik A% dari B = B% dari A.'},
{t:'2. Bilangan: Faktor, KPK, FPB, Pangkat, Akar',i:[
'KPK = kelipatan persekutuan terkecil (untuk soal "bersamaan lagi" / "bertemu kembali"). FPB = faktor persekutuan terbesar (untuk soal "dibagi sama banyak" / "kelompok terbanyak").',
'Cara cepat: faktorkan prima, KPK ambil pangkat TERBESAR semua faktor, FPB ambil pangkat TERKECIL faktor yang sama. 12 = 2²×3 dan 18 = 2×3² → KPK = 2²×3² = 36, FPB = 2×3 = 6.',
'Hubungan: KPK × FPB = a × b (untuk dua bilangan).',
'CONTOH LAMPU: lampu A tiap 4 detik, B tiap 6 detik menyala → menyala bersamaan tiap KPK(4,6) = 12 detik.',
'KUADRAT HAFAL: 11²=121, 12²=144, 13²=169, 14²=196, 15²=225, 16²=256, 17²=289, 18²=324, 19²=361, 20²=400, 25²=625. KUBIK: 2³=8, 3³=27, 4³=64, 5³=125, 6³=216, 7³=343, 8³=512, 9³=729, 10³=1000.',
'KUADRAT BILANGAN BERAKHIR 5: (n5)² = n×(n+1) lalu tulis 25. Contoh 35² → 3×4=12 → 1225. 75² → 7×8=56 → 5625.',
'SIFAT PANGKAT: aᵐ×aⁿ = aᵐ⁺ⁿ · aᵐ:aⁿ = aᵐ⁻ⁿ · (aᵐ)ⁿ = aᵐⁿ · a⁰ = 1 · a⁻ⁿ = 1/aⁿ.',
'SIFAT AKAR: √(a×b) = √a×√b. √50 = √(25×2) = 5√2. Merasionalkan: 1/√a = √a/a.',
'DIVISIBILITAS: habis dibagi 3 bila jumlah digit habis dibagi 3; dibagi 9 bila jumlah digit habis dibagi 9; dibagi 4 bila dua digit terakhir habis dibagi 4; dibagi 6 bila genap dan habis dibagi 3; dibagi 11 bila selisih jumlah digit posisi ganjil dan genap kelipatan 11.',
'ANGKA SATUAN POLA PANGKAT: satuan 2ⁿ berulang 2,4,8,6 (periode 4); 3ⁿ: 3,9,7,1; 7ⁿ: 7,9,3,1; 4ⁿ: 4,6; 9ⁿ: 9,1; 5, 6, 0, 1 selalu tetap.',
'BILANGAN PRIMA ≤ 50: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47.'
],k:'Kata bersamaan lagi berarti KPK, kata dibagi sama banyak berarti FPB, dan cek satuan terakhir untuk menyingkirkan opsi.'},
{t:'3. Perbandingan Senilai dan Berbalik Nilai',i:[
'SENILAI (searah): makin banyak A makin banyak B. Contoh: barang dan harga, bensin dan jarak. Rumus: a₁/a₂ = b₁/b₂ (silang kali).',
'BERBALIK NILAI: makin banyak A makin sedikit B. Contoh: pekerja dan waktu, kecepatan dan waktu tempuh. Rumus: a₁ × b₁ = a₂ × b₂.',
'CONTOH 1 (berbalik nilai): 6 orang menyelesaikan pekerjaan dalam 15 hari. Jika ditambah 3 orang (jadi 9 orang), selesai dalam? 6×15 = 9×x → x = 10 hari. Hemat 5 hari.',
'CONTOH 2: 12 pekerja selesai 20 hari. Setelah 8 hari, tambah pekerja sehingga sisa selesai 6 hari. Sisa pekerjaan = 12 hari-kerja. Total beban 12×12 = 144 orang-hari. Dibutuhkan 144:6 = 24 orang → tambah 12 orang.',
'PEKERJAAN BERSAMA (kerja bareng): waktu = 1 / (1/a + 1/b). A selesai 6 hari, B selesai 3 hari → bersama 1/(1/6+1/3) = 1/(1/2) = 2 hari.',
'Jika A dan B bersama selesai t hari, dan A sendiri a hari, maka B sendiri: 1/b = 1/t − 1/a.',
'TRIK ORANG-HARI: anggap total pekerjaan = (orang × hari). Soal ditambah atau dikurangi orang tinggal bagi total tadi dengan orang baru.',
'SKALA/PETA: jarak sebenarnya = jarak peta × penyebut skala. Skala 1:2.000.000 dengan jarak 5 cm = 10.000.000 cm = 100 km.',
'PERBANDINGAN BAGI: uang Rp 600.000 dibagi A:B:C = 2:3:5 → jumlah bagian 10; A=2/10×600.000=120.000, B=180.000, C=300.000.',
'SELISIH BAGIAN: selisih bagian × nilai satu bagian = selisih nilai. Cari nilai satu bagian dulu.'
],k:'Tentukan dulu searah atau berbalik. Jika berbalik (pekerja dan hari), kalikan keduanya. Jika searah, kali silang.'},
{t:'4. Kecepatan, Jarak, Waktu (Berpapasan dan Menyusul)',i:[
'RUMUS DASAR: Jarak = Kecepatan × Waktu · Kecepatan = Jarak : Waktu · Waktu = Jarak : Kecepatan. Segitiga: S di atas, K×W di bawah.',
'KONVERSI: 1 m/s = 3,6 km/jam. 72 km/jam = 20 m/s. 1 jam = 60 menit. 30 menit = 0,5 jam. Hati-hati satuan.',
'BERPAPASAN (arah berlawanan): kecepatan DIJUMLAH. Waktu bertemu = jarak awal : (v₁ + v₂). Contoh: A–B 150 km, mobil 50 km/jam dan 70 km/jam berangkat bersamaan berlawanan → bertemu 150 : 120 = 1,25 jam.',
'MENYUSUL (searah): kecepatan DIKURANGI. Waktu menyusul = jarak awal : (v₁ − v₂). Contoh: A berangkat 40 km/jam, 1 jam kemudian B 60 km/jam menyusul. Jarak awal saat B berangkat = 40 km; waktu = 40 : (60−40) = 2 jam setelah B berangkat.',
'BERANGKAT BERBEDA JAM: hitung dulu jarak yang sudah ditempuh pihak yang berangkat lebih awal (jarak = v × selisih waktu), baru gunakan rumus menyusul atau berpapasan.',
'RATA-RATA KECEPATAN pergi-pulang jarak sama: v = 2·v₁·v₂ / (v₁+v₂). Pergi 60, pulang 40 → 2×60×40/100 = 48 km/jam (BUKAN 50!).',
'KERETA MELEWATI TIANG/ORANG: jarak = panjang kereta. Melewati terowongan/jembatan: jarak = panjang kereta + panjang terowongan. Dua kereta berpapasan: panjang kedua kereta dijumlah.',
'ARUS SUNGAI: searah arus v = v perahu + v arus; melawan arus v = v perahu − v arus. v perahu = (v hilir + v hulu)/2.',
'LINGKARAN/LINTASAN BULAT: berlawanan arah bertemu tiap keliling : (v₁+v₂); searah menyusul tiap keliling : (v₁−v₂).',
'TITIK TEMU: jarak titik temu dari A = kecepatan A × waktu bertemu.'
],k:'Berpapasan: jumlahkan kecepatan. Menyusul: kurangkan kecepatan. Waktu = jarak awal : hasilnya. Cek satuan km/jam dan m/s.'},
{t:'5. Aritmatika Sosial: Diskon, Untung, Rugi, Bunga',i:[
'HARGA PEMBELIAN (modal) dan HARGA PENJUALAN. Untung = jual − beli (jual > beli). Rugi = beli − jual (jual < beli). Persen untung/rugi = (untung/rugi : harga BELI) × 100%.',
'RUMUS CEPAT: Jual = Beli × (100 + %untung)/100. Beli = Jual × 100/(100 + %untung). Jika rugi, pakai (100 − %rugi).',
'CONTOH: beli Rp 80.000, untung 25% → jual 80.000 × 1,25 = 100.000. Atau jual 100.000 untung 25% → beli 100.000 : 1,25 = 80.000.',
'DISKON: harga bayar = harga × (100 − diskon)/100. Diskon 30% dari 200.000 → bayar 70% × 200.000 = 140.000.',
'DISKON GANDA (bertingkat) JANGAN DIJUMLAH LANGSUNG: diskon a% lalu b% = 100 − (100−a)(100−b)/100. Contoh 20% + 10% = 100 − (80×90)/100 = 100 − 72 = 28% (bukan 30%). Diskon 50% + 20% = 100 − 40 = 60%.',
'DISKON + CASHBACK/BONUS: kerjakan berurutan. Diskon dulu pada harga, baru potongan tambahan nominal.',
'BRUTO, TARA, NETO: Neto = Bruto − Tara. Tara persen = (Tara : Bruto) × 100%. Harga pembelian barang bruto biasanya dihitung dari neto.',
'PAJAK/PPN: PPN 11% → harga + 11% × harga = harga × 1,11. Gaji bersih = gaji − pajak.',
'BUNGA TUNGGAL: Bunga = Modal × persen × (bulan/12). Tabungan akhir = Modal + Bunga. Bunga 12% per tahun, 8 bulan, modal 3.000.000 → 3.000.000 × 12% × 8/12 = 240.000.',
'BUNGA MAJEMUK (2 tahun): M × (1+i)². Bunga 10% selama 2 tahun pada 1.000.000 → 1.210.000.',
'HARGA RATA-RATA (campuran): total harga semua : total jumlah. Bila harga jual campuran, pakai metode salib atau selisih.',
'IMPAS (BEP): untung = 0. Penjualan minimal = modal tetap : selisih (harga jual − biaya satuan).'
],k:'Untung dan rugi selalu dihitung terhadap harga beli. Diskon ganda dikali berurutan: 20% + 10% = 28%, bukan 30%.'},
{t:'6. Logika Umur dan Soal Cerita',i:[
'SELISIH UMUR TIDAK PERNAH BERUBAH. Jadikan selisih sebagai patokan. Kalau umur A − B = 6 sekarang, 10 tahun lagi tetap 6.',
'LANGKAH: (1) misalkan umur sekarang x dan y; (2) tulis persamaan dari kalimat; (3) selesaikan. Kata "x tahun lalu" artinya kurangi x; "x tahun lagi" artinya tambah x.',
'CONTOH: umur ayah 3 kali umur anak. 12 tahun lagi umur ayah 2 kali umur anak. Maka 3a + 12 = 2(a + 12) → 3a + 12 = 2a + 24 → a = 12; ayah 36 tahun.',
'JUMLAH DAN SELISIH: bila jumlah umur J dan selisih S, umur tua = (J+S)/2, umur muda = (J−S)/2.',
'PERBANDINGAN UMUR BERUBAH: bila sekarang a:b dan t tahun lagi c:d, buat persamaan (a·k + t)/(b·k + t) = c/d lalu cari k.',
'SOAL PANJANG: tulis dulu semua angka dan hubungannya dalam bentuk singkat sebelum menghitung.',
'SOAL UANG/KOIN: misalkan banyak tiap jenis, tulis jumlah koin dan jumlah nilai sebagai dua persamaan.',
'TRIK TEBAK OPSI: coba masukkan tiap opsi ke syarat soal (substitusi) bila persamaan terasa lama. Mulai dari opsi tengah (C).',
'KATA KUNCI: "tiga kali umur" berarti ×3. "Lebih tua 3 tahun" berarti + 3. Baca kalimat dengan teliti dan jangan tertukar antara kali dan tambah.',
'TIGA ORANG: bila ada tiga orang dengan jumlah umur diketahui, nyatakan semuanya dengan satu variabel lewat hubungan selisih.'
],k:'Selisih umur selalu tetap. Misalkan variabel, tulis persamaan, dan uji tiap opsi bila perlu.'},
{t:'7. Deret Angka dan Huruf',i:[
'LANGKAH: lihat selisih antar suku. Bila tidak tetap, lihat selisih tingkat dua. Bila tidak ada pola, coba kali/bagi, kuadrat, atau dua pola berselang-seling.',
'BARISAN ARITMATIKA (beda tetap): 3, 7, 11, 15 → +4. Suku ke-n = a + (n−1)b. Jumlah n suku = n/2 × (a + Un).',
'GEOMETRI (rasio tetap): 2, 6, 18, 54 → ×3. Suku ke-n = a × rⁿ⁻¹.',
'BERTINGKAT: 1, 2, 4, 7, 11 → selisih 1,2,3,4 (naik 1). 2, 5, 10, 17, 26 → selisih 3,5,7,9 (kuadrat + 1).',
'FIBONACCI: 1, 1, 2, 3, 5, 8, 13 → suku = dua suku sebelumnya dijumlah.',
'POLA GANDA (selang-seling): 2, 5, 4, 7, 6, 9 → bilangan ganjil urutan +2 dan genap urutan +2 sendiri-sendiri. Pisahkan posisi ganjil dan genap.',
'POLA KUADRAT/KUBIK: 1, 4, 9, 16, 25 · 1, 8, 27, 64. Hafal kuadrat sampai 20 dan kubik sampai 10.',
'POLA PRIMA: 2, 3, 5, 7, 11, 13. POLA SEGITIGA: 1, 3, 6, 10, 15 (rumus n(n+1)/2).',
'POLA KALI LALU TAMBAH: 3, 7, 15, 31, 63 → ×2 + 1.',
'HURUF: ubah ke urutan alfabet A=1 … Z=26. Gunakan pola loncat (+2, −1, dll.) sama seperti angka. Alfabet berulang setelah Z kembali ke A.',
'DERET TABEL (kolom/baris): cek apakah baris atau kolom mengikuti rumus yang sama, misalnya a + b = c, a × b − c, atau rata-rata dua bilangan pertama. Coba baris dulu, bila tidak cocok coba kolom.',
'SELISIH PERLU DITURUNKAN: bila selisih deret membentuk deret lagi, ulangi hingga ketemu beda tetap.'
],k:'Hitung selisih dulu. Kalau tidak tetap, cek selisih tingkat dua, kali, kuadrat, dan pola selang-seling.'},
{t:'8. Himpunan, Peluang, dan Kombinatorika',i:[
'HIMPUNAN DUA KELOMPOK: n(A ∪ B) = n(A) + n(B) − n(A ∩ B). Yang tidak masuk keduanya = total − n(A ∪ B).',
'CONTOH: 40 siswa, 25 suka bola, 20 suka basket, 8 keduanya. Gabungan = 25+20−8 = 37. Tidak suka keduanya = 40−37 = 3.',
'PERMUTASI (urutan penting): nPr = n!/(n−r)!. Susunan huruf kata: n!/(jumlah huruf kembar!). Contoh MATEMATIKA: 10!/(2!·3!·2!).',
'KOMBINASI (urutan tidak penting): nCr = n!/(r!(n−r)!). Memilih 3 dari 5 orang = 10 cara.',
'ATURAN PERKALIAN: bila tahap 1 ada a cara dan tahap 2 ada b cara, total = a×b. Contoh 3 baju × 4 celana = 12 setelan.',
'PELUANG: P(A) = banyak kejadian A : seluruh kemungkinan. Dua dadu: total 36 hasil. Jumlah 7 ada 6 cara → P = 6/36 = 1/6.',
'KEJADIAN SALING BEBAS: P(A dan B) = P(A) × P(B). Atau (saling lepas): P(A atau B) = P(A) + P(B).',
'KOIN: n koin dilempar → 2ⁿ kemungkinan. Dadu: n dadu → 6ⁿ kemungkinan.',
'PELUANG KOMPLEMEN: P(tidak A) = 1 − P(A). Sering mempercepat soal "minimal satu".',
'FREKUENSI HARAPAN: Fh = P × banyak percobaan.',
'RATA-RATA: jumlah : banyak data. Median = nilai tengah setelah diurutkan (genap: rata-rata dua nilai tengah). Modus = paling sering muncul.',
'RATA-RATA GABUNGAN: (n₁·x̄₁ + n₂·x̄₂) / (n₁ + n₂). Data bertambah/berkurang → hitung ulang dari jumlah total.'
],k:'Urutan penting berarti permutasi, tidak penting berarti kombinasi. Peluang = kejadian diminta dibagi seluruh kemungkinan.'},
{t:'9. Geometri dan Pengukuran',i:[
'PERSEGI: L = s², K = 4s. PERSEGI PANJANG: L = p×l, K = 2(p+l). SEGITIGA: L = ½×a×t. JAJAR GENJANG: L = a×t. TRAPESIUM: L = ½(a+b)×t. BELAH KETUPAT/LAYANG: L = ½ d₁ d₂.',
'LINGKARAN: L = πr², K = 2πr; π = 22/7 bila r kelipatan 7, π = 3,14 bila r kelipatan 10. Busur = (θ/360) × K. Juring = (θ/360) × L.',
'PYTHAGORAS: c² = a² + b². Triple hafal: 3-4-5, 5-12-13, 8-15-17, 7-24-25 (dan kelipatannya, mis. 6-8-10).',
'KUBUS: V = s³, luas permukaan 6s², diagonal ruang s√3. BALOK: V = p×l×t, luas permukaan 2(pl+pt+lt). TABUNG: V = πr²t, luas selimut 2πrt. KERUCUT: V = ⅓πr²t. BOLA: V = 4/3 πr³.',
'SKALA LUAS: bila sisi diperbesar k kali, luas k² kali, volume k³ kali.',
'SUDUT: jumlah sudut segitiga 180°, segiempat 360°. Sudut dalam segi-n = (n−2)×180°. Garis sejajar: sudut sehadap sama, berseberangan sama, sepihak berjumlah 180°.',
'DIAGONAL: persegi panjang diagonal = √(p²+l²). Banyak diagonal segi-n = n(n−3)/2.',
'SATUAN: 1 m² = 10.000 cm²; 1 ha = 10.000 m²; 1 liter = 1 dm³ = 1.000 cm³; 1 m³ = 1.000 liter.',
'KESEBANGUNAN/BAYANGAN: perbandingan sisi bersesuaian sama. Tinggi benda : bayangannya = tinggi benda lain : bayangannya.',
'KELILING PAGAR/BIAYA: biaya = luas atau keliling × harga per satuan. Pastikan satuan sama.'
],k:'Hafalkan rumus bangun dasar dan triple Pythagoras. Perbesaran sisi k kali berarti luas k², volume k³.'},
{t:'10. Silogisme, Logika Proposisi, dan Penarikan Kesimpulan',i:[
'SILOGISME KATEGORIK: Semua A adalah B; Semua B adalah C → Semua A adalah C. Ingat urutan, jangan dibalik.',
'KATA "SEMUA" tidak bisa dibalik: Semua A adalah B TIDAK berarti Semua B adalah A.',
'SILOGISME HIPOTETIK: Jika P maka Q; Jika Q maka R → Jika P maka R.',
'MODUS PONENS: Jika P maka Q; P benar → Q benar. MODUS TOLLENS: Jika P maka Q; Q salah → P salah.',
'KESALAHAN UMUM: Jika P maka Q; Q benar ⇒ P belum tentu benar (bukan kesimpulan sah).',
'INGKARAN: ingkaran "Semua A adalah B" = "Ada A yang bukan B". Ingkaran "Ada A yang B" = "Tidak ada A yang B" / "Semua A bukan B".',
'KONTRAPOSISI: Jika P maka Q setara dengan Jika tidak Q maka tidak P. Selalu benar. Invers dan konvers belum tentu.',
'INGKARAN KONJUNGSI/DISJUNGSI: ~(P dan Q) = ~P atau ~Q; ~(P atau Q) = ~P dan ~Q.',
'TIPE "TIDAK ADA": Tidak ada A yang B = Semua A bukan B. Hati-hati kata negatif.',
'DIAGRAM VENN: gambar lingkaran untuk tiap himpunan. Kesimpulan benar bila berlaku di SEMUA kemungkinan diagram, bukan sebagian.',
'KESIMPULAN "ADA": premis "Ada A adalah B" dan "Semua B adalah C" → "Ada A adalah C".',
'LOGIKA ANALITIS (urutan/tempat duduk/jadwal): buat tabel atau gambar posisi, masukkan syarat pasti dulu (mis. "A berada paling kiri"), baru syarat relatif.'
],k:'Gambar diagram Venn. Pilih kesimpulan yang pasti benar di semua kemungkinan. Kontraposisi selalu sah, konvers dan invers tidak.'},
{t:'11. Verbal: Sinonim, Antonim, Analogi, Padanan',i:[
'SINONIM = persamaan kata. ANTONIM = lawan kata. Cek kelas kata (kerja, benda, sifat) agar setara. Hafalkan kata baku sering keluar: efektif, esensial, signifikan, kapabel, eksklusif, hipotesis, kontradiktif, anomali, akurat.',
'CONTOH SINONIM: abadi = kekal · aktual = terkini · bijaksana = arif · cermat = teliti · disparitas = perbedaan · eksis = ada · frustrasi = putus asa · hirau = peduli · inisiatif = prakarsa · konsisten = taat asas.',
'CONTOH ANTONIM: aktif ↔ pasif · optimis ↔ pesimis · maju ↔ mundur · hemat ↔ boros · transparan ↔ tertutup · kolektif ↔ individual · eksplisit ↔ implisit · mayoritas ↔ minoritas · progresif ↔ regresif.',
'ANALOGI: tentukan hubungan di pasangan soal, lalu cari pasangan jawaban dengan hubungan sama persis. Hubungan umum: sinonim, antonim, bagian-keseluruhan, alat-fungsi, sebab-akibat, tempat-pelaku, benda-bahan, tingkatan intensitas.',
'LANGKAH ANALOGI: buat kalimat penghubung (mis. "dokter bekerja di rumah sakit; guru bekerja di sekolah"), lalu uji pada tiap opsi. Bila urutan dibalik, opsi bisa gugur.',
'CONTOH HUBUNGAN: pisau : memotong = pena : menulis (alat-fungsi). Sepatu : kaki = topi : kepala (benda-tempat pakai). Kantuk : tidur = lapar : makan (sebab-akibat).',
'TINGKATAN INTENSITAS: panas > hangat > sejuk > dingin. Pada analogi tingkatan, pasangan jawaban harus punya selisih derajat yang sama.',
'KATA BAKU vs TIDAK BAKU: apotek (bukan apotik), analisis (bukan analisa), risiko (bukan resiko), nasihat, aktivitas, kualitas, praktik, izin, objek, andal, sinkron, hakikat, silakan, napas, sistem.',
'KATA SERAPAN: eksklusif = khusus; relevan = berkaitan; kredibel = layak dipercaya; urgen = mendesak; prioritas = utama; kolaborasi = kerja sama.',
'KALIMAT TIDAK PADU: cek subjek dan predikat ada atau tidak, dan hindari kata hubung ganda (meskipun ... tetapi).',
'BACAAN SINGKAT: baca pertanyaan dulu, baru teks. Ide pokok biasanya di kalimat pertama atau terakhir paragraf.'
],k:'Pahami hubungan di pasangan soal lalu uji pada opsi dengan kalimat penghubung. Untuk sinonim dan antonim, cocokkan dulu kelas katanya.'},
{t:'12. Figural: Pola Gambar, Rotasi, dan Pencerminan',i:[
'LANGKAH: amati perubahan tiap langkah pada (a) posisi, (b) bentuk, (c) warna (hitam/putih), (d) jumlah garis atau titik. Cari satu aturan per elemen.',
'ROTASI: perhatikan arah (searah atau berlawanan jarum jam) dan besar sudut (45°, 90°, 180°). Tandai satu ciri khusus (titik, ujung lancip) untuk melacak.',
'PENCERMINAN: cermin vertikal membalik kiri-kanan, cermin horizontal membalik atas-bawah. Teks/huruf terbalik menjadi petunjuk.',
'POLA BERGERAK: elemen berpindah satu langkah tiap kotak (mis. titik berpindah searah jarum jam di empat sudut). Cari banyaknya langkah tiap kotak lalu lanjutkan.',
'POLA TAMBAH/KURANG: jumlah sisi, garis, atau titik naik 1 tiap langkah, atau bergantian. Hitung tiap kotak secara eksplisit.',
'POLA ANTAR KOTAK (matriks 3×3): baris atau kolom sering mengikuti aturan "gambar 1 + gambar 2 = gambar 3" atau gabung dikurangi bagian yang sama (mirip XOR).',
'GAMBAR TIDAK SEJENIS (beda sendiri): cari ciri yang dipunyai semua gambar kecuali satu (jumlah sisi, simetri, warna).',
'KUBUS/JARING-JARING: dua sisi berhadapan tidak pernah bersebelahan di jaring-jaring. Pada jaring-jaring 1-4-1, kotak yang terpisah satu kotak adalah sisi berhadapan.',
'GAMBAR TUMPUK/POTONG: bayangkan melipat dan melubangi kertas. Buka lipatan satu per satu kebalik urutannya.',
'ELIMINASI CEPAT: periksa SATU elemen yang paling jelas (mis. jumlah garis atau warna), coret opsi yang tidak sesuai, lalu periksa elemen berikutnya.'
],k:'Pisahkan elemen gambar (posisi, bentuk, warna, jumlah) lalu cari aturan satu per satu. Coret opsi yang jelas tidak sesuai.'},
{t:'13. Kecukupan Data dan Soal Cerita Campuran',i:[
'SOAL KECUKUPAN DATA: tentukan apakah pernyataan (1) dan (2) cukup untuk menjawab. Pilihan umum: (A) 1 saja cukup; (B) 2 saja cukup; (C) 1 dan 2 harus digabung; (D) masing-masing cukup; (E) keduanya tidak cukup.',
'CARA KERJA: periksa (1) saja. Lalu (2) saja. Bila belum, gabung. Jangan menghitung sampai hasil akhir. Cukup tahu apakah bisa ditentukan nilai TUNGGAL.',
'CONTOH: berapa umur A? (1) umur A dua kali umur B. (2) jumlah umur A dan B 30. Masing-masing belum cukup. Gabung: 2B + B = 30, B = 10, A = 20 → pilihan C.',
'PERINGATAN: persamaan sama-sama memuat dua variabel TIDAK cukup. Satu persamaan hanya menyelesaikan satu variabel.',
'SOAL CERITA CAMPURAN: ubah kalimat menjadi persamaan, pastikan satuan sama (jam-menit, cm-m), baca pertanyaan akhir apakah yang ditanya jumlah, selisih, atau rata-rata.',
'TABEL & GRAFIK: baca judul, satuan, dan periode sebelum menghitung. Persentase = bagian : total × 100%. Selisih persen ≠ persen selisih.',
'ESTIMASI: jika opsi berbeda jauh, bulatkan angka (mis. 4.987 ≈ 5.000) untuk menghemat waktu.',
'CEK KEMASUKAKALAN: hasil harus masuk akal (umur tidak negatif, jumlah orang bulat, persen tidak lebih dari 100 kecuali pertumbuhan).'
],k:'Pada kecukupan data, cukup tentukan apakah nilai tunggal bisa didapat. Jangan hitung sampai selesai.'},
{t:'⭐ Rumus Kilat Sebelum Ujian (Ringkasan)',i:[
'PERSEN TUKAR: A% dari B = B% dari A.',
'PECAHAN ISTIMEWA: 1/8 = 12,5% · 3/8 = 37,5% · 1/6 = 16,67% · 1/3 = 33,3% · 1/9 = 11,1%.',
'BERBALIK NILAI: orang₁ × hari₁ = orang₂ × hari₂.',
'BERPAPASAN: v₁ + v₂. MENYUSUL: v₁ − v₂. Waktu = jarak : kecepatan gabungan.',
'RATA-RATA PERGI-PULANG: 2v₁v₂/(v₁+v₂).',
'DISKON GANDA: a% lalu b% → 100 − (100−a)(100−b)/100. Contoh 20% + 10% = 28%.',
'UNTUNG/RUGI SELALU terhadap harga BELI.',
'UMUR: selisih tetap. 2 orang bekerja bareng: 1/(1/a+1/b).',
'KPK untuk "bersamaan lagi", FPB untuk "dibagi sama banyak".',
'Passing grade TIU 80 → minimal 16 soal benar dari 35. Isi semua soal.'
],k:'Baca ulang halaman ini sebelum ujian. Hafal rumus, bukan tabel panjang.'}
];

/* ---------- pengaman: tidak pernah layar kosong ---------- */
(function(){const a=$('app'),box=(t,m)=>'<div class="card" style="max-width:420px;margin:40px auto;text-align:center"><h3>'+t+'</h3><p class="mu">'+m+'</p><button class="btn" onclick="location.reload()">Muat Ulang</button></div>';
 if(!a.innerHTML.trim())a.innerHTML=box('Memuat…','Mohon tunggu sebentar.');
 const fail=m=>{if(!a.querySelector('header,.hd'))a.innerHTML=box('Terjadi kesalahan','Detail: '+String(m).replace(/[<>&]/g,'')+'<br>Coba Muat Ulang. Jika tetap sama, kirim tulisan ini ke pemilik.')};
 addEventListener('error',ev=>fail(ev.message));addEventListener('unhandledrejection',ev=>fail(ev.reason&&ev.reason.message||ev.reason));
 setTimeout(()=>{if(!a.querySelector('header,.hd'))a.innerHTML=box('Koneksi lambat','Server belum menjawab. Periksa internet lalu Muat Ulang.')},10000)})();
__log('script utama jalan');addEventListener('hashchange',route);route();

