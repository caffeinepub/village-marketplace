import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Phone, Tag, Trash2, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import type { Listing } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useDeleteListing } from "../hooks/useQueries";
import { formatDate, formatPrice } from "../lib/format";
import { CategoryBadge } from "./CategoryBadge";

interface Props {
  listing: Listing | null;
  isAdmin: boolean;
  onClose: () => void;
}

export function ListingDetailModal({ listing, isAdmin, onClose }: Props) {
  const { identity } = useInternetIdentity();
  const deleteMutation = useDeleteListing();

  const isOwner =
    listing && identity
      ? listing.ownerId.toString() === identity.getPrincipal().toString()
      : false;
  const canDelete = isOwner || isAdmin;

  const handleDelete = async () => {
    if (!listing) return;
    if (!window.confirm("Remove this listing from the marketplace?")) return;
    try {
      await deleteMutation.mutateAsync(listing.id);
      toast.success("Listing removed");
      onClose();
    } catch {
      toast.error("Failed to remove listing");
    }
  };

  return (
    <AnimatePresence>
      {listing && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            data-ocid="listing.modal"
            className="relative bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
          >
            {/* Close button */}
            <button
              type="button"
              data-ocid="listing.close_button"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-secondary transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image */}
            {listing.imageUrl ? (
              <div className="h-64 sm:h-80 overflow-hidden rounded-t-2xl">
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center bg-gradient-to-br from-secondary to-muted rounded-t-2xl">
                <span className="text-7xl opacity-25">
                  {getCategoryEmoji(listing.category as string)}
                </span>
              </div>
            )}

            {/* Content */}
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <CategoryBadge category={listing.category} className="mb-2" />
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                    {listing.title}
                  </h2>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-3xl font-bold text-primary">
                    {formatPrice(listing.price)}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <p className="text-foreground/80 leading-relaxed mb-6">
                {listing.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-secondary/60 rounded-lg">
                  <User className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Seller</p>
                    <p className="font-medium text-sm">{listing.sellerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-secondary/60 rounded-lg">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Contact</p>
                    <p className="font-medium text-sm break-all">
                      {listing.contact}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-secondary/60 rounded-lg">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Posted</p>
                    <p className="font-medium text-sm">
                      {formatDate(listing.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-secondary/60 rounded-lg">
                  <Tag className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <CategoryBadge category={listing.category} />
                  </div>
                </div>
              </div>

              {canDelete && (
                <Button
                  data-ocid="listing.delete_button"
                  variant="destructive"
                  className="w-full"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteMutation.isPending ? "Removing..." : "Remove Listing"}
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
