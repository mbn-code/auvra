// REMOVED: LiveActivity previously displayed fabricated "integrity check" notifications
// using hardcoded lists of random names and cities — not real user activity.
// This constitutes fake social proof, prohibited under EU Directive 2019/2161
// (Omnibus Directive) as an unfair commercial practice.
// Component is stubbed out to preserve imports while all call sites are cleaned.

export default function LiveActivity({ productName }: { productName: string }) {
  // productName prop is kept in the signature to avoid breaking call sites
  // during migration. Remove prop and all imports once call sites are cleaned.
  return null;
}
