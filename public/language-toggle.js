(function(){
  "use strict";
  var STORAGE_KEY="identity-language";
  var current=localStorage.getItem(STORAGE_KEY)==="es"?"es":"en";

  function setCookie(value){
    var maxAge=60*60*24*365;
    document.cookie="googtrans="+value+";path=/;max-age="+maxAge+";SameSite=Lax";
    if(location.hostname.indexOf(".")>-1){document.cookie="googtrans="+value+";path=/;domain=."+location.hostname+";max-age="+maxAge+";SameSite=Lax";}
  }

  function clearCookie(){
    document.cookie="googtrans=;path=/;max-age=0;SameSite=Lax";
    if(location.hostname.indexOf(".")>-1){document.cookie="googtrans=;path=/;domain=."+location.hostname+";max-age=0;SameSite=Lax";}
  }

  function chooseLanguage(language){
    localStorage.setItem(STORAGE_KEY,language);
    if(language==="es"){setCookie("/en/es");}else{clearCookie();}
    location.reload();
  }

  function buildControl(){
    var topbar=document.querySelector(".topbar .wrap");
    if(!topbar||document.querySelector(".language-switcher"))return;
    var switcher=document.createElement("div");
    switcher.className="language-switcher";
    switcher.setAttribute("role","group");
    switcher.setAttribute("aria-label","Language / Idioma");
    switcher.innerHTML='<button type="button" data-language="en" aria-label="Read in English">EN</button><button type="button" data-language="es" aria-label="Leer en español">ES</button>';
    switcher.querySelectorAll("button").forEach(function(button){
      var language=button.getAttribute("data-language");
      button.classList.toggle("active",language===current);
      button.setAttribute("aria-pressed",language===current?"true":"false");
      button.addEventListener("click",function(){if(language!==current)chooseLanguage(language);});
    });
    topbar.appendChild(switcher);

    var notice=document.createElement("div");
    notice.className="translation-notice"+(current==="es"?" show":"");
    notice.lang="es";
    notice.textContent="Traducción automática para su comodidad. Para decisiones médicas, confirme los detalles con nuestro equipo bilingüe.";
    document.querySelector(".topbar").insertAdjacentElement("afterend",notice);
    var target=document.createElement("div");
    target.id="google_translate_element";
    document.body.appendChild(target);
  }

  window.identityGoogleTranslateInit=function(){
    if(!window.google||!google.translate)return;
    new google.translate.TranslateElement({pageLanguage:"en",includedLanguages:"en,es",autoDisplay:false},"google_translate_element");
  };

  function loadTranslator(){
    if(document.querySelector('script[data-identity-translate]'))return;
    var script=document.createElement("script");
    script.src="https://translate.google.com/translate_a/element.js?cb=identityGoogleTranslateInit";
    script.async=true;
    script.setAttribute("data-identity-translate","");
    document.head.appendChild(script);
  }

  if(current==="es")setCookie("/en/es");
  if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",function(){buildControl();loadTranslator();});}
  else{buildControl();loadTranslator();}
})();
