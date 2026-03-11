import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, LogIn, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Category } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateListing } from "../hooks/useQueries";
import { CATEGORY_LABELS } from "./CategoryBadge";

interface Props {
  open: boolean;
  onClose: () => void;
}

const INITIAL_FORM = {
  title: "",
  description: "",
  price: "",
  category: "" as Category | "",
  sellerName: "",
  contact: "",
  imageUrl: "",
};

type FormErrors = Partial<Record<keyof typeof INITIAL_FORM, string>>;

export function PostListingModal({ open, onClose }: Props) {
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const createListing = useCreateListing();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const set = (field: keyof typeof INITIAL_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (
      !form.price ||
      Number.isNaN(Number(form.price)) ||
      Number(form.price) <= 0
    )
      e.price = "Enter a valid price";
    if (!form.category) e.category = "Select a category";
    if (!form.sellerName.trim()) e.sellerName = "Your name is required";
    if (!form.contact.trim()) e.contact = "Contact info is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await createListing.mutateAsync({
        title: form.title.trim(),
        description: form.description.trim(),
        price: BigInt(Math.round(Number(form.price) * 100)),
        category: form.category as Category,
        sellerName: form.sellerName.trim(),
        contact: form.contact.trim(),
        imageUrl: form.imageUrl.trim() || undefined,
      });
      toast.success(
        "Listing posted! Your item is now visible to the community.",
      );
      setForm(INITIAL_FORM);
      setErrors({});
      onClose();
    } catch {
      toast.error("Failed to post listing. Please try again.");
    }
  };

  const handleClose = () => {
    if (createListing.isPending) return;
    setForm(INITIAL_FORM);
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            data-ocid="post.modal"
            className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
          >
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Post a Listing
                  </h2>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    Share something with your community
                  </p>
                </div>
                <button
                  type="button"
                  data-ocid="post.close_button"
                  onClick={handleClose}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Login gate */}
              {!isAuthenticated ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-4">🔒</div>
                  <h3 className="font-display text-xl font-semibold mb-2">
                    Sign in to post
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    You need to be logged in to post a listing in the
                    marketplace.
                  </p>
                  <Button
                    data-ocid="post.login_button"
                    onClick={login}
                    disabled={isLoggingIn}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <Label htmlFor="title" className="text-sm font-medium">
                        Title *
                      </Label>
                      <Input
                        id="title"
                        data-ocid="post.title.input"
                        value={form.title}
                        onChange={(e) => set("title", e.target.value)}
                        placeholder="What are you selling?"
                        className={errors.title ? "border-destructive" : ""}
                      />
                      {errors.title && (
                        <p
                          data-ocid="post.title.error_state"
                          className="text-destructive text-xs mt-1"
                        >
                          {errors.title}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <Label
                        htmlFor="description"
                        className="text-sm font-medium"
                      >
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        data-ocid="post.description.textarea"
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                        placeholder="Describe your item..."
                        rows={3}
                        className={
                          errors.description ? "border-destructive" : ""
                        }
                      />
                      {errors.description && (
                        <p
                          data-ocid="post.description.error_state"
                          className="text-destructive text-xs mt-1"
                        >
                          {errors.description}
                        </p>
                      )}
                    </div>

                    {/* Price + Category */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="price" className="text-sm font-medium">
                          Price ($) *
                        </Label>
                        <Input
                          id="price"
                          data-ocid="post.price.input"
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.price}
                          onChange={(e) => set("price", e.target.value)}
                          placeholder="0.00"
                          className={errors.price ? "border-destructive" : ""}
                        />
                        {errors.price && (
                          <p
                            data-ocid="post.price.error_state"
                            className="text-destructive text-xs mt-1"
                          >
                            {errors.price}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor="category"
                          className="text-sm font-medium"
                        >
                          Category *
                        </Label>
                        <Select
                          value={form.category}
                          onValueChange={(v) => set("category", v)}
                        >
                          <SelectTrigger
                            id="category"
                            data-ocid="post.category.select"
                            className={
                              errors.category ? "border-destructive" : ""
                            }
                          >
                            <SelectValue placeholder="Select…" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(Category).map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {CATEGORY_LABELS[cat]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.category && (
                          <p
                            data-ocid="post.category.error_state"
                            className="text-destructive text-xs mt-1"
                          >
                            {errors.category}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Seller Name + Contact */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label
                          htmlFor="sellerName"
                          className="text-sm font-medium"
                        >
                          Your Name *
                        </Label>
                        <Input
                          id="sellerName"
                          data-ocid="post.seller-name.input"
                          value={form.sellerName}
                          onChange={(e) => set("sellerName", e.target.value)}
                          placeholder="Jane Smith"
                          className={
                            errors.sellerName ? "border-destructive" : ""
                          }
                        />
                        {errors.sellerName && (
                          <p
                            data-ocid="post.seller-name.error_state"
                            className="text-destructive text-xs mt-1"
                          >
                            {errors.sellerName}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor="contact"
                          className="text-sm font-medium"
                        >
                          Contact *
                        </Label>
                        <Input
                          id="contact"
                          data-ocid="post.contact.input"
                          value={form.contact}
                          onChange={(e) => set("contact", e.target.value)}
                          placeholder="email or phone"
                          className={errors.contact ? "border-destructive" : ""}
                        />
                        {errors.contact && (
                          <p
                            data-ocid="post.contact.error_state"
                            className="text-destructive text-xs mt-1"
                          >
                            {errors.contact}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Image URL */}
                    <div>
                      <Label htmlFor="imageUrl" className="text-sm font-medium">
                        Image URL{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        id="imageUrl"
                        data-ocid="post.image-url.input"
                        type="url"
                        value={form.imageUrl}
                        onChange={(e) => set("imageUrl", e.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                    {/* Submit */}
                    <Button
                      data-ocid="post.submit_button"
                      type="submit"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-2.5"
                      disabled={createListing.isPending}
                    >
                      {createListing.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        "Post Listing"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
