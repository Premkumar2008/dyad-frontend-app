export interface LeadershipMember {
  id: number;
  name: string;
  title: string;
  description: string;
  image: string;
  mobileImage: string;
}

export const leadershipData: LeadershipMember[] = [
  {
    id: 1,
    name: 'S. Jaikumar',
    title: 'Founder',
    description:
      'Brings over 26 years of institutional treasury, capital markets, and financial risk management experience to her role. She has held senior leadership positions at Capital Group, Latham & Watkins, Western Digital Corporation, Levi Strauss & Co., BNP Paribas, and ProLogis. Across these roles, she has directed oversight of $2.5 trillion in global securities valuations, structured over $35 billion in syndicated financings, managed over $40 billion in global derivatives portfolios, and has overseen treasury operations across 110 countries. She holds a Master of Science in Financial Analysis and Investment Management and a Master of Business Administration in Finance. She is an FAA-certified private pilot.',
    image: '/assets/images/leadershipteam1.png',
    mobileImage: '/assets/images/leadershipteam1.png',
  },
  {
    id: 2,
    name: 'A. Subramaniam ',
    title: 'Chief Technology and AI Solutions Officer',
    description:
      'Brings over 27 years architecting enterprise data, AI, and automation platforms across healthcare and financial services at major health care insurers and global banks.  At Bank of America, he served as Vice President and India Head of Data Practice, supporting 14 million wealth management clients across a multi million dollar platform. He subsequently built and scaled an AI and data analytics practice from 5 to 130 professionals, delivering over 50 production AI and GenAI accelerators across banking, lending, and healthcare. He holds a Post Graduate Diploma in Business Analytics and Business Intelligence and is an adjunct professor at Johns Hopkins University for AI graduate studies.',
    image: '/assets/images/leadershipteam2.png',
    mobileImage: '/assets/images/leadershipteam2.png',
  },
  {
    id: 3,
    name: 'S. Rajan',
    title: 'Chief Operating Officer',
    description:
      'Brings over 27 years of healthcare finance operations leadership to his role. He previously served as Senior Vice President of Global Revenue Cycle Operations at a Veritas Capital portfolio company, where he held P&L responsibility for $190 million in revenue and led an organization of over 15,000 individuals globally. Prior to that, he served as President of Global Revenue Cycle Operations at a Carlyle Group company, scaling revenue from $108 million to $160 million and expanding EBITDA by six percent. He holds a Post Graduate Diploma in Business Administration in Finance, a Master of Business Administration, and a Six Sigma Black Belt from KPMG. He is a licensed private pilot.',
    image: '/assets/images/leadershipteam3.png',
    mobileImage: '/assets/images/leadershipteam3.png',
  },
];

export const teamExpertiseIntro =
  'Dyad was built on the simple conviction that the same financial discipline that governs global financial platforms should apply to healthcare revenue.';
