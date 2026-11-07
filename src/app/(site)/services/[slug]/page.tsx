import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Finder } from "@/components/Finder";
import { toCard } from "@/components/ServiceCard";
import { CategoryIcon } from "@/components/icons";
import { getCategory, servicesInCategory } from "@/lib/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCategory((await params).slug);
  return { title: c ? `${c.name} seva` : "Service" };
}

export default async function CategoryPage({ params }: Props) {
  const category = await getCategory((await params).slug);
  if (!category) notFound();
  const services = (await servicesInCategory(category.id)).map(toCard);

  return (
    <div className="bg-gradient-to-b from-brand-50 to-white">
      <div className="container-x py-7 max-w-3xl">
        <nav className="text-sm text-muted">
          <Link href="/" className="hover:text-brand-600">Home</Link> / {category.name}
        </nav>
        <div className="mt-3 mb-6 flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-xl bg-white border border-line text-brand-600">
            <CategoryIcon name={category.icon} className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-brand-900">{category.name}</h1>
            <p className="text-sm text-muted">{category.tagline}</p>
          </div>
        </div>
        <Finder
          categoryName={category.name}
          question={category.question}
          options={category.options}
          services={services}
        />
      </div>
    </div>
  );
}
