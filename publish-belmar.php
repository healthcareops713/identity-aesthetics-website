$b=wp_remote_retrieve_body(wp_remote_get('https://raw.githubusercontent.com/healthcareops713/identity-aesthetics-website/'.$IA_COMMIT.'/payload.json',['timeout'=>60]));
if(md5($b)!==$IA_MD5) return ['payload md5 mismatch',strlen($b)];
$p=json_decode($b,true); $d=get_template_directory(); $cf="$d/inc/page-config.json"; copy($cf,$cf.'.bak-20261118-belmar');
$c=json_decode(file_get_contents($cf),true); $log=['pages'=>0,'missing'=>[]];
$setHtml=function(&$els,$h) use (&$setHtml){ foreach($els as &$e){ if(($e['widgetType']??'')==='html'){$e['settings']['html']=$h; return true;} if(!empty($e['elements']) && $setHtml($e['elements'],$h)) return true;} return false; };
foreach($p['pages'] as $pg){ $q=get_posts(['post_type'=>'page','post_status'=>'any','meta_query'=>[['key'=>'_ia_slug','value'=>$pg['slug']],['key'=>'_ia_lang','value'=>$pg['lang']]],'numberposts'=>1]); if(!$q){$log['missing'][]=$pg['path']; continue;} $id=$q[0]->ID; wp_update_post(['ID'=>$id,'post_content'=>wp_slash($pg['body'])]); $ed=json_decode(get_post_meta($id,'_elementor_data',true),true); if($ed && $setHtml($ed,$pg['body'])) update_post_meta($id,'_elementor_data',wp_slash(wp_json_encode($ed))); update_post_meta($id,'_ia_title',$pg['title']); $log['pages']++;
 $k=$pg['lang'].':'.$pg['slug']; if(isset($c[$k])){ $c[$k]['title']=$pg['title']; $c[$k]['description']=$pg['description']; foreach(['og','twitter'] as $t){ if(is_array($c[$k][$t])){$c[$k][$t]['title']=$pg['title']; $c[$k][$t]['description']=$pg['description'];}} $c[$k]['jsonld']=array_merge($pg['head_extra'],$pg['jsonld']); } else $log['missing'][]='cfg '.$k; }
// Dr. Gonzalez profile: match the 16-state list
$OLD1='Dr. Gonzalez holds medical licenses in 16 US states and territories: Texas, North Carolina, South Carolina, Arizona, Tennessee, Georgia, Virginia, Colorado, Utah, Nevada, Oklahoma, Florida, Iowa, Pennsylvania, Wyoming, Puerto Rico.';
$NEW1='Dr. Gonzalez holds medical licenses in 16 states: Texas, Alabama, Arizona, Colorado, Florida, Georgia, Mississippi, Nevada, North Carolina, Ohio, Oklahoma, South Carolina, Tennessee, Utah, Virginia and Wyoming.';
$OLD2='in 15 of them &mdash; North Carolina, South Carolina, Arizona, Tennessee, Georgia, Virginia, Colorado, Utah, Nevada, Oklahoma, Florida, Iowa, Pennsylvania, Wyoming, Puerto Rico.';
$NEW2='in 15 of them &mdash; Alabama, Arizona, Colorado, Florida, Georgia, Mississippi, Nevada, North Carolina, Ohio, Oklahoma, South Carolina, Tennessee, Utah, Virginia and Wyoming.';
$OLD3='The 16-jurisdiction licensure list was confirmed by Identity Aesthetics against each state or territory medical board record on October 10, 2026.';
$NEW3='The 16-state licensure list was updated by Identity Aesthetics on November 18, 2026. Each license can be verified with the issuing state medical board.';
$OLD4='across fifteen states and territories'; $NEW4='across fifteen states';
$pairs=[[$OLD1,$NEW1],[$OLD2,$NEW2],[$OLD3,$NEW3],[$OLD4,$NEW4],['Puerto Rico','']];
$g=[]; $ed=get_post_meta(232,'_elementor_data',true); update_post_meta(232,'_ia_bak_20261118',$ed);
$edd=json_decode($ed,true); $rep=function($v) use (&$rep,$pairs,&$g){ if(is_string($v)){ foreach(array_slice($pairs,0,4) as $i=>$pp){ $n=substr_count($v,$pp[0]); if($n){$g[$i]=($g[$i]??0)+$n; $v=str_replace($pp[0],$pp[1],$v);} } return $v;} if(is_array($v)) foreach($v as $k=>$x) $v[$k]=$rep($x); return $v; };
$edd=$rep($edd); update_post_meta(232,'_elementor_data',wp_slash(wp_json_encode($edd))); wp_update_post(['ID'=>232,'post_content'=>wp_slash($rep(get_post(232)->post_content))]);
if(isset($c['en:team-javier-gonzalez'])) $c['en:team-javier-gonzalez']=$rep($c['en:team-javier-gonzalez']);
file_put_contents($cf,wp_json_encode($c,JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT));
$left=json_encode($c['en:team-javier-gonzalez'],JSON_UNESCAPED_UNICODE).get_post_meta(232,'_elementor_data',true);
$log['gonz']=$g; $log['gonz_left']=preg_match_all('/Iowa|Pennsylvania|Puerto Rico|territor/',$left);
$all=file_get_contents($cf); $log['anazeo_left_cfg']=preg_match_all('/Anaze?o|Anazao/i',$all);
$q=new WP_Query(['post_type'=>'page','s'=>'Anaze','posts_per_page'=>20]); $log['anazeo_pages']=wp_list_pluck($q->posts,'ID');
\Elementor\Plugin::$instance->files_manager->clear_cache(); if(function_exists('tenweb_purge_all_caches')) tenweb_purge_all_caches(); wp_cache_flush(); if(function_exists('opcache_reset')) opcache_reset();
return $log;
