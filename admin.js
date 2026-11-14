/* ===== ADMIN v2: Bank Soal per tema (kategori), hapus cepat, hapus semua soal per tema, tanpa lompat scroll ===== */
let AQ={c:'',rows:[],g:[]};
const gk=x=>x.theme||'';
const cntG=t=>AQ.rows.filter(x=>gk(x)==t).length;
function keepScroll(fn){const y=window.scrollY;fn();window.scrollTo(0,y);requestAnimationFrame(()=>window.scrollTo(0,y))}
function gLabel(t){return t?e(t):'(tanpa tema)'}

async function loadQ(){
  const c=$('fc').value,box=$('ql');
  box.innerHTML='<p class="mu">Memuat...</p>';
  const r=await api('admin/questions?cat='+c);
  if(r.ok===false){box.innerHTML='<p class="no">'+e(r.error||'Gagal memuat')+'</p>';return}
  AQ.c=c;AQ.rows=r.rows||[];
  const g=[...(TM[c]||[])];
  AQ.rows.forEach(x=>{if(x.theme&&!g.includes(x.theme))g.push(x.theme)});
  g.push('');AQ.g=g;
  box.innerHTML=`<p class="mu" style="margin:0 0 8px">Total <b id="qtot">${AQ.rows.length}</b> soal ${c}. Ketuk tema untuk membuka.</p>`+
    g.map((t,i)=>`<details id="g${i}" ontoggle="openG(${i})"><summary>${gLabel(t)} <span class="tag" id="gc${i}">${cntG(t)}</span></summary><div id="gb${i}"></div></details>`).join('');
}

function openG(i){
  const d=$('g'+i),b=$('gb'+i);
  if(!d||!d.open||b.dataset.ok)return;
  fillG(i);
}
function fillG(i){
  const t=AQ.g[i],b=$('gb'+i),rows=AQ.rows.filter(x=>gk(x)==t);
  b.dataset.ok=1;
  if(!rows.length){b.innerHTML='<p class="mu">Kosong.</p>';return}
  b.innerHTML=`<div style="margin:8px 0"><button class="btn r" id="gd${i}" onclick="delG(${i})">🗑 Hapus semua soal tema ini (${rows.length})</button></div>`+
    rows.map(x=>`<div id="qr${x.id}" style="border-top:1px solid var(--b);padding:8px 0"><div style="display:flex;gap:6px;align-items:flex-start"><span style="flex:1;font-size:13px">${e(nm(String(x.text).replace(/\n/g,' ').slice(0,110)))}</span><button class="btn" style="padding:8px 12px" onclick="viewQ(${x.id})">Lihat</button><button class="btn r" style="padding:8px 12px" title="Hapus cepat" onclick="delQ(${x.id},1)">🗑</button></div><div id="qd${x.id}"></div></div>`).join('');
}

function refreshCounts(removedCat,n){
  AQ.g.forEach((t,i)=>{
    const c=$('gc'+i);if(c)c.textContent=cntG(t);
    const b=$('gb'+i);
    if(b&&b.dataset.ok){
      const n2=cntG(t);
      if(!n2)b.innerHTML='<p class="mu">Kosong.</p>';
      else{const bt=$('gd'+i);if(bt)bt.textContent=`🗑 Hapus semua soal tema ini (${n2})`}
    }
  });
  const tt=$('qtot');if(tt)tt.textContent=AQ.rows.length;
  /* sinkronkan angka di ringkasan atas (TWK · TIU · TKP) */
  if(n){const p=[...document.querySelectorAll('p')].find(p=>/^\s*TWK\b/.test(p.textContent)&&p.querySelectorAll('b').length>=3);
    if(p){const k=['TWK','TIU','TKP'].indexOf(removedCat),b=p.querySelectorAll('b')[k];if(b)b.textContent=Math.max(0,(+b.textContent||0)-n)}}
}
function dropQ(ids){
  keepScroll(()=>{
    ids.forEach(id=>{const el=$('qr'+id);if(el)el.remove()});
    AQ.rows=AQ.rows.filter(x=>!ids.includes(x.id));
    refreshCounts(AQ.c,ids.length);
  });
}

/* hapus 1 soal: quick=1 langsung tanpa konfirmasi (tombol 🗑); dari panel detail minta konfirmasi */
async function delQ(id,quick){
  if(!quick&&!confirm('Hapus soal ini?'))return;
  const row=$('qr'+id);if(row){row.style.opacity='.4';row.style.pointerEvents='none'}
  const r=await api('admin/delq',{id});
  if(r.ok===false){if(row){row.style.opacity='';row.style.pointerEvents=''}return alert(r.error||'Gagal menghapus')}
  dropQ([id]);
}

/* hapus SEMUA soal dalam satu tema */
async function delG(i){
  const t=AQ.g[i],ids=AQ.rows.filter(x=>gk(x)==t).map(x=>x.id);
  if(!ids.length)return;
  if(!confirm(`Hapus SEMUA ${ids.length} soal di tema "${t||'tanpa tema'}" (${AQ.c})?\nTidak bisa dibatalkan.`))return;
  const btn=$('gd'+i),done=[];let fail=0;
  if(btn)btn.disabled=true;
  for(let k=0;k<ids.length;k+=5){
    const part=ids.slice(k,k+5);
    const rs=await Promise.all(part.map(id=>api('admin/delq',{id})));
    rs.forEach((r,j)=>r.ok===false?fail++:done.push(part[j]));
    if(btn)btn.textContent=`Menghapus ${done.length}/${ids.length}...`;
  }
  dropQ(done);
  if(fail)alert(fail+' soal gagal dihapus. Coba lagi.');
}

/* pindah tema dari panel detail */
async function moveQ(id,t){
  const r=await api('admin/settheme',{id,theme:t});
  if(r.ok===false)return alert(r.error||'Gagal');
  const q=AQ.rows.find(x=>x.id==id);if(!q)return;
  q.theme=t;
  keepScroll(()=>{
    const el=$('qr'+id);if(el)el.remove();
    AQ.g.forEach((g,i)=>{const b=$('gb'+i);if(b&&b.dataset.ok&&g==t)delete b.dataset.ok,b.innerHTML='',openG(i)});
    refreshCounts(AQ.c,0);
  });
}

/* tambahkan pilihan pindah tema ke panel detail (viewQ bawaan tetap dipakai) */
const _viewQ=viewQ;
viewQ=async function(id){
  await _viewQ(id);
  const box=$('qd'+id),q=AQ.rows.find(x=>x.id==id);
  if(!box||!box.innerHTML||!q||box.querySelector('.thsel'))return;
  const card=box.querySelector('.card');if(!card)return;
  const opts=['',...(TM[AQ.c]||[])];if(q.theme&&!opts.includes(q.theme))opts.push(q.theme);
  card.insertAdjacentHTML('afterbegin',`<label class="mu">Pindah ke tema:</label><select class="thsel" onchange="moveQ(${id},this.value)">${opts.map(t=>`<option value="${e(t)}" ${t==gk(q)?'selected':''}>${t?e(t):'(tanpa tema)'}</option>`).join('')}</select>`);
};
