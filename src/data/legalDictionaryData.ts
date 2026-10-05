export interface DictionaryTerm {
  term: string;
  hindiTerm?: string;
  category: string;
  definition: string;
  simpleExplanation: string;
  example: string;
  relatedTerms: string[];
}

export const LEGAL_DICTIONARY_TERMS: DictionaryTerm[] = [
  {
    term: 'FIR (First Information Report)',
    hindiTerm: 'प्रथम सूचना रिपोर्ट (एफआईआर)',
    category: 'Criminal Law',
    definition: 'A written document prepared by police in India after receiving information about the commission of a cognizable offence.',
    simpleExplanation: 'The first official complaint registered by the police that kicks off a criminal investigation. Under Section 173 BNSS, you have a legal right to get a free copy immediately.',
    example: 'When Ramesh’s motorcycle was stolen from outside the metro station, he went to the police station and lodged an FIR.',
    relatedTerms: ['Cognizable Offence', 'Zero FIR', 'Charge Sheet', 'Section 173 BNSS']
  },
  {
    term: 'Zero FIR',
    hindiTerm: 'जीरो एफआईआर',
    category: 'Criminal Law',
    definition: 'An FIR that can be registered in any police station in India irrespective of the place of incident or territorial jurisdiction.',
    simpleExplanation: 'If a crime happens in another city or area, the nearest police station cannot turn you away. They must register a "Zero FIR" and transfer it to the concerned police station.',
    example: 'Pooja was harassed while traveling on an intercity bus. She filed a Zero FIR at the destination police station, which was later transferred to the highway jurisdiction.',
    relatedTerms: ['FIR', 'Jurisdiction', 'Section 173 BNSS']
  },
  {
    term: 'Cognizable Offence',
    hindiTerm: 'संज्ञेय अपराध',
    category: 'Criminal Law',
    definition: 'An offence for which a police officer may, in accordance with the First Schedule of BNSS or under any other law, arrest without a warrant and start investigation without magistrate orders.',
    simpleExplanation: 'Serious crimes (such as robbery, rape, murder, cyber-fraud) where the police can arrest the suspect right away and must register an FIR.',
    example: 'Online bank theft through forged credentials is a cognizable offence under BNS and the IT Act.',
    relatedTerms: ['Non-Cognizable Offence', 'Warrant', 'Bail']
  },
  {
    term: 'Non-Cognizable Offence',
    hindiTerm: 'असंज्ञेय अपराध',
    category: 'Criminal Law',
    definition: 'An offence for which a police officer has no authority to arrest without warrant and cannot investigate without order of a Magistrate.',
    simpleExplanation: 'Minor offences (such as simple abuse, petty disputes, minor assault without injury) where police cannot arrest directly; they record a Non-Cognizable Report (NCR) and refer you to a Magistrate.',
    example: 'A verbal argument between two neighbours without physical injury is typically entered as a non-cognizable report.',
    relatedTerms: ['NCR', 'Cognizable Offence', 'Magistrate']
  },
  {
    term: 'Anticipatory Bail',
    hindiTerm: 'अग्रिम जमानत',
    category: 'Criminal Procedure',
    definition: 'Direction issued by the High Court or Sessions Court under Section 482 BNSS granting bail to a person anticipating arrest in a non-bailable accusation.',
    simpleExplanation: 'A pre-arrest court shield. If you have genuine reason to believe someone is going to file a false or revenge police complaint against you, the court can order that you should not be put in jail upon arrest.',
    example: 'A business partner threatened with false criminal charges by an ex-associate filed for anticipatory bail before the Sessions Court.',
    relatedTerms: ['Regular Bail', 'Section 482 BNSS', 'Non-Bailable Offence']
  },
  {
    term: 'Limitation Period',
    hindiTerm: 'परिसीमा अवधि (समय सीमा)',
    category: 'Civil & Criminal Procedure',
    definition: 'The maximum statutory time limit prescribed by the Limitation Act, 1963 or specific statutes within which legal proceedings or suits must be instituted.',
    simpleExplanation: 'The expiry deadline for taking legal action. If you sleep on your legal rights and wait too long after a dispute, the court will dismiss your case as "time-barred".',
    example: 'For a defective product, a consumer complaint must generally be filed within 2 years from the date of the defect under Section 69 of the Consumer Protection Act.',
    relatedTerms: ['Condonation of Delay', 'Cause of Action', 'Time-Barred']
  },
  {
    term: 'Injunction / Stay Order',
    hindiTerm: 'व्यादेश / स्थगन आदेश (स्टे ऑर्डर)',
    category: 'Civil Law',
    definition: 'A judicial order restraining a person from beginning or continuing an action threatening or invading the legal right of another, or compelling an act.',
    simpleExplanation: 'An urgent court order that freezes the situation, commanding the other party to stop doing something (like stopping an illegal demolition or halting construction on your boundary).',
    example: 'Anita obtained a temporary injunction from the civil judge stopping her neighbour from breaking down the shared compound wall.',
    relatedTerms: ['Specific Relief Act', 'Order 39 CPC', 'Ex-Parte Order']
  },
  {
    term: 'Plaint & Written Statement',
    hindiTerm: 'वाद पत्र एवं लिखित कथन',
    category: 'Civil Litigation',
    definition: 'A plaint is the formal statement of claim by the plaintiff starting a civil suit; the written statement is the formal defence filed by the defendant within 30-120 days.',
    simpleExplanation: 'The Plaint is your written lawsuit explaining what happened and what you want from the court. The Written Statement is the defendant’s reply answering each paragraph.',
    example: 'The landlord filed a plaint for eviction in the civil court; the tenant submitted their written statement denying default of rent.',
    relatedTerms: ['Plaintiff', 'Defendant', 'Pleadings', 'CPC']
  },
  {
    term: 'Vakalatnama',
    hindiTerm: 'वकालतनामा',
    category: 'Court Procedure',
    definition: 'A formal legal document signed by a litigant authorizing a designated advocate to represent, plead, and act on their behalf in a court or tribunal.',
    simpleExplanation: 'A written power-of-attorney paper you sign that officially permits your lawyer to speak and file applications for you in court.',
    example: 'Before the hearing in the High Court, the client signed the Vakalatnama in favor of Advocate Priya.',
    relatedTerms: ['Advocate', 'Power of Attorney', 'Bar Council']
  },
  {
    term: 'Affidavit',
    hindiTerm: 'शपथ पत्र (हलफनामा)',
    category: 'Legal Evidence',
    definition: 'A written statement of facts voluntarily made by an affiant under an oath or affirmation administered by a person authorized by law, such as an Oath Commissioner or Notary Public.',
    simpleExplanation: 'A sworn declaration on legal stamp paper where you legally swear under penalty of perjury that what you have written is 100% true.',
    example: 'Rajesh submitted an affidavit stating his current residential address along with his application for a new passport.',
    relatedTerms: ['Notary', 'Perjury', 'Verification']
  },
  {
    term: 'Caveat Petition',
    hindiTerm: 'कैविएट याचिका',
    category: 'Civil Procedure',
    definition: 'A formal notice lodged by a party in court under Section 148A of CPC requesting that no order or injunction be passed against them without giving them prior notice and hearing.',
    simpleExplanation: 'A preventive alert to the court saying: "If my opponent files a case against me, please do not pass an urgent stay order against me without hearing my side first."',
    example: 'After terminating a contractor, the company filed a caveat petition in the District Court to ensure they are heard before any stay on construction is issued.',
    relatedTerms: ['Section 148A CPC', 'Ex-Parte Order', 'Natural Justice']
  },
  {
    term: 'Section 138 Notice (Cheque Bounce)',
    hindiTerm: 'धारा 138 कानूनी नोटिस (चेक बाउंस)',
    category: 'Banking / Commercial Law',
    definition: 'Statutory demand notice required to be sent in writing by the payee to the drawer within 30 days of receiving the bank memo of dishonour under Negotiable Instruments Act.',
    simpleExplanation: 'A mandatory legal warning sent when a cheque bounces. The issuer gets 15 days to pay the money. If they don’t pay, a criminal case can be filed against them.',
    example: 'Sunil received a cheque bounce memo from SBI; within 2 weeks, his lawyer dispatched a Section 138 statutory notice via registered post.',
    relatedTerms: ['Negotiable Instruments Act', 'Pecuniary Debt', 'Dishonour Memo']
  },
  {
    term: 'Mediation & Lok Adalat',
    hindiTerm: 'मध्यस्थता एवं लोक अदालत',
    category: 'Alternative Dispute Resolution',
    definition: 'Statutory dispute resolution mechanisms where a neutral trained mediator or Lok Adalat bench assists disputing parties in reaching an amicable binding settlement without full court trials.',
    simpleExplanation: 'A friendly, faster way to resolve disputes without fighting in court for years. A trained mediator helps both sides talk and agree on a fair compromise.',
    example: 'The marital property dispute was referred to the Court Mediation Centre, where the parties agreed on a mutual settlement in three sessions.',
    relatedTerms: ['Arbitration', 'Section 89 CPC', 'Compromise Decree']
  },
  {
    term: 'Legal Aid (NALSA / DLSA)',
    hindiTerm: 'मुफ्त कानूनी सहायता',
    category: 'Constitutional Rights',
    definition: 'Free legal representation, drafting, and exemption from court fees provided under the Legal Services Authorities Act, 1987 to eligible citizens like women, children, SC/ST, and low-income persons.',
    simpleExplanation: 'Free government lawyer and court fee waiver if you cannot afford legal fees and qualify under the criteria.',
    example: 'A domestic worker whose employer refused to pay wages approached the District Legal Services Authority (DLSA) and was assigned a free panel advocate.',
    relatedTerms: ['Section 12 LSA Act', 'Article 39A', 'DLSA']
  },
  {
    term: 'Section 63 BSA Certificate (Electronic Evidence)',
    hindiTerm: 'इलेक्ट्रॉनिक साक्ष्य प्रमाण पत्र',
    category: 'Evidence Law',
    definition: 'A mandatory statutory certificate under Section 63 of Bharatiya Sakshya Adhiniyam, 2023 (formerly Section 65B of Indian Evidence Act) required to admit printouts or extracts of digital records like WhatsApp chats, CCTV footage, or emails in court.',
    simpleExplanation: 'A signed technical declaration explaining how you printed or copied digital messages/recordings from your phone or computer so the court can trust it hasn’t been tampered with.',
    example: 'To submit WhatsApp chat screenshots showing the debt admission, the plaintiff attached a Section 63 BSA certificate signed by the device owner.',
    relatedTerms: ['Bharatiya Sakshya Adhiniyam', 'Digital Evidence', 'Hash Value']
  }
];
