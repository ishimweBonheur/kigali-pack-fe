import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DOC_NAV, getDocBySlug } from "@/content/docs";
import { InteractiveDocPage } from "@/features/public/interactive-doc-page";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return DOC_NAV.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) return { title: "Not Found" };
  return {
    title: `${doc.title} — Kigali-Pack Docs`,
    description: doc.description,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) notFound();

  return <InteractiveDocPage doc={doc} />;
}
