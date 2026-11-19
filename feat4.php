$j=json_decode(wp_remote_retrieve_body(wp_remote_get('https://raw.githubusercontent.com/healthcareops713/identity-aesthetics-website/'.$IA_COMMIT.'/telehealth-states.json',['timeout'=>60])),true);
if(!$j) return 'no json';
$X_EN_OLD='Eligible weight-loss, peptide, hormone and wellness consultations are available to patients located in Texas, North Carolina and South Carolina. Medical weight loss and compounded peptides are also available in Alabama, Arizona, Colorado, Florida, Georgia, Mississippi, Nevada, Ohio, Oklahoma, Tennessee, Utah, Virginia and Wyoming.';
$X_EN_NEW='Hormone replacement therapy (HRT), controlled-medication visits and weight-loss, peptide and wellness consultations are available to patients located in Texas, Florida, North Carolina and South Carolina. Medical weight loss and compounded peptides are also available in Alabama, Arizona, Colorado, Georgia, Mississippi, Nevada, Ohio, Oklahoma, Tennessee, Utah, Virginia and Wyoming.';
$X_ES_OLD='a consultas sobre control del peso, terapia con péptidos, salud hormonal y bienestar. La pérdida de peso médica y los péptidos compuestos también están disponibles en Alabama, Arizona, Colorado, Florida, Georgia, Mississippi, Nevada, Ohio, Oklahoma, Tennessee, Utah, Virginia y Wyoming.';
$X_ES_NEW='a consultas sobre control del peso, terapia con péptidos, terapia de reemplazo hormonal (TRH), medicamentos controlados y bienestar en Texas, Florida, Carolina del Norte y Carolina del Sur. La pérdida de peso médica y los péptidos compuestos también están disponibles en Alabama, Arizona, Colorado, Georgia, Mississippi, Nevada, Ohio, Oklahoma, Tennessee, Utah, Virginia y Wyoming.';
$PAGE=[
 [$X_EN_OLD,$X_EN_NEW],[$X_ES_OLD,$X_ES_NEW],
 ['<b>Available in 16 states</b> — all telehealth services in Texas, North Carolina and South Carolina; medical weight loss and peptides in 13 more','<b>Available in 16 states</b> — HRT, controlled medications and all telehealth services in Texas, Florida, North Carolina and South Carolina; medical weight loss and peptides in 12 more'],
 ['<b>Disponible en 16 estados</b> — todos los servicios de telemedicina en Texas, Carolina del Norte y Carolina del Sur; pérdida de peso médica y péptidos en 13 estados más','<b>Disponible en 16 estados</b> — TRH, medicamentos controlados y todos los servicios de telemedicina en Texas, Florida, Carolina del Norte y Carolina del Sur; pérdida de peso médica y péptidos en 12 estados más'],
];
$CFG=[
 ['Outside Texas, North Carolina and South Carolina, telehealth covers medical weight loss and compounded peptides only.','Outside Texas, Florida, North Carolina and South Carolina, telehealth covers medical weight loss and compounded peptides only.'],
 ['Fuera de Texas, Carolina del Norte y Carolina del Sur, la telemedicina cubre solo la pérdida de peso médica y los péptidos compuestos.','Fuera de Texas, Florida, Carolina del Norte y Carolina del Sur, la telemedicina cubre solo la pérdida de peso médica y los péptidos compuestos.'],
 ['; outside Texas, North Carolina and South Carolina, medical weight loss and compounded peptides only)','; outside Texas, Florida, North Carolina and South Carolina, medical weight loss and compounded peptides only)'],
 ['; fuera de Texas, Carolina del Norte y Carolina del Sur, solo pérdida de peso médica y péptidos compuestos)','; fuera de Texas, Florida, Carolina del Norte y Carolina del Sur, solo pérdida de peso médica y péptidos compuestos)'],
 ['may be handled by telehealth for patients in Texas, North Carolina and South Carolina; medical weight loss and compounded peptides also in Alabama, Arizona, Colorado, Florida, Georgia,','may be handled by telehealth for patients in Texas, Florida, North Carolina and South Carolina; medical weight loss and compounded peptides also in Alabama, Arizona, Colorado, Georgia,'],
 ['por telemedicina a pacientes que se encuentren en Texas, Carolina del Norte y Carolina del Sur; la pérdida de peso médica y los péptidos compuestos también en Alabama, Arizona, Colorado, Florida, Georgia,','por telemedicina a pacientes que se encuentren en Texas, Florida, Carolina del Norte y Carolina del Sur; la pérdida de peso médica y los péptidos compuestos también en Alabama, Arizona, Colorado, Georgia,'],
 ['and hormone care in TX, NC and SC.','and hormone care (HRT) and controlled-medication visits in TX, FL, NC and SC.'],
 ['y atención hormonal en TX, NC y SC.','y terapia hormonal y medicamentos controlados en TX, FL, NC y SC.'],
];
$rep=function($v,$pairs,&$n) use (&$rep){ if(is_string($v)){ foreach($pairs as $p){ $c=substr_count($v,$p[0]); if($c){ $n[$p[0]]=($n[$p[0]]??0)+$c; $v=str_replace($p[0],$p[1],$v);} } return $v;} if(is_array($v)) foreach($v as $k=>$x) $v[$k]=$rep($x,$pairs,$n); return $v; };
$d=get_template_directory(); $cf="$d/inc/page-config.json"; copy($cf,$cf.'.bak-20261119-feat4');
$c=json_decode(file_get_contents($cf),true); $nc=[]; $c=$rep($c,$CFG,$nc); file_put_contents($cf,wp_json_encode($c,JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT));
$log=['cfg'=>$nc];
foreach([236=>'en',286=>'es'] as $id=>$lang){
  $raw=get_post_meta($id,'_elementor_data',true); update_post_meta($id,'_ia_bak_20261119_feat4',$raw); $ed=json_decode($raw,true); $out=null; $np=[];
  $walk=function(&$els) use (&$walk,$j,$lang,$PAGE,$CFG,$rep,&$np,&$out){ foreach($els as &$e){ if(($e['widgetType']??'')==='html'){ $h=$e['settings']['html'];
      $k=0; $h=preg_replace('#<section class="alt" id="states">.*?</section>#su',str_replace(['\\','$'],['\\\\','\$'],$j[$lang]),$h,1,$k); $np['states']=$k;
      $h=$rep($h,array_merge($PAGE,$CFG),$np); $e['settings']['html']=$h; $out=$h; return true; }
    if(!empty($e['elements']) && $walk($e['elements'])) return true; } return false; };
  $walk($ed); update_post_meta($id,'_elementor_data',wp_slash(wp_json_encode($ed))); wp_update_post(['ID'=>$id,'post_content'=>wp_slash($out)]); $log[$id]=$np;
}
\Elementor\Plugin::$instance->files_manager->clear_cache(); if(function_exists('tenweb_purge_all_caches')) tenweb_purge_all_caches(); wp_cache_flush(); if(function_exists('opcache_reset')) opcache_reset();
return $log;
