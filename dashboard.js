
const raw=localStorage.getItem('toyoPremiumData');if(!raw)location.href='index.html';
const data=JSON.parse(raw||'{}');
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:2}).format(Number(n||0));
const pct=n=>`${(Number(n||0)*100).toFixed(1)}%`;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const load=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}};

const current=data.totals?.current||0,prev=data.totals?.prev||0,meta=data.totals?.meta||0;
const diff=current-prev,diffPct=prev?diff/prev:0,advance=meta?current/meta:0,remaining=Math.max(meta-current,0),maxScale=Math.max(current,prev,meta,1);

$('pageTitle').textContent=(data.labels?.current||'').replace(/^\w/,c=>c.toUpperCase());
$('pageSubtitle').textContent=`Comparación contra ${data.labels?.prev||''}`;
$('headerDate').textContent=new Date(data.maxDate).toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'});
$('ventaActual').textContent=money(current);
$('ventaAnterior').textContent=money(prev);
$('meta').textContent=money(meta);
$('avance').textContent=pct(advance);
$('restanteMeta').textContent=money(remaining);
$('variacionPct').textContent=`${diffPct>=0?'+':''}${pct(diffPct)}`;
$('variacionDinero').textContent=`${diff>=0?'+':''}${money(diff)} vs mes anterior`;
$('corteActual').textContent=`Corte al ${new Date(data.maxDate).toLocaleDateString('es-MX')}`;
$('prevLabel').textContent=data.labels?.prev||'';
$('currentLabel').textContent=data.labels?.current||'';
$('barPrev').style.width=`${prev/maxScale*100}%`;$('barCurrent').style.width=`${current/maxScale*100}%`;$('barMeta').style.width=`${meta/maxScale*100}%`;
$('barPrevVal').textContent=money(prev);$('barCurrentVal').textContent=money(current);$('barMetaVal').textContent=money(meta);
const degrees=Math.min(Math.max(advance,0),1)*360;
$('goalRing').style.background=`conic-gradient(#7bc2f1 0deg,#7bc2f1 ${degrees}deg,rgba(255,255,255,.12) ${degrees}deg 360deg)`;
if(diffPct<0){$('variationChip').classList.add('negative');$('variationChip').querySelector('svg').outerHTML='<i data-lucide="arrow-down-right"></i>'}

$('topClients').innerHTML=(data.topClients||[]).map((x,i)=>`
<div class="rank-item"><div class="rank-num">${i+1}</div><div class="rank-client">${esc(x.name)}</div><div class="rank-value">${money(x.value)}</div></div>`).join('')||`<div class="empty">Sin información</div>`;

$('lostClients').innerHTML=(data.lostClients||[]).map(x=>`
<tr><td>${esc(x.name)}</td><td class="money">${money(x.prev)}</td><td class="money">${money(x.current)}</td><td><span class="status-badge">Sin compra</span></td></tr>`).join('')||`<tr><td colspan="4" class="empty">No hay clientes pendientes</td></tr>`;

$('lostProducts').innerHTML=(data.lostProducts||[]).map(x=>`
<tr><td>${esc(x.code)}</td><td>${esc(x.desc)}</td><td class="money">${Number(x.prevPieces||0).toLocaleString('es-MX')}</td><td class="money">${money(x.prevMoney)}</td><td><span class="action-text">RECUPERAR</span></td></tr>`).join('')||`<tr><td colspan="5" class="empty">No hay productos pendientes</td></tr>`;

