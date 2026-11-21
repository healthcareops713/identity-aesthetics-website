global $wpdb; $dir=get_stylesheet_directory(); $res=[];
// llms.txt
$lf=ABSPATH.'llms.txt'; copy($lf,$lf.'.bak-20261120'); file_put_contents($lf,$LLMS); $res['llms']=filesize($lf);
// mega-nav label in site-enhancements.js
$sf=$dir.'/assets/js/site-enhancements.js'; $s=file_get_contents($sf); copy($sf,$sf.'.bak-20261120-geo');
$s=str_replace('["Texas · North Carolina · South Carolina", "/telehealth/"]','["Texas + 15 more states", "/telehealth"]',$s,$n); $res['nav']=$n; file_put_contents($sf,$s);
// page content + elementor: city pages + locations card
$map=['<span>TX &middot; NC &middot; SC</span>'=>'<span>Texas + 15 more states</span>','Texas · North Carolina · South Carolina'=>'Texas + 15 more states'];
kses_remove_filters();
foreach([177,178,179,180,201] as $id){ $p=get_post($id); $pc=str_replace(array_keys($map),array_values($map),$p->post_content,$a); if($a) wp_update_post(['ID'=>$id,'post_content'=>$pc]);
 $raw=get_post_meta($id,'_elementor_data',true); $b=0; if($raw){ $d=json_decode($raw,true); $walk=function(&$v) use(&$walk,$map,&$b){ if(is_array($v)){ foreach($v as &$x) $walk($x); unset($x);} elseif(is_string($v)){ $v=str_replace(array_keys($map),array_values($map),$v,$c); $b+=$c; } }; $walk($d); if($b){ update_post_meta($id,'_elementor_data',wp_slash(wp_json_encode($d))); delete_post_meta($id,'_elementor_element_cache'); } }
 $res['page'][$p->post_name]=[$a,$b]; }
// org description + script version
$cf=$dir.'/inc/page-config.json'; $raw=file_get_contents($cf); copy($cf,$cf.'.bak-20261120-geo');
$raw=str_replace('Medical leadership: Dallas Alvey, MD, DDS.','Medical leadership: Dallas Alvey, MD, DDS, and Javier Gonzalez, MD, double board certified in emergency medicine and obesity medicine.',$raw,$o); $res['org_desc']=$o;
$raw=str_replace('site-enhancements.js?v=154','site-enhancements.js?v=155',$raw,$v); $res['ver']=$v;
if(json_decode($raw,true)===null) return ['err'=>'json','res'=>$res]; file_put_contents($cf,$raw);
if(class_exists('\Elementor\Plugin')) \Elementor\Plugin::$instance->files_manager->clear_cache(); if(function_exists('tenweb_purge_all_caches')) tenweb_purge_all_caches(); wp_cache_flush();
return $res;
