// Policy text shown at /policy/<slug>. These are business commitments: the shop
// owner should read them, and a change here should also update UPDATED_ON.

export const UPDATED_ON = "6 November 2026";

export type Policy = {
  title: string;
  intro: string;
  sections: { heading: string; points: string[] }[];
};

export const POLICIES: Record<string, Policy> = {
  refund: {
    title: "Refund aur Cancellation Policy",
    intro: "Yeh policy batati hai ki Mahato Net Cafe pe kiye gaye payment ka refund kab milega.",
    sections: [
      {
        heading: "Refund kab milega",
        points: [
          "Jab tak hamne aapka form apply nahi kiya hai, aap order cancel karke poora refund le sakte hain.",
          "Galti se do baar payment ho gaya ho to extra rashi poori wapas milegi.",
          "Agar hamari taraf se kaam nahi ho paya to poora refund milega.",
        ],
      },
      {
        heading: "Refund kab nahi milega",
        points: [
          "Form apply hone ke baad service fee wapas nahi hogi, kyunki kaam ho chuka hota hai.",
          "Sarkari vibhag ke application reject karne par service fee wapas nahi hogi. Sarkari kaam ka aakhri faisla vibhag ka hota hai.",
          "Galat jaankari ya galat document dene se kaam ruk jaye to refund nahi milega. Hum sudhar ka mauka denge.",
          "Sarkari fees, exam fees ya portal charges ek baar bhar diye jaane par wapas nahi hote.",
        ],
      },
      {
        heading: "Custom gift",
        points: [
          "Printing shuru hone se pehle order cancel kiya ja sakta hai.",
          "Printing ke baad cancel ya refund nahi hoga, kyunki gift aapke naam aur photo ke hisaab se banta hai.",
          "Gift kharab ya hamari galti se galat bana ho to hum dobara bana denge.",
        ],
      },
      {
        heading: "Refund kaise lein",
        points: [
          "Apna order number lekar neeche diye gaye number pe call karein ya dukan pe aayein.",
          "Refund manzoor hone ke baad 5 se 7 working days me usi tareeke se wapas aayega jisse payment hua tha.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms aur Conditions",
    intro: "Mahato Net Cafe ki website ya service use karne par aap in niyamon se sahmat hote hain.",
    sections: [
      {
        heading: "Hamari service",
        points: [
          "Mahato Net Cafe ek private cyber cafe hai. Hum koi sarkari vibhag nahi hain aur kisi sarkari sanstha se jude nahi hain.",
          "Hum aapki taraf se online form bharte aur apply karte hain, aur custom gift banate hain.",
          "Website pe dikhayi gayi rashi hamari service fee hai. Jahan sarkari fees alag lagti hai, wahan service page pe likha hota hai.",
        ],
      },
      {
        heading: "Aapki zimmedari",
        points: [
          "Di gayi jaankari aur documents sahi aur aapke apne hone chahiye, ya aapko unhe dene ki anumati honi chahiye.",
          "Kaam ke liye OTP ki zaroorat par hum aapko call karenge. OTP sirf is kaam ke liye maanga jayega.",
          "Apna password kisi ke saath share na karein.",
          "Nakli document ya kisi galat kaam ke liye service use karne par order cancel kar diya jayega.",
        ],
      },
      {
        heading: "Hamari seema",
        points: [
          "Application manzoor hogi ya nahi, iska faisla sambandhit sarkari vibhag karta hai. Hum iski guarantee nahi dete.",
          "Sarkari website band hone ya vibhag me deri hone par diya gaya samay badh sakta hai.",
          "Hamari zimmedari us order ki service fee tak seemit hai.",
        ],
      },
      {
        heading: "Baaki niyam",
        points: [
          "Payment Razorpay ke through hota hai aur uske apne niyam bhi lagu hote hain.",
          "Hum in niyamon ko badal sakte hain. Naye niyam isi page pe dikhenge.",
          "Kisi vivad ka faisla Dhanbad, Jharkhand ki adalaton me hoga.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro: "Aapke documents aur jaankari sambhalna hamari zimmedari hai. Yeh policy batati hai ki hum unka kya karte hain.",
    sections: [
      {
        heading: "Hum kya lete hain",
        points: [
          "Account ke liye aapka naam, mobile number aur password. Password hum saaf roop me nahi rakhte.",
          "Form ki jaankari aur aapke upload kiye gaye documents, jaise Aadhaar, PAN aur photo.",
          "Order aur payment ka record.",
        ],
      },
      {
        heading: "Payment ki jaankari",
        points: [
          "Payment Razorpay sambhalta hai. Aapka card, UPI PIN ya bank detail hamare paas nahi aata.",
        ],
      },
      {
        heading: "Hum iska kya karte hain",
        points: [
          "Aapki jaankari sirf aapka kaam karne ke liye use hoti hai.",
          "Jaankari sirf usi sarkari portal ya vibhag ko di jaati hai jahan aapka form apply hona hai, payment ke liye Razorpay ko, aur storage ke liye GitHub ko encrypted form me.",
          "Hum aapki jaankari bechte nahi hain aur marketing ke liye kisi ko nahi dete.",
        ],
      },
      {
        heading: "Suraksha aur documents kab tak rakhe jaate hain",
        points: [
          "Upload ke baad aapke documents sirf hamari team dekh sakti hai. Aapko bas receiving milti hai.",
          "Documents encrypted form me GitHub ki private storage me rakhe jaate hain.",
          "Kaam poora hone ke baad hum documents delete kar dete hain, aur delete hone ki jaankari aapko My Orders me dikhti hai. Aap pehle bhi delete karne ko keh sakte hain.",
          "Order ka record aur receiving aapke account me rehte hain.",
        ],
      },
      {
        heading: "Cookies aur map",
        points: [
          "Hum sirf login banaye rakhne ke liye cookie use karte hain, tracking ya vigyapan ke liye nahi.",
          "Homepage ka map Google Maps se aata hai.",
        ],
      },
      {
        heading: "Android app",
        points: [
          "Camera sirf tab khulta hai jab aap khud document ki photo lete hain. Photo sirf aapke order ke liye upload hoti hai.",
          "Receiving download karne par wo aapke phone ke Downloads folder me save hoti hai.",
          "App aapke contacts, location ya baaki photos nahi padhta, aur usme koi vigyapan nahi hai.",
        ],
      },
      {
        heading: "Account delete karna",
        points: [
          "Website ya app ke footer me Account delete karein pe jayein, ya seedhe mahatocafe.tech/delete-account kholein.",
          "Delete karne par aapka naam, mobile number, password, form ki jaankari, documents aur receiving hat jate hain. Ye wapas nahi aate.",
          "Jis order ka payment hua ho, uska order number, service, rashi aur payment ID hisaab aur kanooni zaroorat ke liye rakha jata hai, bina aapke naam ya mobile number ke.",
        ],
      },
      {
        heading: "Aapke adhikar",
        points: [
          "Apni jaankari dekhne ya sudharne ke liye hamse sampark karein.",
          "18 saal se kam umar ke applicant ke liye form parent ya guardian ki anumati se bharein.",
        ],
      },
    ],
  },
  delivery: {
    title: "Service Delivery Policy",
    intro: "Hamari zyadatar services online milti hain. Hum koi courier ya shipping nahi karte.",
    sections: [
      {
        heading: "Online services",
        points: [
          "Payment ke baad hum aapka kaam shuru karte hain. Har service ka samay uske page pe likha hota hai.",
          "Receiving ready hote hi aapke account ke My Orders me mil jayegi, wahan se download karein.",
          "PAN ya Voter ID jaisa asli card sambhandhit vibhag aapke pate pe bhejta hai. Uska samay vibhag pe nirbhar karta hai.",
        ],
      },
      {
        heading: "Custom gift",
        points: [
          "Gift taiyar hone par aapko dukan se lena hoga. Taiyar hone ki jaankari My Orders me milegi.",
        ],
      },
      {
        heading: "Deri kab ho sakti hai",
        points: [
          "Document saaf na hone par hum sudhar maangenge. Sudhara hua document milne tak kaam ruka rahega.",
          "Sarkari website band hone ya OTP na milne par kaam me deri ho sakti hai.",
        ],
      },
    ],
  },
};
