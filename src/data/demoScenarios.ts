export interface DemoScenario {
  id: string;
  number: number;
  title: string;
  category: string;
  prompt: string;
  description: string;
  keyLaw: string;
  targetForum: string;
  simulatedCase?: {
    title: string;
    category: string;
    userRole: string;
    opposingParty: string;
    state: string;
    district: string;
    dateOfIncident: string;
    facts: string[];
    timeline: { id: string; date: string; event: string }[];
    evidence: { id: string; name: string; type: 'document' | 'digital' | 'financial' | 'witness'; description: string; importance: 'Crucial' | 'Supporting' | 'Secondary' }[];
  };
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'scen-1',
    number: 1,
    title: 'Online Financial UPI Fraud',
    category: 'Cybercrime',
    prompt: 'I received a call from someone claiming to be from my bank asking to verify a failed transaction. They sent a link and within minutes ₹45,000 was debited from my bank account via UPI. It happened 2 hours ago. What should I do immediately?',
    description: 'Deceptive caller lured victim into clicking a phishing link, withdrawing ₹45,000 unauthorized via UPI.',
    keyLaw: 'Information Technology Act (Sec 66D) & Bharatiya Nyaya Sanhita (Sec 318)',
    targetForum: 'National Cyber Crime Helpline (1930) & cybercrime.gov.in (Golden Hour Action)',
    simulatedCase: {
      title: 'Unauthorized UPI Debit via Phishing Call',
      category: 'Cybercrime',
      userRole: 'Victim / Complainant',
      opposingParty: 'Unknown Cyber Fraudsters & Beneficiary Account Holder',
      state: 'Maharashtra',
      district: 'Pune',
      dateOfIncident: '2026-03-01',
      facts: [
        'Received call at 11:30 AM from unknown mobile claiming to be Axis Bank fraud prevention officer.',
        'Caller sent an SMS link titled "Verify Pending Transaction".',
        'Upon clicking, two unauthorized debits of ₹25,000 and ₹20,000 occurred to a Punjab National Bank UPI VPA.',
        'Immediately called bank customer care within 40 minutes to block debit card and netbanking.'
      ],
      timeline: [
        { id: 't1', date: '2026-03-01 11:30', event: 'Received fraudulent call and SMS link' },
        { id: 't2', date: '2026-03-01 11:35', event: 'Two unauthorized debits totaling ₹45,000 occurred' },
        { id: 't3', date: '2026-03-01 12:15', event: 'Reported to Axis Bank and frozen netbanking credentials' }
      ],
      evidence: [
        { id: 'e1', name: 'Call Log & Caller ID Screenshot', type: 'digital', description: 'Shows incoming call timestamp and duration', importance: 'Crucial' },
        { id: 'e2', name: 'Bank Statement showing UTR/Transaction IDs', type: 'financial', description: 'Shows beneficiary UPI ID and debit timestamps', importance: 'Crucial' },
        { id: 'e3', name: 'SMS Phishing Link Screenshot', type: 'digital', description: 'Contains spoofed message and phishing URL', importance: 'Supporting' }
      ]
    }
  },
  {
    id: 'scen-2',
    number: 2,
    title: 'Landlord Refusing Security Deposit Refund',
    category: 'Rent/Tenancy',
    prompt: 'My landlord is refusing to return my security deposit of ₹75,000. I vacated the apartment on 31st January after serving 30 days notice as agreed. The apartment is in good condition, but he says he has to repaint the entire house at my cost.',
    description: 'Tenant completed 11-month agreement and vacated with notice; landlord arbitrarily withholds ₹75,000 deposit.',
    keyLaw: 'Transfer of Property Act (Sec 108) & State Model Tenancy Rules',
    targetForum: 'Rent Authority / Civil Court (Summary Suit) / Advocate Legal Notice',
    simulatedCase: {
      title: 'Unlawful Forfeiture of ₹75,000 Residential Security Deposit',
      category: 'Rent/Tenancy',
      userRole: 'Tenant (Lessee)',
      opposingParty: 'Landlord (R. K. Sharma)',
      state: 'Delhi',
      district: 'South Delhi',
      dateOfIncident: '2026-01-31',
      facts: [
        'Occupied 2BHK flat under registered 11-month agreement from 1 March 2025 to 31 Jan 2026.',
        'Security deposit of ₹75,000 paid via IMPS at commencement.',
        'Served formal 30-day notice of vacation on 1 January 2026.',
        'Vacated flat and handed over keys on 31 January 2026 with handover video recorded.',
        'Landlord refuses refund citing general painting costs without producing repair bills.'
      ],
      timeline: [
        { id: 't1', date: '2025-03-01', event: 'Rental agreement executed and deposit paid' },
        { id: 't2', date: '2026-01-01', event: 'Written notice of non-renewal sent via WhatsApp and email' },
        { id: 't3', date: '2026-01-31', event: 'Keys handed over and video inspection conducted' }
      ],
      evidence: [
        { id: 'e1', name: 'Registered Rent Agreement', type: 'document', description: 'Clause 6 mandates deposit refund within 7 days of vacation', importance: 'Crucial' },
        { id: 'e2', name: 'Bank Transfer Receipt (₹75,000)', type: 'financial', description: 'Proof of deposit payment into landlord account', importance: 'Crucial' },
        { id: 'e3', name: 'Handover Walkthrough Video', type: 'digital', description: 'Shows clean undamaged walls and intact electrical appliances', importance: 'Crucial' }
      ]
    }
  },
  {
    id: 'scen-3',
    number: 3,
    title: 'Unpaid Salary for 3 Months',
    category: 'Employment/Labour',
    prompt: 'My employer has not paid my monthly salary of ₹55,000 for the last three months (November, December, and January). When I ask, HR gives vague excuses about investor funding. What are my legal remedies under Indian labour law?',
    description: 'Salaried employee with documented attendance whose wages are delayed by 90+ days without lawful deduction.',
    keyLaw: 'Payment of Wages Act (Sec 15) & Code on Wages (Sec 17)',
    targetForum: 'Office of the Labour Commissioner / Payment of Wages Authority',
    simulatedCase: {
      title: 'Recovery of Unpaid Salary Arrears (₹1,65,000)',
      category: 'Employment/Labour',
      userRole: 'Employee',
      opposingParty: 'Nexus Innovations Private Limited',
      state: 'Telangana',
      district: 'Hyderabad',
      dateOfIncident: '2025-11-30',
      facts: [
        'Employed since July 2023 with monthly gross salary of ₹55,000.',
        'Performed all daily duties with approved biometric and Slack activity.',
        'Employer defaulted on salaries for Nov 2025, Dec 2025, and Jan 2026.',
        'Sent written formal grievance on 15 January 2026 with no payment received.'
      ],
      timeline: [
        { id: 't1', date: '2023-07-01', event: 'Commenced employment under written appointment letter' },
        { id: 't2', date: '2025-11-30', event: 'First wage payment default' },
        { id: 't3', date: '2026-01-15', event: 'Formal email grievance sent to Managing Director' }
      ],
      evidence: [
        { id: 'e1', name: 'Employment Contract & Salary Slips', type: 'document', description: 'Validates agreed remuneration and designation', importance: 'Crucial' },
        { id: 'e2', name: 'Bank Account Statement (6 Months)', type: 'financial', description: 'Confirms lack of salary credits after October 2025', importance: 'Crucial' },
        { id: 'e3', name: 'Biometric Attendance Records', type: 'digital', description: 'Proves regular attendance and performance of work', importance: 'Supporting' }
      ]
    }
  },
  {
    id: 'scen-4',
    number: 4,
    title: 'Defective Electronic Product & Refusal to Replace',
    category: 'Consumer Protection',
    prompt: 'I bought a laptop for ₹82,000 from an online e-commerce seller with a 1-year brand warranty. Within 3 weeks the motherboard stopped working. The authorized service centre refuses warranty repair claiming customer moisture damage, which is false.',
    description: 'Buyer purchased new laptop; hardware failure occurred within warranty period; service centre falsely denies repair.',
    keyLaw: 'Consumer Protection Act, 2019 (Sec 2(7), 35 & 69)',
    targetForum: 'District Consumer Disputes Redressal Commission / E-Daakhil Portal',
    simulatedCase: {
      title: 'Consumer Complaint for Defective Laptop & Deficiency of Warranty Service',
      category: 'Consumer Protection',
      userRole: 'Consumer / Complainant',
      opposingParty: 'Apex Retail E-Commerce Ltd & Brand Authorized Service Centre',
      state: 'Tamil Nadu',
      district: 'Chennai',
      dateOfIncident: '2026-02-10',
      facts: [
        'Purchased laptop on 15 January 2026 for ₹82,000 with Tax Invoice.',
        'On 5 February 2026, device failed to boot; no liquid spillage occurred.',
        'Deposited device with Authorized Service Centre on 8 February 2026.',
        'Service centre issued rejection report on 10 February alleging moisture without photographic evidence.'
      ],
      timeline: [
        { id: 't1', date: '2026-01-15', event: 'Purchased laptop and received warranty card' },
        { id: 't2', date: '2026-02-08', event: 'Lodged job-sheet at authorized service centre' },
        { id: 't3', date: '2026-02-10', event: 'Warranty repair rejected arbitrarily' }
      ],
      evidence: [
        { id: 'e1', name: 'Tax Invoice & Warranty Booklet', type: 'document', description: 'Proof of consumer purchase and valid 1-year warranty', importance: 'Crucial' },
        { id: 'e2', name: 'Service Centre Job-Sheet Receipt', type: 'document', description: 'Acknowledges receipt of laptop in physically clean condition', importance: 'Crucial' },
        { id: 'e3', name: 'Independent Third-Party Technician Report', type: 'document', description: 'Certifies internal manufacturer component failure', importance: 'Supporting' }
      ]
    }
  },
  {
    id: 'scen-5',
    number: 5,
    title: 'Road Accident Hit & Run / MACT Claim',
    category: 'Motor Vehicle/Accident',
    prompt: 'My brother was hit by a speeding commercial truck while riding his two-wheeler. The truck driver fled the scene. My brother suffered multiple fractures and had to undergo emergency surgery costing ₹3,50,000. Police traced the truck number from CCTV. How can we claim compensation?',
    description: 'Commercial vehicle hit two-wheeler causing severe injuries; driver identified via CCTV; substantial medical bills incurred.',
    keyLaw: 'Motor Vehicles Act, 1988 (Sec 166 & 164 as amended in 2019)',
    targetForum: 'Motor Accidents Claims Tribunal (MACT) at District Court',
    simulatedCase: {
      title: 'MACT Claim Petition for Road Traffic Accident Compensation',
      category: 'Motor Vehicle/Accident',
      userRole: 'Victim / Injured Claimant (represented by brother)',
      opposingParty: 'Truck Driver, Registered Vehicle Owner, & Insurance Company',
      state: 'Haryana',
      district: 'Gurugram',
      dateOfIncident: '2026-01-20',
      facts: [
        'Accident occurred at Rajiv Chowk intersection on 20 January 2026 at 8:30 PM.',
        'Speeding truck skipped red light and rammed into motorcycle.',
        'Police registered FIR under Section 106 & 125 BNS (formerly 279/338 IPC) using traffic CCTV.',
        'Victim admitted to ICU for 12 days; total medical bills exceed ₹3,50,000.',
        'Claimant must file MACT claim within 6-month statutory limitation period.'
      ],
      timeline: [
        { id: 't1', date: '2026-01-20', event: 'Accident occurred and victim hospitalized' },
        { id: 't2', date: '2026-01-21', event: 'Police registered FIR No. 42/2026' },
        { id: 't3', date: '2026-02-05', event: 'Police issued Detailed Accident Report (DAR)' }
      ],
      evidence: [
        { id: 'e1', name: 'Certified Copy of Police FIR & DAR', type: 'document', description: 'Confirms vehicle registration and driver culpability', importance: 'Crucial' },
        { id: 'e2', name: 'Hospital Discharge Summary & Medical Bills', type: 'financial', description: 'Itemized receipts totaling ₹3,50,000 + disability assessment', importance: 'Crucial' },
        { id: 'e3', name: 'CCTV Footage Still Extracts', type: 'digital', description: 'Shows vehicle collision and registration number', importance: 'Supporting' }
      ]
    }
  },
  {
    id: 'scen-6',
    number: 6,
    title: 'Domestic Violence & Protection Orders',
    category: 'Domestic Violence',
    prompt: 'I am facing severe verbal and physical abuse from my husband and his family. Yesterday they locked me out of the house and threatened that they will not let me see my 4-year-old child unless my parents give them money. Where can I get immediate legal protection?',
    description: 'Married woman subjected to physical violence, eviction from matrimonial home, and denial of access to minor child.',
    keyLaw: 'Protection of Women from Domestic Violence Act, 2005 (Sec 12, 18, 19, 21) & BNS (Sec 85/86)',
    targetForum: 'Court of Judicial Magistrate / Protection Officer / Women Helpline (181)',
    simulatedCase: {
      title: 'Urgent Application for Protection, Residence & Child Custody under PWDVA',
      category: 'Domestic Violence',
      userRole: 'Aggrieved Person (Wife)',
      opposingParty: 'Husband & In-laws',
      state: 'Uttar Pradesh',
      district: 'Noida',
      dateOfIncident: '2026-02-25',
      facts: [
        'Married in 2020; residing in shared matrimonial household in Noida.',
        'Faced recurring physical and verbal abuse accompanied by dowry demands.',
        'On 25 February 2026, physically pushed out of house and separated from 4-year-old son.',
        'Seeking immediate Section 18 protection order, Section 19 residence order, and Section 21 interim child custody.'
      ],
      timeline: [
        { id: 't1', date: '2020-11-18', event: 'Marriage solemnized under Hindu Marriage Act' },
        { id: 't2', date: '2026-02-25', event: 'Assault and wrongful expulsion from shared household' }
      ],
      evidence: [
        { id: 'e1', name: 'Government Hospital Medico-Legal Certificate (MLC)', type: 'document', description: 'Records contusions and physical injury examination', importance: 'Crucial' },
        { id: 'e2', name: 'Audio/Video Recordings & WhatsApp Threat Messages', type: 'digital', description: 'Verbal threats and harassment recorded', importance: 'Crucial' },
        { id: 'e3', name: 'Child Birth Certificate', type: 'document', description: 'Proves minor child parentage and custody requirement', importance: 'Supporting' }
      ]
    }
  },
  {
    id: 'scen-7',
    number: 7,
    title: 'Illegal Property Encroachment',
    category: 'Property Law',
    prompt: 'An influential neighbour has illegally started constructing a concrete wall over 400 square feet of my ancestral registered plot while I was out of town. When I confronted him, he threatened me with goons. How do I get an urgent court stay order?',
    description: 'Neighbour initiated unauthorized brick construction encroaching on registered freehold plot.',
    keyLaw: 'Specific Relief Act (Sec 38/39), CPC (Order 39 Rules 1 & 2), BNS (Sec 329)',
    targetForum: 'Civil Court (Application for Temporary Injunction) & Police Station (Criminal Trespass)',
    simulatedCase: {
      title: 'Civil Suit for Permanent Injunction & Restitution of Encroached Land',
      category: 'Property Law',
      userRole: 'Plaintiff / Absolute Owner',
      opposingParty: 'Adjoining Plot Owner (Defendant)',
      state: 'Madhya Pradesh',
      district: 'Bhopal',
      dateOfIncident: '2026-02-18',
      facts: [
        'Plaintiff holds registered Title Deed dated 2012 for Plot No. 84.',
        'Defendant owns adjoining Plot No. 85.',
        'On 18 February 2026, Defendant entered Plaintiff’s boundary and commenced illegal pillar construction.',
        'Defendant refuses to produce municipal approved plan and threatens violence.'
      ],
      timeline: [
        { id: 't1', date: '2012-04-10', event: 'Registered Sale Deed and revenue mutation recorded' },
        { id: 't2', date: '2026-02-18', event: 'Encroachment discovered upon return from travel' },
        { id: 't3', date: '2026-02-19', event: 'Police complaint of criminal trespass lodged' }
      ],
      evidence: [
        { id: 'e1', name: 'Registered Sale Deed & Revenue Khasra/Khatauni', type: 'document', description: 'Proves clear title, demarcated boundaries, and tax receipts', importance: 'Crucial' },
        { id: 'e2', name: 'Government Licensed Surveyor Demarcation Map', type: 'document', description: 'Clearly outlines 400 sq ft encroachment beyond boundary', importance: 'Crucial' },
        { id: 'e3', name: 'Date-Stamped High-Res Photographs of Illegal Construction', type: 'digital', description: 'Depicts ongoing brickwork on plaintiff property', importance: 'Supporting' }
      ]
    }
  },
  {
    id: 'scen-8',
    number: 8,
    title: 'Cyber Harassment & Morphed Photos on Social Media',
    category: 'Cybercrime',
    prompt: 'An unknown Instagram account is circulating morphed vulgar pictures of me and sending blackmail messages demanding ₹50,000, otherwise they threaten to send the photos to my college friends and family. I am terrified. What immediate steps can I take?',
    description: 'Extortionist created fake social media handles circulating fabricated sensitive imagery with monetary extortion.',
    keyLaw: 'Information Technology Act (Sec 66E, 67, 67A) & BNS (Sec 78, 308)',
    targetForum: 'Cyber Crime Police Station, cybercrime.gov.in (1930), & Platform Grievance Officer',
    simulatedCase: {
      title: 'Cyber Extortion, Impersonation & Violation of Privacy',
      category: 'Cybercrime',
      userRole: 'Victim / Complainant',
      opposingParty: 'Anonymous Perpetrator (@fake_acc_xyz)',
      state: 'West Bengal',
      district: 'Kolkata',
      dateOfIncident: '2026-02-28',
      facts: [
        'On 28 February 2026, received extortion message on Instagram Direct Message.',
        'Account shared morphed images superimposing victim’s face on inappropriate photos.',
        'Demanded ₹50,000 via Amazon gift card / UPI QR within 24 hours.',
        'Victim preserved screenshots and profile URLs before blocking.'
      ],
      timeline: [
        { id: 't1', date: '2026-02-28 14:00', event: 'Extortion DM received with morphed image attachments' },
        { id: 't2', date: '2026-02-28 16:30', event: 'Preserved screenshots with Section 63 BSA compliance' }
      ],
      evidence: [
        { id: 'e1', name: 'Screenshots of Direct Messages & Extortion Demands', type: 'digital', description: 'Shows handle, threat text, and timestamps', importance: 'Crucial' },
        { id: 'e2', name: 'Instagram Profile URL & Account ID', type: 'digital', description: 'Required by Cyber Police for Meta IP log preservation order', importance: 'Crucial' }
      ]
    }
  },
  {
    id: 'scen-9',
    number: 9,
    title: 'Legal Notice Received for Alleged Contract Breach',
    category: 'Contract Disputes',
    prompt: 'I received a registered legal notice from an advocate representing an agency I freelance for. They claim I breached a non-compete clause by working for another client and demand ₹5,00,000 in liquidated damages within 15 days or face civil and criminal litigation. What should I do?',
    description: 'Freelancer received intimidating legal notice alleging non-compete violation; non-compete post-termination is generally void under Section 27 Indian Contract Act.',
    keyLaw: 'Indian Contract Act, 1872 (Sec 27 - Agreement in restraint of trade is void)',
    targetForum: 'Advocate Consultation & Formal Reply Notice (Within 15 days)',
    simulatedCase: {
      title: 'Defense against Unenforceable Post-Termination Non-Compete Claim',
      category: 'Contract Disputes',
      userRole: 'Recipient / Freelance Consultant',
      opposingParty: 'Digital Growth Agency LLP & their Advocate',
      state: 'Karnataka',
      district: 'Bengaluru',
      dateOfIncident: '2026-02-15',
      facts: [
        'Freelance agreement terminated mutually on 30 November 2025.',
        'Legal notice served on 15 February 2026 demanding ₹5 Lakhs.',
        'Clause in dispute is a post-termination non-compete, which Indian courts (Percept D’Mark v. Zaheer Khan) have consistently held void under Section 27 Contract Act.',
        'Must prepare a robust point-by-point reply notice denying liability.'
      ],
      timeline: [
        { id: 't1', date: '2024-05-01', event: 'Signed consultancy agreement' },
        { id: 't2', date: '2025-11-30', event: 'Consultancy ended amicably' },
        { id: 't3', date: '2026-02-15', event: 'Received legal demand notice by speed post' }
      ],
      evidence: [
        { id: 'e1', name: 'Original Consultancy Agreement', type: 'document', description: 'Contains restrictive covenants and scope of work', importance: 'Crucial' },
        { id: 'e2', name: 'Legal Notice & Postal Envelope with Tracking Details', type: 'document', description: 'Proves exact date of delivery to calculate 15-day reply window', importance: 'Crucial' },
        { id: 'e3', name: 'Mutual Termination Email Confirmation', type: 'digital', description: 'Confirms complete handover and clearance of past dues', importance: 'Supporting' }
      ]
    }
  },
  {
    id: 'scen-10',
    number: 10,
    title: 'Police Station Refusing to Register FIR',
    category: 'Criminal Law',
    prompt: 'My motorcycle was stolen from in front of my office. When I went to the local police station to file an FIR, the Sub-Inspector refused to write an FIR. Instead, he gave me a simple stamp on an informal paper and told me to just declare it as lost property. What are my legal rights?',
    description: 'Police officer refuses to register mandatory FIR for motor vehicle theft (cognizable offence under Section 303 BNS).',
    keyLaw: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (Sec 173 & Sec 175(3)/(4))',
    targetForum: 'Superintendent of Police (SP) by Registered Post & Judicial Magistrate under 175(4) BNSS',
    simulatedCase: {
      title: 'Statutory Remedy against Police Refusal to Register FIR for Cognizable Theft',
      category: 'Criminal Law',
      userRole: 'Informant / Complainant',
      opposingParty: 'Station House Officer (Local PS) & Unknown Accused',
      state: 'Bihar',
      district: 'Patna',
      dateOfIncident: '2026-02-12',
      facts: [
        'Motorcycle (Hero Splendor, Reg No. BR-01-XXXX) stolen between 2 PM and 5 PM on 12 Feb 2026.',
        'Informant approached jurisdictional police station within 1 hour.',
        'Duty officer refused to lodge FIR under Sec 173 BNSS; gave informal "missing diary" slip.',
        'Lalita Kumari v. Govt of UP mandates FIR registration for cognizable crimes.',
        'Informant entitled to invoke Section 175(3) BNSS by sending written complaint to Senior SP.'
      ],
      timeline: [
        { id: 't1', date: '2026-02-12 17:00', event: 'Discovered motorcycle stolen' },
        { id: 't2', date: '2026-02-12 18:00', event: 'Police station refused FIR registration' }
      ],
      evidence: [
        { id: 'e1', name: 'Vehicle Registration Certificate (RC) & Insurance Policy', type: 'document', description: 'Proves lawful ownership and active insurance cover', importance: 'Crucial' },
        { id: 'e2', name: 'Informal Police "Missing" Stamped Slip', type: 'document', description: 'Documentary evidence showing police evasion of FIR duty', importance: 'Crucial' },
        { id: 'e3', name: 'CCTV Camera Footage from Adjacent Shop', type: 'digital', description: 'Shows motorcycle being unlocked and driven away by thief', importance: 'Supporting' }
      ]
    }
  }
];
