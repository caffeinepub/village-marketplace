import { motion } from "motion/react";
import type { Listing } from "../backend.d";
import { formatDate, formatPrice } from "../lib/format";
import { CategoryBadge } from "./CategoryBadge";

interface Props {
  listing: Listing;
  index: number;
  onClick: (listing: Listing) => void;
}

export function ListingCard({ listing, index, onClick }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
      whileHover={{ y: -4 }}
      data-ocid={`listing.item.${index + 1}`}
    >
      <button
        type="button"
        className="w-full text-left bg-card rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-300 cursor-pointer overflow-hidden group"
        onClick={() => onClick(listing)}
        aria-label={`View listing: ${listing.title}`}
      >
        {/* Image */}
        <div className="relative h-48 bg-secondary overflow-hidden">
          {listing.imageUrl ? (
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
              <span className="text-5xl opacity-30 select-none">
                {getCategoryEmoji(listing.category)}
              </span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <CategoryBadge category={listing.category} />
          </div>
          <div className="absolute bottom-3 right-3 bg-foreground/90 text-background px-3 py-1 rounded-full text-sm font-semibold">
            {formatPrice(listing.price)}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-display font-semibold text-lg text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2 leading-relaxed">
            {listing.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground/80">
              {listing.sellerName}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(listing.createdAt)}
            </span>
          </div>
        </div>
      </button>
    </motion.div>
  );
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    foodProduce: "🌽",
    craftsHandmade: "🎨",
    clothing: "👗",
    toolsEquipment: "🔧",
    electronics: "📱",
    furniture: "🪑",
    services: "🤝",
    other: "📦",
  };
  return map[category] ?? "📦";
}
