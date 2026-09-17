import fs from 'node:fs';
import path from 'node:path';

const publicDir = path.resolve('public');
const base = 'https://713botoxme.com';
const modified = '2026-08-05';
const orgId = `${base}/#organization`;
const siteId = `${base}/#website`;
const editorialId = `${base}/editorial-policy.html#editorial-team`;
const reviewerId = `${base}/team-dallas-alvey.html#person`;

const clinicalPatterns = [
  /^treatment-/, /^peptide-/, /^peptides\.html$/, /^injectables\.html$/,
  /^medspa\.html$/, /^weight-loss\.html$/, /^microneedling\.html$/,
  /^dermaplaning\.html$/, /^glo2facial-treatments\.html$/,
  /^lash-services\.html$/, /^brow-services\.html$/, /^treatments\.html$/,
  /^treatment-guides\.html$/
];

const linkData = {
  injectables: [
    ['Injectables hub','Compare injectables','injectables'],
    ['Facial planning','Complete facial balancing','treatment-complete-facial-balancing'],
    ['Correction options','Filler correction & repair','treatment-botched-filler-correction'],
    ['Clinical team','Meet your provider','team']
  ],
  laser: [
    ['Laser hub','Laser rejuvenation','treatment-laser-rejuvenation'],
    ['Thulium treatment','Explore LaseMD','treatment-lasemd'],
    ['Light & resurfacing','Explore Sciton Profile & BBL','treatment-sciton-profile-bbl'],
    ['Plan your visit','Book a consultation','book-consultation']
  ],
  skin: [
    ['Med spa hub','Facials, skin, lashes & brows','medspa'],
    ['Skin renewal','Microneedling','microneedling'],
    ['Resurfacing ritual','Dermaplaning','dermaplaning'],
    ['Oxygenation facial','Glo2Facial','glo2facial-treatments']
  ],
  wellness: [
    ['Wellness hub','Weight loss & wellness','weight-loss'],
    ['Care from home','Telehealth in TX, NC & SC','telehealth'],
    ['Hormone care','Men’s & women’s optimization','treatment-guides#wellness'],
    ['Next step','Book a consultation','book-consultation']
  ],
  peptide: [
    ['Education center','Peptide foundations','peptide-education'],
    ['Regulatory clarity','FDA-approved peptides','peptide-approved'],
    ['Safety first','Peptide safety','peptide-safety'],
    ['Clinical pathway','Physician-supervised therapy','treatment-physician-supervised-peptide-therapy']
  ],
  general: [
    ['Browse by treatment','Treatment library','treatments'],
    ['Browse by concern','Find my treatment','find-treatment'],
    ['Meet the team','Providers & specialists','team'],
    ['Plan your visit','Book a consultation','book-consultation']
  ]
};

function groupFor(file) {
  if (/peptide/.test(file)) return 'peptide';
  if (/hormone|semaglutide|tirzepatide|glp1|weight-loss/.test(file)) return 'wellness';
  if (/laser|lasemd|sciton|body-contouring|vaginal/.test(file)) return 'laser';
  if (/glo2|microneedling|dermaplaning|lash|brow|medspa/.test(file)) return 'skin';
  if (/botox|dysport|xeomin|jeuveau|juvederm|evolysse|radiesse|sculptra|filler|facial-balancing|pdo|injectables/.test(file)) return 'injectables';
  return 'general';
}

function textContent(html, tag) {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? match[1].replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&[^;]+;/g,' ').replace(/\s+/g,' ').trim() : '';
}

function metaDescription(html) {
  const match = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  return match ? match[1].replace(/&amp;/g,'&') : '';
}

function pageType(file, clinical) {
  if (clinical) return 'MedicalWebPage';
  if (file === 'about') return 'AboutPage';
  if (file === 'contact' || file === 'book-consultation') return 'ContactPage';
  if (file === 'team') return 'CollectionPage';
  if (file.startsWith('team-')) return 'ProfilePage';
  if (file === 'faq') return 'FAQPage';
  return 'WebPage';
}

