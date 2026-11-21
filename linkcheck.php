@set_time_limit(300);
use WpOrg\Requests\Requests;
$O='https://713botoxme.com'; $ua='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
$sm=wp_remote_retrieve_body(wp_remote_get($O.'/sitemap.xml',['timeout'=>20])); preg_match_all('#<loc>([^<]+)</loc>#',$sm,$m); $pages=$m[1];
$ext=[]; $t0=microtime(true);
foreach(array_chunk($pages,15) as $chunk){ $reqs=[]; foreach($chunk as $u) $reqs[$u]=['url'=>$u,'type'=>'GET','headers'=>['User-Agent'=>$ua]];
 $res=Requests::request_multiple($reqs,['timeout'=>25,'connect_timeout'=>10]);
 foreach($res as $u=>$r){ if(!($r instanceof WpOrg\Requests\Response)) continue; if(!preg_match_all('/<a\s[^>]*href=["\']([^"\']+)["\']/i',$r->body,$mm)) continue; foreach($mm[1] as $h){ $h=html_entity_decode(trim($h)); if(!preg_match('#^https?://#',$h)) continue; if(strpos($h,$O)===0) continue; $h=preg_replace('/#.*$/','',$h); $ext[$h][]=str_replace($O,'',$u); } } }
$crawl=round(microtime(true)-$t0,1);
$out=[]; $urls=array_keys($ext);
foreach(array_chunk($urls,20) as $chunk){ $reqs=[]; foreach($chunk as $u) $reqs[$u]=['url'=>$u,'type'=>'GET','headers'=>['User-Agent'=>$ua,'Accept'=>'text/html,application/pdf,*/*']];
 $res=Requests::request_multiple($reqs,['timeout'=>20,'connect_timeout'=>10,'follow_redirects'=>true,'redirects'=>8,'verify'=>true]);
 foreach($res as $u=>$r){ if($r instanceof WpOrg\Requests\Response){ $code=$r->status_code; $final=$r->url; } else { $code='ERR '.substr($r->getMessage(),0,80); $final=''; }
  $out[$u]=['code'=>$code,'final'=>$final,'from'=>array_values(array_slice(array_unique($ext[$u]),0,4)),'n'=>count(array_unique($ext[$u]))]; } }
$bad=array_filter($out,function($x){ return !is_int($x['code']) || $x['code']>=400; });
$redir=array_filter($out,function($x,$u){ return is_int($x['code']) && $x['code']<400 && $x['final'] && rtrim($x['final'],'/')!==rtrim($u,'/'); },ARRAY_FILTER_USE_BOTH);
update_option('ia_audit_links_20261120',$out,false);
return ['pages'=>count($pages),'ext'=>count($urls),'crawl_s'=>$crawl,'total_s'=>round(microtime(true)-$t0,1),'bad'=>$bad,'redirected'=>array_map(function($x){return $x['final'];},$redir)];
