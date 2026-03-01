import PolicyLayout from "@/components/PolicyLayout";

export default function TermsOfService() {
  return (
    <PolicyLayout title="Terms of Service">
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Acceptance of Terms</h2>
          <p>By accessing and using Auvra, you agree to be bound by these Terms of Service. Auvra is a premium digital curation service that discovers and provides source links to unique, pre-owned archival items globally.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Digital Curation Model</h2>
          <p>When you pay a curation fee or use a Society membership on Auvra, you are purchasing a digital source link to a third-party marketplace or private seller. Auvra does not sell the physical item itself, nor do we facilitate its purchase, logistics, or authentication. All physical purchases are strictly between you and the third-party seller.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Non-Affiliation</h2>
          <p>Auvra is an independent curation platform. We are not an authorized dealer, nor are we affiliated, associated, or officially connected with any of the brands featured in our archive or the third-party platforms we link to. All trademarks, logos, and brand names are the property of their respective owners.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Availability Constraints</h2>
          <p>The Auvra Archive Pulse is a real-time sync engine. However, since the items are hosted on third-party platforms and are generally 1-of-1, Auvra cannot guarantee that an item will remain available for purchase after you unlock the source link.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Governing Law</h2>
          <p>These terms are governed by the laws of Denmark and applicable EU consumer protection legislation. Any disputes shall be handled within the jurisdiction of the Danish courts. Nothing in these Terms limits your statutory rights as a consumer under EU law.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase text-sm">Dispute Resolution & EU ODR</h2>
          <p>If you have a complaint or dispute, please contact us first at <strong>malthe@mbn-code.dk</strong> so we can attempt to resolve it directly.</p>
          <p className="mt-4">As required by EU Regulation 524/2013, consumers in the European Union may also use the <strong>EU Online Dispute Resolution (ODR) platform</strong> to resolve disputes with traders. The ODR platform is available at:</p>
          <p className="mt-2">
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold text-zinc-900 hover:opacity-70 transition-opacity"
            >
              https://ec.europa.eu/consumers/odr
            </a>
          </p>
          <p className="mt-4">Our contact email for dispute resolution purposes: <strong>malthe@mbn-code.dk</strong></p>
        </section>
      </div>
    </PolicyLayout>
  );
}
