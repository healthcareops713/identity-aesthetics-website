$B='https://raw.githubusercontent.com/healthcareops713/identity-aesthetics-website/'.$IA_COMMIT.'/';
$log=[];
$d=get_template_directory(); $cf="$d/inc/page-config.json"; copy($cf,$cf.'.bak-20261120-tapdabom');
$c=json_decode(file_get_contents($cf),true);
// 1. online pages: config title/description/jsonld from payload
$b=wp_remote_retrieve_body(wp_remote_get($B.'payload.json',['timeout'=>60])); if(md5($b)!==$IA_MD5) return ['payload md5',strlen($b)];
$p=json_decode($b,true); $log['cfg_pages']=0;
foreach($p['pages'] as $pg){ $k=$pg['lang'].':'.$pg['slug']; if(!isset($c[$k])) continue; $c[$k]['title']=$pg['title']; $c[$k]['description']=$pg['description']; foreach(['og','twitter'] as $t){ if(is_array($c[$k][$t]??null)){$c[$k][$t]['title']=$pg['title']; $c[$k][$t]['description']=$pg['description'];}} $c[$k]['jsonld']=array_merge($pg['head_extra'],$pg['jsonld']); $log['cfg_pages']++; }
// 2. badge image
$img=wp_remote_retrieve_body(wp_remote_get($B.'dabom-diplomate.webp',['timeout'=>60])); $up=wp_upload_dir(); $dir=$up['basedir'].'/ia-media/images/team'; wp_mkdir_p($dir); $log['badge']=file_put_contents($dir.'/dabom-diplomate.webp',$img);
// 3. text replacements
$BADGE='<figure class="profile-badge" style="margin:18px 0 6px"><img src="/wp-content/uploads/ia-media/images/team/dabom-diplomate.webp" alt="Diplomate, American Board of Obesity Medicine (DABOM) badge" width="600" height="414" loading="lazy" style="width:260px;max-width:100%;height:auto"></figure>';
$prof=[
 ['is an emergency medicine physician and serves as Medical Officer for Identity Aesthetics in 15 states and territories,','is double board certified in emergency medicine and obesity medicine and serves as Medical Officer for Identity Aesthetics in 15 states,'],
 ['<p class="profile-title">Medical Officer – Multistate</p>','<p class="profile-title">Medical Officer – Multistate</p><p class="profile-creds" style="font-weight:600;color:var(--gold,#b08d57);margin-top:-6px">Double Board Certified · Emergency Medicine · Obesity Medicine (ABOM)</p>'],
];
$h0=get_post_field('post_content',232);
if(preg_match('#<p>Dr\. Gonzalez is pursuing specialty board certification in obesity medicine.*?</p>#su',$h0,$m)) $prof[]=[$m[0],'<p>Dr. Gonzalez is a Diplomate of the American Board of Obesity Medicine (ABOM), which makes him double board certified: in emergency medicine and in obesity medicine. ABOM certification requires dedicated training in obesity medicine and passing the ABOM certification examination. He treats obesity as a chronic medical condition rather than a failure of willpower, one that deserves the same diagnostic rigour as any other chronic disease.</p>'.$BADGE];
if(preg_match('#<li><strong>Obesity Medicine</strong>Pursuing board certification.*?</li>#su',$h0,$m)) $prof[]=[$m[0],'<li><strong>Board Certified, Obesity Medicine</strong>Diplomate, American Board of Obesity Medicine (ABOM)</li>'];
$prof[]=['<li><strong>Emergency Medicine Physician</strong>HCA Florida Kendall Hospital, Miami</li>','<li><strong>Board Certified, Emergency Medicine</strong>Specialty board certification in emergency medicine</li><li><strong>Emergency Medicine Physician</strong>HCA Florida Kendall Hospital, Miami</li>'];
$prof[]=['<li>Obesity as a chronic medical condition</li>','<li>Obesity medicine (ABOM Diplomate)</li><li>Obesity as a chronic medical condition</li>'];
$prof[]=['No board certification is claimed on this page.','His obesity medicine certification can be verified in the American Board of Obesity Medicine diplomate directory at abom.org.'];
$gen=[
 ['Javier Gonzalez, MD, Medical Officer across fifteen further states and territories','Javier Gonzalez, MD, double board certified in emergency medicine and obesity medicine and Medical Officer across fifteen further states'],
 ['Javier Gonzalez, MD, responsable médico en otros quince estados y territorios','Javier Gonzalez, MD, con doble certificación en medicina de urgencias y medicina de la obesidad, responsable médico en otros quince estados'],
 ['Physician · Emergency Medicine','Physician · Double Board Certified · Emergency &amp; Obesity Medicine'],
 ['Physician &middot; Emergency Medicine','Physician &middot; Double Board Certified &middot; Emergency &amp; Obesity Medicine'],
 ['Médico · Medicina de urgencias','Médico · Doble certificación · Medicina de urgencias y de la obesidad'],
 ['Médico &middot; Medicina de urgencias','Médico &middot; Doble certificación &middot; Medicina de urgencias y de la obesidad'],
 ['states and territories','states'],['estados y territorios','estados'],
];
$cnt=[];
$rep=function($v,$pairs,$tag) use (&$rep,&$cnt){ if(is_string($v)){ foreach($pairs as $i=>$pp){ $n=substr_count($v,$pp[0]); if($n){$cnt[$tag.$i]=($cnt[$tag.$i]??0)+$n; $v=str_replace($pp[0],$pp[1],$v);} } return $v;} if(is_array($v)){ foreach($v as $k=>$x) $v[$k]=$rep($x,$pairs,$tag); } return $v; };
foreach([232=>array_merge($prof,$gen),228=>$gen,285=>$gen,173=>$gen,272=>$gen] as $id=>$pairs){
  $raw=get_post_meta($id,'_elementor_data',true); update_post_meta($id,'_ia_bak_20261120_dabom',$raw);
  $ed=json_decode($raw,true); if($ed){ $ed=$rep($ed,$pairs,"e$id:"); update_post_meta($id,'_elementor_data',wp_slash(wp_json_encode($ed))); }
  wp_update_post(['ID'=>$id,'post_content'=>wp_slash($rep(get_post_field('post_content',$id),$pairs,"p$id:"))]);
}
// 4. pharmacy sourcing page
$ph=wp_remote_retrieve_body(wp_remote_get($B.'pharmacy-sourcing.html',['timeout'=>60]));
if(strlen($ph)>1000){ $setHtml=function(&$els,$h) use (&$setHtml){ foreach($els as &$e){ if(($e['widgetType']??'')==='html'){$e['settings']['html']=$h; return true;} if(!empty($e['elements']) && $setHtml($e['elements'],$h)) return true;} return false; };
 $ed=json_decode(get_post_meta(223,'_elementor_data',true),true); if($ed && $setHtml($ed,$ph)) update_post_meta(223,'_elementor_data',wp_slash(wp_json_encode($ed))); wp_update_post(['ID'=>223,'post_content'=>wp_slash($ph)]); $log['pharm']=strlen($ph); }
