@set_time_limit(240);
global $wpdb; $dir=get_stylesheet_directory(); $res=[];
$cf=$dir.'/inc/page-config.json'; $c=json_decode(file_get_contents($cf),true);
$dec=function($s){ return html_entity_decode($s,ENT_QUOTES,'UTF-8'); };
// ---- 1. titles
$titleOverride=[
 'en:'=>'Luxury Med Spa &amp; Wellness in Houston, TX | Identity Aesthetics',
 'en:peptide-safety-bulletin'=>'Peptide Safety Bulletin: Counterfeit &amp; Research-Only Injectables',
 'en:journal-total-package-weight-loss-women'=>'Beyond the Shot: Total-Package Weight Loss for Women',
 'en:journal-facial-volume-loss'=>'Facial Volume Loss &amp; GLP-1 Weight Loss | Identity Aesthetics',
 'es:about'=>'Quiénes somos | Identity Aesthetics',
 'es:peptides'=>'Terapia con péptidos: presencial y por telemedicina',
];
$tch=[];
foreach($c as $k=>&$e){ if($k==='en:treatment-sermorelin') continue; $t=$e['title']??''; if(mb_strlen($dec($t))<=65 && !isset($titleOverride[$k])) continue;
  if(isset($titleOverride[$k])) $n=$titleOverride[$k]; else { $n=preg_replace('/ \| 16 (States|estados)/u','',$t); if(mb_strlen($dec($n))>65) $n=preg_replace('/ \| Identity Aesthetics$/u','',$n); }
  if($n!==$t && mb_strlen($dec($n))<=66){ $e['title']=$n; $tch[$k]=[$t,$n]; } }
unset($e); $res['titles']=count($tch);
// ---- 2. descriptions
$descOverride=[
 'en:telehealth'=>"See a licensed Identity Aesthetics provider from home. Telehealth for weight loss, peptides, hormones and men's health in Texas and 15 more states.",
 'en:pharmacy-sourcing'=>'Where Identity Aesthetics prescriptions are filled: The Apothecary Pharmacy for TX, AZ, CO, FL and WY, and Belmar Pharma Solutions for other states.',
 'en:team-javier-gonzalez'=>'Meet Javier Gonzalez, MD, double board certified in emergency medicine and obesity medicine, leading our medical weight loss and peptide therapy.',
 'en:online/peptides'=>'Physician-prescribed compounded peptides online: BPC-157, TB-500, MOTS-c, Epitalon, KPV and Semax from a licensed 503A pharmacy. Not FDA-approved.',
 'es:online/peptides'=>'Péptidos compuestos con receta médica en línea: BPC-157, TB-500, MOTS-c, epitalon, KPV y Semax, de una farmacia 503A con licencia. No aprobados por la FDA.',
 'es:botox-conroe-tx'=>'Med Spa dirigido por médicos en Conroe, TX: Botox, rellenos dérmicos y de labios, faciales, láser, pérdida de peso con GLP-1 y terapia hormonal.',
 'es:botox-fulshear-tx'=>'Med Spa con servicios integrales en 5th Street, Fulshear, TX: Botox, rellenos dérmicos y de labios, tratamientos de la piel y servicios de bienestar.',
 'es:locations'=>'Visite cualquiera de las cinco clínicas de Identity Aesthetics en el área de Houston o reciba atención por telemedicina en Texas y 15 estados más.',
 'es:about'=>'Realzamos la belleza de cada persona desde 2011. Conozca la filosofía de Identity Aesthetics: lujo, confianza y atención dirigida por médicos.',
 'es:telehealth'=>'Consulte desde casa con un profesional de la salud autorizado de Identity Aesthetics. Telemedicina en Texas y 15 estados más.',
 'es:treatment-botox'=>'Botox® Cosmetic en Identity Aesthetics: candidatos, procedimiento, recuperación, resultados, riesgos, precios y citas en el área de Houston.',
 'es:treatment-juvederm'=>'Juvéderm® en Identity Aesthetics: candidatos, procedimiento, recuperación, resultados, riesgos, precios y citas en el área de Houston.',
 'es:medspa'=>'Faciales coreanos de piel de cristal, Glo2Facial, pestañas y cejas, rejuvenecimiento con láser y remodelación corporal en Identity Aesthetics.',
 'es:treatments'=>'Candidatos, tratamiento, recuperación, resultados, riesgos, precios y preguntas frecuentes de cada servicio de Identity Aesthetics.',
 'es:injectables'=>'Botox, Dysport, Jeuveau, Xeomin, Juvéderm, rellenos de labios, Sculptra e hilos PDO aplicados por profesionales médicos en el área de Houston.',
 'es:faq'=>'Respuestas sobre consultas, inyectables, Med Spa, pérdida de peso con GLP-1, terapia con péptidos y telemedicina en Identity Aesthetics.',
 'es:online/refund-policy'=>'Cómo funcionan la cuota inicial, los resurtidos, los cobros mensuales, las suscripciones y los análisis en la atención en línea de Identity Aesthetics.',
];
$dch=[];
foreach($c as $k=>&$e){ if($k==='en:treatment-sermorelin') continue; $d=$e['description']??''; $plain=$dec($d); if(mb_strlen($plain)<=165 && !isset($descOverride[$k])) continue;
  if(isset($descOverride[$k])) $n=$descOverride[$k];
  else { $n=''; if(preg_match_all('/[^.!?]+[.!?]+/u',$plain,$m)){ $acc=''; foreach($m[0] as $s){ if(mb_strlen($acc.$s)<=160) $acc.=$s; else break; } $n=trim($acc); }
    if(preg_match('#^es:online/peptides/#',$k)) $n=$n.' Farmacia 503A con licencia; no aprobado por la FDA.';
    elseif(preg_match('#^es:online/weight-loss/(foundayo|saxenda|wegovy|wegovy-pill|zepbound)$#',$k)) $n=$n.' Aprobado por la FDA para reducir y mantener el peso a largo plazo.';
    elseif($k==='es:online/weight-loss') $n=$n.' Wegovy, Zepbound, Saxenda, Foundayo y más.';
    if(mb_strlen($n)<100) $n=''; }
  if($n && mb_strlen($n)<=165){ $old=$e['description']; $e['description']=$n; if(isset($e['og']['description']) && $e['og']['description']===$old) $e['og']['description']=$n; if(isset($e['twitter']['description']) && $e['twitter']['description']===$old) $e['twitter']['description']=$n; $dch[$k]=[mb_strlen($plain),mb_strlen($n),$n]; } }
