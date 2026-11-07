// Starting catalog. Loaded into the database once; after that everything is
// edited from Admin > Services. Only the PAN prices came from the shop owner:
// every other price here is a placeholder to be corrected in the admin panel.

export type DocSpec = { key: string; label: string; required: boolean; hint?: string };
export type FieldSpec = {
  key: string;
  label: string;
  type: "text" | "date" | "tel" | "email" | "textarea" | "select";
  required: boolean;
  options?: string[];
};
export type FinderOption = { label: string; picks: string[] };

export type SeedService = {
  slug: string;
  name: string;
  summary: string;
  price: number;
  etaHours: number;
  keywords: string;
  note?: string;
  badge?: string;
  documents: DocSpec[];
  fields: FieldSpec[];
};

export type SeedCategory = {
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  question: string;
  options: FinderOption[];
  services: SeedService[];
};

const photo: DocSpec = { key: "photo", label: "Passport size photo", required: true, hint: "Saaf, safed background" };
const signature: DocSpec = {
  key: "signature",
  label: "Signature ka photo",
  required: true,
  hint: "Safed kagaz pe kaale pen se",
};
const aadhaar: DocSpec = { key: "aadhaar", label: "Aadhaar card", required: true, hint: "Dono side" };
const pan: DocSpec = { key: "pan", label: "PAN card", required: true };
const addressProof: DocSpec = {
  key: "address",
  label: "Address proof",
  required: true,
  hint: "Bijli bill, bank passbook ya ration card",
};
const dobProof: DocSpec = {
  key: "dob",
  label: "Date of birth proof",
  required: true,
  hint: "10th marksheet ya birth certificate",
};

const person: FieldSpec[] = [
  { key: "applicant", label: "Applicant ka poora naam", type: "text", required: true },
  { key: "father", label: "Pita ka naam", type: "text", required: true },
  { key: "dob", label: "Date of birth", type: "date", required: true },
  { key: "mobile", label: "Applicant ka mobile (OTP ke liye)", type: "tel", required: true },
];
const address: FieldSpec = { key: "address", label: "Poora pata", type: "textarea", required: true };
const correction: FieldSpec = {
  key: "changes",
  label: "Kya badalna hai? Sahi jaankari likhein",
  type: "textarea",
  required: true,
};

const INSTA_FRAMES: SeedService[] = [
  { slug: "insta-frame-small", label: "Small (8x10)", price: 350 },
  { slug: "insta-frame-medium", label: "Medium (12x15)", price: 500 },
  { slug: "insta-frame-large", label: "Large (16x20)", price: 700 },
].map(({ slug, label, price }) => ({
  slug,
  name: `Instagram Style Frame ${label}`,
  summary: "Aapki photo, viral Instagram post jaise design me",
  price,
  etaHours: 48,
  keywords: "instagram insta style viral photo frame post gift couple birthday anniversary",
  note: "Taiyar hone par dukan se le jaayein. Receiving me pickup ki jaankari milegi.",
  documents: [{ key: "gift_photo", label: "Frame ki photo", required: true, hint: "Saaf aur badi photo" }],
  fields: [
    person[0],
    person[3],
    { key: "username", label: "Frame pe likhne wala username", type: "text", required: false },
    { key: "caption", label: "Caption / message", type: "text", required: false },
  ],
}));

