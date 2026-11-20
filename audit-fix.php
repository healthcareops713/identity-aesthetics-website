$B='https://raw.githubusercontent.com/healthcareops713/identity-aesthetics-website/'.$IA_COMMIT.'/';
$pairs=json_decode(wp_remote_retrieve_body(wp_remote_get($B.'site-pairs.json',['timeout'=>60])),true);
$ph=wp_remote_retrieve_body(wp_remote_get($B.'pharmacy-sourcing.html',['timeout'=>60]));
if(!$pairs||strlen($ph)<5000) return 'fetch failed';
$d=get_template_directory(); $cf="$d/inc/page-config.json"; copy($cf,$cf.'.bak-20261120-audit');
$c=json_decode(file_get_contents($cf),true);
$rep=function($v,&$n) use (&$rep,$pairs){ if(is_string($v)){ foreach($pairs as $p){ $k=substr_count($v,$p[0]); if($k){ $n[$p[0]]=($n[$p[0]]??0)+$k; $v=str_replace($p[0],$p[1],$v);} } return $v;} if(is_array($v)) foreach($v as $k=>$x) $v[$k]=$rep($x,$n); return $v; };
$setHtml=function(&$els,$f) use (&$setHtml){ foreach($els as &$e){ if(($e['widgetType']??'')==='html'){ $e['settings']['html']=$f($e['settings']['html']); return true;} if(!empty($e['elements']) && $setHtml($e['elements'],$f)) return true;} return false; };
$log=['pages'=>[],'cfg'=>0]; $n=[];
foreach(get_posts(['post_type'=>'page','post_status'=>'publish','numberposts'=>-1]) as $p){
  $lang=get_post_meta($p->ID,'_ia_lang',true); $slug=get_post_meta($p->ID,'_ia_slug',true); $k=$lang.':'.$slug;
  if(str_starts_with($slug,'online') || $slug==='telehealth') continue;
  $raw=get_post_meta($p->ID,'_elementor_data',true); $ed=json_decode($raw,true); $before=json_encode($n);
  if($slug==='pharmacy-sourcing'){ update_post_meta($p->ID,'_ia_bak_20261120',$raw); if($ed){ $setHtml($ed,function($h) use ($ph){ return $ph; }); update_post_meta($p->ID,'_elementor_data',wp_slash(wp_json_encode($ed))); } wp_update_post(['ID'=>$p->ID,'post_content'=>wp_slash($ph)]); $log['pages'][]=$k.' (rewritten)'; continue; }
  $nn=[]; $newpc=$rep($p->post_content,$nn); $ne=[]; if($ed){ $ed2=$ed; $setHtml($ed2,function($h) use ($rep,&$ne){ return $rep($h,$ne); }); }
  if($nn||$ne){ update_post_meta($p->ID,'_ia_bak_20261120',$raw); if($ne) update_post_meta($p->ID,'_elementor_data',wp_slash(wp_json_encode($ed2))); if($nn) wp_update_post(['ID'=>$p->ID,'post_content'=>wp_slash($newpc)]); $log['pages'][]=$k; foreach(array_merge_recursive($nn,$ne) as $s=>$x) $n[$s]=1; }
}
foreach($c as $k=>&$e){ if(!is_array($e)) continue; if(str_contains($k,':online')||str_ends_with($k,':telehealth')) continue; foreach(['title','description','og','twitter','jsonld'] as $f){ if(isset($e[$f])){ $m=[]; $e[$f]=$rep($e[$f],$m); if($m) $log['cfg']++; } } }
unset($e);
$c['en:pharmacy-sourcing']['description']='Where Identity Aesthetics prescriptions are filled: The Apothecary Pharmacy (Stafford, TX) for Texas and Belmar Pharma Solutions (Arizona) for other states, with links to verify each license.';
foreach(['og','twitter'] as $t) if(is_array($c['en:pharmacy-sourcing'][$t]??null)) $c['en:pharmacy-sourcing'][$t]['description']=$c['en:pharmacy-sourcing']['description'];
$c['en:pharmacy-sourcing']['jsonld']=array_values(array_filter((array)$c['en:pharmacy-sourcing']['jsonld'],fn($x)=>!preg_match('/anazao/i',$x)));
file_put_contents($cf,wp_json_encode($c,JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT));
$log['phrases_hit']=count($n); $log['anazao_cfg_left']=preg_match_all('/anazao/i',file_get_contents($cf));
\Elementor\Plugin::$instance->files_manager->clear_cache(); if(function_exists('tenweb_purge_all_caches')) tenweb_purge_all_caches(); wp_cache_flush(); if(function_exists('opcache_reset')) opcache_reset();
return $log;
