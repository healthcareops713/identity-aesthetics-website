$base='https://raw.githubusercontent.com/healthcareops713/identity-aesthetics-website/'.$IA_COMMIT.'/';
$j=json_decode(wp_remote_retrieve_body(wp_remote_get($base.'telehealth-states.json',['timeout'=>60])),true);
$chips=json_decode(wp_remote_retrieve_body(wp_remote_get($base.'chips.json',['timeout'=>60])),true);
if(!$j||!$chips) return 'no json';
$PAGE=[
 ['are available to patients located in Texas, Florida, North Carolina and South Carolina. Medical weight loss and compounded peptides are also available in Alabama, Arizona, Colorado, Georgia, Mississippi, Nevada, Ohio, Oklahoma, Tennessee, Utah, Virginia and Wyoming.','are available to patients located in Texas and Florida. Medical weight loss and compounded peptides are also available in Alabama, Arizona, Colorado, Georgia, Mississippi, Nevada, North Carolina, Ohio, Oklahoma, South Carolina, Tennessee, Utah, Virginia and Wyoming.'],
 ['medicamentos controlados y bienestar en Texas, Florida, Carolina del Norte y Carolina del Sur. La pérdida de peso médica y los péptidos compuestos también están disponibles en Alabama, Arizona, Colorado, Georgia, Mississippi, Nevada, Ohio, Oklahoma, Tennessee, Utah, Virginia y Wyoming.','medicamentos controlados y bienestar en Texas y Florida. La pérdida de peso médica y los péptidos compuestos también están disponibles en Alabama, Arizona, Colorado, Georgia, Mississippi, Nevada, Carolina del Norte, Ohio, Oklahoma, Carolina del Sur, Tennessee, Utah, Virginia y Wyoming.'],
 ['HRT, controlled medications and all telehealth services in Texas, Florida, North Carolina and South Carolina; medical weight loss and peptides in 12 more','HRT, controlled medications and all telehealth services in Texas and Florida; medical weight loss and peptides in 14 more'],
 ['TRH, medicamentos controlados y todos los servicios de telemedicina en Texas, Florida, Carolina del Norte y Carolina del Sur; pérdida de peso médica y péptidos en 12 estados más','TRH, medicamentos controlados y todos los servicios de telemedicina en Texas y Florida; pérdida de peso médica y péptidos en 14 estados más'],
];
$CFG=[
 ['Outside Texas, Florida, North Carolina and South Carolina, telehealth covers medical weight loss and compounded peptides only.','Outside Texas, Florida, North Carolina and South Carolina, telehealth covers medical weight loss and compounded peptides only. Hormone therapy and controlled medications are offered by telehealth only in Texas and Florida.'],
 ['Fuera de Texas, Florida, Carolina del Norte y Carolina del Sur, la telemedicina cubre solo la pérdida de peso médica y los péptidos compuestos.','Fuera de Texas, Florida, Carolina del Norte y Carolina del Sur, la telemedicina cubre solo la pérdida de peso médica y los péptidos compuestos. La terapia hormonal y los medicamentos controlados por telemedicina solo se ofrecen en Texas y Florida.'],
 ['; outside Texas, Florida, North Carolina and South Carolina, medical weight loss and compounded peptides only)','; hormone therapy and controlled medications in Texas and Florida only; outside Texas, Florida, North Carolina and South Carolina, medical weight loss and compounded peptides only)'],
 ['; fuera de Texas, Florida, Carolina del Norte y Carolina del Sur, solo pérdida de peso médica y péptidos compuestos)','; terapia hormonal y medicamentos controlados solo en Texas y Florida; fuera de Texas, Florida, Carolina del Norte y Carolina del Sur, solo pérdida de peso médica y péptidos compuestos)'],
 ['for patients in Texas, Florida, North Carolina and South Carolina; medical weight loss and compounded peptides also in Alabama, Arizona, Colorado, Georgia,','for patients in Texas and Florida; medical weight loss, compounded peptides and wellness care also in North Carolina and South Carolina, and medical weight loss and compounded peptides in Alabama, Arizona, Colorado, Georgia,'],
 ['a pacientes que se encuentren en Texas, Florida, Carolina del Norte y Carolina del Sur; la pérdida de peso médica y los péptidos compuestos también en Alabama, Arizona, Colorado, Georgia,','a pacientes que se encuentren en Texas y Florida; la pérdida de peso médica, los péptidos compuestos y el bienestar también en Carolina del Norte y Carolina del Sur, y la pérdida de peso médica y los péptidos compuestos en Alabama, Arizona, Colorado, Georgia,'],
 ['and hormone care (HRT) and controlled-medication visits in TX, FL, NC and SC.','and hormone care (HRT) and controlled-medication visits in TX and FL.'],
 ['y terapia hormonal y medicamentos controlados en TX, FL, NC y SC.','y terapia hormonal y medicamentos controlados en TX y FL.'],
];
$rep=function($v,$pairs,&$n) use (&$rep){ if(is_string($v)){ foreach($pairs as $p){ $c=substr_count($v,$p[0]); if($c){ $n[$p[0]]=($n[$p[0]]??0)+$c; $v=str_replace($p[0],$p[1],$v);} } return $v;} if(is_array($v)) foreach($v as $k=>$x) $v[$k]=$rep($x,$pairs,$n); return $v; };
$d=get_template_directory(); $cf="$d/inc/page-config.json"; copy($cf,$cf.'.bak-20261119-txfl');
$c=json_decode(file_get_contents($cf),true); $nc=[]; $c=$rep($c,$CFG,$nc); file_put_contents($cf,wp_json_encode($c,JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT));
$log=['cfg'=>array_values($nc)];
foreach([236=>'en',286=>'es'] as $id=>$lang){
  $raw=get_post_meta($id,'_elementor_data',true); update_post_meta($id,'_ia_bak_20261119_txfl',$raw); $ed=json_decode($raw,true); $out=null; $np=[];
  $walk=function(&$els) use (&$walk,$j,$chips,$lang,$PAGE,$CFG,$rep,&$np,&$out){ foreach($els as &$e){ if(($e['widgetType']??'')==='html'){ $h=$e['settings']['html'];
      $h=$rep($h,array_merge($PAGE,$CFG),$np);
      $k=0; $h=preg_replace('#<section class="alt" id="states">.*?</section>#su',str_replace(['\\','$'],['\\\\','\$'],$j[$lang]),$h,1,$k); $np['states']=$k;
      $k2=0; $h=preg_replace('#<div class="state-line">.*?</div>#su',str_replace(['\\','$'],['\\\\','\$'],$chips[$lang]),$h,1,$k2); $np['chips']=$k2;
      $e['settings']['html']=$h; $out=$h; return true; }
    if(!empty($e['elements']) && $walk($e['elements'])) return true; } return false; };
  $walk($ed); update_post_meta($id,'_elementor_data',wp_slash(wp_json_encode($ed))); wp_update_post(['ID'=>$id,'post_content'=>wp_slash($out)]); $log[$id]=$np;
}
\Elementor\Plugin::$instance->files_manager->clear_cache(); if(function_exists('tenweb_purge_all_caches')) tenweb_purge_all_caches(); wp_cache_flush(); if(function_exists('opcache_reset')) opcache_reset();
return $log;