export const CATALOG: SeedCategory[] = [
  {
    slug: "pan-card",
    name: "PAN Card",
    tagline: "Naya PAN, correction",
    icon: "CreditCard",
    question: "Kya aapke paas pehle se PAN card hai?",
    options: [
      { label: "Nahi, naya banwana hai", picks: ["new-pan", "minor-pan"] },
      { label: "Hai, galti sudharni hai", picks: ["pan-correction"] },
      { label: "Hai, par kho gaya", picks: ["pan-reprint"] },
    ],
    services: [
      {
        slug: "new-pan",
        name: "New PAN Card",
        summary: "Pehli baar PAN card ke liye apply karein",
        price: 200,
        etaHours: 24,
        keywords: "pan pancard naya new pan card banwana",
        badge: "Sabse popular",
        documents: [aadhaar, photo, signature],
        fields: [...person, address],
      },
      {
        slug: "pan-correction",
        name: "PAN Correction",
        summary: "Naam, DOB, photo ya pata sudharein",
        price: 200,
        etaHours: 24,
        keywords: "pan correction sudhar galti naam change update",
        documents: [pan, aadhaar, photo, signature],
        fields: [...person, correction],
      },
      {
        slug: "minor-pan",
        name: "Minor PAN (18 se kam)",
        summary: "Bachche ke naam PAN card",
        price: 200,
        etaHours: 24,
        keywords: "minor bachcha child pan",
        documents: [
          { key: "child_aadhaar", label: "Bachche ka Aadhaar", required: true },
          { key: "parent_aadhaar", label: "Parent ka Aadhaar", required: true },
          photo,
          { key: "signature", label: "Parent ka signature", required: true },
        ],
        fields: [...person, address],
      },
      {
        slug: "pan-reprint",
        name: "PAN Reprint",
        summary: "Kho gaya ya toot gaya PAN dobara mangwayein",
        price: 150,
        etaHours: 24,
        keywords: "pan reprint lost kho gaya duplicate dobara",
        documents: [aadhaar],
        fields: [...person, { key: "pan_number", label: "PAN number (agar yaad ho)", type: "text", required: false }],
      },
    ],
  },
  {
    slug: "aadhaar",
    name: "Aadhaar Seva",
    tagline: "Address update, PVC card",
    icon: "Fingerprint",
    question: "Aadhaar me aapko kya kaam hai?",
    options: [
      { label: "Pata badalna hai", picks: ["aadhaar-address"] },
      { label: "PVC card mangwana hai", picks: ["aadhaar-pvc"] },
      { label: "Aadhaar download karna hai", picks: ["aadhaar-download"] },
    ],
    services: [
      {
        slug: "aadhaar-address",
        name: "Aadhaar Address Update",
        summary: "Online pata update (registered mobile zaroori)",
        price: 100,
        etaHours: 24,
        keywords: "aadhaar aadhar address pata update change",
        note: "Aadhaar se juda mobile number chalu hona chahiye. OTP ke liye hum aapko call karenge.",
        documents: [aadhaar, addressProof],
        fields: [person[0], person[3], { key: "new_address", label: "Naya pata", type: "textarea", required: true }],
      },
      {
        slug: "aadhaar-pvc",
        name: "Aadhaar PVC Card Order",
        summary: "ATM jaisa plastic Aadhaar ghar pe",
        price: 100,
        etaHours: 24,
        keywords: "aadhaar aadhar pvc plastic card order",
        note: "Aadhaar se juda mobile number chalu hona chahiye. OTP ke liye hum aapko call karenge.",
        documents: [aadhaar],
        fields: [person[0], person[3]],
      },
      {
        slug: "aadhaar-download",
        name: "e-Aadhaar Download",
        summary: "Aadhaar ki PDF copy nikalwayein",
        price: 50,
        etaHours: 12,
        keywords: "aadhaar aadhar download pdf print",
        note: "Aadhaar se juda mobile number chalu hona chahiye. OTP ke liye hum aapko call karenge.",
        documents: [],
        fields: [
          person[0],
          person[3],
          { key: "aadhaar_last4", label: "Aadhaar ke aakhri 4 ank", type: "text", required: true },
        ],
      },
    ],
  },
  {
    slug: "voter-id",
    name: "Voter ID",
    tagline: "Naya card, correction",
    icon: "Vote",
    question: "Voter ID me aapko kya chahiye?",
    options: [
      { label: "Naya voter card", picks: ["new-voter"] },
      { label: "Correction ya pata badalna", picks: ["voter-correction"] },
    ],
    services: [
      {
        slug: "new-voter",
        name: "New Voter ID",
        summary: "18 saal se upar, naya registration",
        price: 100,
        etaHours: 24,
        keywords: "voter id vote card naya new epic",
        documents: [aadhaar, dobProof, addressProof, photo],
        fields: [...person, address],
      },
      {
        slug: "voter-correction",
        name: "Voter ID Correction",
        summary: "Naam, pata ya photo sudharein",
        price: 100,
        etaHours: 24,
        keywords: "voter correction sudhar address change",
        documents: [{ key: "voter", label: "Purana voter card", required: true }, aadhaar, photo],
        fields: [...person, correction],
      },
    ],
  },
  {
    slug: "driving-licence",
    name: "Driving Licence",
    tagline: "Learner, renewal",
    icon: "Car",
    question: "Licence ka kaunsa kaam hai?",
    options: [
      { label: "Naya learner licence", picks: ["learner-licence"] },
      { label: "Purana licence renew", picks: ["dl-renewal"] },
    ],
    services: [
      {
        slug: "learner-licence",
        name: "Learner Licence Apply",
        summary: "LL form aur slot booking",
        price: 300,
        etaHours: 24,
        keywords: "dl ll learner licence license driving gaadi",
        note: "Sarkari fees alag se lagegi. Hum total bata denge.",
        documents: [aadhaar, dobProof, photo, signature],
        fields: [...person, address],
      },
      {
        slug: "dl-renewal",
        name: "DL Renewal",
        summary: "Expire hua licence renew karein",
        price: 300,
        etaHours: 24,
        keywords: "dl driving licence renewal renew expire",
        note: "Sarkari fees alag se lagegi. Hum total bata denge.",
        documents: [{ key: "dl", label: "Purana driving licence", required: true }, aadhaar, photo, signature],
        fields: [...person, address],
      },
    ],
  },
  {
    slug: "passport",
    name: "Passport",
    tagline: "Fresh, renewal",
    icon: "BookUser",
    question: "Passport ka kaunsa kaam hai?",
    options: [
      { label: "Pehli baar bana rahe hain", picks: ["passport-fresh"] },
      { label: "Purana renew karna hai", picks: ["passport-renewal"] },
    ],
    services: [
      {
        slug: "passport-fresh",
        name: "Fresh Passport Apply",
        summary: "Form bharna aur appointment",
        price: 300,
        etaHours: 24,
        keywords: "passport new fresh videsh",
        note: "Sarkari fees alag se lagegi. Hum total bata denge.",
        documents: [aadhaar, dobProof, addressProof],
        fields: [...person, address],
      },
      {
        slug: "passport-renewal",
        name: "Passport Renewal",
        summary: "Expire hua passport renew karein",
        price: 300,
        etaHours: 24,
        keywords: "passport renewal renew reissue",
        note: "Sarkari fees alag se lagegi. Hum total bata denge.",
        documents: [{ key: "passport", label: "Purana passport", required: true }, aadhaar],
        fields: [...person, address],
      },
    ],
  },
  {
    slug: "certificates",
    name: "Certificates",
    tagline: "Income, caste, residence",
    icon: "FileBadge",
    question: "Kaunsa certificate chahiye?",
    options: [
      { label: "Income certificate", picks: ["income-certificate"] },
      { label: "Caste certificate", picks: ["caste-certificate"] },
      { label: "Residence certificate", picks: ["residence-certificate"] },
    ],
    services: [
      {
        slug: "income-certificate",
        name: "Income Certificate",
        summary: "Aay praman patra ke liye apply",
        price: 100,
        etaHours: 24,
        keywords: "income aay praman patra certificate",
        documents: [aadhaar, photo, { key: "ration", label: "Ration card ya self declaration", required: true }],
        fields: [...person, address],
      },
      {
        slug: "caste-certificate",
        name: "Caste Certificate",
        summary: "Jati praman patra ke liye apply",
        price: 100,
        etaHours: 24,
        keywords: "caste jati praman patra certificate",
        documents: [aadhaar, photo, { key: "old_proof", label: "Khatiyan ya purana jati proof", required: true }],
        fields: [...person, address, { key: "caste", label: "Jati", type: "text", required: true }],
      },
      {
        slug: "residence-certificate",
        name: "Residence Certificate",
        summary: "Niwas praman patra ke liye apply",
        price: 100,
        etaHours: 24,
        keywords: "residence domicile niwas praman patra certificate",
        documents: [aadhaar, photo, addressProof],
        fields: [...person, address],
      },
    ],
  },
  {
    slug: "ration-card",
    name: "Ration Card",
    tagline: "Naya card, naam jodna",
    icon: "ShoppingBasket",
    question: "Ration card me kya kaam hai?",
    options: [
      { label: "Naya ration card", picks: ["new-ration"] },
      { label: "Member jodna hai", picks: ["ration-member"] },
    ],
    services: [
      {
        slug: "new-ration",
        name: "New Ration Card",
        summary: "Parivar ke liye naya ration card",
        price: 150,
        etaHours: 24,
        keywords: "ration card naya new rashan",
        documents: [
          { key: "family_aadhaar", label: "Parivar ke sabhi Aadhaar", required: true },
          photo,
          { key: "bank", label: "Bank passbook", required: true },
        ],
        fields: [
          ...person,
          address,
          { key: "members", label: "Parivar ke sadasya kitne hain", type: "text", required: true },
        ],
      },
      {
        slug: "ration-member",
        name: "Ration Card Member Add",
        summary: "Parivar ke naye sadasya ka naam jodein",
        price: 100,
        etaHours: 24,
        keywords: "ration member add naam jodna rashan",
        documents: [
          { key: "ration", label: "Ration card", required: true },
          { key: "member_aadhaar", label: "Naye sadasya ka Aadhaar", required: true },
        ],
        fields: [person[0], person[3], { key: "member", label: "Naye sadasya ka naam", type: "text", required: true }],
      },
    ],
  },
  {
    slug: "sarkari-yojana",
    name: "Sarkari Yojana",
    tagline: "Ayushman, e-Shram, PM-Kisan",
    icon: "Landmark",
    question: "Kaunsi yojana ke liye apply karna hai?",
    options: [
      { label: "Ayushman card", picks: ["ayushman-card"] },
      { label: "e-Shram card", picks: ["eshram-card"] },
      { label: "PM-Kisan", picks: ["pm-kisan"] },
    ],
    services: [
      {
        slug: "ayushman-card",
        name: "Ayushman Card",
        summary: "Eligibility check aur card apply",
        price: 100,
        etaHours: 24,
        keywords: "ayushman bharat golden card health yojana",
        documents: [aadhaar, { key: "ration", label: "Ration card", required: true }],
        fields: [person[0], person[3]],
      },
      {
        slug: "eshram-card",
        name: "e-Shram Card",
        summary: "Mazdoor registration aur card",
        price: 80,
        etaHours: 24,
        keywords: "eshram e-shram shram mazdoor labour card",
        documents: [aadhaar, { key: "bank", label: "Bank passbook", required: true }],
        fields: [person[0], person[3], person[2]],
      },
      {
        slug: "pm-kisan",
        name: "PM-Kisan Registration",
        summary: "Kisan yojana me registration",
        price: 100,
        etaHours: 24,
        keywords: "pm kisan samman nidhi kheti farmer",
        documents: [
          aadhaar,
          { key: "land", label: "Zameen ka kagaz", required: true },
          { key: "bank", label: "Bank passbook", required: true },
        ],
        fields: [person[0], person[3], address],
      },
    ],
  },
  {
    slug: "job-exam-forms",
    name: "Job & Exam Form",
    tagline: "Sarkari naukri, scholarship",
    icon: "ClipboardList",
    question: "Kaunsa form bharwana hai?",
    options: [
      { label: "Naukri ya exam form", picks: ["job-form"] },
      { label: "Scholarship form", picks: ["scholarship-form"] },
      { label: "Admit card ya result", picks: ["admit-card"] },
    ],
    services: [
      {
        slug: "job-form",
        name: "Sarkari Job / Exam Form",
        summary: "Kisi bhi bharti ya pariksha ka online form",
        price: 150,
        etaHours: 24,
        keywords: "job naukri exam form bharti ssc railway bank police",
        note: "Exam ki fees alag se lagegi. Hum total bata denge.",
        documents: [
          aadhaar,
          photo,
          signature,
          { key: "marksheets", label: "Marksheets", required: true, hint: "10th, 12th aur baaki" },
        ],
        fields: [...person, { key: "exam", label: "Kaunsa form / exam", type: "text", required: true }],
      },
      {
        slug: "scholarship-form",
        name: "Scholarship Form",
        summary: "Chhatravritti ka online form",
        price: 100,
        etaHours: 24,
        keywords: "scholarship chhatravritti student nsp",
        documents: [
          aadhaar,
          { key: "marksheets", label: "Pichhli marksheet", required: true },
          { key: "bank", label: "Bank passbook", required: true },
        ],
        fields: [...person, { key: "school", label: "School / college ka naam", type: "text", required: true }],
      },
      {
        slug: "admit-card",
        name: "Admit Card / Result Print",
        summary: "Admit card ya result nikalwayein",
        price: 30,
        etaHours: 12,
        keywords: "admit card result download print",
        documents: [],
        fields: [
          person[0],
          { key: "exam", label: "Exam ka naam", type: "text", required: true },
          { key: "roll", label: "Application / roll number", type: "text", required: true },
          person[2],
        ],
      },
    ],
  },
  {
    slug: "business",
    name: "Business Registration",
    tagline: "Udyam, food licence",
    icon: "Store",
    question: "Business ka kaunsa kaam hai?",
    options: [
      { label: "Udyam registration", picks: ["udyam"] },
      { label: "Food licence (FSSAI)", picks: ["fssai"] },
    ],
    services: [
      {
        slug: "udyam",
        name: "Udyam Registration",
        summary: "Chhote business ka MSME registration",
        price: 300,
        etaHours: 24,
        keywords: "udyam msme business registration",
        documents: [aadhaar, pan, { key: "bank", label: "Bank passbook", required: true }],
        fields: [
          person[0],
          person[3],
          { key: "business", label: "Business ka naam aur kaam", type: "textarea", required: true },
          address,
        ],
      },
      {
        slug: "fssai",
        name: "FSSAI Food Licence",
        summary: "Khane ke business ka basic registration",
        price: 500,
        etaHours: 48,
        keywords: "fssai food licence khana hotel dukan",
        note: "Sarkari fees alag se lagegi. Hum total bata denge.",
        documents: [aadhaar, photo, { key: "shop_proof", label: "Dukan ka proof", required: true }],
        fields: [
          person[0],
          person[3],
          { key: "business", label: "Business ka naam aur kaam", type: "textarea", required: true },
          address,
        ],
      },
    ],
  },
  {
    slug: "resume-typing",
    name: "Resume & Typing",
    tagline: "Biodata, letter, typing",
    icon: "FileText",
    question: "Aapko kya banwana hai?",
    options: [
      { label: "Resume / biodata", picks: ["resume"] },
      { label: "Letter ya typing", picks: ["typing"] },
    ],
    services: [
      {
        slug: "resume",
        name: "Resume / Biodata",
        summary: "Naukri ya shaadi ke liye PDF biodata",
        price: 100,
        etaHours: 12,
        keywords: "resume cv biodata naukri shaadi",
        documents: [{ key: "photo", label: "Passport size photo", required: false }],
        fields: [
          person[0],
          person[3],
          { key: "details", label: "Padhai, kaam ka anubhav aur baaki jaankari", type: "textarea", required: true },
        ],
      },
      {
        slug: "typing",
        name: "Letter / Typing Work",
        summary: "Application, affidavit draft, typing",
        price: 50,
        etaHours: 12,
        keywords: "typing letter application affidavit",
        documents: [{ key: "reference", label: "Likha hua kagaz (agar ho)", required: false }],
        fields: [
          person[0],
          person[3],
          { key: "details", label: "Kya type karna hai", type: "textarea", required: true },
        ],
      },
    ],
  },
  {
    ...{
      slug: "insurance",
      name: "Insurance",
      tagline: "Bike, car third party",
      icon: "ShieldCheck",
      question: "Kis gaadi ka third party insurance chahiye?",
      options: [
        { label: "Bike third party", picks: ["bike-insurance"] },
        { label: "Car third party", picks: ["car-insurance"] },
      ],
    },
    services: [
      {
        slug: "bike-insurance",
        name: "Bike Third Party Insurance",
        summary: "Bike ka third party insurance, naya ya renewal",
        keywords: "bike two wheeler scooter third party insurance bima policy renewal tp",
        documents: [
          { key: "rc", label: "RC", required: true },
          { key: "old_policy", label: "Purani policy", required: false },
        ],
        fields: [
          { key: "applicant", label: "Applicant ka poora naam", type: "text", required: true },
          { key: "mobile", label: "Applicant ka mobile (OTP ke liye)", type: "tel", required: true },
          { key: "vehicle", label: "Gaadi ka number", type: "text", required: true },
        ],
        price: 100,
        etaHours: 24,
        note: "Yeh hamari service fee hai. Policy ka premium alag lagega, hum pehle bata denge. Policy insurance company deti hai.",
      },
      {
        slug: "car-insurance",
        name: "Car Third Party Insurance",
        summary: "Car ka third party insurance, naya ya renewal",
        keywords: "car gaadi third party insurance bima policy renewal tp",
        documents: [
          { key: "rc", label: "RC", required: true },
          { key: "old_policy", label: "Purani policy", required: false },
        ],
        fields: [
          { key: "applicant", label: "Applicant ka poora naam", type: "text", required: true },
          { key: "mobile", label: "Applicant ka mobile (OTP ke liye)", type: "tel", required: true },
          { key: "vehicle", label: "Gaadi ka number", type: "text", required: true },
        ],
        price: 100,
        etaHours: 24,
        note: "Yeh hamari service fee hai. Policy ka premium alag lagega, hum pehle bata denge. Policy insurance company deti hai.",
      },
    ],
  } as SeedCategory,
  {
    slug: "custom-gifting",
    name: "Custom Gifting",
    tagline: "Photo mug, frame, gift",
    icon: "Gift",
    question: "Kaunsa gift banwana hai?",
    options: [
      { label: "Photo mug", picks: ["photo-mug"] },
      { label: "Photo frame", picks: ["photo-frame"] },
      { label: "Instagram style frame", picks: ["insta-frame-small", "insta-frame-medium", "insta-frame-large"] },
      { label: "Kuch aur gift", picks: ["custom-gift"] },
    ],
    services: [
      {
        slug: "photo-mug",
        name: "Photo Mug",
        summary: "Apni photo aur naam ke saath mug",
        price: 250,
        etaHours: 48,
        keywords: "mug magic mug cup photo gift birthday customize",
        note: "Taiyar hone par dukan se le jaayein. Receiving me pickup ki jaankari milegi.",
        documents: [
          { key: "gift_photo", label: "Mug pe chhapne wali photo", required: true, hint: "Saaf aur badi photo" },
        ],
        fields: [
          person[0],
          person[3],
          { key: "text", label: "Mug pe likhne wala naam / message", type: "text", required: false },
        ],
      },
      {
        slug: "photo-frame",
        name: "Photo Frame",
        summary: "Yaadon ke liye customize frame",
        price: 350,
        etaHours: 48,
        keywords: "frame photo gift anniversary customize",
        note: "Taiyar hone par dukan se le jaayein. Receiving me pickup ki jaankari milegi.",
        documents: [{ key: "gift_photo", label: "Frame ki photo", required: true, hint: "Saaf aur badi photo" }],
        fields: [
          person[0],
          person[3],
          { key: "size", label: "Size", type: "select", required: true, options: ["6x8", "8x10", "12x18"] },
          { key: "text", label: "Frame pe likhne wala message", type: "text", required: false },
        ],
      },
      ...INSTA_FRAMES,
      {
        slug: "custom-gift",
        name: "Customize Gift",
        summary: "T-shirt, keychain ya koi bhi gift",
        price: 200,
        etaHours: 48,
        keywords: "gift tshirt t-shirt keychain cushion customize",
        note: "Gift ke hisaab se rate alag ho sakta hai. Hum pehle aapse baat karenge.",
        documents: [{ key: "gift_photo", label: "Design ya photo", required: false }],
        fields: [
          person[0],
          person[3],
          { key: "details", label: "Kaunsa gift aur kaisa chahiye", type: "textarea", required: true },
        ],
      },
    ],
  },
  {
    slug: "other",
    name: "Koi Aur Kaam",
    tagline: "Jo list me nahi hai",
    icon: "Sparkles",
    question: "Apna kaam niche se chunein",
    options: [{ label: "Apna kaam likhna hai", picks: ["custom-work"] }],
    services: [
      {
        slug: "custom-work",
        name: "Custom Online Work",
        summary: "Koi bhi online kaam, likh kar bhejein",
        price: 100,
        etaHours: 24,
        keywords: "other custom koi aur kaam online",
        note: "Kaam ke hisaab se rate alag ho sakta hai. Hum pehle aapse baat karenge.",
        documents: [{ key: "reference", label: "Koi kagaz ho to upload karein", required: false }],
        fields: [
          person[0],
          person[3],
          { key: "details", label: "Apna kaam likhein", type: "textarea", required: true },
        ],
      },
    ],
  },
];