$pd='Where Identity Aesthetics prescriptions are filled: The Apothecary Pharmacy (Stafford, TX) for Texas, Arizona, Colorado, Florida and Wyoming, and Belmar Pharma Solutions (Arizona) for our other states, with links to verify each license.';
foreach(['en:pharmacy-sourcing'] as $k){ if(isset($c[$k])){ $c[$k]['description']=$pd; foreach(['og','twitter'] as $t) if(is_array($c[$k][$t]??null)) $c[$k][$t]['description']=$pd; } }
// 5. Gonzalez config
$gc=[['Medical Officer for Identity Aesthetics across fifteen states and an emergency medicine physician','Medical Officer for Identity Aesthetics across fifteen states, double board certified in emergency medicine and obesity medicine'],
 ['"knowsAbout":["Emergency medicine",','"hasCredential":[{"@type":"EducationalOccupationalCredential","credentialCategory":"Board certification","name":"Diplomate, American Board of Obesity Medicine","recognizedBy":{"@type":"Organization","name":"American Board of Obesity Medicine","url":"https://www.abom.org"}}],"knowsAbout":["Emergency medicine","Obesity medicine",'],
 ['states and territories','states']];
foreach($c as $k=>$v){ if(strpos($k,'team')!==false || strpos($k,'about')!==false) $c[$k]=$rep($v,$gc,"c:"); }
file_put_contents($cf,wp_json_encode($c,JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT));
\Elementor\Plugin::$instance->files_manager->clear_cache(); if(function_exists('tenweb_purge_all_caches')) tenweb_purge_all_caches(); wp_cache_flush(); if(function_exists('opcache_reset')) opcache_reset();
$log['cnt']=$cnt; return $log;