unset($e); $res['descs']=count($dch);
// ---- 3. hreflang on 19 pairs
$pairs=['botox-conroe-tx','botox-houston-tx','botox-fulshear-tx','botox-katy-tx','locations','contact','about','team','book-consultation','telehealth','weight-loss','peptides','treatment-botox','treatment-juvederm','medspa','treatments','injectables','faq','payment-plans'];
$hl=0; foreach($pairs as $s){ if(!isset($c['en:'.$s],$c['es:'.$s])) continue; $tags=['<link rel="alternate" hreflang="en-US" href="https://713botoxme.com/'.$s.'">','<link rel="alternate" hreflang="es-US" href="https://713botoxme.com/es/'.$s.'">','<link rel="alternate" hreflang="x-default" href="https://713botoxme.com/'.$s.'">'];
 foreach(['en:','es:'] as $L){ $j=array_values(array_filter($c[$L.$s]['jsonld']??[],function($b){ return strpos($b,'hreflang=')===false; })); $c[$L.$s]['jsonld']=array_merge($tags,$j); $hl++; } }
$res['hreflang_pages']=$hl;
// ---- 4. sitemap gap, press og, pharmacy JSON-LD
$c['es:online/weight-loss/compounded']['sitemap']='<url><loc>https://713botoxme.com/es/online/weight-loss/compounded</loc><lastmod>2026-11-20</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>';
$c['en:press']['og']=array_merge($c['en:press']['og'],['site_name'=>'Identity Aesthetics','locale'=>'en_US','image'=>'/wp-content/uploads/ia-media/images/og/home-og.jpg','image_width'=>'1200','image_height'=>'630','image_alt'=>'Identity Aesthetics']);
$c['en:press']['twitter']['image']='/wp-content/uploads/ia-media/images/og/home-og.jpg'; if(empty($c['en:press']['twitter']['card'])) $c['en:press']['twitter']['card']='summary_large_image';
$ps=$c['en:pharmacy-sourcing']; $ld=['@context'=>'https://schema.org','@graph'=>[['@type'=>'MedicalWebPage','@id'=>'https://713botoxme.com/pharmacy-sourcing#webpage','url'=>'https://713botoxme.com/pharmacy-sourcing','name'=>$dec($ps['title']),'description'=>$dec($ps['description']),'inLanguage'=>'en-US','isPartOf'=>['@id'=>'https://713botoxme.com/#website'],'about'=>['@id'=>'https://713botoxme.com/#organization'],'publisher'=>['@id'=>'https://713botoxme.com/#organization'],'lastReviewed'=>'2026-11-20'],['@type'=>'BreadcrumbList','itemListElement'=>[['@type'=>'ListItem','position'=>1,'name'=>'Home','item'=>'https://713botoxme.com/'],['@type'=>'ListItem','position'=>2,'name'=>'Pharmacy Sourcing & Medication Safety','item'=>'https://713botoxme.com/pharmacy-sourcing']]]]];
$c['en:pharmacy-sourcing']['jsonld']=['<script type="application/ld+json">'.json_encode($ld,JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE).'</script>'];
// ---- 5. trailing-slash internal links (shells + content + elementor), second H1 on intake page
$slashRe='#href=(["\'])(/(?!/)[^"\'\#?\s]*[^/"\'\#?\s])/((?:[\#?][^"\']*)?)\1#';
$fixSlash=function($s) use($slashRe){ return preg_replace($slashRe,'href=$1$2$3$1',$s,-1,$n) ; };
$cnt=0; foreach($c as $k=>&$e){ foreach(['shell_before','shell_after'] as $f){ if(!empty($e[$f])){ $e[$f]=preg_replace($slashRe,'href=$1$2$3$1',$e[$f],-1,$n); $cnt+=$n; } } } unset($e); $res['shell_slash']=$cnt;
$h1fix=function($s){ return preg_replace('#<h1>(Where are you located\?|¿Dónde se encuentra\?)</h1>#u','<h2 style="font-size:clamp(40px,6vw,64px)">$1</h2>',$s,-1,$n); };
$ids=$wpdb->get_col("SELECT ID FROM {$wpdb->posts} WHERE post_status='publish' AND post_type IN ('page','post','elementor_library')");
$pc=[]; if($APPLY) kses_remove_filters();
foreach($ids as $id){ $p=get_post($id); $new=preg_replace($slashRe,'href=$1$2$3$1',$p->post_content,-1,$a); $new=preg_replace('#<h1>(Where are you located\?|¿Dónde se encuentra\?)</h1>#u','<h2 style="font-size:clamp(40px,6vw,64px)">$1</h2>',$new,-1,$b);
 $raw=get_post_meta($id,'_elementor_data',true); $ea=0; $d=null; if($raw){ $d=json_decode($raw,true); $walk=function(&$v) use(&$walk,$slashRe,&$ea){ if(is_array($v)){ foreach($v as &$x) $walk($x); unset($x);} elseif(is_string($v)){ $v=preg_replace($slashRe,'href=$1$2$3$1',$v,-1,$q); $v=preg_replace('#<h1>(Where are you located\?|¿Dónde se encuentra\?)</h1>#u','<h2 style="font-size:clamp(40px,6vw,64px)">$1</h2>',$v,-1,$q2); $ea+=$q+$q2; } }; $walk($d); }
 if($a+$b+$ea){ $pc[$p->post_name.'#'.$id]=[$a+$b,$ea]; if($APPLY){ if($a+$b) wp_update_post(['ID'=>$id,'post_content'=>$new]); if($ea){ update_post_meta($id,'_ia_bak_20261120_seo',wp_slash($raw)); update_post_meta($id,'_elementor_data',wp_slash(wp_json_encode($d))); delete_post_meta($id,'_elementor_element_cache'); } } } }
