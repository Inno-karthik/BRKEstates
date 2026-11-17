/** Founder profile shown on Home (compact) and About (detailed). Photos live in the R2
 *  media bucket under brand/ like every other uploaded file. Edit the copy here. */
const R2 = process.env.R2_PUBLIC_URL ?? "https://pub-b6bfd758709a42bbbcceb22b5a972143.r2.dev";

export const AUTHOR = {
  title: "Founder, BKR Estates",
  tagline: "Your guide, consultant and investment companion in Visakhapatnam real estate.",
  portrait: `${R2}/brand/author-portrait.jpg`,
  group: `${R2}/brand/author-group.jpg`,
  stats: [
    { value: "20+", label: "Years with Prakruti" },
    { value: "115", label: "Ventures delivered" },
    { value: "Executive → Regional Deputy Director", label: "Growth at Prakruti Avenues" },
  ],
  short:
    "From a young executive to Regional Deputy Director at Prakruti Avenues, he has spent over 20 years and 115 ventures learning what makes a property worth owning. Today he guides families and investors across Visakhapatnam as the founder of BKR Estates.",
  journey: [
    "Started at Prakruti Avenues as an Executive and, through consistent performance over the years, rose to Regional Deputy Director.",
    "Has been serving with Prakruti for over 20 years — a rare depth of continuity in the Visakhapatnam real estate market.",
    "Associated with 115 ventures, giving first-hand knowledge of layouts, approvals, pricing cycles and what buyers truly value.",
    "Founded BKR Estates and has since brought multiple residential projects to families in and around Visakhapatnam.",
  ],
  strengths: [
    { title: "Trusted guide", desc: "Straight answers on location, approvals, pricing and timing — before you commit." },
    { title: "Real estate consultant", desc: "Plot, apartment, villa or farm land: advice matched to your goals and budget." },
    { title: "Investment companion", desc: "A long-term partner for choosing investments that grow with Vizag's development." },
  ],
};
