import { prisma } from "@second-app/database";
import ListingWizard from "./ListingWizard";

export default async function NewListingPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      conditionScale: true,
      brands: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          models: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              specsTemplate: true,
            },
          },
        },
      },
    },
  });

  const catalogData = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    conditions: cat.conditionScale ? JSON.parse(cat.conditionScale) as string[] : ["Good", "Better", "Best", "Like New"],
    brands: cat.brands.map((b) => ({
      id: b.id,
      name: b.name,
      models: b.models.map((m) => ({
        id: m.id,
        name: m.name,
        specs: m.specsTemplate ? JSON.parse(m.specsTemplate) as Record<string, string[]> : {},
      })),
    })),
  }));

  return <ListingWizard catalog={catalogData} />;
}
