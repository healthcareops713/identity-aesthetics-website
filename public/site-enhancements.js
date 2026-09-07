(function () {
  "use strict";

  var KINGWOOD_URL = "https://identityaestheticskingwood.com/";

  function activateAnimatedIdentityLogos() {
    var baseSource = "images/identity-aesthetics-logo-best-slim-gold.png";
    var sparkleSource = "images/identity-aesthetics-sparkles.svg?v=98";

    document.querySelectorAll('img[src*="identity-aesthetics-logo"]').forEach(function (baseLogo) {
      if (baseLogo.closest(".ia-animated-logo")) return;

      baseLogo.src = baseSource;
      baseLogo.removeAttribute("srcset");

      var stack = document.createElement("span");
      stack.className = "ia-animated-logo";

      var sparkleLayer = document.createElement("img");
      sparkleLayer.className = "ia-logo-sparkles";
      sparkleLayer.src = sparkleSource;
      sparkleLayer.alt = "";
      sparkleLayer.setAttribute("aria-hidden", "true");
      sparkleLayer.setAttribute("decoding", "async");

      baseLogo.parentNode.insertBefore(stack, baseLogo);
      stack.appendChild(baseLogo);
      stack.appendChild(sparkleLayer);
    });
  }

  activateAnimatedIdentityLogos();

  function createKingwoodLink() {
    var link = document.createElement("a");
    link.className = "kingwood-external-link";
    link.href = KINGWOOD_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Kingwood";
    link.setAttribute("aria-label", "Kingwood location website (opens in a new tab)");
    return link;
  }

  function connectKingwoodReferences() {
    document.querySelectorAll(".topbar a.loc").forEach(function (locationLink) {
      if (locationLink.textContent.indexOf("Kingwood") === -1) return;

      var label = locationLink.textContent;
      var kingwoodIndex = label.indexOf("Kingwood");
      var afterKingwood = label.slice(kingwoodIndex + "Kingwood".length);
      var separatorIndex = afterKingwood.indexOf("|");
      var replacement = document.createElement("span");
      replacement.className = locationLink.className;
      replacement.appendChild(document.createTextNode(label.slice(0, kingwoodIndex)));
      replacement.appendChild(createKingwoodLink());

      if (separatorIndex !== -1) {
        replacement.appendChild(document.createTextNode(" " + afterKingwood.slice(0, separatorIndex + 1) + " "));
        var telehealthLink = document.createElement("a");
        telehealthLink.href = locationLink.getAttribute("href") || "telehealth.html";
        telehealthLink.textContent = afterKingwood.slice(separatorIndex + 1).trim();
        replacement.appendChild(telehealthLink);
      } else {
        replacement.appendChild(document.createTextNode(afterKingwood));
      }

      locationLink.replaceWith(replacement);
    });

    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || node.nodeValue.indexOf("Kingwood") === -1) return NodeFilter.FILTER_REJECT;
        if (node.parentElement && node.parentElement.closest("a, script, style, noscript, textarea, select, option")) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var matchingNodes = [];
    while (walker.nextNode()) matchingNodes.push(walker.currentNode);

    matchingNodes.forEach(function (node) {
      var parts = node.nodeValue.split("Kingwood");
      var fragment = document.createDocumentFragment();
      parts.forEach(function (part, index) {
        if (part) fragment.appendChild(document.createTextNode(part));
        if (index < parts.length - 1) fragment.appendChild(createKingwoodLink());
      });
      node.replaceWith(fragment);
    });

    document.querySelectorAll(".loc-card").forEach(function (card) {
      if (card.textContent.indexOf("Kingwood") === -1) return;
      card.classList.add("kingwood-franchise-card");
      card.querySelectorAll(".links a").forEach(function (link, index) {
        link.href = KINGWOOD_URL;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        if (index === 0) link.textContent = "Kingwood Website";
        if (index === 1) link.textContent = "Book in Kingwood";
        if (index === 2) link.textContent = "Kingwood Details";
      });
    });
  }

  connectKingwoodReferences();

  /* Keep the Identity Journal visible in the shared desktop and mobile menus. */
  document.querySelectorAll("nav.links").forEach(function (nav) {
    if (nav.querySelector('a[href="journal.html"]')) return;
    var resources = nav.querySelector('a[href="faq.html"]');
    var journal = document.createElement("a");
    journal.href = "journal.html";
    journal.textContent = "Journal";
    if (resources) nav.insertBefore(journal, resources); else nav.appendChild(journal);
  });
  document.querySelectorAll(".m-nav").forEach(function (nav) {
    if (nav.querySelector('a[href="journal.html"]')) return;
    var journal = document.createElement("a");
    journal.href = "journal.html";
    journal.textContent = "The Identity Journal";
    nav.insertBefore(journal, nav.firstChild);
  });

  if (!document.querySelector(".mobile-action-bar")) {
    var bar = document.createElement("nav");
    bar.className = "mobile-action-bar";
    bar.setAttribute("aria-label", "Quick appointment actions");
    bar.innerHTML = '<a href="tel:713-268-6963" aria-label="Call or text Identity Aesthetics">Call / Text</a><a class="tele" href="telehealth.html">Telehealth</a><a href="book-consultation.html">Book Now</a>';
    document.body.appendChild(bar);
  }

  var currentFile = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  var activeMap = {
    "injectables.html":"treatments.html",
    "peptides.html":"weight-loss.html",
    "telehealth.html":"weight-loss.html",
    "about.html":"team.html",
    "contact.html":"faq.html",
    "payment-plans.html":"faq.html",
    "memberships-offers.html":"faq.html",
    "treatment-guides.html":"faq.html",
    "virtual-preview.html":"faq.html",
    "sms-terms.html":"faq.html",
    "find-treatment.html":"treatments.html"
  };
  var activeHref = currentFile.indexOf("journal-") === 0 ? "journal.html" : (currentFile.indexOf("treatment-") === 0 ? "treatments.html" : (currentFile.indexOf("peptide-") === 0 ? "peptide-education.html" : (activeMap[currentFile] || currentFile)));
  document.querySelectorAll("nav.links a").forEach(function(link){
    link.classList.toggle("on", link.getAttribute("href") === activeHref);
  });

  var serviceMap = {
    "injectables.html":"Injectables & Facial Balancing",
    "treatment-botox.html":"Botox / Dysport / Xeomin / Jeuveau",
    "treatment-dysport.html":"Botox / Dysport / Xeomin / Jeuveau",
    "treatment-xeomin.html":"Botox / Dysport / Xeomin / Jeuveau",
    "treatment-jeuveau.html":"Botox / Dysport / Xeomin / Jeuveau",
    "treatment-juvederm.html":"Dermal or Lip Filler",
    "treatment-evolysse.html":"Dermal or Lip Filler",
    "treatment-radiesse.html":"Dermal or Lip Filler",
    "treatment-sculptra.html":"Dermal or Lip Filler",
    "treatment-lip-filler.html":"Dermal or Lip Filler",
    "treatment-complete-facial-balancing.html":"Injectables & Facial Balancing",
    "treatment-botched-filler-correction.html":"Injectables & Facial Balancing",
    "treatment-pdo-threads.html":"Injectables & Facial Balancing",
    "medspa.html":"Facials / Lashes / Brows / Skin",
    "lash-services.html":"Facials / Lashes / Brows / Skin",
    "brow-services.html":"Facials / Lashes / Brows / Skin",
    "waxing-services.html":"Facials / Lashes / Brows / Waxing",
    "glo2facial-treatments.html":"Facials / Lashes / Brows / Skin",
    "treatment-glo2facial.html":"Facials / Lashes / Brows / Skin",
    "microneedling.html":"Microneedling / Dermaplaning",
    "dermaplaning.html":"Microneedling / Dermaplaning",
    "treatment-lasemd.html":"Laser Rejuvenation / LaseMD / Sciton BBL",
    "treatment-laser-rejuvenation.html":"Laser Rejuvenation / LaseMD / Sciton BBL",
    "treatment-sciton-profile-bbl.html":"Laser Rejuvenation / LaseMD / Sciton BBL",
    "treatment-body-contouring.html":"Body Contouring",
    "treatment-laser-hair-removal.html":"Laser Hair Removal",
    "treatment-vaginal-rejuvenation-hifu.html":"Vaginal Rejuvenation with HIFU",
    "weight-loss.html":"GLP-1 Medical Weight Loss",
    "total-woman-weight-loss.html":"Total Woman Weight-Loss Program",
    "treatment-semaglutide.html":"GLP-1 Medical Weight Loss",
    "treatment-tirzepatide.html":"GLP-1 Medical Weight Loss",
    "treatment-glp1-weight-loss-consultation.html":"GLP-1 Medical Weight Loss",
    "peptides.html":"Peptide Therapy",
    "treatment-physician-supervised-peptide-therapy.html":"Peptide Therapy",
    "treatment-hormone-optimization-men.html":"Hormone Optimization",
    "treatment-hormone-optimization-women.html":"Hormone Optimization"
  };
  document.querySelectorAll('a[href="book-consultation.html"]').forEach(function(link){
    if(link.closest("footer") || link.closest("header") || currentFile === "book-consultation.html") return;
    var query = new URLSearchParams({source:document.title});
    if(serviceMap[currentFile]) query.set("service",serviceMap[currentFile]);
    link.href = "book-consultation.html?" + query.toString();
  });

  var path = window.location.pathname;
  var file = path.split("/").pop() || "index.html";
  var safetyPages = [
    "index.html",
    "peptides.html",
    "peptide-education.html",
    "peptide-approved.html",
    "peptide-research.html",
    "peptide-safety.html",
    "peptide-semaglutide.html",
    "peptide-tirzepatide.html",
    "peptide-retatrutide.html",
    "peptide-bpc-157.html",
    "peptide-tb-500.html",
    "peptide-cjc-1295.html",
    "peptide-ipamorelin.html",
    "peptide-sermorelin.html",
    "weight-loss.html",
    "treatment-semaglutide.html",
    "treatment-tirzepatide.html",
    "treatment-glp1-weight-loss-consultation.html",
    "treatment-physician-supervised-peptide-therapy.html"
  ];

  if (safetyPages.indexOf(file) !== -1 && !document.querySelector(".peptide-safety-float")) {
    var bulletin = document.createElement("a");
    bulletin.className = "peptide-safety-float";
    bulletin.href = "peptide-safety-bulletin.html";
    bulletin.setAttribute("aria-label", "Read the urgent peptide safety bulletin");
    bulletin.innerHTML = '<span class="peptide-safety-icon" aria-hidden="true">!</span><span><strong>Urgent Peptide Safety</strong><small>Read the evidence bulletin</small></span>';
    document.body.appendChild(bulletin);
  }

  var searchItems = [
    {title:"Sarah Walker, APRN, FNP-C",category:"Our Team",url:"team-sarah-walker.html",description:"Meet Identity Aesthetics Advanced Provider and Nutritionist Sarah Walker, BS, MSN, APRN, FNP-C.",terms:"Sarah Walker nurse practitioner nutritionist weight hormone peptide recovery performance sports nutrition"},
    {title:"The Total Woman Weight-Loss Program",category:"Wellness",url:"total-woman-weight-loss.html",description:"Physician-guided women's weight loss with baseline health evaluation, nutrition, medication monitoring, aesthetic support and women's wellness.",terms:"women female weight loss glp-1 nutrition labs physician whole woman ozempic face body skin wellness Sarah Walker"},
    {title:"Beyond the Shot: Total-Package Weight Loss for Women",category:"Education",url:"journal-total-package-weight-loss-women.html",description:"Reviewed by Sarah Walker, APRN, FNP-C: why women's medical weight loss should extend beyond a prescription.",terms:"journal Sarah Walker reviewed women weight loss glp-1 nutrition baseline labs whole woman total package"},
    {title:"Clinical Peptide Therapy",category:"Wellness",url:"clinical-peptide-therapy.html",description:"Plain-language guide to physician-crafted peptide therapy, candidacy, evidence, safety and medically managed care.",terms:"clinical peptide therapy physician crafted managed approved compounded investigational safety consultation"},
    {title:"Peptide Program for Women",category:"Wellness",url:"peptide-program-women.html",description:"Women-focused physician-managed peptide care covering symptoms, candidacy, evidence, pregnancy and contraception safeguards.",terms:"women female peptide program weight appetite energy sleep libido pregnancy contraception menopause"},
    {title:"Peptide Program for Men",category:"Wellness",url:"peptide-program-men.html",description:"Men-focused physician-managed peptide care covering weight, sleep apnea, energy, recovery and sexual-health evaluation.",terms:"men male peptide program weight sleep apnea energy recovery libido testosterone erectile dysfunction"},
    {title:"SMS Terms & Consent",category:"Resources",url:"sms-terms.html",description:"Review Identity Aesthetics marketing-text consent, message frequency, privacy, HELP and STOP opt-out instructions.",terms:"sms text messaging terms consent opt in opt out stop help privacy marketing promotions mensajes texto consentimiento cancelar ayuda"},
    {title:"The Identity Journal",category:"Education",url:"journal.html",description:"Physician-led articles about aesthetics, skin, weight management, wellness and patient safety.",terms:"journal blog articles insights education aesthetics wellness medical review houston conroe fulshear"},
    {title:"What Do Peptides Do in Skincare?",category:"Education",url:"journal-peptides-skincare-skinmedica.html",description:"An evidence-informed guide to topical peptides, SkinMedica TNS Advanced+ Serum and physician-guided skin health.",terms:"peptides skincare skinmedica tns advanced serum growth factors wrinkles firmness texture collagen professional skincare skin health"},
    {title:"Facial Volume Loss",category:"Education",url:"journal-facial-volume-loss.html",description:"Why facial structure changes with age and weight loss—and how a layered treatment plan may help.",terms:"facial volume loss ozempic face glp1 hollow cheeks temples filler sculptra radiesse facial aging deflation"},
    {title:"Peptide Therapy for Recovery & Longevity",category:"Education",url:"journal-peptide-therapy-recovery-longevity.html",description:"An evidence-aware guide to recovery peptides, sustainable wellness and compounded-drug safety.",terms:"peptide therapy recovery longevity sleep mobility gut health bpc 157 tb 500 cjc 1295 ipamorelin semax selank compounding safety"},
    {title:"Botox®",category:"Treatments",url:"treatment-botox.html",description:"Smooth expression lines with a personalized, physician-guided neurotoxin plan.",terms:"botox botulinum toxin wrinkles forehead lines elevens 11 lines crow feet gummy smile sweating arrugas frente toxina"},
    {title:"Dysport®",category:"Treatments",url:"treatment-dysport.html",description:"A fast-spreading neurotoxin option for softening dynamic facial lines.",terms:"dysport wrinkles forehead frown lines crow feet arrugas entrecejo toxina"},
    {title:"Xeomin®",category:"Treatments",url:"treatment-xeomin.html",description:"A purified neurotoxin option for natural-looking expression-line refinement.",terms:"xeomin wrinkles forehead frown lines crow feet arrugas toxina"},
    {title:"Jeuveau®",category:"Treatments",url:"treatment-jeuveau.html",description:"A modern neurotoxin treatment designed to soften dynamic facial lines.",terms:"jeuveau newtox wrinkles forehead frown lines arrugas toxina"},
    {title:"Juvéderm®",category:"Treatments",url:"treatment-juvederm.html",description:"Hyaluronic-acid filler options for lips, cheeks, folds and facial contour.",terms:"juvederm filler lip cheek chin jawline volume lines relleno labios mejillas"},
    {title:"Evolysse™",category:"Treatments",url:"treatment-evolysse.html",description:"Hyaluronic-acid filler for tailored facial volume and contour enhancement.",terms:"evolysse filler lip cheek volume facial contour relleno labios volumen"},
    {title:"Radiesse®",category:"Treatments",url:"treatment-radiesse.html",description:"A calcium-based biostimulator for structure, contour and collagen support.",terms:"radiesse biostimulator collagen hands jawline cheek structure bioestimulador colageno"},
    {title:"Sculptra®",category:"Treatments",url:"treatment-sculptra.html",description:"A gradual collagen biostimulator for facial volume and skin-quality support.",terms:"sculptra biostimulator collagen volume temples cheeks buttocks bioestimulador colageno volumen"},
    {title:"Lip Filler",category:"Treatments",url:"treatment-lip-filler.html",description:"Personalized lip enhancement focused on shape, balance and proportion.",terms:"lip filler lips volume border cupid bow hydration relleno labios volumen perfilado"},
    {title:"Complete Facial Balancing",category:"Treatments",url:"treatment-complete-facial-balancing.html",description:"A comprehensive plan that evaluates the face as a whole for refined balance.",terms:"facial balancing full face liquid facelift profile chin jaw cheeks harmony balance facial armonizacion perfil"},
    {title:"Botched Filler Correction & Repair",category:"Treatments",url:"treatment-botched-filler-correction.html",description:"Expert evaluation of migrated, uneven or unwanted filler and correction options.",terms:"botched filler repair correction dissolve hyaluronidase migration lumps uneven bad filler relleno mal hecho migrado disolver"},
    {title:"PDO Thread Lift",category:"Treatments",url:"treatment-pdo-threads.html",description:"Minimally invasive threads for selected lifting and collagen-support goals.",terms:"pdo threads thread lift sagging jowls neck lift collagen hilos tensores flacidez"},
    {title:"LaseMD",category:"Treatments",url:"treatment-lasemd.html",description:"Customizable thulium laser rejuvenation with targeted post-treatment ampoules.",terms:"lasemd laser sun damage brown spots pigment melasma texture scars stretch marks serum ampoules manchas melasma textura cicatriz estrias"},
    {title:"Sciton Profile & BBL®",category:"Treatments",url:"treatment-sciton-profile-bbl.html",description:"BroadBand Light and laser options for color correction, resurfacing and rejuvenation.",terms:"sciton profile bbl broadband light sun damage redness rosacea brown spots pigment filters photofacial manchas rojez dano solar"},
    {title:"Laser Rejuvenation",category:"Treatments",url:"treatment-laser-rejuvenation.html",description:"Compare LaseMD and Sciton pathways for tone, texture, pigment and renewal.",terms:"laser rejuvenation resurfacing skin tightening texture sun damage brown spots stretch marks scars toenail fungus rejuvenecimiento laser manchas estrias cicatrices hongos unas"},
    {title:"Laser Hair Removal",category:"Treatments",url:"treatment-laser-hair-removal.html",description:"Long-term hair reduction plans using technology selected for your skin and hair.",terms:"laser hair removal unwanted hair face legs bikini back underarms depilacion laser vello axilas bikini"},
    {title:"Vaginal Rejuvenation with HIFU",category:"Treatments",url:"treatment-vaginal-rejuvenation-hifu.html",description:"A noninvasive consultation pathway for intimate wellness and selected concerns.",terms:"vaginal rejuvenation hifu tightening urinary leaking incontinence intimacy sexual intercourse rejuvenecimiento vaginal escape orina incontinencia"},
    {title:"Glo2Facial by Geneo",category:"Treatments",url:"treatment-glo2facial.html",description:"Oxygenation, exfoliation and infusion with pod options matched to your skin goals.",terms:"glo2facial geneo oxygen facial pods brighten hydrate smooth clarify facial oxigenacion brillo hidratacion"},
    {title:"Glo2Facial Treatment Options",category:"Treatments",url:"glo2facial-treatments.html",description:"Explore the complete collection of Geneo treatment pods and ingredients.",terms:"glo2facial pods geneo balance detox glam hydrate illuminate retouch revive ingredients opciones facial"},
    {title:"Microneedling",category:"Treatments",url:"microneedling.html",description:"Controlled collagen induction for selected texture, pore and scar concerns.",terms:"microneedling collagen induction acne scars pores texture lines skinpen microagujas cicatrices acne poros textura"},
    {title:"Dermaplaning",category:"Treatments",url:"dermaplaning.html",description:"Precision exfoliation to remove surface buildup and fine facial hair.",terms:"dermaplaning exfoliation peach fuzz smooth skin vellus hair exfoliacion vello facial piel suave"},
    {title:"Lash Services",category:"Treatments",url:"lash-services.html",description:"Lash lifts, tints, keratin or vitamin treatments and finishing options.",terms:"lashes lash lift tint keratin lower lash collagen mask pestanas levantamiento tinte queratina"},
    {title:"Brow Services",category:"Treatments",url:"brow-services.html",description:"Waxing, threading, tinting, lamination, tweezing and detailed brow finishing.",terms:"brows brow wax threading tint lamination tweezing eyebrow cejas cera hilo tinte laminado depilacion"},
    {title:"Waxing Services",category:"Treatments",url:"waxing-services.html",description:"Professional face, body and full-body waxing with customized individual-area options.",terms:"waxing full body brazilian bikini legs arms back chest underarms face hair removal cera cuerpo completo depilacion axilas piernas brazos espalda"},
    {title:"Healthcare Certification & Transparency",category:"Resources",url:"healthcare-certification.html",description:"Verify Identity Aesthetics' LegitScript approval and review prescription-treatment, telehealth and advertising transparency disclosures.",terms:"legitscript certification healthcare advertising transparency prescription treatment telehealth trust verify certificado publicidad medicamentos"},
    {title:"Pharmacy Sourcing & Medication Safety",category:"Resources",url:"pharmacy-sourcing.html",description:"Verify disclosed pharmacy relationships, understand 503A and 503B distinctions, and review compounded-medication safety standards.",terms:"pharmacy sourcing anazaohealth red carpet pharmacy compounding 503a 503b medication safety prescription verification farmacia medicamentos seguridad"},
    {title:"Body Contouring",category:"Treatments",url:"treatment-body-contouring.html",description:"Nonsurgical options for selected body-shaping and skin-smoothing goals.",terms:"body contouring fat reduction cellulite abdomen thighs arms sculpting moldeado corporal grasa celulitis abdomen"},
    {title:"Semaglutide",category:"Treatments",url:"treatment-semaglutide.html",description:"Physician-supervised GLP-1 weight-management consultation and ongoing care.",terms:"semaglutide ozempic wegovy glp1 weight loss appetite diabetes perdida peso apetito"},
    {title:"Tirzepatide",category:"Treatments",url:"treatment-tirzepatide.html",description:"Physician-supervised dual-action weight-management consultation and monitoring.",terms:"tirzepatide mounjaro zepbound glp1 gip weight loss appetite perdida peso apetito"},
    {title:"GLP-1 Weight-Loss Consultation",category:"Treatments",url:"treatment-glp1-weight-loss-consultation.html",description:"A medical evaluation for personalized weight-loss options and monitoring.",terms:"glp1 weight loss consultation obesity overweight semaglutide tirzepatide consulta perdida peso sobrepeso"},
    {title:"Hormone Optimization for Men",category:"Treatments",url:"treatment-hormone-optimization-men.html",description:"Physician-guided evaluation for fatigue, low drive, body-composition and hormone concerns.",terms:"men hormones testosterone trt low t fatigue libido muscle brain fog hormone optimization hombre testosterona cansancio libido"},
    {title:"Hormone Optimization for Women",category:"Treatments",url:"treatment-hormone-optimization-women.html",description:"Individualized evaluation for menopausal, perimenopausal and hormone-related concerns.",terms:"women hormones menopause perimenopause hot flashes fatigue libido sleep mood hrt mujer menopausia sofocos cansancio"},
    {title:"Physician-Supervised Peptide Therapy",category:"Treatments",url:"treatment-physician-supervised-peptide-therapy.html",description:"A safety-first consultation for clinically appropriate peptide-related goals.",terms:"peptide therapy physician supervised recovery sleep body composition wellness peptide consultation terapia peptidos medico"},
    {title:"Fine Lines & Wrinkles",category:"Concerns",url:"injectables.html",description:"Explore neurotoxins, fillers, biostimulators and personalized facial planning.",terms:"fine lines wrinkles forehead frown crow feet aging arrugas lineas finas envejecimiento"},
    {title:"Sun Damage, Brown Spots & Pigment",category:"Concerns",url:"treatment-laser-rejuvenation.html",description:"Explore laser and light-based options for selected discoloration concerns.",terms:"sun damage brown spots age spots pigment melasma freckles discoloration manchas solares pigmentacion pecas"},
    {title:"Redness & Visible Vessels",category:"Concerns",url:"treatment-sciton-profile-bbl.html",description:"Learn how selected BBL filters may address redness and visible vascular concerns.",terms:"redness rosacea vessels capillaries flushing bbl rojez rosacea vasos capilares"},
    {title:"Acne Scars, Pores & Uneven Texture",category:"Concerns",url:"microneedling.html",description:"Compare collagen-induction and laser options for textural renewal.",terms:"acne scars pores texture rough skin microneedling laser cicatrices acne poros textura"},
    {title:"Stretch-Mark Reduction",category:"Concerns",url:"treatment-laser-rejuvenation.html",description:"Learn about realistic laser-rejuvenation pathways for improving selected stretch marks.",terms:"stretch marks striae laser scars body estrias cicatrices"},
    {title:"Facial Volume Loss & Sagging",category:"Concerns",url:"treatment-complete-facial-balancing.html",description:"Explore filler, biostimulator, PDO-thread and facial-balancing options.",terms:"volume loss sagging jowls hollow temples cheeks lifting flacidez papada volumen sienes mejillas"},
    {title:"Low Energy, Libido or Brain Fog",category:"Concerns",url:"telehealth.html",description:"Begin a physician-guided wellness evaluation in office or by telehealth where available.",terms:"fatigue low energy libido brain fog sleep hormone testosterone menopause cansancio energia niebla mental"},
    {title:"Weight, Appetite & Metabolic Health",category:"Concerns",url:"weight-loss.html",description:"Explore GLP-1 consultation, medical monitoring and sustainable weight-management support.",terms:"weight appetite obesity metabolic visceral fat glp1 peso apetito obesidad metabolismo grasa visceral"},
    {title:"Urinary Leaking & Intimate Wellness",category:"Concerns",url:"treatment-vaginal-rejuvenation-hifu.html",description:"Review the consultation pathway for selected intimate-wellness concerns.",terms:"urinary leaking incontinence vaginal laxity intimacy sexual wellness escape orina incontinencia bienestar intimo"},
    {title:"Peptide Education Center",category:"Education",url:"peptide-education.html",description:"Evidence-aware baseline education on peptides, approval status, safety and sourcing.",terms:"peptide university education evidence fda approved research peptides education peptidos aprobados investigacion"},
    {title:"New & Emerging GLP-1 Medicines",category:"Education",url:"glp1-pipeline.html",description:"Reviewed 2026 status for Foundayo, Wegovy updates, retatrutide, CagriSema and eloralintide.",terms:"new emerging glp1 glp-1 pipeline foundayo orforglipron retatrutide cagrisema cagrilintide eloralintide future medicines"},
    {title:"FDA-Approved Peptide Medicines",category:"Education",url:"peptide-approved.html",description:"Understand what FDA approval means and review approved peptide-based medicines.",terms:"fda approved peptides list medicines approval peptide drugs peptidos aprobados medicamentos"},
    {title:"Research-Only Peptides",category:"Education",url:"peptide-research.html",description:"Learn the distinction between emerging research and approved clinical use.",terms:"research only peptides bpc 157 tb 500 cjc ipamorelin unapproved investigacion peptidos no aprobados"},
    {title:"Peptide Safety Bulletin",category:"Education",url:"peptide-safety-bulletin.html",description:"Important warnings about counterfeit, contaminated and unsupervised peptide products.",terms:"peptide safety counterfeit scam contamination danger warning seguridad peptidos fraude contaminado riesgo"},
    {title:"Frequently Asked Questions",category:"Education",url:"faq.html",description:"Clear answers about consultations, treatment planning, telehealth, pricing and policies.",terms:"faq questions answers cost pricing downtime booking consulta preguntas respuestas precio recuperacion cita"},
    {title:"Treatment Preparation & Aftercare",category:"Education",url:"treatment-guides.html",description:"General preparation, aftercare and when-to-call guidance for common services.",terms:"aftercare before treatment instructions swelling bruising preparation cuidados antes despues hinchazon moretones"},
    {title:"Meet Our Providers",category:"Providers",url:"team.html",description:"Meet Identity Aesthetics physicians, injectors, estheticians and leadership.",terms:"team providers doctor physician injector esthetician staff equipo medicos proveedores inyectoras esteticistas"},
    {title:"Dallas Alvey, MD, DDS, Chief Medical Officer",category:"Providers",url:"team-dallas-alvey.html",description:"Chief Medical Officer with dual medical and dental training in facial anatomy and wellness.",terms:"dallas alvey doctor physician injector hormone peptide chief medical officer medico inyector"},
    {title:"Ike Nwanonyiri, MD",category:"Providers",url:"team-ike-nwanonyiri.html",description:"Board-certified family medicine physician and Chief Medical Officer with experience in primary care, athlete care, men's health and regenerative medicine.",terms:"ike nwanonyiri doctor physician chief medical officer family medicine primary care sports athlete men health regenerative medical reviewer telehealth medico"},
    {title:"Astrid Ariano, Licensed Esthetician",category:"Providers",url:"team-astrid-ariano.html",description:"Advanced corrective skincare, facials, microneedling, peels and dermaplaning.",terms:"astrid ariano esthetician facial microneedling chemical peel dermaplaning esteticista"},
    {title:"Patrisia L., CLT",category:"Providers",url:"team-patrisia-l.html",description:"Meet Identity Aesthetics Aesthetic Consultant and Certified Laser Technician Patrisia L., CLT.",terms:"Patrisia Patricia aesthetic consultant facial rejuvenation certified laser technician CLT facility operations"},
    {title:"Dameon Tryon, Chief Executive Officer",category:"Leadership",url:"team-dameon-tryon.html",description:"Meet the executive leader guiding Identity Aesthetics strategy, operations, technology, pharmaceutical operations, growth and marketing.",terms:"Dameon Tryon chief executive officer CEO leadership business development strategy franchising pharmaceutical operations information technology IT marketing advertising"},
    {title:"Telehealth Visits",category:"Resources",url:"telehealth.html",description:"Learn how eligible patients can begin care from home in Texas, North Carolina and South Carolina.",terms:"telehealth virtual visit home texas north carolina south carolina online telesalud consulta virtual casa"},
    {title:"Locations",category:"Resources",url:"locations.html",description:"Find Identity Aesthetics in Conroe, Houston, Fulshear and Katy, plus our Kingwood franchise website.",terms:"locations address conroe houston fulshear katy kingwood map near me ubicaciones direccion cerca"},
    {title:"Payment Plans",category:"Resources",url:"payment-plans.html",description:"Explore available payment-plan information and the Cherry application experience.",terms:"payment plan cherry financing monthly payments cost price financiamiento pagos mensuales precio"},
    {title:"Book a Consultation",category:"Resources",url:"book-consultation.html",description:"Request an in-office or telehealth consultation with the Identity Aesthetics team.",terms:"book appointment schedule consultation telehealth cita reservar consulta programar"}
  ];

  function buildLuxurySearch() {
    if (document.querySelector(".site-search-launcher")) return;
    var isSpanish = localStorage.getItem("identity-language") === "es";
    var words = isSpanish ? {
      open:"Buscar tratamientos y recursos", close:"Cerrar búsqueda", title:"¿Cómo podemos ayudarle?", eyebrow:"Búsqueda de Identity", placeholder:"Busque un tratamiento, síntoma o pregunta…", popular:"Búsquedas populares", results:"Resultados", empty:"No encontramos una coincidencia exacta.", emptyHelp:"Nuestro equipo puede ayudarle a elegir el mejor punto de partida.", book:"Reservar consulta", learn:"Más información", all:"Ver todos los tratamientos", count:"resultados"
    } : {
      open:"Search treatments and resources", close:"Close search", title:"How may we help you?", eyebrow:"Identity Search", placeholder:"Search a treatment, concern or question…", popular:"Popular searches", results:"Results", empty:"We couldn't find an exact match.", emptyHelp:"Our team can help you choose the best place to begin.", book:"Book a consultation", learn:"Learn more", all:"View all treatments", count:"results"
    };
    var launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "site-search-launcher";
    launcher.setAttribute("aria-label", words.open);
    launcher.setAttribute("aria-haspopup", "dialog");
    launcher.innerHTML = '<svg class="site-search-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="10.75" cy="10.75" r="6.75"></circle><path d="M15.75 15.75L20 20"></path></svg>';
    var navActions = document.querySelector("header.nav .wrap > div:last-child");
    if (navActions) navActions.insertBefore(launcher, navActions.firstChild);

    var dialog = document.createElement("div");
    dialog.className = "site-search-overlay";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "site-search-title");
    dialog.setAttribute("aria-hidden", "true");
    dialog.innerHTML = '<div class="site-search-shell"><button type="button" class="site-search-close" aria-label="'+words.close+'"><span aria-hidden="true">×</span></button><div class="site-search-heading"><span class="site-search-eyebrow">'+words.eyebrow+'</span><h2 id="site-search-title">'+words.title+'</h2></div><div class="site-search-field"><svg class="site-search-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="10.75" cy="10.75" r="6.75"></circle><path d="M15.75 15.75L20 20"></path></svg><input type="search" autocomplete="off" spellcheck="false" aria-label="'+words.placeholder+'" placeholder="'+words.placeholder+'"><span class="site-search-key" aria-hidden="true">ESC</span></div><div class="site-search-popular"><span>'+words.popular+'</span><div><button type="button">Botox</button><button type="button">'+(isSpanish?'Manchas solares':'Sun damage')+'</button><button type="button">'+(isSpanish?'Pérdida de peso':'Weight loss')+'</button><button type="button">'+(isSpanish?'Hormonas':'Hormones')+'</button><button type="button">LaseMD</button></div></div><div class="site-search-summary" aria-live="polite"></div><div class="site-search-results"></div><div class="site-search-footer"><a href="treatments.html">'+words.all+'</a><a class="site-search-book" href="book-consultation.html">'+words.book+'</a></div></div>';
    document.body.appendChild(dialog);

    var input = dialog.querySelector("input");
    var results = dialog.querySelector(".site-search-results");
    var summary = dialog.querySelector(".site-search-summary");
    var close = dialog.querySelector(".site-search-close");
    var previousFocus = null;

    function normalize(value) {
      return (value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
    }
    function score(item, query) {
      var q = normalize(query);
      if (!q) return 0;
      var title = normalize(item.title);
      var haystack = title + " " + normalize(item.category) + " " + normalize(item.terms) + " " + normalize(item.description);
      var tokens = q.split(" ").filter(Boolean);
      var total = 0;
      if (title === q) total += 100;
      if (title.indexOf(q) === 0) total += 55;
      if (title.indexOf(q) !== -1) total += 35;
      if (haystack.indexOf(q) !== -1) total += 24;
      tokens.forEach(function(token){
        if (title.split(" ").some(function(word){return word.indexOf(token) === 0;})) total += 12;
        else if (haystack.indexOf(token) !== -1) total += 5;
        else total -= 8;
      });
      return total;
    }
    function render(query) {
      var q = normalize(query);
      if (!q) {
        results.innerHTML = '<div class="site-search-welcome"><p>'+(isSpanish?'Puede buscar por una marca, un objetivo —como arrugas o manchas— o una pregunta sobre su visita.':'Search by a treatment brand, a goal—such as wrinkles or sun damage—or a question about your visit.')+'</p></div>';
        summary.textContent = "";
        return;
      }
      var matches = searchItems.map(function(item){return {item:item,value:score(item,q)};}).filter(function(entry){return entry.value > 0;}).sort(function(a,b){return b.value-a.value;}).slice(0,12).map(function(entry){return entry.item;});
      summary.textContent = matches.length ? matches.length + " " + words.count : "";
      if (!matches.length) {
        results.innerHTML = '<div class="site-search-empty"><div class="site-search-empty-mark">?</div><h3>'+words.empty+'</h3><p>'+words.emptyHelp+'</p><a class="site-search-book" href="book-consultation.html?source=Site%20Search">'+words.book+'</a></div>';
        return;
      }
      var grouped = {};
      matches.forEach(function(item){(grouped[item.category] = grouped[item.category] || []).push(item);});
      var categoryNames = isSpanish ? {Treatments:"Tratamientos",Concerns:"Necesidades",Education:"Educación",Providers:"Especialistas",Resources:"Recursos"} : {};
      results.innerHTML = Object.keys(grouped).map(function(category){
        return '<section class="site-search-group"><h3>'+ (categoryNames[category] || category) +'</h3><div class="site-search-grid">'+grouped[category].map(function(item){
          return '<a class="site-search-result" href="'+item.url+'"><span><strong>'+item.title+'</strong><small>'+item.description+'</small></span><em>'+words.learn+' <b aria-hidden="true">→</b></em></a>';
        }).join("")+'</div></section>';
      }).join("");
    }
    function openSearch() {
      previousFocus = document.activeElement;
      dialog.classList.add("open");
      dialog.setAttribute("aria-hidden", "false");
      document.documentElement.classList.add("search-open");
      window.setTimeout(function(){input.focus();}, 80);
      render(input.value);
    }
    function closeSearch() {
      dialog.classList.remove("open");
      dialog.setAttribute("aria-hidden", "true");
      document.documentElement.classList.remove("search-open");
      if (previousFocus && previousFocus.focus) previousFocus.focus();
    }
    launcher.addEventListener("click", openSearch);
    close.addEventListener("click", closeSearch);
    dialog.addEventListener("click", function(event){if(event.target === dialog) closeSearch();});
    input.addEventListener("input", function(){render(input.value);});
    dialog.querySelectorAll(".site-search-popular button").forEach(function(button){
      button.addEventListener("click", function(){input.value = button.textContent; render(input.value); input.focus();});
    });
    document.addEventListener("keydown", function(event){
      if ((event.key === "/" || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k")) && !/input|textarea|select/i.test(document.activeElement.tagName)) {
        event.preventDefault(); openSearch();
      }
      if (event.key === "Escape" && dialog.classList.contains("open")) closeSearch();
      if (event.key === "Tab" && dialog.classList.contains("open")) {
        var focusable = Array.prototype.slice.call(dialog.querySelectorAll('button:not([disabled]),input,a[href]')).filter(function(element){return element.offsetParent !== null;});
        if (!focusable.length) return;
        var first = focusable[0], last = focusable[focusable.length-1];
        if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
        else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
      }
    });
    render("");
  }

  function enhanceFooterTrust() {
    var footer = document.querySelector("footer");
    if (!footer || footer.dataset.trustEnhanced === "true") return;
    footer.dataset.trustEnhanced = "true";

    var footerGrid = footer.querySelector(".f-grid");
    var brandColumn = footerGrid && footerGrid.firstElementChild;
    if (brandColumn) {
      var social = brandColumn.querySelector(".social, .footer-social-links");
      if (!social) {
        social = document.createElement("nav");
        brandColumn.appendChild(social);
      }
      social.className = "footer-social-links";
      social.setAttribute("aria-label", "Follow Identity Aesthetics");
      social.innerHTML = '<a href="https://www.instagram.com/identityaesthetics/" target="_blank" rel="noopener noreferrer" aria-label="Identity Aesthetics on Instagram"><span aria-hidden="true">IG</span><b>Instagram</b></a><a href="https://www.facebook.com/identityAestheticCenters/" target="_blank" rel="noopener noreferrer" aria-label="Identity Aesthetics on Facebook"><span aria-hidden="true">FB</span><b>Facebook</b></a><a href="https://www.tiktok.com/@identityaestheticcenter" target="_blank" rel="noopener noreferrer" aria-label="Identity Aesthetics on TikTok"><span aria-hidden="true">TT</span><b>TikTok</b></a>';

      if (!brandColumn.querySelector(".legitscript-trust")) {
        var certification = document.createElement("div");
        certification.className = "legitscript-trust";
        certification.innerHTML = '<a href="https://www.legitscript.com/websites/?checker_keywords=713botoxme.com" target="_blank" rel="noopener noreferrer" title="Verify LegitScript Approval for 713botoxme.com"><img src="https://static.legitscript.com/seals/10791384.png" alt="Verify LegitScript approval for 713botoxme.com" width="100" height="100" loading="lazy"><span><strong>LegitScript Approved</strong><small>Verify our healthcare website certification</small></span></a>';
        brandColumn.appendChild(certification);
      }
    }

    var visitHeading = Array.prototype.find.call(footer.querySelectorAll("h4"), function(heading){
      return heading.textContent.trim().toLowerCase() === "visit us";
    });
    if (visitHeading) {
      var visitColumn = visitHeading.parentElement;
      var locationLine = visitColumn && visitColumn.querySelector("p");
      if (locationLine) {
        locationLine.className = "footer-location-list";
        locationLine.innerHTML = '<span>Conroe, TX</span><i aria-hidden="true">·</i><span>Houston, TX</span><i aria-hidden="true">·</i><span>Fulshear, TX</span><i aria-hidden="true">·</i><span>Katy, TX</span><i aria-hidden="true">·</i><a class="kingwood-external-link" href="https://identityaestheticskingwood.com/" target="_blank" rel="noopener noreferrer" aria-label="Kingwood, Texas franchise website (opens in a new tab)">Kingwood, TX</a>';
      }
    }
  }

  function buildMegaNavigation() {
    var desktopNav = document.querySelector("header.nav nav.links");
    var mobileNav = document.querySelector("header.nav .m-nav");
    var header = desktopNav && desktopNav.closest("header.nav");
    if (!desktopNav || !header || header.dataset.megaNavigation === "true") return;
    header.dataset.megaNavigation = "true";

    var menuSections = [
      {
        key: "treatments",
        label: "Treatments",
        eyebrow: "Aesthetic Treatments",
        headline: "Refined treatments. Thoughtful facial balance.",
        description: "Explore injectables, fillers, biostimulators and corrective treatments organized around your goals.",
        overview: { label: "Treatment Library", href: "treatments.html" },
        secondary: { label: "Find My Treatment", href: "find-treatment.html" },
        activeFiles: ["treatments.html", "find-treatment.html", "injectables.html", "treatment-botox.html", "treatment-dysport.html", "treatment-xeomin.html", "treatment-jeuveau.html", "treatment-juvederm.html", "treatment-evolysse.html", "treatment-lip-filler.html", "treatment-botched-filler-correction.html", "treatment-complete-facial-balancing.html", "treatment-radiesse.html", "treatment-sculptra.html", "treatment-pdo-threads.html"],
        groups: [
          { title: "Neurotoxins", links: [["Botox® Cosmetic", "treatment-botox.html"], ["Dysport®", "treatment-dysport.html"], ["Xeomin®", "treatment-xeomin.html"], ["Jeuveau®", "treatment-jeuveau.html"]] },
          { title: "Filler & Structure", links: [["Juvéderm®", "treatment-juvederm.html"], ["Evolysse™", "treatment-evolysse.html"], ["Lip Filler", "treatment-lip-filler.html"], ["Filler Correction & Repair", "treatment-botched-filler-correction.html"]] },
          { title: "Collagen & Lift", links: [["Radiesse®", "treatment-radiesse.html"], ["Sculptra®", "treatment-sculptra.html"], ["PDO Threads", "treatment-pdo-threads.html"], ["Complete Facial Balancing", "treatment-complete-facial-balancing.html"]] }
        ]
      },
      {
        key: "medspa",
        label: "Med Spa",
        eyebrow: "Laser & Skin",
        headline: "Skin confidence, guided by technology and touch.",
        description: "Explore skin, laser and esthetic services selected around texture, pigment, hair and renewal.",
        overview: { label: "Med Spa Overview", href: "medspa.html" },
        secondary: { label: "Book a Skin Consultation", href: "book-consultation.html" },
        activeFiles: ["medspa.html", "microneedling.html", "dermaplaning.html", "korean-glass-skin-facial.html", "glo2facial-treatments.html", "treatment-glo2facial.html", "treatment-lasemd.html", "treatment-laser-rejuvenation.html", "treatment-sciton-profile-bbl.html", "treatment-laser-hair-removal.html", "brow-services.html", "lash-services.html", "waxing-services.html", "treatment-body-contouring.html", "treatment-vaginal-rejuvenation-hifu.html"],
        groups: [
          { title: "Skin Treatments", links: [["Microneedling", "microneedling.html"], ["Dermaplaning", "dermaplaning.html"], ["Korean Glass Skin Facial", "korean-glass-skin-facial.html"], ["Glo2Facial", "glo2facial-treatments.html"]] },
          { title: "Laser & Resurfacing", links: [["LaseMD", "treatment-lasemd.html"], ["Laser Rejuvenation", "treatment-laser-rejuvenation.html"], ["Sciton BBL", "treatment-sciton-profile-bbl.html"], ["Laser Hair Removal", "treatment-laser-hair-removal.html"]] },
          { title: "Brows, Lashes & Body", links: [["Brow Services", "brow-services.html"], ["Lash Services", "lash-services.html"], ["Waxing Services", "waxing-services.html"], ["Body Contouring", "treatment-body-contouring.html"], ["Vaginal Rejuvenation", "treatment-vaginal-rejuvenation-hifu.html"]] }
        ]
      },
      {
        key: "wellness",
        label: "Wellness & Weight Loss",
        eyebrow: "Medical Wellness",
        headline: "Evidence-guided wellness with thoughtful follow-through.",
        description: "Explore medical weight management, hormone care, peptide therapy and telehealth access.",
        overview: { label: "Weight-Loss Overview", href: "weight-loss.html" },
        secondary: { label: "Telehealth", href: "telehealth.html" },
        activeFiles: ["weight-loss.html", "total-woman-weight-loss.html", "treatment-glp1-weight-loss-consultation.html", "treatment-semaglutide.html", "treatment-tirzepatide.html", "peptides.html", "clinical-peptide-therapy.html", "peptide-program-women.html", "peptide-program-men.html", "treatment-physician-supervised-peptide-therapy.html", "treatment-hormone-optimization-men.html", "treatment-hormone-optimization-women.html", "telehealth.html"],
        groups: [
          { title: "Medical Weight Management", links: [["The Total Woman Program", "total-woman-weight-loss.html"], ["GLP-1 Consultation", "treatment-glp1-weight-loss-consultation.html"], ["Semaglutide", "treatment-semaglutide.html"], ["Tirzepatide", "treatment-tirzepatide.html"], ["Weight-Loss Programs", "weight-loss.html"]] },
          { title: "Hormone & Peptide Care", links: [["Clinical Peptide Therapy", "clinical-peptide-therapy.html"], ["Peptide Program for Women", "peptide-program-women.html"], ["Peptide Program for Men", "peptide-program-men.html"], ["Hormone Optimization for Women", "treatment-hormone-optimization-women.html"], ["Hormone Optimization for Men", "treatment-hormone-optimization-men.html"]] },
          { title: "Access & Guidance", links: [["Telehealth Care", "telehealth.html"], ["Meet the Clinical Team", "team.html"], ["Frequently Asked Questions", "faq.html"], ["Book a Consultation", "book-consultation.html"]] }
        ]
      },
      {
        key: "clinical-peptides",
        label: "Clinical Peptide Therapy",
        directHref: "clinical-peptide-therapy.html",
        eyebrow: "Physician-Crafted Programs",
        headline: "Clinical peptide care, made clear and personal.",
        description: "Start with the clinical overview, then explore programs tailored to women and men with evidence, safety and physician management built in.",
        overview: { label: "Clinical Peptide Therapy", href: "clinical-peptide-therapy.html" },
        secondary: { label: "Book a Peptide Consultation", href: "book-consultation.html?service=Clinical%20Peptide%20Therapy" },
        activeFiles: ["clinical-peptide-therapy.html", "peptide-program-women.html", "peptide-program-men.html"],
        groups: [
          { title: "Clinical Programs", links: [["Clinical Peptide Therapy", "clinical-peptide-therapy.html"], ["Peptide Program for Women", "peptide-program-women.html"], ["Peptide Program for Men", "peptide-program-men.html"]] },
          { title: "Evidence & Safety", links: [["FDA-Approved Peptides", "peptide-approved.html"], ["Medication & Pharmacy Safety", "pharmacy-sourcing.html"], ["Research-Only Evidence", "peptide-research.html"]] },
          { title: "Begin Your Care", links: [["Book a Peptide Consultation", "book-consultation.html?service=Clinical%20Peptide%20Therapy"], ["Telehealth · TX · NC · SC", "telehealth.html"], ["Meet the Clinical Team", "team.html"]] }
        ]
      },
      {
        key: "education",
        label: "Peptide Education",
        eyebrow: "Education Center",
        headline: "Clear peptide education, safety and sourcing.",
        description: "Review FDA status, clinical evidence, safety considerations and responsible pharmacy sourcing.",
        overview: { label: "Education Center", href: "peptide-education.html" },
        secondary: { label: "Safety Bulletin", href: "peptide-safety-bulletin.html" },
        activeFiles: ["peptide-education.html", "peptide-approved.html", "glp1-pipeline.html", "peptide-research.html", "peptide-safety.html", "peptide-safety-bulletin.html", "pharmacy-sourcing.html", "peptide-semaglutide.html", "peptide-tirzepatide.html", "peptide-retatrutide.html", "peptide-bpc-157.html", "peptide-tb-500.html", "peptide-cjc-1295.html", "peptide-ipamorelin.html", "peptide-sermorelin.html"],
        groups: [
          { title: "Start Here", links: [["Peptide Education Center", "peptide-education.html"], ["FDA-Approved Directory", "peptide-approved.html"], ["2026 GLP-1 Update Tracker", "glp1-pipeline.html"], ["Research-Only Evidence", "peptide-research.html"], ["Peptide Safety", "peptide-safety.html"]] },
          { title: "Peptide Guides", links: [["Semaglutide", "peptide-semaglutide.html"], ["Tirzepatide", "peptide-tirzepatide.html"], ["Retatrutide", "peptide-retatrutide.html"], ["Sermorelin", "peptide-sermorelin.html"], ["Ipamorelin", "peptide-ipamorelin.html"]] },
          { title: "Evidence & Sourcing", links: [["Urgent Safety Bulletin", "peptide-safety-bulletin.html"], ["Pharmacy Sourcing", "pharmacy-sourcing.html"], ["BPC-157", "peptide-bpc-157.html"], ["CJC-1295", "peptide-cjc-1295.html"], ["TB-500", "peptide-tb-500.html"]] }
        ]
      },
      {
        key: "team",
        label: "Our Team",
        eyebrow: "Identity Aesthetics",
        headline: "Meet the people behind your care.",
        description: "Learn about the physicians, advanced providers, esthetic professionals and leadership team serving you.",
        overview: { label: "Meet the Team", href: "team.html" },
        secondary: { label: "Our Story", href: "about.html" },
        activeFiles: ["team.html", "about.html", "team-sarah-walker.html", "team-dallas-alvey.html", "team-ike-nwanonyiri.html", "team-astrid-ariano.html", "team-patrisia-l.html", "team-dameon-tryon.html"],
        groups: [
          { title: "Medical Leadership", links: [["Dallas Alvey, MD, DDS, Chief Medical Officer", "team-dallas-alvey.html"], ["Ike Nwanonyiri, MD", "team-ike-nwanonyiri.html"]] },
          { title: "Advanced & Aesthetic Care", links: [["Sarah Walker, APRN, FNP-C", "team-sarah-walker.html"], ["Astrid A., Licensed Esthetician", "team-astrid-ariano.html"], ["Patrisia L., CLT", "team-patrisia-l.html"]] },
          { title: "Leadership & Support", links: [["Dameon Tryon, Chief Executive Officer", "team-dameon-tryon.html"], ["Samantha F., Patient Liaison", "team.html"], ["Book a Consultation", "book-consultation.html"]] }
        ]
      },
      {
        key: "locations",
        label: "Locations",
        eyebrow: "Find Us",
        headline: "Care across Greater Houston and beyond.",
        description: "Explore our Greater Houston locations and physician-guided telehealth availability.",
        overview: { label: "All Locations", href: "locations.html" },
        secondary: { label: "Contact Us", href: "contact.html" },
        activeFiles: ["locations.html"],
        groups: [
          { title: "Conroe", links: [["3508 W. Davis St · 77304", "locations.html#conroe"], ["Book Conroe", "book-consultation.html?location=Conroe"]] },
          { title: "Houston", links: [["6806 Long Point Rd · 77055", "locations.html#houston"], ["Book Houston", "book-consultation.html?location=Houston"]] },
          { title: "Fulshear", links: [["30417 5th St Ste C · 77441", "locations.html#fulshear"], ["Directions", "https://www.google.com/maps/search/?api=1&query=30417+5th+St+Ste+C%2C+Fulshear%2C+TX+77441", true], ["Book Fulshear", "book-consultation.html?location=Fulshear"]] },
          { title: "Katy", links: [["1227 Grand W Blvd · 77449", "locations.html#katy"], ["Book Katy", "book-consultation.html?location=Katy"]] },
          { title: "Kingwood", links: [["2610 Chestnut Ridge Rd · 77339", "https://identityaestheticskingwood.com/", true], ["Visit Kingwood Website ↗", "https://identityaestheticskingwood.com/", true]] },
          { title: "Telehealth", links: [["Texas · North Carolina · South Carolina", "telehealth.html"], ["Explore Virtual Care", "telehealth.html"]] }
        ],
        mobileLinks: [
          { label: "All Locations", href: "locations.html" },
          { label: "Conroe — 3508 W. Davis St", href: "locations.html#conroe" },
          { label: "Houston — 6806 Long Point Rd", href: "locations.html#houston" },
          { label: "Fulshear — 30417 5th St Ste C", href: "locations.html#fulshear" },
          { label: "Katy — 1227 Grand W Blvd", href: "locations.html#katy" },
          { label: "Kingwood — Visit Location Website ↗", href: "https://identityaestheticskingwood.com/", external: true },
          { label: "Telehealth — TX · NC · SC", href: "telehealth.html" },
          { label: "Book an Appointment", href: "book-consultation.html" }
        ]
      },
      {
        key: "journal",
        label: "Journal",
        eyebrow: "The Identity Journal",
        headline: "Clear guidance for modern aesthetic and wellness care.",
        description: "Read evidence-informed articles designed to help you understand options and prepare better questions.",
        overview: { label: "Visit the Journal", href: "journal.html" },
        secondary: { label: "Editorial Standards", href: "editorial-policy.html" },
        activeFiles: ["journal.html", "journal-total-package-weight-loss-women.html", "journal-facial-volume-loss.html", "journal-peptide-therapy-recovery-longevity.html", "journal-peptides-skincare-skinmedica.html", "journal-peptides-vs-proteins-skincare.html"],
        groups: [
          { title: "Aesthetics", links: [["Understanding Facial Volume Loss", "journal-facial-volume-loss.html"], ["Treatment Library", "treatments.html"], ["Find My Treatment", "find-treatment.html"]] },
          { title: "Skin Health", links: [["What Peptides Do in Skincare", "journal-peptides-skincare-skinmedica.html"], ["Peptides vs. Proteins", "journal-peptides-vs-proteins-skincare.html"], ["Med Spa Treatments", "medspa.html"]] },
          { title: "Wellness", links: [["Total-Package Weight Loss for Women", "journal-total-package-weight-loss-women.html"], ["Peptide Therapy for Recovery", "journal-peptide-therapy-recovery-longevity.html"], ["Weight Management", "weight-loss.html"], ["Peptide Education", "peptide-education.html"]] }
        ]
      },
      {
        key: "resources",
        label: "Resources",
        eyebrow: "Patient Resources",
        headline: "Plan your care with more confidence.",
        description: "Find practical preparation, payment, policy and contact information in one organized place.",
        overview: { label: "Frequently Asked Questions", href: "faq.html" },
        secondary: { label: "Contact Us", href: "contact.html" },
        activeFiles: ["faq.html", "contact.html", "payment-plans.html", "memberships-offers.html", "treatment-guides.html", "virtual-preview.html", "privacy.html", "terms.html", "sms-terms.html", "accessibility.html", "editorial-policy.html", "healthcare-certification.html"],
        groups: [
          { title: "Plan Your Care", links: [["Frequently Asked Questions", "faq.html"], ["Treatment Guides", "treatment-guides.html"], ["Payment Plans", "payment-plans.html"], ["Memberships & Offers", "memberships-offers.html"]] },
          { title: "Explore", links: [["Virtual Treatment Preview", "virtual-preview.html"], ["Contact Us", "contact.html"], ["Healthcare Certification", "healthcare-certification.html"], ["Medical Editorial Standards", "editorial-policy.html"]] },
          { title: "Policies", links: [["Privacy Policy", "privacy.html"], ["Terms of Use", "terms.html"], ["SMS Terms", "sms-terms.html"], ["Accessibility", "accessibility.html"]] }
        ]
      }
    ];

    function linkMarkup(link) {
      var external = link[2] ? ' target="_blank" rel="noopener noreferrer"' : "";
      return '<a href="' + link[1] + '"' + external + '><span>' + link[0] + '</span><i aria-hidden="true">→</i></a>';
    }

    function renderPanel(section) {
      return '<div class="ia-mega-intro"><span class="ia-mega-eyebrow">' + section.eyebrow + '</span><h2>' + section.headline + '</h2><p>' + section.description + '</p><div class="ia-mega-actions"><a href="' + section.overview.href + '">' + section.overview.label + '</a><a href="' + section.secondary.href + '">' + section.secondary.label + '</a></div></div><div class="ia-mega-groups' + (section.key === "locations" ? ' ia-mega-groups--locations' : '') + '">' + section.groups.map(function (group) {
        return '<section><h3>' + group.title + '</h3>' + group.links.map(linkMarkup).join("") + '</section>';
      }).join("") + '</div>';
    }

    desktopNav.classList.add("ia-mega-nav");
    desktopNav.setAttribute("aria-label", "Primary navigation");
    desktopNav.innerHTML = menuSections.map(function (section) {
      var active = section.activeFiles.indexOf(currentFile) !== -1;
      if (section.directHref) {
        return '<span class="ia-mega-direct' + (active ? ' on' : '') + '"><a href="' + section.directHref + '">' + section.label + '</a><button type="button" class="ia-mega-trigger" data-mega-key="' + section.key + '" aria-expanded="false" aria-controls="ia-mega-panel" aria-label="Open ' + section.label + ' menu"><i aria-hidden="true"></i></button></span>';
      }
      return '<button type="button" class="ia-mega-trigger' + (active ? ' on' : '') + '" data-mega-key="' + section.key + '" aria-expanded="false" aria-controls="ia-mega-panel"><span>' + section.label + '</span><i aria-hidden="true"></i></button>';
    }).join("");

    var panel = document.createElement("div");
    panel.className = "ia-mega-panel";
    panel.id = "ia-mega-panel";
    panel.setAttribute("aria-hidden", "true");
    panel.innerHTML = '<div class="ia-mega-inner"></div>';
    header.appendChild(panel);
    var panelInner = panel.querySelector(".ia-mega-inner");
    var currentTrigger = null;

    function closePanel(restoreFocus) {
      panel.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
      desktopNav.querySelectorAll(".ia-mega-trigger").forEach(function (trigger) {
        trigger.setAttribute("aria-expanded", "false");
      });
      if (restoreFocus && currentTrigger) currentTrigger.focus();
      currentTrigger = null;
    }

    function openPanel(trigger) {
      var section = menuSections.find(function (item) { return item.key === trigger.dataset.megaKey; });
      if (!section) return;
      panelInner.innerHTML = renderPanel(section);
      desktopNav.querySelectorAll(".ia-mega-trigger").forEach(function (item) {
        item.setAttribute("aria-expanded", String(item === trigger));
      });
      currentTrigger = trigger;
      panel.classList.add("open");
      panel.setAttribute("aria-hidden", "false");
    }

    desktopNav.querySelectorAll(".ia-mega-trigger").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        if (trigger.getAttribute("aria-expanded") === "true") closePanel(false);
        else openPanel(trigger);
      });
    });
    document.addEventListener("click", function (event) {
      if (panel.classList.contains("open") && !header.contains(event.target)) closePanel(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && panel.classList.contains("open")) closePanel(true);
    });

    if (mobileNav) {
      mobileNav.classList.add("ia-mobile-mega-nav");
      mobileNav.innerHTML = menuSections.map(function (section, index) {
        var links = section.mobileLinks || [section.overview, section.secondary].concat(section.groups.reduce(function (items, group) {
          return items.concat(group.links.map(function (link) { return { label: link[0], href: link[1], external: link[2] }; }));
        }, []));
        return '<section class="ia-mobile-menu-section"><button type="button" aria-expanded="false" aria-controls="ia-mobile-' + section.key + '"><span>' + section.label + '</span><i aria-hidden="true"></i></button><div id="ia-mobile-' + section.key + '" class="ia-mobile-menu-links" hidden>' + links.map(function (link) {
          return '<a href="' + link.href + '"' + (link.external ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + link.label + '</a>';
        }).join("") + '</div></section>';
      }).join("");
      mobileNav.querySelectorAll(".ia-mobile-menu-section>button").forEach(function (button) {
        button.addEventListener("click", function () {
          var links = document.getElementById(button.getAttribute("aria-controls"));
          var open = button.getAttribute("aria-expanded") === "true";
          button.setAttribute("aria-expanded", String(!open));
          links.hidden = open;
        });
      });
      var menuButton = header.querySelector(".menu-btn");
      if (menuButton) {
        menuButton.setAttribute("aria-label", "Open navigation menu");
        menuButton.addEventListener("click", function () {
          window.setTimeout(function () {
            var open = mobileNav.classList.contains("open");
            menuButton.setAttribute("aria-expanded", String(open));
            menuButton.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
          }, 0);
        });
      }
    }
  }

  buildMegaNavigation();
  enhanceFooterTrust();
  buildLuxurySearch();
})();
