$j=json_decode(wp_remote_retrieve_body(wp_remote_get('https://raw.githubusercontent.com/healthcareops713/identity-aesthetics-website/'.$IA_COMMIT.'/telehealth-states.json',['timeout'=>60])),true);
if(!$j) return 'no json';
$log=[];
foreach([236=>'en',286=>'es'] as $id=>$lang){
  $raw=get_post_meta($id,'_elementor_data',true); update_post_meta($id,'_ia_bak_20261119_states',$raw);
  $ed=json_decode($raw,true); $html=null;
  $find=function(&$els) use (&$find,&$html,$j,$lang,&$log,$id){ foreach($els as &$e){ if(($e['widgetType']??'')==='html'){ $h=$e['settings']['html'];
      $n0=0; $h=preg_replace('#<section class="alt"><div class="wrap">\s*<div class="sec-head"><div><span class="eyebrow">(Where We Serve|Estados en los que ofrecemos atenci\x{00f3}n)</span>.*?</section>#su','',$h,1,$n0);
      $p=strpos($h,'</section>'); $h=substr($h,0,$p+10)."\n".$j[$lang].substr($h,$p+10);
      $n1=0; if($lang==='en') $h=str_replace('Expert care, from the <em class="gold">comfort of home</em>','Telehealth in <em class="gold">16 states</em>, from the comfort of home',$h,$n1); else $h=str_replace('Atención especializada desde la <em class="gold">comodidad de su hogar</em>','Telemedicina en <em class="gold">16 estados</em>, desde la comodidad de su hogar',$h,$n1);
      $lbl=$lang==='en'?'Choose your state':'Elija su estado'; $n2=0;
      $h=preg_replace_callback('#<a ([^>]*?)href="https://www\.optimantra\.com/optimus/patient/patientaccess/servicesall[^"]*"[^>]*>.*?</a>#su',function($m) use ($lbl){ $cls=''; if(preg_match('#class="[^"]*"#',$m[1],$c)) $cls=$c[0].' '; return '<a '.$cls.'href="#states">'.$lbl.'</a>'; },$h,-1,$n2);
      $e['settings']['html']=$h; $html=$h; $log[$id]=['removed_old'=>$n0,'h1'=>$n1,'links'=>$n2,'len'=>strlen($h)]; return true; }
    if(!empty($e['elements']) && $find($e['elements'])) return true; } return false; };
  $find($ed);
  update_post_meta($id,'_elementor_data',wp_slash(wp_json_encode($ed)));
  wp_update_post(['ID'=>$id,'post_content'=>wp_slash($html)]);
}
\Elementor\Plugin::$instance->files_manager->clear_cache(); if(function_exists('tenweb_purge_all_caches')) tenweb_purge_all_caches(); wp_cache_flush(); if(function_exists('opcache_reset')) opcache_reset();
return $log;
