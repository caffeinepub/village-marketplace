# Village Marketplace

## Current State
New project with no existing features.

## Requested Changes (Diff)

### Add
- Public marketplace listing page: browse all items for sale with category filters and search
- Item listing card: photo (optional), title, price, category, seller name, short description
- Post a listing form: title, description, price, category, contact info (name, email/phone)
- Item detail view: full description, seller contact info, posted date
- Categories: Food & Produce, Crafts & Handmade, Clothing, Tools & Equipment, Electronics, Furniture, Services, Other
- Admin/seller can delete their own listings (with authorization)
- Sample listings seeded on first load

### Modify
- N/A (new project)

### Remove
- N/A

## Implementation Plan
1. Backend: Listing data model (id, title, description, price, category, sellerName, contact, createdAt, imageUrl optional), CRUD operations, authorization so only listing owner can delete
2. Frontend: Home/browse page with category tabs and search bar, listing cards grid, post listing modal form, listing detail modal, navigation header with marketplace branding
