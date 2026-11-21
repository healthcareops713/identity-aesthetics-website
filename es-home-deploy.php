$dir=get_stylesheet_directory(); $res=[];
// 1. language toggle
$lf=$dir.'/assets/js/language-toggle.js'; $lt=file_get_contents($lf); copy($lf,$lf.'.bak-20261120-eshome');
$reps=[
 ['var onSpanishPage=path.indexOf("/es/")===0;','var onSpanishPage=path==="/es"||path.indexOf("/es/")===0;'],
 ['var hasSpanishPage=ES_PAGES.indexOf(slug)!==-1;','var hasSpanishPage=slug===""||ES_PAGES.indexOf(slug)!==-1;'."\n".'  function esUrl(s){return s?"/es/"+s:"/es";}'."\n".'  function enUrl(s){return "/"+s;}'],
 ['location.assign("/es/"+slug+"/"+location.search+location.hash)','location.assign(esUrl(slug)+location.search+location.hash)'],
 ['location.assign("/"+slug+"/"+location.search+location.hash)','location.assign(enUrl(slug)+location.search+location.hash)'],
 ['var enHref=onSpanishPage?"/"+slug+"/":null;','var enHref=onSpanishPage?enUrl(slug):null;'],
 ['var esHref=hasSpanishPage&&!onSpanishPage?"/es/"+slug+"/":null;','var esHref=hasSpanishPage&&!onSpanishPage?esUrl(slug):null;'],
];
foreach($reps as $r){ $n=substr_count($lt,$r[0]); $res['lt'][]=$n; if($n!==1) return ['err'=>'lt match','r'=>$r[0],'n'=>$n,'res'=>$res]; $lt=str_replace($r[0],$r[1],$lt); }
file_put_contents($lf,$lt);
// 2. config
$cf=$dir.'/inc/page-config.json'; $raw=file_get_contents($cf); copy($cf,$cf.'.bak-20261120-eshome');
$raw=str_replace('language-toggle.js?v=6','language-toggle.js?v=7',$raw); $c=json_decode($raw,true);
$hl=function(){ return ['<link rel="alternate" hreflang="en-US" href="https://713botoxme.com/">','<link rel="alternate" hreflang="es-US" href="https://713botoxme.com/es">','<link rel="alternate" hreflang="x-default" href="https://713botoxme.com/">']; };
$en=$c['en:']; $enld=array_values(array_filter($en['jsonld'],function($b){ return strpos($b,'hreflang=')===false; }));
$c['en:']['jsonld']=array_merge($hl(),$enld);
// Spanish JSON-LD: org graph minus the English WebPage node, plus a Spanish WebPage node
$t='Med spa de lujo y bienestar en Houston, TX | Identity Aesthetics'; $d='Inyectables, tratamientos avanzados para la piel, pérdida de peso con GLP-1 y terapia con péptidos en cinco sedes de Houston y por telemedicina en 16 estados.';
$esld=[]; foreach($enld as $b){ if(preg_match('#^\s*<script[^>]*>(.*)</script>\s*$#s',$b,$m)){ $j=json_decode($m[1],true); if(isset($j['@graph'])){ $j['@graph']=array_values(array_filter($j['@graph'],function($n){ $ty=(array)($n['@type']??''); return !in_array('WebPage',$ty,true); })); $j['@graph'][]=['@type'=>'WebPage','@id'=>'https://713botoxme.com/es#webpage','url'=>'https://713botoxme.com/es','name'=>$t,'description'=>$d,'inLanguage'=>'es-US','isPartOf'=>['@id'=>'https://713botoxme.com/#website'],'about'=>['@id'=>'https://713botoxme.com/#organization']]; } $esld[]='<script type="application/ld+json">'.json_encode($j,JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE).'</script>'; } }
$es=$en; $ab=$c['es:about'];
$es['lang']='es'; $es['slug']=''; $es['path']='/es'; $es['html_lang']='es'; $es['body_attrs']=$ab['body_attrs']; $es['title']=$t; $es['description']=$d; $es['canonical']='https://713botoxme.com/es';
$es['og']['locale']='es_US'; $es['og']['title']=$t; $es['og']['description']=$d; $es['og']['url']='https://713botoxme.com/es'; $es['twitter']['title']=$t; $es['twitter']['description']=$d;
$es['fonts']=$ab['fonts']; $es['jsonld']=array_merge($hl(),$esld); $es['sitemap']='<url><loc>https://713botoxme.com/es</loc><lastmod>2026-11-20</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>';
$es['shell_before']=$ab['shell_before']; $es['shell_after']=$ab['shell_after'];
$new=[]; foreach($c as $k=>$v){ $new[$k]=$v; if($k==='en:') $new['es:']=$es; } $c=$new;
// 3. Spanish logo links go to the Spanish homepage
$logo=0; foreach($c as $k=>&$e){ if(strpos($k,'es:')!==0) continue; foreach(['shell_before','shell_after'] as $f){ $e[$f]=str_replace('href="/" aria-label="Identity Aesthetics home"','href="/es" aria-label="Inicio de Identity Aesthetics"',$e[$f],$n); $logo+=$n; } } unset($e); $res['logo_links']=$logo;
file_put_contents($cf,json_encode($c,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE)); $res['cfg']=count($c);
// 4. page
kses_remove_filters(); $id=wp_update_post(['ID'=>366,'post_title'=>'Inicio','post_status'=>'publish','post_content'=>$HTML],true);
if(is_wp_error($id)) return ['err'=>$id->get_error_message(),'res'=>$res];
update_post_meta(366,'_ia_lang','es'); update_post_meta(366,'_ia_slug',''); update_post_meta(366,'_ia_title',$t);
$res['page']=[get_permalink(366), strlen(get_post(366)->post_content), strlen($HTML)];
if(function_exists('tenweb_purge_all_caches')) tenweb_purge_all_caches(); wp_cache_flush();
return $res;
