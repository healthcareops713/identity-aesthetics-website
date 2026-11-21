$T='(832) 979-9105'; $SMS='<a href="sms:8329799105">(832) 979-9105</a>';
$num='(<a href="tel:713-268-6963">[^<]*<\/a>|713-BOTOX-ME \(713-268-6963\)|713-268-6963|713-BOTOX-ME)';
$fix=function($s) use($T,$SMS,$num){ $n=0;
 $s=preg_replace_callback('/([Cc])all or text '.$num.'/u',function($m) use($T,$SMS){ return $m[1].'all '.$m[2].' or text '.(strpos($m[2],'<a')===0?$SMS:$T); },$s,-1,$c); $n+=$c;
 $s=preg_replace_callback('/(Llame|llame) o envíe un mensaje de texto al '.$num.'/u',function($m) use($T,$SMS){ return $m[1].' al '.$m[2].' o envíe un mensaje de texto al '.(strpos($m[2],'<a')===0?$SMS:$T); },$s,-1,$c); $n+=$c;
 $s=preg_replace_callback('/llamar o enviar un mensaje de texto al '.$num.'/u',function($m) use($T,$SMS){ return 'llamar al '.$m[1].', enviar un mensaje de texto al '.(strpos($m[1],'<a')===0?$SMS:$T); },$s,-1,$c); $n+=$c;
 $s=preg_replace_callback('/Llámenos o envíenos un mensaje de texto al '.$num.'/u',function($m) use($T){ return 'Llámenos al '.$m[1].' o envíenos un mensaje de texto al '.$T; },$s,-1,$c); $n+=$c;
 $s=str_replace('call and text us at 713-BOTOX-ME','call us at 713-BOTOX-ME or text '.$T,$s,$c); $n+=$c;
 $s=str_replace('href="sms:7132686963">Text 713-BOTOX-ME','href="sms:8329799105">Text '.$T,$s,$c); $n+=$c;
 $s=str_replace('href="sms:7132686963">Envíe un mensaje de texto al 713-BOTOX-ME','href="sms:8329799105">Envíe un mensaje de texto al '.$T,$s,$c); $n+=$c;
 $s=str_replace('<div class="n">Call or Text</div><p class="d">One number reaches all five locations.</p></div><a class="p" href="tel:713-268-6963">713-BOTOX-ME (713-268-6963)</a></div>','<div class="n">Call</div><p class="d">One number reaches all five locations.</p></div><a class="p" href="tel:713-268-6963">713-BOTOX-ME (713-268-6963)</a></div>'."\n        ".'<div class="row"><div><div class="n">Text</div><p class="d">Text our team for questions and scheduling.</p></div><a class="p" href="sms:8329799105">'.$T.'</a></div>',$s,$c); $n+=$c;
 $s=str_replace('<a class="btn btn-gold" href="tel:713-268-6963">Call or Text</a>','<a class="btn btn-gold" href="tel:713-268-6963">Call Us</a><a class="btn btn-line" href="sms:8329799105">Text Us</a>',$s,$c); $n+=$c;
 $s=preg_replace('/<div class="n">Llame o envíe un mensaje de texto<\/div>(<p class="d">[^<]*<\/p><\/div><a class="p" href="tel:713-268-6963">[^<]*<\/a><\/div>)/u','<div class="n">Llámenos</div>$1'."\n        ".'<div class="row"><div><div class="n">Mensaje de texto</div><p class="d">Envíe un mensaje a nuestro equipo para preguntas y citas.</p></div><a class="p" href="sms:8329799105">'.$T.'</a></div>',$s,-1,$c); $n+=$c;
 return [$s,$n]; };
$res=[]; $posts=get_posts(['post_type'=>'any','numberposts'=>-1,'post_status'=>'publish']);
foreach($posts as $p){ if($p->post_name==='booked') continue; list($s,$n)=$fix($p->post_content); if($n){ $res['posts'][$p->post_name.'#'.$p->ID]=$n; if($APPLY){ kses_remove_filters(); wp_update_post(['ID'=>$p->ID,'post_content'=>$s]); } } }
$dir=get_stylesheet_directory(); $cf=$dir.'/inc/page-config.json'; $c=json_decode(file_get_contents($cf),true); $cn=0;
foreach($c as $k=>&$e){ foreach(['shell_before','shell_after'] as $f){ if(!empty($e[$f])){ list($s,$n)=$fix($e[$f]); $e[$f]=$s; $cn+=$n; } } } unset($e);
$res['cfg_changes']=$cn; $res['cfg_sample_en']=$fix($c['en:']['shell_before'])[0]; 
$res['topbar_en']= (preg_match('/<span>Call.{0,260}<\/span><\/div><\/div>/u',$c['en:']['shell_before'],$m)?$m[0]:''); $res['topbar_es']=(preg_match('/<span>Llame.{0,300}?<\/span>/u',$c['es:book-consultation']['shell_before'],$m)?$m[0]:'');
// remaining leftovers
$left=[]; foreach($posts as $p){ $t=$APPLY?get_post($p->ID)->post_content:$fix($p->post_content)[0]; if(preg_match_all('/.{0,50}(or text|o envíe|sms:7132686963|Call or Text).{0,50}/u',$t,$m)) foreach($m[0] as $x) if(strpos($x,'832')===false) $left[]=$p->post_name.': '.$x; } $res['left']=$left;
if($APPLY){ $raw=json_encode($c,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE); copy($cf,$cf.'.bak-20261120-text'); $raw=str_replace('site-enhancements.js?v=153','site-enhancements.js?v=154',$raw); file_put_contents($cf,$raw);
 $sf=$dir.'/assets/js/site-enhancements.js'; $s=file_get_contents($sf); copy($sf,$sf.'.bak-20261120-text');
 $old='bar.innerHTML = \'<a href="tel:713-268-6963" aria-label="Call or text Identity Aesthetics">Call / Text</a><a class="tele" href="/telehealth/">Telehealth</a><a href="/book-consultation/">Book Now</a>\';';
 $new='var esBar=/^\/es(\/|$)/.test(location.pathname); bar.style.gridTemplateColumns="1fr 1fr 1.15fr 1fr"; bar.innerHTML = \'<a href="tel:713-268-6963" aria-label="Call Identity Aesthetics">\'+(esBar?"Llamar":"Call")+\'</a><a href="sms:8329799105" aria-label="Text Identity Aesthetics">\'+(esBar?"Texto":"Text")+\'</a><a class="tele" href="/telehealth/">\'+(esBar?"Telemedicina":"Telehealth")+\'</a><a href="/book-consultation/">\'+(esBar?"Reservar":"Book Now")+\'</a>\';';
 $res['bar']=substr_count($s,$old); $s=str_replace($old,$new,$s);
 $a=strpos($s,'/* IA-BOOKING-START */'); $z=strpos($s,'/* IA-BOOKING-END */'); $s=substr($s,0,$a+strlen('/* IA-BOOKING-START */'))."\n".$JS."\n".substr($s,$z); file_put_contents($sf,$s);
 $bp=get_page_by_path('booked'); kses_remove_filters(); wp_update_post(['ID'=>$bp->ID,'post_content'=>$HTML]);
 if(function_exists('tenweb_purge_all_caches')) tenweb_purge_all_caches(); wp_cache_flush(); }
return $res;
