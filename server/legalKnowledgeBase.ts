export interface LegalSourceItem {
  id: string;
  act: string;
  section?: string;
  chapter?: string;
  title: string;
  category: string;
  currentStatus: 'Current Law' | 'Historical Reference' | 'Repealed' | 'Model Law';
  oldEquivalent?: string;
  summary: string;
  simpleExplanation: string;
  fullProvisionsSummary: string;
  keyElements: string[];
  remediesOrPenalties: string;
  relevantForums: string[];
  limitationPeriod?: string;
  sourceUrl: string;
  officialSourceType: 'Central Act' | 'Criminal Sanhita' | 'Statutory Regulation' | 'Constitution of India' | 'State Law';
  verifiedDate: string;
  confidence: 'Verified' | 'Likely Relevant' | 'Requires Verification';
}

export const LEGAL_CATEGORIES = [
  'Criminal Law',
  'Civil Disputes',
  'Family Law',
  'Property Law',
  'Consumer Protection',
  'Employment/Labour',
  'Cybercrime',
  'Banking/Financial Fraud',
  'Motor Vehicle/Accident',
  'Rent/Tenancy',
  'Contract Disputes',
  'Intellectual Property',
  'Constitutional Rights',
  'Domestic Violence',
  'Matrimonial Disputes',
  'Child/Family Matters',
  'Defamation',
  'Personal Injury',
  'Environmental Issues',
  'Government Services',
  'Senior Citizen Issues',
  'Other'
] as const;

