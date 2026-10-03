
const fileInput=document.getElementById('fileInput');
const fileLabel=document.getElementById('fileLabel');
const analyzeBtn=document.getElementById('analyzeBtn');
const metaInput=document.getElementById('metaInput');
const statusBox=document.getElementById('status');
const dropzone=document.getElementById('dropzone');
let selectedFile=null;

const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim().replace(/\s+/g,' ');
const asNumber=v=>{if(typeof v==='number')return Number.isFinite(v)?v:0;if(v==null||v==='')return 0;const n=Number(String(v).replace(/[$,\s]/g,''));return Number.isFinite(n)?n:0};

function parseDate(v){
  if(v instanceof Date&&!isNaN(v))return v;
  if(typeof v==='number'){const d=XLSX.SSF.parse_date_code(v);if(d)return new Date(d.y,d.m-1,d.d)}
  const s=String(v??'').trim();if(!s)return null;
  const m=s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if(m){let y=Number(m[3]);if(y<100)y+=2000;return new Date(y,Number(m[2])-1,Number(m[1]))}
  const d=new Date(s);return isNaN(d)?null:d;
}
function monthLabel(d){return d.toLocaleDateString('es-MX',{month:'long',year:'numeric'})}
function findColumn(headers,candidates){
  const nh=headers.map(norm);
  for(const c of candidates){const i=nh.indexOf(norm(c));if(i>=0)return headers[i]}
  for(let i=0;i<nh.length;i++){if(candidates.some(c=>nh[i].includes(norm(c))))return headers[i]}
  return null;
}
function handleFile(file){
  selectedFile=file;fileLabel.textContent=file?file.name:'Arrastra tu archivo aquí';
  analyzeBtn.disabled=!file;statusBox.textContent='';statusBox.className='status';
}
fileInput.addEventListener('change',e=>handleFile(e.target.files[0]));
dropzone.addEventListener('dragover',e=>{e.preventDefault();dropzone.style.borderColor='#2f78b7'});
dropzone.addEventListener('dragleave',()=>dropzone.style.borderColor='');
dropzone.addEventListener('drop',e=>{e.preventDefault();dropzone.style.borderColor='';const f=e.dataTransfer.files[0];if(f)handleFile(f)});

analyzeBtn.addEventListener('click',async()=>{
  if(!selectedFile)return;
  analyzeBtn.disabled=true;statusBox.textContent='Analizando archivo...';
  try{
    const buf=await selectedFile.arrayBuffer();
    const wb=XLSX.read(buf,{type:'array',cellDates:true});
    const ws=wb.Sheets[wb.SheetNames[0]];
    const rows=XLSX.utils.sheet_to_json(ws,{defval:null,raw:true});
    if(!rows.length)throw new Error('El archivo no contiene registros.');
    const headers=Object.keys(rows[0]);
    const cols={
      date:findColumn(headers,['FECHA DE CONTABILIZACION','FECHA CONTABILIZACION','FECHA']),
      client:findColumn(headers,['NOMBRE DE CLIENTE','CLIENTE']),
      code:findColumn(headers,['CODIGO DE PRODUCTO','CODIGO PRODUCTO','CÓDIGO DE PRODUCTO']),
      desc:findColumn(headers,['DESCRIPCION DE PRODUCTO','DESCRIPCIÓN DE PRODUCTO','PRODUCTO']),
      pieces:findColumn(headers,['TOTAL DE PIEZAS','PIEZAS']),
      subtotal:findColumn(headers,['SUBTOTAL'])
    };
    const missing=Object.entries(cols).filter(([,v])=>!v).map(([k])=>k);
    if(missing.length)throw new Error('No pude identificar estas columnas: '+missing.join(', '));

    const valid=rows.map(r=>({r,d:parseDate(r[cols.date])})).filter(x=>x.d);
    if(!valid.length)throw new Error('No pude leer fechas válidas.');

    const maxDate=new Date(Math.max(...valid.map(x=>x.d.getTime())));
    const currentStart=new Date(maxDate.getFullYear(),maxDate.getMonth(),1);
    const prevStart=new Date(maxDate.getFullYear(),maxDate.getMonth()-1,1);
    const prevEnd=new Date(maxDate.getFullYear(),maxDate.getMonth(),0,23,59,59);

    const clients={},products={};let currentTotal=0,prevTotal=0;
    for(const {r,d} of valid){
      const subtotal=asNumber(r[cols.subtotal]),pieces=asNumber(r[cols.pieces]);
      const client=String(r[cols.client]??'').trim(),code=String(r[cols.code]??'').trim(),desc=String(r[cols.desc]??'').trim();
      const isCurrent=d>=currentStart&&d<=maxDate,isPrev=d>=prevStart&&d<=prevEnd;
      if(!isCurrent&&!isPrev)continue;
      if(isCurrent)currentTotal+=subtotal;if(isPrev)prevTotal+=subtotal;
      if(client){clients[client]??={current:0,prev:0};if(isCurrent)clients[client].current+=subtotal;if(isPrev)clients[client].prev+=subtotal}
      if(code){products[code]??={desc,currentMoney:0,prevMoney:0,currentPieces:0,prevPieces:0};if(!products[code].desc&&desc)products[code].desc=desc;if(isCurrent){products[code].currentMoney+=subtotal;products[code].currentPieces+=pieces}if(isPrev){products[code].prevMoney+=subtotal;products[code].prevPieces+=pieces}}
    }
    const topClients=Object.entries(clients).filter(([,v])=>v.current>0).sort((a,b)=>b[1].current-a[1].current).slice(0,5).map(([name,v])=>({name,value:v.current}));
    const lostClients=Object.entries(clients).filter(([,v])=>v.prev>0&&v.current===0).sort((a,b)=>b[1].prev-a[1].prev).map(([name,v])=>({name,prev:v.prev,current:v.current}));
    const lostProducts=Object.entries(products).filter(([,v])=>v.prevMoney>0&&v.currentMoney===0).sort((a,b)=>b[1].prevMoney-a[1].prevMoney).map(([code,v])=>({code,desc:v.desc,prevPieces:v.prevPieces,prevMoney:v.prevMoney}));
    const summary={fileName:selectedFile.name,maxDate:maxDate.toISOString(),labels:{current:monthLabel(maxDate),prev:monthLabel(prevStart)},totals:{current:currentTotal,prev:prevTotal,meta:asNumber(metaInput.value)},topClients,lostClients,lostProducts,products};
    localStorage.setItem('toyoPremiumData',JSON.stringify(summary));
    location.href='dashboard.html';
  }catch(err){
    console.error(err);statusBox.textContent=err.message||'No fue posible analizar el archivo.';statusBox.className='status error';analyzeBtn.disabled=false;
  }
});
