$EN_ALL="Texas, Alabama, Arizona, Colorado, Florida, Georgia, Mississippi, Nevada, North Carolina, Ohio, Oklahoma, South Carolina, Tennessee, Utah, Virginia and Wyoming";
$EN_OR=str_replace(' and Wyoming',' or Wyoming',$EN_ALL);
$ES_ALL="Texas, Alabama, Arizona, Colorado, Florida, Georgia, Mississippi, Nevada, Carolina del Norte, Ohio, Oklahoma, Carolina del Sur, Tennessee, Utah, Virginia y Wyoming";
$ES_OR=str_replace(' y Wyoming',' o Wyoming',$ES_ALL);
$X_EN="Alabama, Arizona, Colorado, Florida, Georgia, Mississippi, Nevada, Ohio, Oklahoma, Tennessee, Utah, Virginia and Wyoming";
$X_ES="Alabama, Arizona, Colorado, Florida, Georgia, Mississippi, Nevada, Ohio, Oklahoma, Tennessee, Utah, Virginia y Wyoming";
$st=[]; foreach(['Texas','Alabama','Arizona','Colorado','Florida','Georgia','Mississippi','Nevada','North Carolina','Ohio','Oklahoma','South Carolina','Tennessee','Utah','Virginia','Wyoming'] as $n) $st[]='{"@type":"State","name":"'.$n.'"}';
$CFG=[
 ['Telehealth · TX · NC · SC','Telehealth · 16 States'],
 ['Telemedicina · TX · NC · SC','Telemedicina · 16 estados'],
 ['Telehealth in TX, NC &amp; SC — Care From Home','Telehealth in 16 States — Care From Home'],
 ['Telemedicina en TX, NC y SC: atención desde casa','Telemedicina en 16 estados: atención desde casa'],
 ['Telehealth in TX, NC &amp; SC','Telehealth in 16 States'],
 ['Telehealth: Texas, North Carolina &amp; South Carolina','Telehealth: '.$EN_ALL],
 ['Telemedicina: Texas, Carolina del Norte y Carolina del Sur','Telemedicina: '.$ES_ALL],
 ['Telehealth: TX, NC &amp; SC','Telehealth: 16 states'],
 ['You must be physically located in Texas, North Carolina or South Carolina at the time of the visit.','You must be physically located in a state where we offer telehealth ('.$EN_OR.') at the time of the visit. Outside Texas, North Carolina and South Carolina, telehealth covers medical weight loss and compounded peptides only.'],
 ['Debe encontrarse físicamente en Texas, Carolina del Norte o Carolina del Sur en el momento de la consulta.','Debe encontrarse físicamente en un estado donde ofrecemos telemedicina ('.$ES_OR.') en el momento de la consulta. Fuera de Texas, Carolina del Norte y Carolina del Sur, la telemedicina cubre solo la pérdida de peso médica y los péptidos compuestos.'],
 ['Telehealth services require the patient to be physically located in Texas, North Carolina or South Carolina and remain','Telehealth services require the patient to be physically located in a state we serve ('.$EN_OR.'; outside Texas, North Carolina and South Carolina, medical weight loss and compounded peptides only) and remain'],
 ['requieren que el paciente se encuentre físicamente en Texas, Carolina del Norte o Carolina del Sur, y están','requieren que el paciente se encuentre físicamente en un estado donde atendemos ('.$ES_OR.'; fuera de Texas, Carolina del Norte y Carolina del Sur, solo pérdida de peso médica y péptidos compuestos), y están'],
 ['{"@type":"State","name":"Texas"},{"@type":"State","name":"North Carolina"},{"@type":"State","name":"South Carolina"}',implode(',',$st)],
 ['connect by telehealth in Texas, North Carolina and South Carolina.','connect by telehealth in Texas and 15 more states.'],
 ['telehealth in TX, NC &amp; SC.','telehealth in 16 states.'],
 ['may be handled by telehealth for patients in Texas, North Carolina and South Carolina.','may be handled by telehealth for patients in Texas, North Carolina and South Carolina; medical weight loss and compounded peptides also in '.$X_EN.'.'],
 ['por telemedicina a pacientes que se encuentren en Texas, Carolina del Norte y Carolina del Sur.','por telemedicina a pacientes que se encuentren en Texas, Carolina del Norte y Carolina del Sur; la pérdida de peso médica y los péptidos compuestos también en '.$X_ES.'.'],
 ['Telehealth in Texas, North Carolina &amp; South Carolina | Identity Aesthetics','Telehealth in Texas &amp; 15 More States | Identity Aesthetics'],
 ['Telehealth in Texas, North Carolina & South Carolina | Identity Aesthetics','Telehealth in Texas & 15 More States | Identity Aesthetics'],
 ['Telemedicina en Texas, Carolina del Norte y Carolina del Sur | Identity Aesthetics','Telemedicina en Texas y 15 estados más | Identity Aesthetics'],
 ['Telehealth for eligible weight loss, peptide and hormone care in TX, NC and SC.','Telehealth for eligible weight loss and peptide care in 16 states, and hormone care in TX, NC and SC.'],
 ['Ofrecemos telemedicina para servicios elegibles de control del peso, terapia con péptidos y atención hormonal en TX, NC y SC.','Ofrecemos telemedicina para control del peso y terapia con péptidos en 16 estados, y atención hormonal en TX, NC y SC.'],
];
$TELE=[
 ['>TX · NC · SC<','>16 States<'],
 ['Eligible weight-loss, peptide, hormone and wellness consultations are available to patients located in Texas, North Carolina and South Carolina.','Eligible weight-loss, peptide, hormone and wellness consultations are available to patients located in Texas, North Carolina and South Carolina. Medical weight loss and compounded peptides are also available in '.$X_EN.'.'],
 ['physically located in Texas, North Carolina or South Carolina.</p>','physically located in a state we serve.</p>'],
 ['<b>Available in three states</b> — Texas, North Carolina and South Carolina','<b>Available in 16 states</b> — all telehealth services in Texas, North Carolina and South Carolina; medical weight loss and peptides in 13 more'],
 ['At-home access across <span class="gold">three states</span>','At-home access across <span class="gold">16 states</span>'],
 ['<p>Access eligible virtual consultations with individualized guidance and appropriate follow-up.</p></div>','<p>Access eligible virtual consultations with individualized guidance and appropriate follow-up.</p></div>'."\n    ".'<div class="card"><div class="ic">+13</div><h3>13 more states</h3><p>Medical weight loss and compounded peptides by video visit in '.$X_EN.'.</p></div>'],
];
$TELE_ES=[
 ['>TX · NC · SC<','>16 estados<'],
 ['a consultas sobre control del peso, terapia con péptidos, salud hormonal y bienestar.','a consultas sobre control del peso, terapia con péptidos, salud hormonal y bienestar. La pérdida de peso médica y los péptidos compuestos también están disponibles en '.$X_ES.'.'],
 ['siempre que se encuentre físicamente en Texas, Carolina del Norte o Carolina del Sur.','siempre que se encuentre físicamente en un estado donde atendemos.'],
 ['<b>Disponible en tres estados</b> — Texas, Carolina del Norte y Carolina del Sur','<b>Disponible en 16 estados</b> — todos los servicios de telemedicina en Texas, Carolina del Norte y Carolina del Sur; pérdida de peso médica y péptidos en 13 estados más'],
 ['desde casa en <span class="gold">tres estados</span>','desde casa en <span class="gold">16 estados</span>'],
 ['<h3>North Carolina</h3>','<h3>Carolina del Norte</h3>'],['<h3>South Carolina</h3>','<h3>Carolina del Sur</h3>'],
 ['con orientación personalizada y seguimiento adecuado.</p></div>','con orientación personalizada y seguimiento adecuado.</p></div>'."\n    ".'<div class="card"><div class="ic">+13</div><h3>13 estados más</h3><p>Pérdida de peso médica y péptidos compuestos mediante videoconsulta en '.$X_ES.'.</p></div>'],
];
function ia_rep($v,$pairs,&$n){ if(is_string($v)){ foreach($pairs as $p){ $c=substr_count($v,$p[0]); if($c){ $n[$p[0]]=($n[$p[0]]??0)+$c; $v=str_replace($p[0],$p[1],$v);} } return $v;} if(is_array($v)){ foreach($v as $k=>$x) $v[$k]=ia_rep($x,$pairs,$n); } return $v; }
$d=get_template_directory(); $cf="$d/inc/page-config.json"; copy($cf,$cf.'.bak-20261118-16states-site');
$c=json_decode(file_get_contents($cf),true); $n=[]; $c=ia_rep($c,$CFG,$n);
foreach($c as $k=>&$e){ if(!is_array($e)) continue; if(isset($e['scripts']) && is_array($e['scripts'])) $e['scripts']=str_replace('site-enhancements.js?v=143','site-enhancements.js?v=144',$e['scripts']); if(!empty($e['scripts_html'])) $e['scripts_html']=str_replace('site-enhancements.js?v=143','site-enhancements.js?v=144',$e['scripts_html']); } unset($e);
file_put_contents($cf,wp_json_encode($c,JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT));
$tn=[]; foreach([236=>$TELE,286=>$TELE_ES] as $id=>$pairs){ update_post_meta($id,'_ia_bak_20261118',get_post_meta($id,'_elementor_data',true)); $ed=json_decode(get_post_meta($id,'_elementor_data',true),true); $x=[]; $ed=ia_rep($ed,array_merge($pairs,$CFG),$x); update_post_meta($id,'_elementor_data',wp_slash(wp_json_encode($ed))); $pc=get_post($id)->post_content; $y=[]; $pc=ia_rep($pc,array_merge($pairs,$CFG),$y); wp_update_post(['ID'=>$id,'post_content'=>wp_slash($pc)]); $tn[$id]=$x; }
$jsf="$d/assets/js/site-enhancements.js"; copy($jsf,$jsf.'.bak-20261118-16states'); $js=file_get_contents($jsf); $jn=[];
$JSP=[['Online Shop · TX · NC · SC','Online Shop · 16 States'],['Online Shop \\u00b7 TX \\u00b7 NC \\u00b7 SC','Online Shop \\u00b7 16 States'],['Tienda en línea · TX · NC · SC','Tienda en línea · 16 estados'],['Tienda en l\\u00ednea \\u00b7 TX \\u00b7 NC \\u00b7 SC','Tienda en l\\u00ednea \\u00b7 16 estados'],['GLP-1 weight loss, compounded peptides and Vyleesi for adults in Texas, North Carolina and South Carolina.','GLP-1 weight loss and compounded peptides in Texas and 15 more states; Vyleesi in TX, NC and SC.'],['Telehealth · TX · NC · SC','Telehealth · 16 States'],['Telehealth \\u00b7 TX \\u00b7 NC \\u00b7 SC','Telehealth \\u00b7 16 States']];
$js=ia_rep($js,$JSP,$jn); file_put_contents($jsf,$js);
preg_match_all('/description: es \? "[^"]*"/u',$js,$dm);
\Elementor\Plugin::$instance->files_manager->clear_cache(); if(function_exists('tenweb_purge_all_caches')) tenweb_purge_all_caches(); wp_cache_flush(); if(function_exists('opcache_reset')) opcache_reset();
return ['cfg'=>$n,'tele'=>$tn,'js'=>$jn,'esdesc'=>$dm[0]];
