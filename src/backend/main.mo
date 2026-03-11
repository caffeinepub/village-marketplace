import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Option "mo:core/Option";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type ListingId = Nat;
  type Price = Nat;
  type Timestamp = Int;

  public type Category = {
    #foodProduce;
    #craftsHandmade;
    #clothing;
    #toolsEquipment;
    #electronics;
    #furniture;
    #services;
    #other;
  };

  public type Listing = {
    id : ListingId;
    title : Text;
    description : Text;
    price : Price;
    category : Category;
    sellerName : Text;
    contact : Text;
    createdAt : Timestamp;
    imageUrl : ?Text;
    ownerId : Principal;
  };

  module Listing {
    func categoryOrderValue(category : Category) : Nat {
      switch (category) {
        case (#foodProduce) { 0 };
        case (#craftsHandmade) { 1 };
        case (#clothing) { 2 };
        case (#toolsEquipment) { 3 };
        case (#electronics) { 4 };
        case (#furniture) { 5 };
        case (#services) { 6 };
        case (#other) { 7 };
      };
    };

    public func compare(listing1 : Listing, listing2 : Listing) : Order.Order {
      switch (categoryOrderValue(listing1.category) <= categoryOrderValue(listing2.category)) {
        case (true) { #less };
        case (false) {
          switch (categoryOrderValue(listing1.category) >= categoryOrderValue(listing2.category)) {
            case (true) { #greater };
            case (false) { #equal };
          };
        };
      };
    };
  };

  public type NewListingInput = {
    title : Text;
    description : Text;
    price : Price;
    category : Category;
    sellerName : Text;
    contact : Text;
    imageUrl : ?Text;
  };

  type ListingStore = Map.Map<ListingId, Listing>;
  var nextListingId = 1;
  var listings : ListingStore = Map.empty();
  var isInitialized = false;

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Initialization
  // Only seed on first deploy, admin-only to prevent unauthorized seeding
  public shared ({ caller }) func initialize() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can initialize");
    };
    if (not isInitialized) {
      seededListings().keys().forEach(
        func(id) {
          let listing = seededListings().get(id);
          switch (listing) {
            case (?listing) {
              addListingToStore(listing);
            };
            case (null) {};
          };
        }
      );
      isInitialized := true;
    };
  };

  // CRUD Operations
  public shared ({ caller }) func createListing(input : NewListingInput) : async ListingId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create listings");
    };
    let listingId = getNextListingId();
    let listing : Listing = {
      id = listingId;
      title = input.title;
      description = input.description;
      price = input.price;
      category = input.category;
      sellerName = input.sellerName;
      contact = input.contact;
      createdAt = Time.now();
      imageUrl = input.imageUrl;
      ownerId = caller;
    };

    addListingToStore(listing);
    listingId;
  };

  public query ({ caller }) func getAllListings() : async [Listing] {
    listings.values().toArray();
  };

  public query ({ caller }) func getListingById(id : ListingId) : async Listing {
    switch (listings.get(id)) {
      case (null) { Runtime.trap("Listing does not exist") };
      case (?listing) { listing };
    };
  };

  public shared ({ caller }) func deleteListing(id : ListingId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete listings");
    };
    let listing = switch (listings.get(id)) {
      case (null) { Runtime.trap("Listing does not exist") };
      case (?listing) { listing };
    };

    let isAuthorized = caller == listing.ownerId or AccessControl.isAdmin(accessControlState, caller);
    switch (isAuthorized) {
      case (false) { Runtime.trap("Unauthorized: Only owner or admin can delete listing") };
      case (true) {};
    };

    listings.remove(id);
  };

  // Search and Filter
  public query ({ caller }) func searchListings(keyword : Text) : async [Listing] {
    listings.values().toArray().filter(
      func(listing) {
        listing.title.toLower().contains(#text (keyword.toLower())) or listing.description.toLower().contains(
          #text (keyword.toLower()),
        );
      }
    );
  };

  public query ({ caller }) func filterListingsByCategory(category : Category) : async [Listing] {
    listings.values().toArray().filter(
      func(listing) { listing.category == category }
    );
  };

  public query ({ caller }) func countListingsByCategory() : async [(Category, Nat)] {
    let categories : [Category] = [
      #foodProduce,
      #craftsHandmade,
      #clothing,
      #toolsEquipment,
      #electronics,
      #furniture,
      #services,
      #other,
    ];

    categories.map(
      func(category) {
        let count = listings.values().toArray().filter(func(listing) { listing.category == category }).size();
        (category, count);
      }
    );
  };

  // Helper Functions
  func getNextListingId() : ListingId {
    let currentId = nextListingId;
    nextListingId += 1;
    currentId;
  };

  func addListingToStore(listing : Listing) {
    listings.add(listing.id, listing);
  };

  func seededListings() : Map.Map<ListingId, Listing> {
    Map.fromIter<ListingId, Listing>(
      [
        (1, {
          id = 1;
          title = "Fresh Organic Apples";
          description = "Crisp and juicy apples from our local orchard. 5kg bag.";
          price = 800;
          category = #foodProduce;
          sellerName = "Jane's Farm";
          contact = "555-1234";
          createdAt = 1716855000000;
          imageUrl = ?"https://example.com/apples.jpg";
          ownerId = Principal.fromText("2vxsx-fae");
        }),
        (2, {
          id = 2;
          title = "Handmade Wool Scarf";
          description = "Beautifully crafted scarf made from local sheep wool.";
          price = 1200;
          category = #craftsHandmade;
          sellerName = "Linda's Creations";
          contact = "555-5678";
          createdAt = 1716855100000;
          imageUrl = ?"https://example.com/scarf.jpg";
          ownerId = Principal.fromText("2vxsx-fae");
        }),
        (3, {
          id = 3;
          title = "Used Power Drill";
          description = "Reliable power drill, lightly used. Comes with extra bits.";
          price = 3200;
          category = #toolsEquipment;
          sellerName = "Dave's Hardware";
          contact = "555-6789";
          createdAt = 1716855200000;
          imageUrl = null;
          ownerId = Principal.fromText("2vxsx-fae");
        }),
      ].values(),
    );
  };
};
