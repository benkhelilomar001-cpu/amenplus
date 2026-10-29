import type { Locale } from "@/lib/constants";

// Legal page TEMPLATES. Everything in [brackets] must be completed by AmenPlus,
// and the texts must be reviewed by a legal professional (Tunisian law) before launch.

export type LegalDoc = { title: string; description: string; sections: { heading: string; body: string[] }[] };
export type LegalKey = "mentions-legales" | "confidentialite" | "conditions-devis";

export const LEGAL_BANNER: Record<Locale, string> = {
  fr: "Modèle provisoire : ce texte doit être complété par AmenPlus et validé par un professionnel du droit avant publication définitive.",
  ar: "نموذج مؤقت: يجب أن تستكمل AmenPlus هذا النص وأن يصادق عليه مختص في القانون قبل النشر النهائي.",
  en: "Provisional template: this text must be completed by AmenPlus and reviewed by a legal professional before final publication.",
};

export const LEGAL: Record<LegalKey, Record<Locale, LegalDoc>> = {
  "mentions-legales": {
    fr: {
      title: "Mentions légales",
      description: "Informations légales relatives au site AmenPlus.",
      sections: [
        {
          heading: "Éditeur du site",
          body: [
            "AmenPlus — [forme juridique et dénomination sociale complète]",
            "Siège : [adresse complète], La Soukra, Tunisie",
            "Identifiant unique / registre : [numéro à compléter]",
            "Contact : [e-mail officiel] — [téléphone officiel]",
            "Responsable de la publication : [nom et fonction]",
          ],
        },
        {
          heading: "Hébergement",
          body: ["Hébergeur : [nom, adresse et contact de l'hébergeur]"],
        },
        {
          heading: "Propriété intellectuelle",
          body: [
            "La marque AmenPlus, le logo, les textes et les photographies des produits et réalisations AmenPlus sont protégés. Toute reproduction sans autorisation écrite est interdite.",
            "Certains visuels du site sont des images d'inspiration, signalées comme telles ; ils ne représentent pas des meubles fabriqués par AmenPlus.",
          ],
        },
        {
          heading: "Responsabilité",
          body: [
            "Les informations présentées sur le site sont fournies à titre indicatif. Les caractéristiques définitives de chaque meuble (dimensions, matériaux, finitions, délais) sont précisées dans le devis.",
          ],
        },
      ],
    },
    ar: {
      title: "البيانات القانونية",
      description: "معلومات قانونية تتعلق بموقع AmenPlus.",
      sections: [
        {
          heading: "ناشر الموقع",
          body: [
            "AmenPlus — [الشكل القانوني والتسمية الاجتماعية الكاملة]",
            "المقر: [العنوان الكامل]، سكرة، تونس",
            "المعرّف الوحيد / السجل: [الرقم للاستكمال]",
            "الاتصال: [البريد الإلكتروني الرسمي] — [الهاتف الرسمي]",
            "المسؤول عن النشر: [الاسم والصفة]",
          ],
        },
        { heading: "الاستضافة", body: ["المستضيف: [الاسم والعنوان ومعلومات الاتصال]"] },
        {
          heading: "الملكية الفكرية",
          body: [
            "علامة AmenPlus وشعارها ونصوص الموقع وصور منتجات وإنجازات AmenPlus محمية. يُمنع أي نسخ دون ترخيص كتابي.",
            "بعض صور الموقع هي صور للإلهام ومُشار إليها على هذا الأساس، ولا تمثّل أثاثًا من صنع AmenPlus.",
          ],
        },
        {
          heading: "المسؤولية",
          body: ["المعلومات المعروضة على الموقع استرشادية. تُحدَّد الخصائص النهائية لكل قطعة أثاث (المقاسات، المواد، التشطيبات، الآجال) في عرض السعر."],
        },
      ],
    },
    en: {
      title: "Legal notice",
      description: "Legal information about the AmenPlus website.",
      sections: [
        {
          heading: "Publisher",
          body: [
            "AmenPlus — [legal form and full company name]",
            "Registered office: [full address], La Soukra, Tunisia",
            "Company identifier / register: [number to be completed]",
            "Contact: [official email] — [official phone]",
            "Publication manager: [name and position]",
          ],
        },
        { heading: "Hosting", body: ["Host: [name, address and contact of the hosting provider]"] },
        {
          heading: "Intellectual property",
          body: [
            "The AmenPlus brand, logo, texts and photographs of AmenPlus products and projects are protected. Any reproduction without written permission is prohibited.",
            "Some images on this site are inspiration visuals, labelled as such; they do not show furniture made by AmenPlus.",
          ],
        },
        {
          heading: "Liability",
          body: ["Information on this site is indicative. The final specifications of each piece (dimensions, materials, finishes, lead times) are set out in the quote."],
        },
      ],
    },
  },
  confidentialite: {
    fr: {
      title: "Politique de confidentialité",
      description: "Comment AmenPlus traite les données personnelles transmises via le site.",
      sections: [
        {
          heading: "Responsable du traitement",
          body: ["AmenPlus — [dénomination, adresse et e-mail de contact pour les données personnelles]"],
        },
        {
          heading: "Données collectées",
          body: [
            "Via les formulaires de devis et de contact : nom, société (le cas échéant), e-mail et/ou téléphone, gouvernorat et ville du projet, description du besoin et fichiers que vous choisissez de joindre.",
            "Aucun paiement n'est effectué sur le site ; aucune donnée bancaire n'est collectée.",
          ],
        },
        {
          heading: "Finalité",
          body: ["Ces données servent uniquement à étudier votre demande, vous recontacter et établir un devis. Elles ne sont ni vendues ni cédées à des tiers à des fins commerciales."],
        },
        {
          heading: "Durée de conservation",
          body: ["[Durée à définir par AmenPlus, par exemple : 3 ans après le dernier échange.]"],
        },
        {
          heading: "Vos droits",
          body: [
            "Conformément à la loi organique n° 2004-63 du 27 juillet 2004 portant sur la protection des données à caractère personnel, vous disposez d'un droit d'accès, de rectification et d'opposition. Pour l'exercer : [e-mail de contact].",
            "Vous pouvez également vous adresser à l'Instance Nationale de Protection des Données Personnelles (INPDP).",
          ],
        },
        {
          heading: "Cookies",
          body: [
            "Le site n'utilise pas de cookies publicitaires ni d'outil de mesure d'audience à ce jour. Votre sélection de modèles pour le devis est conservée uniquement dans votre navigateur (stockage local).",
          ],
        },
      ],
    },
    ar: {
      title: "سياسة الخصوصية",
      description: "كيف تعالج AmenPlus المعطيات الشخصية المرسلة عبر الموقع.",
      sections: [
        { heading: "المسؤول عن المعالجة", body: ["AmenPlus — [التسمية والعنوان والبريد الإلكتروني الخاص بالمعطيات الشخصية]"] },
        {
          heading: "المعطيات المجمّعة",
          body: [
            "عبر استمارتي طلب عرض السعر والاتصال: الاسم، المؤسسة (عند الاقتضاء)، البريد الإلكتروني و/أو الهاتف، ولاية ومدينة المشروع، وصف الحاجة والملفات التي تختارون إرفاقها.",
            "لا يتم أي دفع على الموقع، ولا تُجمع أي معطيات بنكية.",
          ],
        },
        { heading: "الغاية", body: ["تُستعمل هذه المعطيات فقط لدراسة طلبكم والتواصل معكم وإعداد عرض السعر. لا تُباع ولا تُحال إلى أطراف أخرى لأغراض تجارية."] },
        { heading: "مدة الحفظ", body: ["[مدة تحددها AmenPlus، مثلًا: 3 سنوات بعد آخر تواصل.]"] },
        {
          heading: "حقوقكم",
          body: [
            "طبقًا للقانون الأساسي عدد 63 لسنة 2004 المؤرخ في 27 جويلية 2004 المتعلق بحماية المعطيات الشخصية، لكم حق النفاذ والتصحيح والاعتراض. لممارسة هذه الحقوق: [البريد الإلكتروني].",
            "يمكنكم أيضًا التوجه إلى الهيئة الوطنية لحماية المعطيات الشخصية.",
          ],
        },
        { heading: "ملفات تعريف الارتباط", body: ["لا يستعمل الموقع حاليًا ملفات تعريف ارتباط إشهارية ولا أدوات لقياس الجمهور. تُحفظ النماذج التي تختارونها لطلب عرض السعر في متصفحكم فقط (تخزين محلي)."] },
      ],
    },
    en: {
      title: "Privacy policy",
      description: "How AmenPlus processes personal data sent through the website.",
      sections: [
        { heading: "Data controller", body: ["AmenPlus — [name, address and contact email for personal data]"] },
        {
          heading: "Data collected",
          body: [
            "Through the quote and contact forms: name, company (if any), email and/or phone, project governorate and town, description of your needs and any files you choose to attach.",
            "No payment is made on the site; no bank details are collected.",
          ],
        },
        { heading: "Purpose", body: ["This data is used only to study your request, contact you and prepare a quote. It is not sold or passed on to third parties for marketing purposes."] },
        { heading: "Retention", body: ["[Period to be set by AmenPlus, e.g. 3 years after the last exchange.]"] },
        {
          heading: "Your rights",
          body: [
            "Under Tunisian Organic Law No. 2004-63 of 27 July 2004 on the protection of personal data, you have the right to access, correct and object. To exercise these rights: [contact email].",
            "You may also contact the National Authority for the Protection of Personal Data (INPDP).",
          ],
        },
        { heading: "Cookies", body: ["The site currently uses no advertising cookies or audience measurement tools. The models you select for a quote are stored only in your browser (local storage)."] },
      ],
    },
  },
  "conditions-devis": {
    fr: {
      title: "Conditions des demandes de devis",
      description: "Fonctionnement des demandes de devis AmenPlus.",
      sections: [
        {
          heading: "Nature de la demande",
          body: [
            "Une demande envoyée via le site n'est ni une commande ni un engagement d'achat. Elle permet à AmenPlus d'étudier votre projet et de vous adresser une proposition.",
            "Aucun prix n'est affiché sur le site et aucun paiement n'y est effectué.",
          ],
        },
        {
          heading: "Le devis",
          body: ["Le devis précise les caractéristiques, le prix, les délais et les conditions de livraison et d'installation. [Durée de validité, acompte et modalités de paiement à définir par AmenPlus.]"],
        },
        {
          heading: "Livraison",
          body: ["Zone envisagée : toute la Tunisie. Les frais, délais, zones desservies, installation et montage sont précisés dans chaque devis. [Conditions générales à confirmer par AmenPlus.]"],
        },
        {
          heading: "Garantie et service après-vente",
          body: ["[Conditions de garantie et de service après-vente à compléter par AmenPlus.]"],
        },
      ],
    },
    ar: {
      title: "شروط طلبات عروض الأسعار",
      description: "طريقة سير طلبات عروض الأسعار لدى AmenPlus.",
      sections: [
        {
          heading: "طبيعة الطلب",
          body: [
            "الطلب المرسل عبر الموقع ليس طلب شراء ولا التزامًا بالشراء، بل يتيح لـ AmenPlus دراسة مشروعكم وإرسال مقترح إليكم.",
            "لا تُعرض أي أسعار على الموقع ولا يتم عليه أي دفع.",
          ],
        },
        { heading: "عرض السعر", body: ["يحدّد عرض السعر الخصائص والسعر والآجال وشروط التسليم والتركيب. [مدة الصلاحية والتسبقة وطرق الدفع تحددها AmenPlus.]"] },
        { heading: "التسليم", body: ["المنطقة المعتزمة: كامل التراب التونسي. تُحدَّد المصاريف والآجال والمناطق المخدومة والتركيب في كل عرض سعر. [الشروط العامة تؤكدها AmenPlus.]"] },
        { heading: "الضمان وخدمة ما بعد البيع", body: ["[شروط الضمان وخدمة ما بعد البيع تستكملها AmenPlus.]"] },
      ],
    },
    en: {
      title: "Quote request terms",
      description: "How AmenPlus quote requests work.",
      sections: [
        {
          heading: "Nature of the request",
          body: [
            "A request sent through the site is neither an order nor a commitment to buy. It allows AmenPlus to study your project and send you a proposal.",
            "No prices are shown on the site and no payment is made on it.",
          ],
        },
        { heading: "The quote", body: ["The quote sets out specifications, price, lead times and delivery and installation terms. [Validity period, deposit and payment terms to be set by AmenPlus.]"] },
        { heading: "Delivery", body: ["Intended area: all of Tunisia. Costs, lead times, areas served, installation and assembly are specified in each quote. [General terms to be confirmed by AmenPlus.]"] },
        { heading: "Warranty and after-sales service", body: ["[Warranty and after-sales terms to be completed by AmenPlus.]"] },
      ],
    },
  },
};
