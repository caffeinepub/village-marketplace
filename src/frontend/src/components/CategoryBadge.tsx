import { Category } from "../backend.d";

const CATEGORY_LABELS: Record<Category, string> = {
  [Category.foodProduce]: "Food & Produce",
  [Category.craftsHandmade]: "Crafts & Handmade",
  [Category.clothing]: "Clothing",
  [Category.toolsEquipment]: "Tools & Equipment",
  [Category.electronics]: "Electronics",
  [Category.furniture]: "Furniture",
  [Category.services]: "Services",
  [Category.other]: "Other",
};

const CATEGORY_CLASSES: Record<Category, string> = {
  [Category.foodProduce]: "category-food",
  [Category.craftsHandmade]: "category-crafts",
  [Category.clothing]: "category-clothing",
  [Category.toolsEquipment]: "category-tools",
  [Category.electronics]: "category-electronics",
  [Category.furniture]: "category-furniture",
  [Category.services]: "category-services",
  [Category.other]: "category-other",
};

interface Props {
  category: Category;
  className?: string;
}

export function CategoryBadge({ category, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_CLASSES[category]} ${className}`}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}

export { CATEGORY_LABELS };
