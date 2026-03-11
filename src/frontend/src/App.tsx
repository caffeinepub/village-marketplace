import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { Loader2, PlusCircle, Search, Store } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Category, type Listing } from "./backend.d";
import { CATEGORY_LABELS, CategoryBadge } from "./components/CategoryBadge";
import { ListingCard } from "./components/ListingCard";
import { ListingDetailModal } from "./components/ListingDetailModal";
import { PostListingModal } from "./components/PostListingModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetAllListings, useIsCallerAdmin } from "./hooks/useQueries";

const queryClient = new QueryClient();

const SAMPLE_LISTINGS: Listing[] = [
  {
    id: 1n,
    title: "Grandmother's Sourdough Starter",
    description:
      "A 40-year-old sourdough starter, lovingly maintained. Makes the most incredible rustic loaves. Will include care instructions and my favorite bread recipe.",
    price: 1500n,
    category: Category.foodProduce,
    sellerName: "Martha Kowalski",
    contact: "martha@valley.net",
    ownerId: { toString: () => "owner1" } as any,
    createdAt: BigInt(Date.now() - 2 * 24 * 60 * 60 * 1000) * 1_000_000n,
    imageUrl: "/assets/generated/listing-bread.dim_600x400.jpg",
  },
  {
    id: 2n,
    title: "Hand-thrown Ceramic Mugs (Set of 4)",
    description:
      "Each mug is unique, thrown on my wheel and fired in a kiln at home. Earthy glazes, dishwasher safe. Perfect for your morning coffee ritual.",
    price: 4800n,
    category: Category.craftsHandmade,
    sellerName: "Diego Reyes",
    contact: "(555) 234-5678",
    ownerId: { toString: () => "owner2" } as any,
    createdAt: BigInt(Date.now() - 5 * 24 * 60 * 60 * 1000) * 1_000_000n,
    imageUrl: "/assets/generated/listing-pottery.dim_600x400.jpg",
  },
  {
    id: 3n,
    title: "Vintage Oak Rocking Chair",
    description:
      "Solid oak rocker from the 1960s, refinished last spring. Sturdy and comfortable. Great on a porch or in a reading nook. No wobbles, just warmth.",
    price: 12500n,
    category: Category.furniture,
    sellerName: "Helen Okafor",
    contact: "helen.okafor@mail.com",
    ownerId: { toString: () => "owner3" } as any,
    createdAt: BigInt(Date.now() - 1 * 24 * 60 * 60 * 1000) * 1_000_000n,
    imageUrl: "/assets/generated/listing-chair.dim_600x400.jpg",
  },
  {
    id: 4n,
    title: "Heirloom Tomato Seedlings (12 Pack)",
    description:
      "Started from seed in February — Brandywine, Cherokee Purple, and Green Zebra varieties. Ready to transplant now. Grown without pesticides.",
    price: 800n,
    category: Category.foodProduce,
    sellerName: "Sam Tillman",
    contact: "sam_tillman@gmail.com",
    ownerId: { toString: () => "owner4" } as any,
    createdAt: BigInt(Date.now() - 3 * 24 * 60 * 60 * 1000) * 1_000_000n,
    imageUrl: "/assets/generated/listing-veggies.dim_600x400.jpg",
  },
  {
    id: 5n,
    title: "Garden Tool Set — Shovel, Rake, Trowel",
    description:
      "Solid steel heads with ash handles. Well-maintained and clean. Selling because we're downsizing. Pick up from our shed, cash preferred.",
    price: 3500n,
    category: Category.toolsEquipment,
    sellerName: "Frank & Barb Munro",
    contact: "(555) 987-1234",
    ownerId: { toString: () => "owner5" } as any,
    createdAt: BigInt(Date.now() - 7 * 24 * 60 * 60 * 1000) * 1_000_000n,
    imageUrl: "/assets/generated/listing-tools.dim_600x400.jpg",
  },
  {
    id: 6n,
    title: "Lightly Worn Denim Jacket — Size M",
    description:
      "Worn maybe 10 times. Classic cut, no fading or damage. I just prefer looser fits now. From a smoke-free home.",
    price: 2200n,
    category: Category.clothing,
    sellerName: "Priya Nair",
    contact: "priya.nair@outlook.com",
    ownerId: { toString: () => "owner6" } as any,
    createdAt: BigInt(Date.now() - 4 * 24 * 60 * 60 * 1000) * 1_000_000n,
    imageUrl: "/assets/generated/listing-jacket.dim_600x400.jpg",
  },
];

