/** The standards, regulations and professional guidance the book cites.
 *
 * Regulatory material is jurisdiction-specific and dated, and a companion
 * site that cites it loosely is worse than one that does not cite it at
 * all. So each entry carries its jurisdiction explicitly, and
 * `lastVerified` stays null until a human has actually opened the link and
 * confirmed it still resolves to the current version. Nothing renders a
 * verification date that was not earned; see `formatVerified`. */

import type { DomainSlug } from "./domains";

export type ReferenceKind =
  | "standard"
  | "regulation"
  | "guidance"
  | "professional-body";

export type Jurisdiction =
  | "International"
  | "EU"
  | "UK"
  | "US"
  | "India";

export type Reference = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  kind: ReferenceKind;
  jurisdiction: Jurisdiction;
  /** What the book says about it, in one sentence. */
  note: string;
  appliesTo: DomainSlug[];
  chapters: number[];
  /** ISO date, or null until a human has checked the link. */
  lastVerified: string | null;
};

export const KIND_LABELS: Record<ReferenceKind, string> = {
  standard: "Accounting and reporting standards",
  regulation: "Regulation and supervisory frameworks",
  guidance: "Professional guidance on AI",
  "professional-body": "Professional bodies",
};

export const REFERENCES: Reference[] = [
  {
    id: "ifrs-17",
    title: "IFRS 17 Insurance Contracts",
    publisher: "International Accounting Standards Board",
    url: "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-17-insurance-contracts/",
    kind: "standard",
    jurisdiction: "International",
    note: "Effective for reporting periods beginning on or after 1 January 2023. The book treats it as one of the three pressures that made AI adoption non-optional, because it expanded the documentation surface, data volume and reconciliation burden falling to actuarial teams.",
    appliesTo: ["reserving", "risk-compliance"],
    chapters: [1, 5, 6, 16],
    lastVerified: null,
  },
  {
    id: "solvency-ii",
    title: "Solvency II Directive and the Solvency II review",
    publisher: "European Commission / EIOPA",
    url: "https://www.eiopa.europa.eu/browse/regulation-and-policy/solvency-ii_en",
    kind: "regulation",
    jurisdiction: "EU",
    note: "Requires a written opinion on technical provisions from a named Actuarial Function Holder, and governs ORSA and internal capital models. The named-holder requirement is central to the book's structural argument about accountability.",
    appliesTo: ["risk-compliance", "reserving"],
    chapters: [1, 16, 17],
    lastVerified: null,
  },
  {
    id: "ldti-asc-944",
    title: "Long-Duration Targeted Improvements (ASC 944)",
    publisher: "Financial Accounting Standards Board",
    url: "https://www.fasb.org/insurance",
    kind: "standard",
    jurisdiction: "US",
    note: "Adopted by United States life insurers from 2023, and cited alongside IFRS 17 as a driver of the documentation and reconciliation load on actuarial functions.",
    appliesTo: ["life-health-pensions", "risk-compliance"],
    chapters: [1, 16],
    lastVerified: null,
  },
  {
    id: "insurance-act-1938-s34",
    title: "Insurance Act 1938, Section 34 (Appointed Actuary certification)",
    publisher: "Government of India",
    url: "https://irdai.gov.in/",
    kind: "regulation",
    jurisdiction: "India",
    note: "Requires the Appointed Actuary to certify actuarial reports. The book uses this, with the Solvency II and US signing-actuary equivalents, to show that personal professional liability is a legal structure no software can absorb.",
    appliesTo: ["reserving", "life-health-pensions"],
    chapters: [1, 14, 17],
    lastVerified: null,
  },
  {
    id: "irdai",
    title: "IRDAI circulars, product approval and digital reporting",
    publisher: "Insurance Regulatory and Development Authority of India",
    url: "https://irdai.gov.in/",
    kind: "regulation",
    jurisdiction: "India",
    note: "Digital reporting expectations and the product approval framework, cited as both a driver of documentation load and a constraint on pricing systems.",
    appliesTo: ["pricing", "risk-compliance"],
    chapters: [1, 8, 13, 16],
    lastVerified: null,
  },
  {
    id: "iais",
    title: "International Association of Insurance Supervisors publications",
    publisher: "IAIS",
    url: "https://www.iais.org/",
    kind: "regulation",
    jurisdiction: "International",
    note: "One of the document flows a regulatory monitoring agent is expected to track in the book's canonical risk-and-compliance application.",
    appliesTo: ["risk-compliance"],
    chapters: [16],
    lastVerified: null,
  },
  {
    id: "asb",
    title: "Actuarial Standards Board guidance on artificial intelligence",
    publisher: "Actuarial Standards Board",
    url: "https://www.actuarialstandardsboard.org/",
    kind: "guidance",
    jurisdiction: "US",
    note: "One of four bodies whose AI guidance the book identifies as converging on documented assumptions, validation evidence, ongoing monitoring, professional accountability and proportionality.",
    appliesTo: ["risk-compliance", "pricing", "reserving"],
    chapters: [7, 8, 17],
    lastVerified: null,
  },
  {
    id: "ifoa",
    title: "Institute and Faculty of Actuaries guidance and Risk Alert on AI",
    publisher: "Institute and Faculty of Actuaries",
    url: "https://actuaries.org.uk/",
    kind: "guidance",
    jurisdiction: "UK",
    note: "Cited on the governance of fine-tuned and custom models, and among the discussion documents on AI in reserving.",
    appliesTo: ["reserving", "risk-compliance"],
    chapters: [7, 14, 16, 17],
    lastVerified: null,
  },
  {
    id: "iaa",
    title: "International Actuarial Association guidance on AI",
    publisher: "International Actuarial Association",
    url: "https://www.actuaries.org/",
    kind: "guidance",
    jurisdiction: "International",
    note: "Part of the convergent governance position the book describes: AI components are governed under the existing actuarial framework rather than a new one.",
    appliesTo: ["risk-compliance"],
    chapters: [8, 16, 17],
    lastVerified: null,
  },
  {
    id: "cas",
    title: "Casualty Actuarial Society guidance and discussion documents",
    publisher: "Casualty Actuarial Society",
    url: "https://www.casact.org/",
    kind: "professional-body",
    jurisdiction: "US",
    note: "Cited on responsible use of AI, and specifically on reserving, with emphasis on documented assumptions, independent validation and accountability retained by the named actuary.",
    appliesTo: ["reserving", "risk-compliance"],
    chapters: [14, 16, 17],
    lastVerified: null,
  },
  {
    id: "gdpr",
    title: "General Data Protection Regulation and UK GDPR",
    publisher: "European Union / Information Commissioner's Office",
    url: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/",
    kind: "regulation",
    jurisdiction: "EU",
    note: "Constrains AI architecture before any model component is designed, through contractual provisions with model providers, data minimisation, redaction, and audit trails of every model interaction.",
    appliesTo: ["life-health-pensions", "risk-compliance"],
    chapters: [8, 15],
    lastVerified: null,
  },
  {
    id: "dpdp-act",
    title: "Digital Personal Data Protection Act",
    publisher: "Government of India",
    url: "https://www.meity.gov.in/",
    kind: "regulation",
    jurisdiction: "India",
    note: "Cited with GDPR and HIPAA on the handling of health information, the most sensitive data class in the book's life and health applications.",
    appliesTo: ["life-health-pensions"],
    chapters: [15],
    lastVerified: null,
  },
  {
    id: "hipaa",
    title: "Health Insurance Portability and Accountability Act",
    publisher: "US Department of Health and Human Services",
    url: "https://www.hhs.gov/hipaa/",
    kind: "regulation",
    jurisdiction: "US",
    note: "Governs the processing of health information in the book's health insurance analytics and policyholder communication workflows.",
    appliesTo: ["life-health-pensions"],
    chapters: [15],
    lastVerified: null,
  },
];

export function referencesForDomain(slug: DomainSlug): Reference[] {
  return REFERENCES.filter((r) => r.appliesTo.includes(slug));
}

export function referencesForChapter(n: number): Reference[] {
  return REFERENCES.filter((r) => r.chapters.includes(n));
}

/** Renders nothing when the link has not been checked, rather than
 * implying a verification that did not happen. */
export function formatVerified(reference: Reference): string | null {
  if (!reference.lastVerified) return null;
  return new Date(reference.lastVerified).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