function existingReviewDate(html) {
  const match = html.match(/(?:Medical-content evidence review|Evidence review|Last medically reviewed):<\/strong>\s*([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/i);
  if (!match) return '2026-07-30';
  const d = new Date(`${match[1]} 12:00:00 UTC`);
  return Number.isNaN(d.valueOf()) ? '2026-07-30' : d.toISOString().slice(0,10);
}

function centralGraph(file, html, clinical) {
  const url = file === '/' ? `${base}/` : `${base}/${file}`;
  const title = textContent(html, 'title') || textContent(html, 'h1') || 'Identity Aesthetics';
  const description = metaDescription(html);
  const graph = [
    {
      '@type':['Organization','MedicalBusiness'], '@id':orgId,
      name:'Identity Aesthetics', legalName:'Identity Aesthetics', alternateName:'713 Botox Me', url:`${base}/`,
      logo:{'@type':'ImageObject',url:`${base}/images/identity-aesthetics-logo-best-slim-gold.png`},
      telephone:'+1-713-268-6963', email:'info@713botoxme.com', foundingDate:'2011',
      medicalSpecialty:['Aesthetic Medicine','Endocrinology','Dermatology'],
      areaServed:[{'@type':'State','name':'Texas'},{'@type':'State','name':'North Carolina'},{'@type':'State','name':'South Carolina'}],
      sameAs:['https://www.instagram.com/identityaesthetics','https://www.facebook.com/identityAestheticCenters/','https://www.tiktok.com/@identityaestheticcenter']
    },
    {'@type':'WebSite','@id':siteId,name:'Identity Aesthetics',url:`${base}/`,publisher:{'@id':orgId}},
    {
      '@type':'Person','@id':reviewerId,name:'Dallas Alvey, MD, DDS',honorificSuffix:'MD, DDS',
      jobTitle:'Chief Medical Officer',url:`${base}/team-dallas-alvey.html`,worksFor:{'@id':orgId},
      alumniOf:[
        {'@type':'CollegeOrUniversity','name':'UT Southwestern Medical School'},
        {'@type':'CollegeOrUniversity','name':'University of Texas School of Dentistry at Houston'}
      ],
      knowsAbout:['Aesthetic medicine','Hormone optimization','Peptide therapy','Regenerative aesthetics','Facial anatomy']
    },
    {
      '@type':pageType(file, clinical),'@id':`${url}#webpage`,url,name:title,description,
      isPartOf:{'@id':siteId},publisher:{'@id':orgId},dateModified:modified
    }
  ];
  if (clinical) {
    graph[3].author = {'@id':editorialId};
    graph[3].reviewedBy = {'@id':reviewerId};
    graph[3].lastReviewed = existingReviewDate(html);
    graph.push({'@type':'Organization','@id':editorialId,name:'Identity Aesthetics Clinical Editorial Team',url:`${base}/editorial-policy.html`,parentOrganization:{'@id':orgId}});
  }
  if (file === 'locations') {
    const locations = [
      ['conroe','Identity Aesthetics — Conroe','3508 W. Davis St','Conroe','77304'],
      ['houston','Identity Aesthetics — Houston','6806 Long Point Rd, Suite C','Houston','77055'],
      ['fulshear','Identity Aesthetics — Fulshear','30417 5th St Ste C','Fulshear','77441']
    ];
    for (const [slug,name,street,city,zip] of locations) graph.push({
      '@type':'MedicalBusiness','@id':`${base}/locations.html#${slug}`,name,url:`${base}/locations.html#${slug}`,
      parentOrganization:{'@id':orgId},telephone:'+1-713-268-6963',priceRange:'$$$',
      address:{'@type':'PostalAddress',streetAddress:street,addressLocality:city,addressRegion:'TX',postalCode:zip,addressCountry:'US'}
    });
  }
  if (file === 'team') {
    const people = [
      ['Ike Nwanonyiri, MD','MD','Chief Medical Officer'],['Sarah Walker, APRN, FNP-C','APRN, FNP-C','Advanced Provider and Nutritionist'],
      ['Astrid Ariano','','Licensed Esthetician'],
      ['Patricia, CLT','CLT','Office Administrator & Director'],['Samantha','','Patient Liaison'],
      ['Dameon Tryon','','Chief Executive Officer']
    ];
    for (const [name,suffix,role] of people) graph.push({'@type':'Person',name,honorificSuffix:suffix||undefined,jobTitle:role,worksFor:{'@id':orgId}});
  }
  return {'@context':'https://schema.org','@graph':graph};
}

function pathways(file) {
  const links = linkData[groupFor(file)].filter(([, , href]) => href !== file).slice(0,4);
  return `<section class="authority-pathways" aria-labelledby="authority-pathways-title"><div class="wrap"><div class="authority-heading"><span class="eyebrow">Continue Exploring</span><h2 id="authority-pathways-title">Move from information to the right next step.</h2><p>Explore connected treatment guidance, meet the clinical team or begin a personalized consultation.</p></div><div class="authority-link-grid">${links.map(([k,t,h])=>`<a class="authority-link" href="${h}"><span>${k}</span><strong>${t}</strong></a>`).join('')}</div></div></section>`;
}

function reviewPanel(html) {
  const reviewDate = existingReviewDate(html);
  const pretty = new Date(`${reviewDate}T12:00:00Z`).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'});
  return `<section class="authority-review" aria-label="Editorial and medical review information"><div class="wrap"><div class="authority-review-card"><div class="authority-review-item"><span class="authority-review-label">Prepared by</span><a href="editorial-policy">Identity Aesthetics Clinical Editorial Team</a><p>Patient education developed from primary regulatory, labeling and professional sources.</p></div><div class="authority-review-item"><span class="authority-review-label">Medically reviewed by</span><a href="team-dallas-alvey">Dallas Alvey, MD, DDS</a><p>Chief Medical Officer · Aesthetic medicine, hormone optimization and peptide therapy.</p></div><div class="authority-review-item"><span class="authority-review-label">Evidence review</span><strong>${pretty}</strong><p><a href="editorial-policy">Read our editorial standards and update policy</a></p></div></div></div></section>`;
}

for (const file of fs.readdirSync(publicDir).filter(f=>f.endsWith('.html'))) {
  const full = path.join(publicDir,file);
  let html = fs.readFileSync(full,'utf8');
  const clinical = clinicalPatterns.some(pattern=>pattern.test(file));
  html = html.replace(/\n?<link[^>]+authority-signals\.css[^>]*>/g,'');
  html = html.replace(/\n?<script id="identity-authority-schema"[\s\S]*?<\/script>/g,'');
  html = html.replace(/\n?<section class="authority-pathways"[\s\S]*?<\/section>/g,'');
  html = html.replace(/\n?<section class="authority-review"[\s\S]*?<\/section>/g,'');
  if (!html.includes('href="editorial-policy">Medical Editorial Standards</a>')) {
    html = html.replace('<a href="accessibility">Accessibility</a></div></div>', '<a href="accessibility">Accessibility</a><a href="editorial-policy">Medical Editorial Standards</a></div></div>');
    if (!html.includes('href="editorial-policy">Medical Editorial Standards</a>')) {
      html = html.replace('<a href="accessibility">Accessibility</a></span>', '<a href="accessibility">Accessibility</a> · <a href="editorial-policy">Medical Editorial Standards</a></span>');
    }
  }
  const schema = centralGraph(file,html,clinical);
  html = html.replace('</head>',`<link rel="stylesheet" href="authority-signals.css?v=71"><script id="identity-authority-schema" type="application/ld+json">${JSON.stringify(schema)}</script></head>`);
  if (clinical) html = html.replace('</main>',`${pathways(file)}${reviewPanel(html)}</main>`);
  fs.writeFileSync(full,html);
}

console.log('Authority signals enhanced across all HTML pages.');
