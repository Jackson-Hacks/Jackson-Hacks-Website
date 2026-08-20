import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Footer from '@/components/landing/Footer';
import legalContent from '@/content/legalDocuments.json';
import PageNotFound from '@/lib/PageNotFound';

function DocumentSection({ section }) {
  return (
    <section className="border-t border-white/10 pt-8 first:border-0 first:pt-0">
      <h2 className="font-title text-2xl text-[#F3F1F1]">{section.heading}</h2>
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph} className="mt-4 leading-7 text-[#C7CCD1]">
          {paragraph}
        </p>
      ))}
      {section.bullets && (
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-[#C7CCD1]">
          {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
        </ul>
      )}
    </section>
  );
}

export default function LegalDocument() {
  const { documentSlug } = useParams();
  const document = legalContent.documents.find((item) => item.slug === documentSlug);

  if (!document) return <PageNotFound />;

  return (
    <div className="min-h-screen bg-[#272727] text-[#F3F1F1]">
      <header className="border-b border-white/10 bg-[#1E1E1E]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Link to="/" className="font-title text-xl" aria-label="Jackson Hacks home">
            <span className="text-[#F68A42]">JACKSON</span>{' '}
            <span className="text-[#F3F1F1]">HACKS</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-[#B4BAC0] transition-colors hover:text-[#F68A42]"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Back to home
          </Link>
        </div>
      </header>

      <main>
        <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(32,114,199,0.18),transparent_45%)]">
          <div className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#F68A42]">
              <FileText size={18} aria-hidden="true" /> Legal document
            </div>
            <h1 className="mt-4 font-title text-4xl leading-tight sm:text-5xl">{document.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#B4BAC0]">{document.summary}</p>
            <p className="mt-4 text-sm text-[#8A9199]">
              Version {legalContent.version} · Last updated {legalContent.lastUpdated}
            </p>
            {document.status && (
              <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
                {document.status}
              </div>
            )}
            <a
              href={document.pdf}
              download
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#2072C7] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#084F9A]"
            >
              <Download size={18} aria-hidden="true" /> Download PDF
            </a>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:py-16">
          <nav aria-label="Legal documents" className="lg:sticky lg:top-6 lg:self-start">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8A9199]">Documents</h2>
            <ul className="mt-4 space-y-2">
              {legalContent.documents.map((item) => (
                <li key={item.slug}>
                  <Link
                    to={`/${item.slug}`}
                    aria-current={item.slug === document.slug ? 'page' : undefined}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                      item.slug === document.slug
                        ? 'bg-[#2072C7]/20 text-[#9CC4EA]'
                        : 'text-[#B4BAC0] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.navLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <article className="min-w-0 space-y-8 rounded-2xl border border-white/10 bg-[#2C2C2C] p-6 sm:p-9">
            {document.sections.map((section) => (
              <DocumentSection key={section.heading} section={section} />
            ))}

            {document.formFields && (
              <section className="border-t border-white/10 pt-8">
                <h2 className="font-title text-2xl">Signature information</h2>
                <p className="mt-4 leading-7 text-[#C7CCD1]">
                  Download the PDF to complete and sign this form. Signed copies must be submitted through the private process provided to accepted participants and must never be emailed publicly or uploaded to a public folder.
                </p>
                <ul className="mt-4 grid list-disc gap-3 pl-6 text-[#C7CCD1] sm:grid-cols-2">
                  {document.formFields.map((field) => <li key={field}>{field}</li>)}
                </ul>
              </section>
            )}
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
