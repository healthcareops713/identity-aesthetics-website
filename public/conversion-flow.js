(function(){
  "use strict";
  var BOOKING_URL="https://www.fresha.com/providers/identity-aesthetic-center-llc-a7mjsu33";
  var params=new URLSearchParams(location.search);

  function setValue(id,value){var el=document.getElementById(id);if(el&&value){var option=Array.from(el.options||[]).find(function(o){return o.value.toLowerCase()===value.toLowerCase()||o.text.toLowerCase()===value.toLowerCase();});if(option)el.value=option.value;}}

  var form=document.getElementById("consultation-form");
  if(form){
    var challengeToken="";
    var humanAnswer=document.getElementById("human-answer");
    var humanQuestion=document.getElementById("human-question");
    var humanStatus=document.getElementById("human-status");
    var refreshChallenge=document.getElementById("refresh-challenge");
    var submitButton=document.getElementById("consultation-submit");
    var startedAt=document.getElementById("human-started-at");
    if(startedAt)startedAt.value=String(Date.now());

    function setHumanStatus(message,state){
      if(!humanStatus)return;
      humanStatus.textContent=message;
      humanStatus.dataset.state=state||"";
    }

    async function loadChallenge(){
      challengeToken="";
      if(humanAnswer){humanAnswer.value="";humanAnswer.disabled=true;}
      if(refreshChallenge)refreshChallenge.disabled=true;
      if(humanQuestion)humanQuestion.textContent="Loading verification…";
      setHumanStatus("Preparing a secure human check…","loading");
      try{
        var response=await fetch("/api/human-verification/challenge",{headers:{"accept":"application/json"},cache:"no-store"});
        var result=await response.json();
        if(!response.ok||!result.ok)throw new Error(result.message||"Verification unavailable.");
        challengeToken=result.token;
        if(humanQuestion)humanQuestion.textContent=result.question;
        if(humanAnswer){humanAnswer.disabled=false;humanAnswer.focus();}
        if(refreshChallenge)refreshChallenge.disabled=false;
        if(startedAt)startedAt.value=String(Date.now());
        setHumanStatus("Answer the question to confirm you are a person.","");
      }catch(error){
        if(humanQuestion)humanQuestion.textContent="Verification unavailable";
        setHumanStatus((error&&error.message)||"Please call or text us to continue.","error");
      }
    }

    if(refreshChallenge)refreshChallenge.addEventListener("click",loadChallenge);
    loadChallenge();
    setValue("interest",params.get("service")||params.get("interest"));
    setValue("location",params.get("location"));
    setValue("provider",params.get("provider"));
    var mode=params.get("mode");
    if(mode){Array.from(form.querySelectorAll('input[name="care_mode"]')).forEach(function(radio){if(radio.value.toLowerCase()===mode.toLowerCase())radio.checked=true;});}
    var source=document.getElementById("source-page");if(source)source.value=params.get("source")||document.referrer||"Direct visit";

    form.querySelectorAll('input[name="care_mode"]').forEach(function(radio){radio.addEventListener("change",function(){var locationField=document.getElementById("location");if(!locationField)return;if(radio.value==="Telehealth")locationField.value="Telehealth";else if(locationField.value==="Telehealth")locationField.value="";});});

    form.addEventListener("submit",async function(event){
      event.preventDefault();
      if(!form.reportValidity())return;
      if(!challengeToken||!humanAnswer||!startedAt){setHumanStatus("Please complete the human verification.","error");return;}
      var marketingConsent=form.querySelector('input[name="marketing_consent"]');
      var consentTimestamp=document.getElementById("sms-consent-timestamp");
      var consentSource=document.getElementById("sms-consent-source-url");
      if(consentTimestamp)consentTimestamp.value=marketingConsent&&marketingConsent.checked?new Date().toISOString():"";
      if(consentSource)consentSource.value=marketingConsent&&marketingConsent.checked?location.href:"";
      var data=Object.fromEntries(new FormData(form).entries());
      data.marketing_consent=Boolean(marketingConsent&&marketingConsent.checked);
      data.token=challengeToken;
      data.answer=humanAnswer.value;
      data.startedAt=Number(startedAt.value);
      setHumanStatus("Sending your request securely…","loading");
      if(submitButton){submitButton.disabled=true;submitButton.textContent="Sending Securely…";}
      try{
        var response=await fetch("/api/consultation",{method:"POST",headers:{"content-type":"application/json","accept":"application/json"},body:JSON.stringify(data)});
        var result=await response.json().catch(function(){return {};});
        if(!response.ok||!result.ok){var submissionError=new Error(result.message||"Your request could not be sent.");submissionError.keepReference=result.submissionId||"";throw submissionError;}
        var summary=document.getElementById("request-summary");
        document.getElementById("summary-service").textContent=data.interest;
        document.getElementById("summary-care").textContent=data.care_mode;
        document.getElementById("summary-location").textContent=data.location;
        document.getElementById("summary-contact").textContent=data.contact_preference;
        document.getElementById("submission-reference").textContent=result.submissionId;
        summary.classList.add("show");
        summary.setAttribute("tabindex","-1");summary.focus();
        setHumanStatus("Verified and sent. Your confirmation number is "+result.submissionId+".","success");
        window.dispatchEvent(new CustomEvent("identity:consultation-sent",{detail:{submissionId:result.submissionId}}));
        challengeToken="";
        humanAnswer.disabled=true;
        if(refreshChallenge)refreshChallenge.disabled=true;
        form.querySelectorAll("input, select, textarea, button").forEach(function(control){control.disabled=true;});
        if(submitButton)submitButton.textContent="Request Sent";
      }catch(error){
        var errorMessage=(error&&error.message)||"Your request could not be sent. Please call or text us.";
        if(error&&error.keepReference)errorMessage+=" Reference: "+error.keepReference;
        await loadChallenge();
        setHumanStatus(errorMessage,"error");
        if(submitButton){submitButton.disabled=false;submitButton.textContent="Send My Consultation Request";}
      }
    });
  }

  var finder=document.getElementById("treatment-finder");
  if(finder){
    var data={
      "lines":[["Neurotoxin","Botox, Dysport, Xeomin or Jeuveau","injectables","Soften expression lines while preserving natural movement."],["Planning","Complete Facial Balancing","treatment-complete-facial-balancing","Evaluate facial relationships before selecting a product."],["Skin quality","Laser Rejuvenation","treatment-laser-rejuvenation","Address etched texture, pigment and overall skin quality."]],
      "volume":[["Contour","Dermal Fillers","injectables","Restore or refine volume with an anatomy-led plan."],["Biostimulation","Radiesse or Sculptra","treatment-radiesse","Discuss structural support and collagen-focused options."],["Advanced planning","Complete Facial Balancing","treatment-complete-facial-balancing","Build a comprehensive plan across multiple facial areas."]],
      "pigment":[["Broadband light","Sciton BBL","treatment-sciton-profile-bbl","Explore filter-selected care for sun damage, redness and uneven color."],["Thulium laser","LaseMD","treatment-lasemd","Discuss pigment, texture and customized ampoule pathways."],["Skin renewal","Glo2Facial","treatment-glo2facial","Consider a gentler exfoliation, oxygenation and infusion ritual."]],
      "texture":[["Collagen induction","Microneedling","microneedling","Support texture refinement through controlled renewal."],["Resurfacing","Laser Rejuvenation","treatment-laser-rejuvenation","Compare LaseMD and Sciton options for scars, texture and stretch marks."],["Surface renewal","Dermaplaning","dermaplaning","Create a smoother surface by removing dead skin and fine vellus hair."]],
      "wellness":[["Medical weight management","GLP-1 Consultation","treatment-glp1-weight-loss-consultation","Review candidacy, medication options, labs and supervision."],["Hormone health","Hormone Optimization","treatment-hormone-optimization-women","Evaluate symptoms in context for women or men."],["Physician-guided","Peptide Therapy","treatment-physician-supervised-peptide-therapy","Begin with an evidence-aware medical consultation."]],
      "body":[["Body goals","Body Contouring","treatment-body-contouring","Discuss non-surgical options selected for your goals."],["Hair reduction","Laser Hair Removal","treatment-laser-hair-removal","Plan a series around treatment area and skin/hair characteristics."],["Intimate wellness","Vaginal Rejuvenation with HIFU","treatment-vaginal-rejuvenation-hifu","Request a private consultation for candidacy and alternatives."]]
    };
    var result=document.getElementById("finder-results"),grid=document.getElementById("finder-result-grid"),title=document.getElementById("finder-result-title"),book=document.getElementById("finder-book");
    finder.querySelectorAll(".finder-choice").forEach(function(button){button.addEventListener("click",function(){
      finder.querySelectorAll(".finder-choice").forEach(function(b){b.classList.remove("active");b.setAttribute("aria-pressed","false");});button.classList.add("active");button.setAttribute("aria-pressed","true");
      var key=button.dataset.concern,items=data[key]||[];title.textContent=button.querySelector("strong").textContent;grid.innerHTML=items.map(function(item){return '<article class="result-card"><small>'+item[0]+'</small><h3>'+item[1]+'</h3><p>'+item[3]+'</p><a href="'+item[2]+'">Read the treatment guide →</a></article>';}).join("");
      book.href="book-consultation?service="+encodeURIComponent(button.dataset.service||title.textContent)+"&source=find-treatment";result.classList.add("show");result.scrollIntoView({behavior:"smooth",block:"nearest"});
    });});
  }

  document.querySelectorAll('a[href="book-consultation"]').forEach(function(link){if(!link.search){link.href="book-consultation?source="+encodeURIComponent(document.title);}});
  window.IDENTITY_BOOKING_URL=BOOKING_URL;
})();
