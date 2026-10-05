export interface ForumGuideItem {
  id: string;
  name: string;
  hindiName?: string;
  forumType: 'Police & Cyber' | 'Consumer' | 'Labour' | 'Civil & Rent' | 'Criminal' | 'Tribunal' | 'ADR & Legal Aid';
  typesOfDisputes: string[];
  pecuniaryOrTerritorialJurisdiction: string;
  howToApproach: string[];
  expectedDocuments: string[];
  averageTimeframe: string;
  officialPortalOrHelpline?: string;
}

export const INDIAN_FORUMS: ForumGuideItem[] = [
  {
    id: 'forum-police-station',
    name: 'Local Police Station & Zero FIR',
    hindiName: 'स्थानीय पुलिस थाना एवं जीरो एफआईआर',
    forumType: 'Police & Cyber',
    typesOfDisputes: [
      'Theft, burglary, vehicle theft',
      'Physical assault, threats to life, criminal intimidation',
      'Cheating, extortion, forgery',
      'Crimes against women, domestic violence incidents'
    ],
    pecuniaryOrTerritorialJurisdiction: 'Police station covering the area where crime occurred. Under Section 173 BNSS, ANY police station can register a Zero FIR and transfer it.',
    howToApproach: [
      'Visit the station in person or file e-FIR where your state police portal supports it.',
      'Submit written complaint in duplicate and demand a signed & stamped acknowledgment.',
      'If cognizable, demand your statutory free copy of the registered FIR (Section 173(2) BNSS).',
      'If refused, send written complaint via registered post to Superintendent of Police (SP) under Section 175(3) BNSS.'
    ],
    expectedDocuments: ['Identity Proof (Aadhaar/Voter ID)', 'Written chronological complaint', 'Photos, receipts, or medical examination reports (MLC)'],
    averageTimeframe: 'FIR registration within 24-48 hours; investigation timeline typically 60-90 days.',
    officialPortalOrHelpline: 'Emergency: 112'
  },
  {
    id: 'forum-cyber-crime',
    name: 'National Cyber Crime Reporting Portal & Cyber Cells',
    hindiName: 'राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल',
    forumType: 'Police & Cyber',
    typesOfDisputes: [
      'UPI, netbanking, credit card online fraud',
      'Phishing, OTP scams, fake investment apps',
      'Social media hacking, sextortion, morphed photos, cyber harassment',
      'Identity theft and online impersonation'
    ],
    pecuniaryOrTerritorialJurisdiction: 'Pan-India jurisdiction via central 1930 routing system and jurisdictional district cyber police stations.',
    howToApproach: [
      'For financial fraud within last 24 hours: Call 1930 immediately to freeze recipient bank accounts.',
      'Log on to cybercrime.gov.in and register an incident report under "Report Cyber Crime".',
      'Download the acknowledgment number and visit local cyber cell if requested.'
    ],
    expectedDocuments: ['Bank statement showing transaction UTRs', 'Screenshots of phishing links/SMS', 'Call logs and sender mobile numbers', 'Device info'],
    averageTimeframe: 'Account freeze within 2-4 hours; investigation 1-3 months.',
    officialPortalOrHelpline: 'Helpline: 1930 | cybercrime.gov.in'
  },
  {
    id: 'forum-district-consumer',
    name: 'District Consumer Disputes Redressal Commission',
    hindiName: 'जिला उपभोक्ता विवाद निवारण आयोग',
    forumType: 'Consumer',
    typesOfDisputes: [
      'Defective products (electronics, vehicles, home appliances)',
      'Deficiency in service (banks, airlines, hospitals, telecom, insurance)',
      'E-commerce delivery failure or warranty refusal',
      'Misleading advertisements and overcharging above MRP'
    ],
    pecuniaryOrTerritorialJurisdiction: 'Handles claims where value of goods/services paid does not exceed ₹50 Lakhs. Can be filed where consumer resides or where seller has office.',
    howToApproach: [
      'First issue a formal grievance or legal notice giving 15 days to resolve.',
      'File online via E-Daakhil (edaakhil.nic.in) or submit 3 copies of petition at District Commission.',
      'Nominal court fee payable (Free up to ₹5 Lakhs, nominal fee above ₹5 Lakhs).'
    ],
    expectedDocuments: ['Tax Invoice / Bill of Purchase', 'Warranty / Guarantee card', 'Written communications and emails with company', 'Photographs/video of defect'],
    averageTimeframe: 'Statutory target is 3 to 5 months; typically 6 to 12 months.',
    officialPortalOrHelpline: 'edaakhil.nic.in | National Consumer Helpline: 1915'
  },
  {
    id: 'forum-labour-commissioner',
    name: 'Office of the Labour Commissioner & Payment of Wages Authority',
    hindiName: 'श्रम आयुक्त कार्यालय',
    forumType: 'Labour',
    typesOfDisputes: [
      'Non-payment or delay of monthly wages/salary',
      'Unlawful withholding of Full & Final (F&F) settlement, gratuity, or PF',
      'Illegal termination or retrenchment without statutory notice',
      'Unsafe working conditions and overtime disputes'
    ],
    pecuniaryOrTerritorialJurisdiction: 'Territorial jurisdiction where the workplace/office is situated.',
    howToApproach: [
      'Submit written petition under Section 15 of Payment of Wages Act or Section 2A of Industrial Disputes Act.',
      'Labour Officer issues conciliation notice to employer for joint meeting.',
      'If conciliation fails, matter is referred to the Labour Court for formal adjudication.'
    ],
    expectedDocuments: ['Appointment letter / Offer letter', 'Salary slips / Form 16', 'Bank statements showing wage stoppage', 'Attendance proof and emails'],
    averageTimeframe: 'Conciliation typically 30-60 days; Labour court trial 1-2 years.',
    officialPortalOrHelpline: 'samadhan.labour.gov.in | State Labour Portals'
  },
  {
    id: 'forum-rent-authority',
    name: 'Rent Authority / Rent Court / Civil Court',
    hindiName: 'किराया प्राधिकरण एवं सिविल न्यायालय',
    forumType: 'Civil & Rent',
    typesOfDisputes: [
      'Refusal to refund residential/commercial security deposit',
      'Unlawful eviction or cutting off essential supplies (water/electricity)',
      'Revision of rent disputes and maintenance obligations',
      'Tenant overstaying after expiry of lease'
    ],
    pecuniaryOrTerritorialJurisdiction: 'Where property is located. Rent Authority under Model Tenancy Act or Junior/Senior Civil Judge based on suit value.',
    howToApproach: [
      'Issue statutory legal notice giving 15 to 30 days demanding deposit refund or compliance.',
      'File petition before Rent Authority under State Tenancy Act or file Summary Suit under Order XXXVII CPC in Civil Court.'
    ],
    expectedDocuments: ['Registered Rent Agreement / Lease Deed', 'Bank payment receipts of security deposit and monthly rent', 'Handover notes and photos/videos of flat'],
    averageTimeframe: 'Rent Authority: 60-90 days; Civil summary suit: 6-18 months.',
    officialPortalOrHelpline: 'District Court e-Courts Portal (ecourts.gov.in)'
  },
  {
    id: 'forum-mact',
    name: 'Motor Accidents Claims Tribunal (MACT)',
    hindiName: 'मोटर दुर्घटना दावा अधिकरण',
    forumType: 'Tribunal',
    typesOfDisputes: [
      'Compensation for injury, disability, or death in road vehicle accidents',
      'Third-party claims against insurance companies and vehicle owners',
      'Hit and run compensation claims'
    ],
    pecuniaryOrTerritorialJurisdiction: 'Tribunal at District Court where accident occurred or where claimant resides. CRITICAL: 6-month limitation period under 2019 amendment!',
    howToApproach: [
      'Obtain certified copy of FIR and Detailed Accident Report (DAR) from police.',
      'File Section 166 petition before MACT within 6 months of accident.',
      'Insurance company and vehicle owner are served summons.'
    ],
    expectedDocuments: ['Police FIR & Charge Sheet', 'Detailed Accident Report (DAR)', 'Hospital discharge summary, medical bills, disability certificate', 'Income proof of victim'],
    averageTimeframe: 'Typically 1 to 2 years.',
    officialPortalOrHelpline: 'ecourts.gov.in'
  },
  {
    id: 'forum-dlsa',
    name: 'District Legal Services Authority (DLSA) / Legal Aid Clinic',
    hindiName: 'जिला विधिक सेवा प्राधिकरण (मुफ्त कानूनी सहायता)',
    forumType: 'ADR & Legal Aid',
    typesOfDisputes: [
      'All civil, matrimonial, property, criminal, and labour disputes for eligible citizens',
      'Free representation, document drafting, and court fee waiver'
    ],
    pecuniaryOrTerritorialJurisdiction: 'Located inside every District Court complex across India. High Court and Supreme Court have respective HCLSC and SCLSC.',
    howToApproach: [
      'Walk into the DLSA office at your nearest District Court or apply online at nalsa.gov.in.',
      'Submit Form-1 stating your legal problem and eligibility category (e.g., woman, senior citizen, low income, SC/ST).',
      'A panel advocate is assigned to your case free of cost.'
    ],
    expectedDocuments: ['Income certificate (if applying under income criteria)', 'Aadhaar / Voter ID', 'Grievance documents'],
    averageTimeframe: 'Advocate allotted within 3 to 7 working days.',
    officialPortalOrHelpline: 'National Legal Aid Helpline: 15100 | nalsa.gov.in'
  }
];