const CATEGORY_TABS = [
  { label: "All", value: null },
  { label: "Food & Produce", value: Category.foodProduce },
  { label: "Crafts & Handmade", value: Category.craftsHandmade },
  { label: "Clothing", value: Category.clothing },
  { label: "Tools & Equipment", value: Category.toolsEquipment },
  { label: "Electronics", value: Category.electronics },
  { label: "Furniture", value: Category.furniture },
  { label: "Services", value: Category.services },
  { label: "Other", value: Category.other },
];

const SKELETON_IDS = ["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"];

function AppContent() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const qc = useQueryClient();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const { data: backendListings, isLoading } = useGetAllListings();
  const { data: isAdmin = false } = useIsCallerAdmin();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [postModalOpen, setPostModalOpen] = useState(false);

  const allListings =
    backendListings && backendListings.length > 0
      ? backendListings
      : SAMPLE_LISTINGS;

  const filteredListings = useMemo(() => {
    let list = allListings;
    if (selectedCategory) {
      list = list.filter((l) => l.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.sellerName.toLowerCase().includes(q),
      );
    }
    return list;
  }, [allListings, selectedCategory, searchQuery]);

  const handleLogout = async () => {
    await clear();
    qc.clear();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="relative overflow-hidden bg-primary">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{
            backgroundImage: `url('/assets/generated/marketplace-hero.dim_1200x400.jpg')`,
          }}
        />
        <div className="absolute inset-0 texture-grain" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <Store className="w-8 h-8 text-primary-foreground/90" />
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground tracking-tight">
                  Village Marketplace
                </h1>
              </div>
              <p className="text-primary-foreground/75 text-base sm:text-lg">
                Buy, sell, and trade with your neighbours
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <span className="text-primary-foreground/70 text-sm hidden sm:inline">
                    {identity?.getPrincipal().toString().slice(0, 10)}…
                  </span>
                  <Button
                    data-ocid="nav.logout.button"
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button
                  data-ocid="nav.login.button"
                  variant="outline"
                  size="sm"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              )}
              <Button
                data-ocid="nav.post-listing.button"
                onClick={() => setPostModalOpen(true)}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold shadow-md"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Post a Listing
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="listings.search_input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search listings by keyword, item, or seller..."
            className="pl-10 h-11 bg-card border-border shadow-xs"
          />
        </div>

        {/* Category filter tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORY_TABS.map(({ label, value }) => (
            <button
              type="button"
              key={label}
              data-ocid="listings.category.tab"
              onClick={() => setSelectedCategory(value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                selectedCategory === value
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-foreground/70 border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Listings grid */}
        {isLoading ? (
          <div
            data-ocid="listings.loading_state"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {SKELETON_IDS.map((id) => (
              <div
                key={id}
                className="bg-card rounded-xl shadow-card overflow-hidden"
              >
                <Skeleton className="h-48 w-full rounded-none" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex justify-between pt-1">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <motion.div
            data-ocid="listings.empty_state"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <p className="text-5xl mb-4">🌿</p>
            <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
              {searchQuery || selectedCategory
                ? "No listings found"
                : "The marketplace is quiet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? `No results for "${searchQuery}" — try a different keyword`
                : selectedCategory
                  ? `No ${CATEGORY_LABELS[selectedCategory]} listings yet`
                  : "Be the first to post something!"}
            </p>
            <Button
              data-ocid="listings.post.primary_button"
              onClick={() => setPostModalOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Post a Listing
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing, i) => (
              <ListingCard
                key={listing.id.toString()}
                listing={listing}
                index={i}
                onClick={setSelectedListing}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-secondary/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* Modals */}
      <ListingDetailModal
        listing={selectedListing}
        isAdmin={isAdmin}
        onClose={() => setSelectedListing(null)}
      />
      <PostListingModal
        open={postModalOpen}
        onClose={() => setPostModalOpen(false)}
      />

      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