let visits=load('toyoPremiumVisits',Array.from({length:5},()=>({date:'',client:'',comments:'',type:''})));
function renderVisits(){
  $('visitsBody').innerHTML=visits.map((v,i)=>`
  <tr>
    <td><input type="date" data-t="visit" data-i="${i}" data-f="date" value="${esc(v.date)}"></td>
    <td><input data-t="visit" data-i="${i}" data-f="client" value="${esc(v.client)}" placeholder="Cliente"></td>
    <td><textarea data-t="visit" data-i="${i}" data-f="comments" placeholder="Comentarios">${esc(v.comments)}</textarea></td>
    <td><select data-t="visit" data-i="${i}" data-f="type"><option value=""></option><option ${v.type==='Recuperación'?'selected':''}>Recuperación</option><option ${v.type==='Upgrade'?'selected':''}>Upgrade</option></select></td>
    <td><button class="delete-btn" data-del-visit="${i}">×</button></td>
  </tr>`).join('');
}
$('visitsBody').addEventListener('input',e=>{if(e.target.dataset.t!=='visit')return;const i=+e.target.dataset.i,f=e.target.dataset.f;visits[i][f]=e.target.value;save('toyoPremiumVisits',visits)});
$('visitsBody').addEventListener('click',e=>{if(e.target.dataset.delVisit===undefined)return;visits.splice(+e.target.dataset.delVisit,1);save('toyoPremiumVisits',visits);renderVisits()});
$('addVisit').onclick=()=>{visits.push({date:'',client:'',comments:'',type:''});save('toyoPremiumVisits',visits);renderVisits()};renderVisits();

let pending=load('toyoPremiumPending',Array.from({length:5},()=>({pending:'',follow:''})));
function renderPending(){
  $('pendingBody').innerHTML=pending.map((v,i)=>`
  <tr>
    <td><textarea data-t="pending" data-i="${i}" data-f="pending" placeholder="Pendiente">${esc(v.pending)}</textarea></td>
    <td><textarea data-t="pending" data-i="${i}" data-f="follow" placeholder="Seguimiento">${esc(v.follow)}</textarea></td>
    <td><button class="delete-btn" data-del-pending="${i}">×</button></td>
  </tr>`).join('');
}
$('pendingBody').addEventListener('input',e=>{if(e.target.dataset.t!=='pending')return;const i=+e.target.dataset.i,f=e.target.dataset.f;pending[i][f]=e.target.value;save('toyoPremiumPending',pending)});
$('pendingBody').addEventListener('click',e=>{if(e.target.dataset.delPending===undefined)return;pending.splice(+e.target.dataset.delPending,1);save('toyoPremiumPending',pending);renderPending()});
$('addPending').onclick=()=>{pending.push({pending:'',follow:''});save('toyoPremiumPending',pending);renderPending()};renderPending();

let promos=load('toyoPremiumPromos',Array.from({length:5},()=>({code:'',note:''})));
function renderPromos(){
  $('promoBody').innerHTML=promos.map((v,i)=>{const p=data.products?.[v.code]||{};return `
  <tr>
    <td><input data-t="promo" data-i="${i}" data-f="code" value="${esc(v.code)}" placeholder="Código"></td>
    <td>${esc(p.desc||'')}</td>
    <td class="money">${p.currentPieces!=null?Number(p.currentPieces).toLocaleString('es-MX'):''}</td>
    <td class="money">${p.currentMoney!=null?money(p.currentMoney):''}</td>
    <td><textarea data-t="promo" data-i="${i}" data-f="note" placeholder="Comentario / acción">${esc(v.note||'')}</textarea></td>
    <td><button class="delete-btn" data-del-promo="${i}">×</button></td>
  </tr>`}).join('');
}
$('promoBody').addEventListener('input',e=>{if(e.target.dataset.t!=='promo')return;const i=+e.target.dataset.i,f=e.target.dataset.f;promos[i][f]=e.target.value;save('toyoPremiumPromos',promos);if(f==='code')renderPromos()});
$('promoBody').addEventListener('click',e=>{if(e.target.dataset.delPromo===undefined)return;promos.splice(+e.target.dataset.delPromo,1);save('toyoPremiumPromos',promos);renderPromos()});
$('addPromo').onclick=()=>{promos.push({code:'',note:''});save('toyoPremiumPromos',promos);renderPromos()};renderPromos();

const notes=$('generalNotes');notes.value=localStorage.getItem('toyoPremiumNotes')||'';notes.addEventListener('input',()=>localStorage.setItem('toyoPremiumNotes',notes.value));

$('photoInput').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{$('photoPreview').src=r.result;$('photoPreview').style.display='block';$('photoPlaceholder').style.display='none';try{localStorage.setItem('toyoPremiumPhoto',r.result)}catch{}};r.readAsDataURL(f)});
const sp=localStorage.getItem('toyoPremiumPhoto');if(sp){$('photoPreview').src=sp;$('photoPreview').style.display='block';$('photoPlaceholder').style.display='none'}

lucide.createIcons();