$res['content']=$pc;
// ---- 6. mu-plugin cleanup
$mu=WP_CONTENT_DIR.'/mu-plugins/ia-seo-cleanup.php';
$muCode=<<<'MU'
<?php
// SEO and security cleanup (Nov 20, 2026).
// The theme serves its own /sitemap.xml; WordPress's built-in one listed leftover pages.
add_filter('wp_sitemaps_enabled','__return_false');
// Author, category, tag and date archives are WordPress leftovers on this site.
add_action('template_redirect',function(){ if(is_author()||is_category()||is_tag()||is_date()){ wp_safe_redirect(home_url('/'),301); exit; } },0);
// Internal preview page: keep it out of search results.
add_action('wp_head',function(){ if(is_page('animated-logo-preview')) echo '<meta name="robots" content="noindex, nofollow">'."\n"; },1);
// Do not publish the user list (login names) to logged-out visitors.
add_filter('rest_endpoints',function($e){ if(!is_user_logged_in()){ unset($e['/wp/v2/users'],$e['/wp/v2/users/(?P<id>[\d]+)']); } return $e; });
MU;
$res['mu_exists']=file_exists($mu);
if($APPLY){ copy($cf,$cf.'.bak-20261120-seo'); file_put_contents($cf,json_encode($c,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE)); file_put_contents($mu,$muCode);
 if(class_exists('\Elementor\Plugin')) \Elementor\Plugin::$instance->files_manager->clear_cache(); if(function_exists('tenweb_purge_all_caches')) tenweb_purge_all_caches(); wp_cache_flush(); }
$res['title_changes']=$tch; $res['desc_changes']=$dch;
return $res;