export const INDIAN_LEGAL_DATABASE: LegalSourceItem[] = [
  // --- BNS / CRIMINAL LAW ---
  {
    id: 'bns-318',
    act: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    section: 'Section 318',
    chapter: 'Chapter XVII - Offences Against Property',
    title: 'Cheating and Dishonestly Inducing Delivery of Property',
    category: 'Criminal Law',
    currentStatus: 'Current Law',
    oldEquivalent: 'Replaces Section 415 & Section 420 of the Indian Penal Code, 1860 (IPC)',
    summary: 'Defines cheating where someone deceives another person to fraudulently deliver property or alter valuable security.',
    simpleExplanation: 'When someone intentionally deceives or tricks you with fraudulent promises to take your money, goods, or property.',
    fullProvisionsSummary: 'Under Section 318(4) of BNS, whoever cheats and thereby dishonestly induces the person deceived to deliver any property, shall be punished with imprisonment for a term which may extend to seven years and shall also be liable to fine.',
    keyElements: ['Deception of any person', 'Fraudulent or dishonest inducement to deliver property', 'Intentional concealment of facts from inception'],
    remediesOrPenalties: 'Cognizable & Non-Bailable offence. Imprisonment up to 7 years + fine.',
    relevantForums: ['Local Police Station (FIR under Section 173 BNSS)', 'Judicial Magistrate Court (Complaint under Section 175(3) BNSS)'],
    limitationPeriod: 'Generally 3 years under Section 468 CrPC / 514 BNSS for offences up to 3 years, but for offences punishable up to 7 years there is generally no strict bar of limitation, though prompt filing is essential to avoid delay suspicion.',
    sourceUrl: 'https://indiacode.nic.in/handle/123456789/21808',
    officialSourceType: 'Criminal Sanhita',
    verifiedDate: '01/07/2024',
    confidence: 'Verified'
  },
  {
    id: 'bns-303',
    act: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    section: 'Section 303',
    chapter: 'Chapter XVII - Offences Against Property',
    title: 'Theft',
    category: 'Criminal Law',
    currentStatus: 'Current Law',
    oldEquivalent: 'Replaces Section 378 & Section 379 of the Indian Penal Code, 1860',
    summary: 'Whoever intending to take dishonestly any movable property out of the possession of any person without that persons consent moves that property in order to such taking commits theft.',
    simpleExplanation: 'Taking someone else’s movable property dishonestly without their permission.',
    fullProvisionsSummary: 'Punishable with imprisonment of either description for a term which may extend to three years, or with fine, or with both. In case of theft of property value less than Rs 5,000 where offender is first time, community service may be ordered under BNS.',
    keyElements: ['Dishonest intention', 'Movable property', 'Taken out of possession without consent', 'Moving of the property'],
    remediesOrPenalties: 'Cognizable offence. Imprisonment up to 3 years or fine or both.',
    relevantForums: ['Local Police Station', 'Court of Judicial Magistrate'],
    sourceUrl: 'https://indiacode.nic.in/handle/123456789/21808',
    officialSourceType: 'Criminal Sanhita',
    verifiedDate: '01/07/2024',
    confidence: 'Verified'
  },
  {
    id: 'bns-351',
    act: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    section: 'Section 351',
    chapter: 'Chapter XVIII - Offences of Criminal Intimidation, Insult and Annoyance',
    title: 'Criminal Intimidation',
    category: 'Criminal Law',
    currentStatus: 'Current Law',
    oldEquivalent: 'Replaces Section 503 & Section 506 of the Indian Penal Code, 1860',
    summary: 'Threatening another with injury to their person, reputation or property, or to the person or reputation of anyone in whom that person is interested.',
    simpleExplanation: 'Threatening you with physical harm, property damage, or ruining your reputation to force you to do something or stop doing something you have a right to do.',
    fullProvisionsSummary: 'Section 351(2) BNS provides imprisonment up to two years or fine or both; if threat is to cause death or grievous hurt or destruction of property by fire, imprisonment may extend to seven years.',
    keyElements: ['Threat of injury to person, reputation, or property', 'Intent to cause alarm or compel an act contrary to law'],
    remediesOrPenalties: 'Up to 2 years imprisonment or fine; up to 7 years if threat to life.',
    relevantForums: ['Police Station (Non-Cognizable Report or FIR depending on threat gravity)', 'Judicial Magistrate'],
    sourceUrl: 'https://indiacode.nic.in/handle/123456789/21808',
    officialSourceType: 'Criminal Sanhita',
    verifiedDate: '01/07/2024',
    confidence: 'Verified'
  },
  {
    id: 'bns-356',
    act: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    section: 'Section 356',
    chapter: 'Chapter XIX - Defamation',
    title: 'Defamation',
    category: 'Defamation',
    currentStatus: 'Current Law',
    oldEquivalent: 'Replaces Section 499 & Section 500 of the Indian Penal Code, 1860',
    summary: 'Making or publishing any imputation concerning any person intending to harm the reputation of such person.',
    simpleExplanation: 'Publicly saying, writing, or posting false statements with intent to damage your dignity, good name, or reputation.',
    fullProvisionsSummary: 'Defamation under BNS includes exceptions such as imputation of truth for public good. Punishment is simple imprisonment up to two years, or fine, or both, or community service.',
    keyElements: ['Making or publishing an imputation', 'Concerning the complainant', 'Intending or knowing it will harm reputation'],
    remediesOrPenalties: 'Simple imprisonment up to 2 years, or fine, or both, or community service.',
    relevantForums: ['Judicial Magistrate Court (Private Criminal Complaint under Section 223 BNSS)', 'Civil Court for Damages / Defamation Suit'],
    limitationPeriod: '3 years from publication under Limitation Act (Schedule Article 75 / 76).',
    sourceUrl: 'https://indiacode.nic.in/handle/123456789/21808',
    officialSourceType: 'Criminal Sanhita',
    verifiedDate: '01/07/2024',
    confidence: 'Verified'
  },
  {
    id: 'bns-78',
    act: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
    section: 'Section 78',
    chapter: 'Chapter V - Offences Against Women and Children',
    title: 'Stalking and Cyber-Stalking',
    category: 'Cybercrime',
    currentStatus: 'Current Law',
    oldEquivalent: 'Replaces Section 354D of the Indian Penal Code, 1860',
    summary: 'Following a woman, contacting or attempting to contact her despite a clear indication of disinterest, or monitoring her use of the internet, email, or any other electronic communication.',
    simpleExplanation: 'Repeatedly following, harassing, or monitoring a woman’s online activity, messages, or movements against her wishes.',
    fullProvisionsSummary: 'First conviction carries imprisonment up to three years and fine (Bailable); second or subsequent conviction carries imprisonment up to five years and fine (Non-bailable).',
    keyElements: ['Unwanted following or contacting', 'Monitoring electronic communication', 'Absence of legal necessity'],
    remediesOrPenalties: 'Imprisonment up to 3 years + fine (1st offence); up to 5 years (subsequent).',
    relevantForums: ['Local Police Station / Women Police Station', 'Cyber Crime Portal (cybercrime.gov.in / 1930)'],
    sourceUrl: 'https://indiacode.nic.in/handle/123456789/21808',
    officialSourceType: 'Criminal Sanhita',
    verifiedDate: '01/07/2024',
    confidence: 'Verified'
  },

  // --- BNSS / CRIMINAL PROCEDURE ---
  {
    id: 'bnss-173',
    act: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    section: 'Section 173',
    chapter: 'Chapter XIII - Information to the Police and Their Powers to Investigate',
    title: 'Information in Cognizable Cases (Registration of FIR & Zero FIR)',
    category: 'Criminal Law',
    currentStatus: 'Current Law',
    oldEquivalent: 'Replaces Section 154 of the Code of Criminal Procedure, 1973 (CrPC)',
    summary: 'Mandates registration of First Information Report (FIR) irrespective of territorial jurisdiction (Zero FIR). Allows electronic submission (e-FIR) provided signed within 3 days.',
    simpleExplanation: 'The law that requires police to write down and officially register your complaint when a serious (cognizable) crime has occurred, even if it took place outside their police station limits (Zero FIR).',
    fullProvisionsSummary: 'Under Section 173(1) BNSS, every information relating to a cognizable offence shall be recorded in writing or electronically. A copy of the FIR must be given immediately free of cost to the informant.',
    keyElements: ['Mandatory FIR for cognizable crimes', 'Statutory right to a free copy of the FIR', 'Recognition of Zero FIR and e-FIR'],
    remediesOrPenalties: 'Officer who fails to record FIR can face disciplinary action and prosecution under Section 199 BNS (old 166A IPC).',
    relevantForums: ['Any Police Station (Zero FIR must be forwarded to jurisdictional station)', 'SP / Commissioner of Police'],
    sourceUrl: 'https://indiacode.nic.in/handle/123456789/21809',
    officialSourceType: 'Criminal Sanhita',
    verifiedDate: '01/07/2024',
    confidence: 'Verified'
  },
  {
    id: 'bnss-175',
    act: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    section: 'Section 175(3) & 175(4)',
    chapter: 'Chapter XIII - Investigation',
    title: 'Remedy When Police Refuse to Register FIR',
    category: 'Criminal Law',
    currentStatus: 'Current Law',
    oldEquivalent: 'Replaces Section 154(3) and Section 156(3) of the CrPC, 1973',
    summary: 'Procedure when an officer in charge of a police station refuses to record information: Informant may send substance of info to Superintendent of Police (SP). If still unresolved, application to Magistrate.',
    simpleExplanation: 'What you can legally do if the local police station refuses to file your FIR: Step 1: Send registered complaint to the Superintendent of Police (SP). Step 2: File an application before the Judicial Magistrate.',
    fullProvisionsSummary: 'Under Section 175(3) BNSS, send written complaint by post to the SP. If the SP does not direct investigation, apply to the Magistrate under Section 175(4) BNSS accompanied by an affidavit stating compliance with Section 175(3).',
    keyElements: ['Initial complaint to SHO', 'Written representation to SP/DCP', 'Magistrate application supported by affidavit'],
    remediesOrPenalties: 'Magistrate can direct police to register FIR and submit investigation report.',
    relevantForums: ['Office of the Superintendent of Police (SP/DCP)', 'Court of Judicial Magistrate First Class / Metropolitan Magistrate'],
    sourceUrl: 'https://indiacode.nic.in/handle/123456789/21809',
    officialSourceType: 'Criminal Sanhita',
    verifiedDate: '01/07/2024',
    confidence: 'Verified'
  },
  {
    id: 'bnss-482',
    act: 'Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)',
    section: 'Section 482',
    chapter: 'Chapter XXXV - Provisions as to Bail and Bonds',
    title: 'Anticipatory Bail (Direction for Grant of Bail to Person Apprehending Arrest)',
    category: 'Criminal Law',
    currentStatus: 'Current Law',
    oldEquivalent: 'Replaces Section 438 of the Code of Criminal Procedure, 1973 (CrPC)',
    summary: 'When any person has reason to believe that they may be arrested on accusation of having committed a non-bailable offence, they may apply to the High Court or Sessions Court for pre-arrest bail.',
    simpleExplanation: 'Protection from the court ensuring you are not arrested and jailed if a false or motivated criminal complaint is filed against you.',
    fullProvisionsSummary: 'Court considers nature and gravity of accusation, antecedents of applicant, possibility of fleeing, and whether accusation made to humiliate.',
    keyElements: ['Apprehension of arrest in non-bailable offence', 'Application before Sessions Court or High Court', 'Conditions regarding cooperation with investigation'],
    remediesOrPenalties: 'Bail granted in the event of arrest.',
    relevantForums: ['Sessions Court', 'High Court of the State'],
    sourceUrl: 'https://indiacode.nic.in/handle/123456789/21809',
    officialSourceType: 'Criminal Sanhita',
    verifiedDate: '01/07/2024',
    confidence: 'Verified'
  },

  // --- BSA / EVIDENCE LAW ---
  {
    id: 'bsa-61-63',
    act: 'Bharatiya Sakshya Adhiniyam, 2023 (BSA)',
    section: 'Section 61 & Section 63',
    chapter: 'Chapter V - Of Documentary Evidence',
    title: 'Admissibility of Electronic Records & Digital Evidence',
    category: 'Cybercrime',
    currentStatus: 'Current Law',
    oldEquivalent: 'Replaces Section 65A & Section 65B of the Indian Evidence Act, 1872',
    summary: 'Governs admissibility of electronic records such as emails, WhatsApp messages, digital photographs, audio recordings, and CCTV footage in court.',
    simpleExplanation: 'How digital proofs like WhatsApp chats, emails, phone recordings, and photos can be legally accepted as valid proof in an Indian court.',
    fullProvisionsSummary: 'Under Section 63 BSA, electronic records require an accompanying certificate signed by the person managing the device or lawful authority at the time the record was created or extracted.',
    keyElements: ['Certificate requirement for secondary electronic evidence', 'Hash value preservation', 'Custody chain verification'],
    remediesOrPenalties: 'Makes digital records legally admissible as substantive evidence.',
    relevantForums: ['All Indian Civil, Criminal, Family, and Consumer Courts'],
    sourceUrl: 'https://indiacode.nic.in/handle/123456789/21810',
    officialSourceType: 'Criminal Sanhita',
    verifiedDate: '01/07/2024',
    confidence: 'Verified'
  },

  // --- CONSUMER PROTECTION ---
  {
    id: 'cpa-2-35',
    act: 'Consumer Protection Act, 2019',
    section: 'Section 2(7), Section 35 & Section 69',
    chapter: 'Chapter IV - Consumer Disputes Redressal Commission',
    title: 'Consumer Complaint for Defective Goods or Deficiency in Service',
    category: 'Consumer Protection',
    currentStatus: 'Current Law',
    oldEquivalent: 'Replaced Consumer Protection Act, 1986',
    summary: 'Allows any consumer who bought goods or hired services for consideration to file a complaint against defective products, unfair trade practices, or deficient service.',
    simpleExplanation: 'If you paid for a product or service (like electronics, flight tickets, medical care, builders, e-commerce) and received defective goods or poor service, you can claim refund and compensation.',
    fullProvisionsSummary: 'Complaints can be filed online via E-Daakhil. Pecuniary jurisdiction: District Commission handles claims up to Rs 50 Lakhs; State Commission handles claims from Rs 50 Lakhs to Rs 2 Crores; NCDRC handles claims exceeding Rs 2 Crores.',
    keyElements: ['Purchased goods or services for consideration (not for resale/commercial purpose)', 'Deficiency in service or defect in goods', 'Written complaint with invoice proof'],
    remediesOrPenalties: 'Replacement of goods, refund of price paid, compensation for mental agony and loss, punitive damages.',
    relevantForums: ['District Consumer Disputes Redressal Commission', 'Online E-Daakhil Portal (edaakhil.nic.in)', 'National Consumer Helpline (1915)'],
    limitationPeriod: '2 years from the date on which the cause of action arose (Section 69 CPA 2019).',
    sourceUrl: 'https://consumeraffairs.nic.in/acts-and-rules/consumer-protection',
    officialSourceType: 'Central Act',
    verifiedDate: '15/01/2025',
    confidence: 'Verified'
  },

  // --- CYBERCRIME & IT ACT ---
  {
    id: 'it-66d',
    act: 'Information Technology Act, 2000',
    section: 'Section 66D',
    chapter: 'Chapter XI - Offences',
    title: 'Punishment for Cheating by Personation by using Computer Resource',
    category: 'Cybercrime',
    currentStatus: 'Current Law',
    summary: 'Punishes anyone who by means of any communication device or computer resource cheats by personation (e.g. fake bank calls, phishing, fake UPI QR codes, lottery scams).',
    simpleExplanation: 'When an online scammer pretends to be someone else (like your bank manager, customer support, or official) over WhatsApp, call, or internet to steal your money.',
    fullProvisionsSummary: 'Whoever by means of any communication device or computer resource cheats by personation, shall be punished with imprisonment of either description for a term which may extend to three years and shall also be liable to fine which may extend to one lakh rupees.',
    keyElements: ['Use of computer resource or mobile device', 'Cheating by pretending to be another entity', 'Inducement causing financial or other loss'],
    remediesOrPenalties: 'Cognizable offence. Imprisonment up to 3 years and fine up to Rs 1 Lakh.',
    relevantForums: ['National Cyber Crime Reporting Portal (cybercrime.gov.in / Helpline 1930)', 'Cyber Crime Police Station'],
    limitationPeriod: 'Immediate reporting within 2 to 24 hours ("Golden Hour") is critical to freeze fraudulent funds in bank accounts.',
    sourceUrl: 'https://www.meity.gov.in/content/information-technology-act-2000',
    officialSourceType: 'Central Act',
    verifiedDate: '10/01/2025',
    confidence: 'Verified'
  },
  {
    id: 'it-66e-67',
    act: 'Information Technology Act, 2000',
    section: 'Section 66E & Section 67',
    chapter: 'Chapter XI - Offences',
    title: 'Violation of Privacy & Transmitting Obscene Material',
    category: 'Cybercrime',
    currentStatus: 'Current Law',
    summary: 'Prohibits capturing, publishing or transmitting images of private area of any person without consent, and publishing or transmitting obscene material in electronic form.',
    simpleExplanation: 'Illegal taking, sharing, morphing, or threatening to circulate private photos, videos, or intimate content online without consent.',
    fullProvisionsSummary: 'Section 66E provides imprisonment up to 3 years or fine up to Rs 2 Lakhs. Section 67 provides imprisonment up to 3 years (first conviction) and up to 5 years (subsequent).',
    keyElements: ['Intentional capture or publication without consent', 'Transmission over internet/social media', 'Infringement of privacy'],
    remediesOrPenalties: 'Imprisonment up to 3 to 5 years + fine. Immediate takedown orders under IT Rules 2021.',
    relevantForums: ['Cyber Crime Police Station', 'National Cyber Crime Portal (cybercrime.gov.in)', 'Social Media Grievance Officer'],
    sourceUrl: 'https://www.meity.gov.in/content/information-technology-act-2000',
    officialSourceType: 'Central Act',
    verifiedDate: '10/01/2025',
    confidence: 'Verified'
  },

  // --- RENT & TENANCY ---
  {
    id: 'tenancy-sec-deposit',
    act: 'Transfer of Property Act, 1882 & Model Tenancy Act, 2021',
    section: 'Section 106 & Section 108 TPA / Model Tenancy Act Sec 11',
    chapter: 'Leases of Immovable Property',
    title: 'Return of Security Deposit and Tenancy Obligations',
    category: 'Rent/Tenancy',
    currentStatus: 'Current Law',
    summary: 'Governs rights and obligations of lessor (landlord) and lessee (tenant). Security deposit must be refunded upon vacation after reasonable deductions for actual damages.',
    simpleExplanation: 'Your landlord cannot arbitrarily withhold or refuse to return your security deposit. They must refund it when you vacate and can only deduct documented damages or legitimate pending utility dues.',
    fullProvisionsSummary: 'Under Model Tenancy Act (adopted by several states), security deposit for residential premises is generally capped at two months rent and must be refunded upon handing over vacant possession. Arbitrary forfeiture is illegal.',
    keyElements: ['Valid tenancy agreement / rent receipts', 'Proof of deposit payment', 'Handover of vacant possession', 'Notice of vacation as per agreement terms'],
    remediesOrPenalties: 'Recovery suit in Civil Court, Complaint before Rent Authority / Rent Tribunal (where state rent law applies), or Consumer Commission (if service deficiency applies).',
    relevantForums: ['Rent Authority / Rent Court (under State Tenancy Act)', 'Civil Court (Summary Suit under Order XXXVII CPC)', 'Legal Notice through Advocate'],
    limitationPeriod: '3 years from the date of handover of vacant possession / refusal to return deposit (Article 22/55 Limitation Act).',
    sourceUrl: 'https://mohua.gov.in/upload/uploadfiles/files/Model_Tenancy_Act_English.pdf',
    officialSourceType: 'Central Act',
    verifiedDate: '01/01/2025',
    confidence: 'Verified'
  },

  // --- EMPLOYMENT & LABOUR ---
  {
    id: 'labour-unpaid-salary',
    act: 'Payment of Wages Act, 1936 & Code on Wages, 2019',
    section: 'Section 15 Payment of Wages Act / Section 17 & 45 Code on Wages',
    chapter: 'Claims arising out of deductions from wages or delay in payment',
    title: 'Recovery of Unpaid Wages, Salary, and Final Settlement',
    category: 'Employment/Labour',
    currentStatus: 'Current Law',
    summary: 'Employer must pay wages within 7 to 10 days of wage period. Unlawful withholding or failure to pay earned salary entitles employee to claim payment plus compensation.',
    simpleExplanation: 'Your employer is legally obligated to pay your earned salary on time. They cannot delay or withhold your salary or full-and-final settlement without legal justification.',
    fullProvisionsSummary: 'Under Section 15 of Payment of Wages Act, employee or registered trade union can file a claim before the Authority appointed under the Act. Authority may direct payment of wages along with compensation up to ten times the amount deducted.',
    keyElements: ['Employer-employee relationship', 'Proof of attendance and work performed', 'Salary slips, offer letter, or bank credit records', 'Formal written demand'],
    remediesOrPenalties: 'Order for payment of unpaid wages + compensation up to 10 times the unpaid amount. Labour Commissioner conciliation.',
    relevantForums: ['Office of the Labour Commissioner / Authority under Payment of Wages Act', 'Labour Court / Industrial Tribunal', 'Civil Court for Summary Suit (for managerial employees excluded from definition of workman)'],
    limitationPeriod: '12 months under Section 15(2) Payment of Wages Act (extendable on sufficient cause); 3 years for civil recovery suit.',
    sourceUrl: 'https://labour.gov.in/sites/default/files/the_code_on_wages_2019_no._29_of_2019.pdf',
    officialSourceType: 'Central Act',
    verifiedDate: '12/01/2025',
    confidence: 'Verified'
  },

  // --- BANKING & CHEQUE DISHONOUR ---
  {
    id: 'ni-138',
    act: 'Negotiable Instruments Act, 1881',
    section: 'Section 138 & Section 142',
    chapter: 'Chapter XVII - Of Penalties in case of Dishonour of Certain Cheques',
    title: 'Dishonour of Cheque for Insufficiency of Funds (Cheque Bounce)',
    category: 'Banking/Financial Fraud',
    currentStatus: 'Current Law',
    summary: 'Where a cheque is returned by bank unpaid due to insufficiency of funds or exceeding arrangement, drawer is deemed to have committed an offence.',
    simpleExplanation: 'If someone gave you a cheque to repay a debt and it bounced due to insufficient balance, you can send a legal notice and file a criminal complaint if they don’t pay within 15 days.',
    fullProvisionsSummary: 'Strict mandatory procedure: (1) Cheque must be presented within validity (3 months). (2) Statutory demand notice in writing must be sent to drawer within 30 days of receiving return memo from bank. (3) Drawer has 15 days from receipt of notice to make payment. (4) If unpaid, complaint must be filed in Magistrate court within 30 days thereafter.',
    keyElements: ['Cheque issued for discharge of legally enforceable debt', 'Dishonour memo from bank', 'Statutory 30-day legal notice sent via speed post', 'Failure to pay within 15 days of notice receipt'],
    remediesOrPenalties: 'Imprisonment up to two years, or fine up to twice the amount of the cheque, or both. Interim compensation up to 20% under Section 143A.',
    relevantForums: ['Court of Metropolitan Magistrate / Judicial Magistrate First Class (having territorial jurisdiction where payee bank is located)'],
    limitationPeriod: 'Strict 30 days from expiry of 15 days notice period. Delay can only be condoned under Section 142(1)(b) on sufficient cause.',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2296',
    officialSourceType: 'Central Act',
    verifiedDate: '05/01/2025',
    confidence: 'Verified'
  },

  // --- DOMESTIC VIOLENCE ---
  {
    id: 'pwdva-2005',
    act: 'Protection of Women from Domestic Violence Act, 2005 (PWDVA)',
    section: 'Section 12, 18, 19, 20, 21 & 22',
    chapter: 'Powers and Duties of Protection Officers and Service Providers',
    title: 'Reliefs Against Domestic Violence (Protection, Residence, Monetary Orders)',
    category: 'Domestic Violence',
    currentStatus: 'Current Law',
    summary: 'Provides civil and quasi-criminal protection to women who are or have been in a domestic relationship subjected to physical, sexual, verbal, emotional, or economic abuse.',
    simpleExplanation: 'A woman facing physical beating, verbal abuse, threats, dowry harassment, or economic starvation in a shared household can get immediate court protection, right to stay in the house, and financial maintenance.',
    fullProvisionsSummary: 'Aggrieved woman or Protection Officer can file Form DIR before Magistrate. Reliefs include: Section 18 Protection Orders (restraining respondent from acts of violence or contacting victim), Section 19 Residence Orders (restraining eviction from shared household), Section 20 Monetary Relief (medical expenses and maintenance), Section 21 Custody of children, Section 22 Compensation.',
    keyElements: ['Domestic relationship & shared household', 'Occurrence of domestic abuse (physical, emotional, or economic)', 'Application before Magistrate under Section 12'],
    remediesOrPenalties: 'Magistrate can grant ex-parte interim orders within days. Breach of protection order is a cognizable criminal offence punishable under Section 31 with up to 1 year imprisonment.',
    relevantForums: ['Court of Judicial Magistrate First Class / Metropolitan Magistrate', 'Protection Officer / One Stop Centre (Sakhi Centre)', 'Women Helpline 181'],
    limitationPeriod: 'Supreme Court held in Kamlesh Devi v. Jaipal that petition under Section 12 PWDVA does not have a strict one-year bar, but continuous cause of action must exist.',
    sourceUrl: 'https://wcd.nic.in/act/protection-women-domestic-violence-act-2005',
    officialSourceType: 'Central Act',
    verifiedDate: '15/01/2025',
    confidence: 'Verified'
  },

  // --- MOTOR ACCIDENT CLAIMS ---
  {
    id: 'mva-166',
    act: 'Motor Vehicles Act, 1988 (as amended by MV Amendment Act 2019)',
    section: 'Section 166 & Section 164',
    chapter: 'Chapter XII - Claims Tribunals',
    title: 'Compensation Claims for Road Traffic Accidents',
    category: 'Motor Vehicle/Accident',
    currentStatus: 'Current Law',
    summary: 'Provides mechanism for compensation for death, grievous injury, or damage to property arising out of the use of motor vehicles.',
    simpleExplanation: 'If you or your family member suffered injury or death in a road accident involving a motor vehicle, you can claim monetary compensation from the vehicle owner and insurance company.',
    fullProvisionsSummary: 'Under Section 166, an application for compensation can be made by the injured person or legal representatives of deceased before the Motor Accidents Claims Tribunal (MACT). Crucial update: 2019 Amendment introduced Section 166(3) requiring claims to be made within 6 months of the accident.',
    keyElements: ['Use of a motor vehicle', 'Accident causing injury, death, or property damage', 'FIR / Detailed Accident Report (DAR) filed by police', 'Medical records and disability certificates'],
    remediesOrPenalties: 'Financial compensation determined based on age, income multiplier, medical expenses, pain & suffering, and loss of future earnings.',
    relevantForums: ['Motor Accidents Claims Tribunal (MACT) at District Court'],
    limitationPeriod: '6 months from the date of occurrence of the accident (Section 166(3) inserted in 2019 amendment). Prompt filing is imperative.',
    sourceUrl: 'https://morth.nic.in/motor-vehicles-act-1988',
    officialSourceType: 'Central Act',
    verifiedDate: '10/01/2025',
    confidence: 'Verified'
  },

  // --- LEGAL AID ---
  {
    id: 'nalsa-12',
    act: 'Legal Services Authorities Act, 1987',
    section: 'Section 12 & Section 13',
    chapter: 'Chapter VI - Entitlement to Legal Services',
    title: 'Eligibility for Free Legal Aid (NALSA / DLSA / SLSA)',
    category: 'Constitutional Rights',
    currentStatus: 'Current Law',
    summary: 'Guarantees free and competent legal services to weaker sections of society to ensure opportunities for securing justice are not denied to any citizen by reason of economic or other disabilities.',
    simpleExplanation: 'You can get a free government advocate, free drafting of legal documents, and exemption from court fees if you belong to eligible categories like women, children, SC/ST, or have low income.',
    fullProvisionsSummary: 'Eligible categories under Section 12: (a) Women and children, (b) Members of Scheduled Castes or Scheduled Tribes, (c) Industrial workmen, (d) Persons with disability, (e) Victims of trafficking or beggar, (f) Victims of mass disaster or ethnic violence, (g) Persons in police custody, (h) Persons whose annual income is less than threshold fixed by state government (usually Rs 1,50,000 to Rs 3,00,000).',
    keyElements: ['Membership in designated vulnerable class OR income below state threshold', 'Prima facie genuine legal grievance', 'Application to District or Taluka Legal Services Committee'],
    remediesOrPenalties: 'Free advocate assigned, court fees covered, certified copies and process fees paid by government.',
    relevantForums: ['National Legal Services Authority (NALSA - nalsa.gov.in)', 'District Legal Services Authority (DLSA) at every District Court', 'National Legal Aid Helpline 15100'],
    sourceUrl: 'https://nalsa.gov.in/acts-rules/the-legal-services-authorities-act-1987',
    officialSourceType: 'Central Act',
    verifiedDate: '20/01/2025',
    confidence: 'Verified'
  },

  // --- PROPERTY & ENCROACHMENT ---
  {
    id: 'property-injunction',
    act: 'Specific Relief Act, 1963 & Code of Civil Procedure, 1908 (CPC)',
    section: 'Section 38 & 39 SRA / Order XXXIX Rules 1 & 2 CPC',
    chapter: 'Injunctions and Preventive Relief',
    title: 'Protection Against Illegal Dispossession, Encroachment & Injunction',
    category: 'Property Law',
    currentStatus: 'Current Law',
    summary: 'Remedies for unlawful encroachment, interference with peaceful possession, or threat of illegal dispossession from immovable property.',
    simpleExplanation: 'If someone is trying to grab your land, build on your boundary wall, or throw you out of your property by force, you can get an urgent court "stay order" (temporary injunction) stopping them.',
    fullProvisionsSummary: 'Under Order XXXIX Rules 1 & 2 CPC, plaintiff can apply for temporary injunction demonstrating: (1) Prima facie case, (2) Balance of convenience, and (3) Irreparable injury if stay is not granted. Under Section 6 Specific Relief Act, a person dispossessed without consent can recover possession within 6 months without proving title.',
    keyElements: ['Proof of lawful ownership or settled possession (sale deed, mutation, electricity bills)', 'Photographic / surveyor evidence of encroachment', 'Police complaint of trespass (Section 329 BNS)'],
    remediesOrPenalties: 'Temporary and permanent injunction restraining trespass; demolition order for illegal construction; restoration of possession.',
    relevantForums: ['Civil Court (Junior Civil Judge / Sub-Court / Senior Civil Judge depending on property value)', 'Local Police Station (for criminal trespass under BNS Sec 329)'],
    limitationPeriod: 'Section 6 Specific Relief Act (summary possession): 6 months from dispossession. Title-based recovery suit: 12 years under Article 65 Limitation Act.',
    sourceUrl: 'https://indiacode.nic.in/handle/123456789/1583',
    officialSourceType: 'Central Act',
    verifiedDate: '15/01/2025',
    confidence: 'Verified'
  },

  // --- RERA (REAL ESTATE) ---
  {
    id: 'rera-18',
    act: 'Real Estate (Regulation and Development) Act, 2016 (RERA)',
    section: 'Section 18 & Section 31',
    chapter: 'Rights and Duties of Allottees',
    title: 'Delay in Flat Possession and Refund with Interest',
    category: 'Property Law',
    currentStatus: 'Current Law',
    summary: 'If builder fails to complete or give possession of apartment, plot, or building in accordance with agreement for sale, allottee can seek refund with interest or monthly interest for delay.',
    simpleExplanation: 'If a real estate builder promised to deliver your flat by a certain date and is delaying construction, you have the legal right under RERA to either get a full refund with interest or monthly interest compensation for every month of delay.',
    fullProvisionsSummary: 'Section 18(1) RERA gives allottee the unqualified choice to either withdraw from the project and demand full refund with prescribed interest (State SBI MCLR + 2%) or continue in project and receive monthly delay compensation.',
    keyElements: ['Registered or registrable RERA project', 'Agreement for sale mentioning handover deadline', 'Proof of payments made to promoter'],
    remediesOrPenalties: 'Order directing promoter to refund total amount with interest, or monthly compensation, recovery warrant if promoter defaults.',
    relevantForums: ['State Real Estate Regulatory Authority (RERA) / Adjudicating Officer', 'RERA Appellate Tribunal'],
    limitationPeriod: 'No specific period in RERA, but should be filed while possession remains delayed or within reasonable time.',
    sourceUrl: 'https://mohua.gov.in/upload/uploadfiles/files/Real_Estate_Act_2016.pdf',
    officialSourceType: 'Central Act',
    verifiedDate: '01/01/2025',
    confidence: 'Verified'
  }
];

export function searchLegalSources(query: string, category?: string): LegalSourceItem[] {
  const q = query.toLowerCase().trim();
  const tokens = q.split(/\s+/).filter(t => t.length > 2);

  return INDIAN_LEGAL_DATABASE.filter(item => {
    if (category && category !== 'All' && category !== 'Other') {
      if (item.category.toLowerCase() !== category.toLowerCase()) {
        return false;
      }
    }

    if (!q) return true;

    const searchableText = `${item.act} ${item.section || ''} ${item.title} ${item.category} ${item.summary} ${item.simpleExplanation} ${item.fullProvisionsSummary} ${item.keyElements.join(' ')} ${item.oldEquivalent || ''}`.toLowerCase();

    return tokens.some(token => searchableText.includes(token));
  });
}
