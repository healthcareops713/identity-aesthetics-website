/* IA booking router v1 — every booking button goes to the right OptiMantra service (Nov 20, 2026) */
(function(){
  try{var q=new URLSearchParams(location.search);var bk=null;try{bk=JSON.parse(sessionStorage.getItem('iaBooked')||'null');sessionStorage.removeItem('iaBooked');}catch(e){}if(q.has('apptDate')||q.has('first')||q.has('email')||q.has('ph')){bk={d:q.get('apptDate')||'',t:q.get('apptTime')||'',s:q.get('serviceName')||''};history.replaceState(null,'',location.pathname+location.hash);}if(bk){var es0=/^\/es(\/|$)/.test(location.pathname);var d=bk.d,t=bk.t,sv=bk.s;var run=function(){var b=document.createElement('div');b.setAttribute('role','status');b.style.cssText='position:fixed;left:50%;top:90px;transform:translateX(-50%);z-index:99999;background:#1f1b16;color:#fff;padding:16px 22px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.25);max-width:92vw;font-size:15px';b.textContent=(es0?'¡Su cita está reservada! ':'You\'re booked! ')+sv+(d?' · '+d:'')+(t?' · '+t:'')+(es0?' · Revise su correo para la confirmación y los formularios.':' · Check your email for your confirmation and forms.');document.body.appendChild(b);setTimeout(function(){b.remove();},12000);};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();}}catch(e){}
  var OM='https://www.optimantra.com/optimus/patient/patientaccess/';
  var CON={pid:'M2hRWi96bXhEYm1lc1RmL0d2eVZ0UT09',lid:'dWlWZGxqOUtQNGxWRWhYQlF3VUdEdz09'};
  var FUL={pid:'LzE4RzJRNmxQNXBFUjEwZGZUNEFMUT09',lid:'NjJQendiMUpOZUZGRnl4eFFYRlhGdz09'};
  var MI=['botox','filler','filler-correction','pdo','kybella','hair','vaginal','ed-shockwave','consult','holiday'];
  var PHONE='713-268-6963';
  var S={
    'botox':['Botox, Dysport, Jeuveau & Xeomin','Botox, Dysport, Jeuveau y Xeomin','1540308952','U2hGUWpJM1ZEMHVZdllnb0VQL0JxZz09'],
    'filler':['Dermal Filler Consultation','Consulta de rellenos dérmicos','1541084268','ekh6MU1rYkQ5RVRIM2g5M3NtYWR2dz09'],
    'filler-correction':['Filler Correction Consultation','Consulta de corrección de rellenos','1541084270','VU4wNWFMZlZiajNSVnBrZ2dWRkpWQT09'],
    'pdo':['PDO Thread Lift Consultation','Consulta de hilos PDO','1541084326','Yk1mZFZTSllJcGxqR1JuQlZqNUxqZz09'],
    'kybella':['Kybella','Kybella','1541198843','c2pmQ25lbVpPNVljOVQ4T2Z1aVN1dz09'],
    'lasemd':['LaseMD Laser Resurfacing','Rejuvenecimiento con láser LaseMD','1541084204','alFBNFhZL2xHRnZaV2Z5MHB1V21Bdz09'],
    'bbl':['Sciton BBL Photofacial','Fotofacial Sciton BBL','1541198847','d0t2NUpwa0l3L2ZtUkVIdytjTzZqZz09'],
    'profractional':['Sciton ProFractional','Sciton ProFractional','1541199520','Z2ZITTRoNisrR1IxaGlqRG9jaUQ2UT09'],
    'microlaserpeel':['Sciton MicroLaserPeel','Sciton MicroLaserPeel','1541199521','MTJ3VWJmZ0I0MVplTktkRXdtMDBTZz09'],
    'lhr':['Laser Hair Reduction','Reducción de vello con láser','1541198846','SEN1OWt4SW8wSlhiaXM3NUJwNEUwZz09'],
    'microneedling':['EVO Microneedling','Microagujas EVO','1541083247','TExyK1c5QnBBWWlram5Janl1eldtZz09'],
    'facial':['Custom Signature Facial','Facial personalizado','1541083273','d2tNV1JYVHdKWk1QTnBmT2ZnU2NpZz09'],
    'glo2':['Glo2Facial','Glo2Facial','1541084239','ZEhwVlFlVW9Mc3V5NGRDbU8zNTQxZz09'],
    'peel':['Custom Chemical Peel','Peeling químico personalizado','1541083433','dVF3elF1RndhN1YyV3VsYzNaTmE4QT09'],
    'dermaplaning':['Dermaplaning','Dermaplaning','1541083364','elkySElObDRGbS9xVWhCd01SNjkxUT09'],
    'velashape':['VelaShape Body Contouring','Contorno corporal VelaShape','1541084357','QTFNdVV4RkRqU3lzWFNNTkNGTWd3Zz09'],
    'ultherapy':['Ultherapy','Ultherapy','1541199522','KzhpQ3l3TW5qVldHRGhnV0RWcEdDdz09'],
    'brow':['Eyebrow Wax','Depilación de cejas','1541199523','alVRRm9QcXk3ekN5d2lScEI2R0l4dz09'],
    'lash':['Lash Lift and Tint','Lifting y tinte de pestañas','1541199525','VWs4c2FNU1pSdmVLQ2Q3NHdCMHBDQT09'],
    'waxing':['Waxing','Depilación con cera','1541199615','ajR5aThTSU1zUHF4SDc2NkFDOTF5Zz09'],
    'vaginal':['Vaginal Rejuvenation (HIFU)','Rejuvenecimiento vaginal (HIFU)','1541198842','V3haWlhVWlU3a05Fb21YTGNZaW9vdz09'],
    'ed-shockwave':['ED Shockwave Therapy','Terapia de ondas de choque para la DE','1541199527','UVhFWHpyM1BjcFJwVHJ2b05hQnJkZz09'],
    'hair':['PRP Hair Restoration','Restauración capilar con PRP','1541084298','NithTDNvRERmcnRWYUYrZ29tdG5uUT09'],
    'consult':['Consultation','Consulta','1541199614','aGlMMFRPUFFPUG5Fa1RaTVk3Y2k4QT09'],
    'holiday':['Holiday Promotion','Promoción navideña','1541203493','NjNidWNiVkU3ZjQ0eC94SVNmVU1MZz09']
  };
  var MED=['weight-loss','hormones','peptides','ed','longevity','total-woman','telehealth'];
  var PAGE={
    'botox':['treatment-botox','treatment-dysport','treatment-xeomin','treatment-jeuveau','botox-conroe-tx','botox-houston-tx','botox-fulshear-tx','botox-katy-tx','injectables'],
    'filler':['treatment-juvederm','treatment-lip-filler','treatment-sculptra','treatment-radiesse','treatment-evolysse','fillers-conroe-tx','treatment-complete-facial-balancing'],
    'filler-correction':['treatment-botched-filler-correction'],'pdo':['treatment-pdo-threads'],'lasemd':['treatment-lasemd'],
    'bbl':['treatment-laser-rejuvenation','treatment-sciton-profile-bbl'],'lhr':['treatment-laser-hair-removal'],
    'microneedling':['microneedling'],'dermaplaning':['dermaplaning'],'glo2':['glo2facial-treatments','treatment-glo2facial'],
    'facial':['korean-glass-skin-facial','team-astrid-ariano'],'brow':['brow-services'],'lash':['lash-services'],'waxing':['waxing-services'],
    'velashape':['treatment-body-contouring'],'vaginal':['treatment-vaginal-rejuvenation-hifu'],'hair':['treatment-hair-restoration'],
    'weight-loss':['weight-loss','treatment-semaglutide','treatment-tirzepatide','treatment-glp1-weight-loss-consultation','glp1-pipeline'],
    'total-woman':['total-woman-weight-loss','journal-total-package-weight-loss-women'],
    'hormones':['treatment-hormone-optimization-men','treatment-hormone-optimization-women'],
    'ed':['treatment-erectile-dysfunction'],'longevity':['longevity-medicine'],
    'peptides':['peptides','clinical-peptide-therapy','peptide-program-men','peptide-program-women','treatment-physician-supervised-peptide-therapy'],
    'telehealth':['team-sarah-walker','team-dallas-alvey','team-javier-gonzalez']
  };
  var NAMES={'clinical peptide therapy':'peptides','peptide program for women':'peptides','peptide program for men':'peptides','total woman weight-loss program':'total-woman','longevity medicine':'longevity','erectile dysfunction treatment':'ed','sermorelin therapy':'peptides','not sure — help me choose':'consult'};
  var path=location.pathname.replace(/\/+$/,'')||'/'; var es=/^\/es(\/|$)/.test(path); var slug=path.replace(/^\/es/,'').replace(/^\//,'');
  function link(k,L){L=L||CON;var s=S[k]; return OM+'practsNslotsNEW?sid='+encodeURIComponent(s[3])+'&unCryptedSid='+s[2]+'&pid='+encodeURIComponent(L.pid)+'&lid='+encodeURIComponent(L.lid);}
  function tele(){return (es?'/es':'')+'/telehealth#states';}
  function pageKey(){for(var k in PAGE){if(PAGE[k].indexOf(slug)>-1)return k;}return null;}
  function keyFromHref(h){try{var u=new URL(h,location.origin);var s=(u.searchParams.get('service')||'').trim();if(!s)return null;if(S[s]||MED.indexOf(s)>-1)return s;return NAMES[s.toLowerCase()]||'consult';}catch(e){return null;}}
  function inChrome(a){return !!a.closest('header.nav,.mobile-action-bar,footer,.site-footer,#masthead');}
  function rewrite(){
    var pk=pageKey();
    document.querySelectorAll('a[href*="book-consultation"]').forEach(function(a){
      if(a.dataset.iaBk)return; a.dataset.iaBk='1';
      var k=keyFromHref(a.getAttribute('href'))||(inChrome(a)?null:pk);
      if(!k)return;
      if(MED.indexOf(k)>-1){a.setAttribute('href',tele());return;}
      if(S[k]){a.setAttribute('href',(es?'/es':'')+'/book-consultation?service='+k);}
    });
  }
  function hub(){
    if(!/^\/(es\/)?book-consultation$/.test(path))return;
    var p=new URLSearchParams(location.search); var raw=(p.get('service')||'').trim(); var k=raw?(S[raw]||MED.indexOf(raw)>-1?raw:(NAMES[raw.toLowerCase()]||'consult')):null;
    if(k&&MED.indexOf(k)>-1){location.replace(tele());return;}
    var T=es?{h:'Reserve en línea',sub:'Elija su servicio, su clínica y su horario. Recibirá sus formularios de consentimiento al reservar.',btn:'Reservar ',con:' en Conroe',ful:'Fulshear (viernes)',all:'Ver todos los servicios y horarios',other:'Houston y Katy: llame o envíe un mensaje de texto al '+PHONE+' para reservar.',med:'¿Pérdida de peso, hormonas, péptidos o DE? Se atienden por telemedicina:',medb:'Reservar telemedicina',pick:'O elija un servicio:'}:{h:'Book online',sub:'Choose your service, clinic and time. Your consent forms are sent when you book.',btn:'Book ',con:' in Conroe',ful:'Fulshear (Fridays)',all:'See all services & times',other:'Houston & Katy: call or text '+PHONE+' to book.',med:'Weight loss, hormones, peptides or ED? Those are seen by telehealth:',medb:'Book telehealth',pick:'Or pick a service:'};
    var allUrl=OM+'servicesall?pid='+CON.pid+'&lid='+CON.lid;
    var h='<section id="ia-book-hub" style="padding:48px 0;background:#faf7f2"><div class="wrap" style="max-width:1100px;margin:0 auto;padding:0 24px">';
    h+='<span class="eyebrow">'+T.h+'</span>';
    if(k&&S[k]){h+='<h2 style="margin:8px 0 10px">'+S[k][es?1:0]+'</h2><p>'+T.sub+'</p><div class="cta" style="display:flex;gap:14px;flex-wrap:wrap;margin:18px 0"><a class="btn btn-gold" href="'+link(k)+'">'+T.btn+S[k][es?1:0]+T.con+'</a>'+(MI.indexOf(k)>-1?'<a class="btn btn-line" href="'+link(k,FUL)+'">'+T.ful+'</a>':'')+'<a class="btn btn-line" href="'+allUrl+'">'+T.all+'</a></div>';}
    else{h+='<h2 style="margin:8px 0 10px">'+(es?'Reserve su cita':'Book your appointment')+'</h2><p>'+T.sub+'</p><div class="cta" style="display:flex;gap:14px;flex-wrap:wrap;margin:18px 0"><a class="btn btn-gold" href="'+allUrl+'">'+T.all+'</a></div><p style="margin-top:6px;font-weight:600">'+T.pick+'</p><div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:10px">';
      ['botox','filler','lhr','lasemd','bbl','microneedling','facial','glo2','dermaplaning','brow','lash','waxing','kybella','pdo','velashape','ultherapy','hair','vaginal','ed-shockwave','consult'].forEach(function(x){h+='<a class="btn btn-line btn-sm" href="'+link(x)+'">'+S[x][es?1:0]+'</a>';});
      h+='</div>';}
    h+='<p style="margin-top:16px">'+T.other+'</p><p>'+T.med+' <a class="gold" href="'+tele()+'">'+T.medb+' &rarr;</a></p></div></section>';
    var main=document.querySelector('main')||document.querySelector('.elementor')||document.body; var first=main.querySelector('section');
    var wrap=document.createElement('div'); wrap.innerHTML=h; var node=wrap.firstChild;
    if(first&&first.parentNode){first.parentNode.insertBefore(node,first.nextSibling);}else{main.insertBefore(node,main.firstChild);}
    // Online booking is Conroe-only until other clinics have OptiMantra schedules
    document.querySelectorAll('a[href*="servicesall"]').forEach(function(a){ if(/Houston|Katy/i.test(a.textContent)){a.setAttribute('href','sms:'+PHONE.replace(/-/g,''));a.removeAttribute('target');a.textContent=(es?'Mensaje de texto para reservar · ':'Text to book · ')+a.textContent.replace(/^(Book|Reservar)\s*/i,'');} });
    if(k&&location.hash!=='#ia-book-hub'){setTimeout(function(){node.scrollIntoView({behavior:'smooth',block:'start'});},300);}
  }
  function go(){rewrite();hub();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
