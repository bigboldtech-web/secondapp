import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.listingComment.deleteMany();
  await prisma.listingReaction.deleteMany();
  await prisma.collectionItem.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.product.deleteMany();
  await prisma.model.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.user.deleteMany();

  // ============================================================
  // CATEGORIES
  // ============================================================
  console.log("  Creating categories...");

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Phones",
        slug: "phones",
        icon: "phone",
        sortOrder: 1,
        specTemplate: JSON.stringify({
          storage: ["64GB", "128GB", "256GB", "512GB", "1TB"],
          ram: ["4GB", "6GB", "8GB", "12GB", "16GB"],
          color: ["Black", "White", "Blue", "Red", "Green", "Purple", "Gold", "Silver", "Titanium", "Pink"],
        }),
        conditionScale: JSON.stringify(["Rough", "Good", "Better", "Best", "Like New"]),
      },
    }),
    prisma.category.create({
      data: {
        name: "Laptops",
        slug: "laptops",
        icon: "laptop",
        sortOrder: 2,
        specTemplate: JSON.stringify({
          processor: ["Intel i3", "Intel i5", "Intel i7", "Intel i9", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9"],
          ram: ["8GB", "16GB", "32GB", "64GB"],
          storage: ["256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD"],
          screenSize: ["13\"", "14\"", "15.6\"", "16\"", "17\""],
          color: ["Black", "Silver", "Grey", "White"],
        }),
        conditionScale: JSON.stringify(["Rough", "Good", "Better", "Best", "Like New"]),
      },
    }),
    prisma.category.create({
      data: {
        name: "Tablets",
        slug: "tablets",
        icon: "tablet",
        sortOrder: 3,
        specTemplate: JSON.stringify({
          storage: ["64GB", "128GB", "256GB", "512GB", "1TB"],
          color: ["Space Grey", "Silver", "Blue", "Pink", "Purple"],
          connectivity: ["Wi-Fi", "Wi-Fi + Cellular"],
        }),
        conditionScale: JSON.stringify(["Rough", "Good", "Better", "Best", "Like New"]),
      },
    }),
    prisma.category.create({
      data: {
        name: "MacBooks",
        slug: "macbooks",
        icon: "laptop",
        sortOrder: 4,
        specTemplate: JSON.stringify({
          chip: ["M1", "M2", "M3", "M3 Pro", "M3 Max", "M4", "M4 Pro", "M4 Max"],
          ram: ["8GB", "16GB", "24GB", "32GB", "64GB"],
          storage: ["256GB", "512GB", "1TB", "2TB"],
          screenSize: ["13\"", "14\"", "15\"", "16\""],
          color: ["Space Grey", "Silver", "Midnight", "Starlight"],
        }),
        conditionScale: JSON.stringify(["Rough", "Good", "Better", "Best", "Like New"]),
      },
    }),
    prisma.category.create({
      data: {
        name: "Cars",
        slug: "cars",
        icon: "car",
        sortOrder: 5,
        specTemplate: JSON.stringify({
          fuelType: ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"],
          transmission: ["Manual", "Automatic", "CVT", "DCT"],
          year: ["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"],
          kmDriven: ["Under 10,000", "10,000-30,000", "30,000-50,000", "50,000-75,000", "75,000-1,00,000", "Over 1,00,000"],
          color: ["White", "Black", "Silver", "Grey", "Red", "Blue", "Brown"],
        }),
        conditionScale: JSON.stringify(["Fair", "Good", "Excellent", "Certified"]),
      },
    }),
    prisma.category.create({
      data: {
        name: "Bikes",
        slug: "bikes",
        icon: "bike",
        sortOrder: 6,
        specTemplate: JSON.stringify({
          cc: ["100cc", "125cc", "150cc", "155cc", "200cc", "250cc", "300cc", "350cc", "400cc", "650cc"],
          year: ["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"],
          kmDriven: ["Under 5,000", "5,000-15,000", "15,000-30,000", "30,000-50,000", "Over 50,000"],
          color: ["Black", "Red", "Blue", "White", "Grey", "Green"],
        }),
        conditionScale: JSON.stringify(["Fair", "Good", "Excellent", "Certified"]),
      },
    }),
    prisma.category.create({
      data: {
        name: "Gaming",
        slug: "gaming",
        icon: "gamepad",
        sortOrder: 7,
        specTemplate: JSON.stringify({
          storage: ["500GB", "825GB", "1TB", "2TB"],
          edition: ["Standard", "Digital", "Pro", "Slim"],
          color: ["Black", "White", "Red", "Blue"],
        }),
        conditionScale: JSON.stringify(["Rough", "Good", "Better", "Best", "Like New"]),
      },
    }),
    prisma.category.create({
      data: {
        name: "Accessories",
        slug: "accessories",
        icon: "headphones",
        sortOrder: 8,
        specTemplate: JSON.stringify({
          type: ["Earbuds", "Headphones", "Charger", "Case", "Cable", "Stand", "Keyboard", "Mouse"],
          color: ["Black", "White", "Blue", "Red"],
        }),
        conditionScale: JSON.stringify(["Good", "Better", "Best", "Like New"]),
      },
    }),
  ]);

  const [catPhones, catLaptops, catTablets, catMacbooks, catCars, catBikes, catGaming, catAccessories] = categories;

  // ============================================================
  // BRANDS
  // ============================================================
  console.log("  Creating brands...");

  const brands = await Promise.all([
    // Phone brands
    prisma.brand.create({ data: { categoryId: catPhones.id, name: "Apple", slug: "apple-phones" } }),
    prisma.brand.create({ data: { categoryId: catPhones.id, name: "Samsung", slug: "samsung-phones" } }),
    prisma.brand.create({ data: { categoryId: catPhones.id, name: "OnePlus", slug: "oneplus" } }),
    prisma.brand.create({ data: { categoryId: catPhones.id, name: "Google", slug: "google-phones" } }),
    prisma.brand.create({ data: { categoryId: catPhones.id, name: "Xiaomi", slug: "xiaomi" } }),
    // Laptop brands
    prisma.brand.create({ data: { categoryId: catLaptops.id, name: "Dell", slug: "dell" } }),
    prisma.brand.create({ data: { categoryId: catLaptops.id, name: "Lenovo", slug: "lenovo" } }),
    prisma.brand.create({ data: { categoryId: catLaptops.id, name: "HP", slug: "hp" } }),
    prisma.brand.create({ data: { categoryId: catLaptops.id, name: "ASUS", slug: "asus" } }),
    // Tablet brands
    prisma.brand.create({ data: { categoryId: catTablets.id, name: "Apple", slug: "apple-tablets" } }),
    prisma.brand.create({ data: { categoryId: catTablets.id, name: "Samsung", slug: "samsung-tablets" } }),
    // MacBook brand
    prisma.brand.create({ data: { categoryId: catMacbooks.id, name: "Apple", slug: "apple-macbooks" } }),
    // Car brands
    prisma.brand.create({ data: { categoryId: catCars.id, name: "Hyundai", slug: "hyundai" } }),
    prisma.brand.create({ data: { categoryId: catCars.id, name: "Maruti Suzuki", slug: "maruti-suzuki" } }),
    prisma.brand.create({ data: { categoryId: catCars.id, name: "Honda", slug: "honda-cars" } }),
    prisma.brand.create({ data: { categoryId: catCars.id, name: "Tata", slug: "tata" } }),
    // Bike brands
    prisma.brand.create({ data: { categoryId: catBikes.id, name: "Royal Enfield", slug: "royal-enfield" } }),
    prisma.brand.create({ data: { categoryId: catBikes.id, name: "Yamaha", slug: "yamaha" } }),
    prisma.brand.create({ data: { categoryId: catBikes.id, name: "Honda", slug: "honda-bikes" } }),
    // Gaming brands
    prisma.brand.create({ data: { categoryId: catGaming.id, name: "Sony", slug: "sony" } }),
    prisma.brand.create({ data: { categoryId: catGaming.id, name: "Microsoft", slug: "microsoft" } }),
    prisma.brand.create({ data: { categoryId: catGaming.id, name: "Nintendo", slug: "nintendo" } }),
    // Accessories brands
    prisma.brand.create({ data: { categoryId: catAccessories.id, name: "Apple", slug: "apple-accessories" } }),
    prisma.brand.create({ data: { categoryId: catAccessories.id, name: "Samsung", slug: "samsung-accessories" } }),
    prisma.brand.create({ data: { categoryId: catAccessories.id, name: "Sony", slug: "sony-accessories" } }),
  ]);

  const [
    bApplePhone, bSamsung, bOnePlus, bGoogle, bXiaomi,
    bDell, bLenovo, bHP, bASUS,
    bAppleTablet, bSamsungTablet,
    bAppleMac,
    bHyundai, bMaruti, bHondaCar, bTata,
    bRoyalEnfield, bYamaha, bHondaBike,
    bSony, bMicrosoft, bNintendo,
    bAppleAcc, bSamsungAcc, bSonyAcc,
  ] = brands;

  // ============================================================
  // MODELS
  // ============================================================
  console.log("  Creating models...");

  const models = await Promise.all([
    // Phones - Apple
    prisma.model.create({ data: { brandId: bApplePhone.id, name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max", specsTemplate: JSON.stringify({ storage: ["256GB", "512GB", "1TB"], color: ["Black Titanium", "White Titanium", "Blue Titanium", "Natural Titanium"] }) } }),
    prisma.model.create({ data: { brandId: bApplePhone.id, name: "iPhone 15 Pro", slug: "iphone-15-pro", specsTemplate: JSON.stringify({ storage: ["128GB", "256GB", "512GB", "1TB"], color: ["Black Titanium", "White Titanium", "Blue Titanium", "Natural Titanium"] }) } }),
    prisma.model.create({ data: { brandId: bApplePhone.id, name: "iPhone 14", slug: "iphone-14", specsTemplate: JSON.stringify({ storage: ["128GB", "256GB", "512GB"], color: ["Black", "White", "Blue", "Purple", "Red"] }) } }),
    prisma.model.create({ data: { brandId: bApplePhone.id, name: "iPhone 13 Mini", slug: "iphone-13-mini", specsTemplate: JSON.stringify({ storage: ["128GB", "256GB", "512GB"], color: ["Midnight", "Starlight", "Blue", "Pink", "Green", "Red"] }) } }),
    prisma.model.create({ data: { brandId: bApplePhone.id, name: "iPhone 11", slug: "iphone-11", specsTemplate: JSON.stringify({ storage: ["64GB", "128GB", "256GB"], color: ["Black", "White", "Red", "Green", "Purple", "Yellow"] }) } }),
    // Phones - Samsung
    prisma.model.create({ data: { brandId: bSamsung.id, name: "Galaxy S24 Ultra", slug: "galaxy-s24-ultra", specsTemplate: JSON.stringify({ storage: ["256GB", "512GB", "1TB"], color: ["Titanium Black", "Titanium Grey", "Titanium Violet", "Titanium Yellow"] }) } }),
    prisma.model.create({ data: { brandId: bSamsung.id, name: "Galaxy S23", slug: "galaxy-s23", specsTemplate: JSON.stringify({ storage: ["128GB", "256GB"], color: ["Phantom Black", "Cream", "Green", "Lavender"] }) } }),
    // Phones - OnePlus
    prisma.model.create({ data: { brandId: bOnePlus.id, name: "OnePlus 12", slug: "oneplus-12", specsTemplate: JSON.stringify({ storage: ["256GB", "512GB"], color: ["Flowy Emerald", "Silky Black"] }) } }),
    // Phones - Google
    prisma.model.create({ data: { brandId: bGoogle.id, name: "Pixel 8 Pro", slug: "pixel-8-pro", specsTemplate: JSON.stringify({ storage: ["128GB", "256GB", "512GB", "1TB"], color: ["Obsidian", "Porcelain", "Bay"] }) } }),
    // Phones - Xiaomi
    prisma.model.create({ data: { brandId: bXiaomi.id, name: "Xiaomi 14", slug: "xiaomi-14", specsTemplate: JSON.stringify({ storage: ["256GB", "512GB"], color: ["Black", "White", "Green"] }) } }),
    // Laptops
    prisma.model.create({ data: { brandId: bDell.id, name: "XPS 15 9530", slug: "dell-xps-15-9530", specsTemplate: JSON.stringify({ processor: ["Intel i7", "Intel i9"], ram: ["16GB", "32GB"], storage: ["512GB SSD", "1TB SSD"] }) } }),
    prisma.model.create({ data: { brandId: bLenovo.id, name: "ThinkPad X1 Carbon Gen 11", slug: "thinkpad-x1-carbon-gen11", specsTemplate: JSON.stringify({ processor: ["Intel i5", "Intel i7"], ram: ["16GB", "32GB"], storage: ["256GB SSD", "512GB SSD", "1TB SSD"] }) } }),
    prisma.model.create({ data: { brandId: bHP.id, name: "Spectre x360 14", slug: "hp-spectre-x360-14", specsTemplate: JSON.stringify({ processor: ["Intel i5", "Intel i7"], ram: ["16GB", "32GB"], storage: ["512GB SSD", "1TB SSD"] }) } }),
    prisma.model.create({ data: { brandId: bASUS.id, name: "ROG Strix G16", slug: "asus-rog-strix-g16", specsTemplate: JSON.stringify({ processor: ["Intel i7", "Intel i9"], ram: ["16GB", "32GB"], storage: ["512GB SSD", "1TB SSD"] }) } }),
    // Tablets
    prisma.model.create({ data: { brandId: bAppleTablet.id, name: "iPad Pro 12.9\" M2", slug: "ipad-pro-12-9-m2", specsTemplate: JSON.stringify({ storage: ["128GB", "256GB", "512GB", "1TB"], connectivity: ["Wi-Fi", "Wi-Fi + Cellular"] }) } }),
    prisma.model.create({ data: { brandId: bSamsungTablet.id, name: "Galaxy Tab S9 FE", slug: "galaxy-tab-s9-fe", specsTemplate: JSON.stringify({ storage: ["128GB", "256GB"], connectivity: ["Wi-Fi", "Wi-Fi + Cellular"] }) } }),
    // MacBooks
    prisma.model.create({ data: { brandId: bAppleMac.id, name: "MacBook Air M2 2023", slug: "macbook-air-m2-2023", specsTemplate: JSON.stringify({ ram: ["8GB", "16GB", "24GB"], storage: ["256GB", "512GB", "1TB"], color: ["Space Grey", "Silver", "Midnight", "Starlight"] }) } }),
    prisma.model.create({ data: { brandId: bAppleMac.id, name: "MacBook Pro 14\" M3", slug: "macbook-pro-14-m3", specsTemplate: JSON.stringify({ chip: ["M3", "M3 Pro", "M3 Max"], ram: ["8GB", "18GB", "36GB"], storage: ["512GB", "1TB", "2TB"] }) } }),
    // Cars
    prisma.model.create({ data: { brandId: bHyundai.id, name: "Creta 2023", slug: "hyundai-creta-2023", specsTemplate: JSON.stringify({ variant: ["E", "EX", "S", "SX", "SX(O)"], fuelType: ["Petrol", "Diesel"], transmission: ["Manual", "Automatic"] }) } }),
    prisma.model.create({ data: { brandId: bHondaCar.id, name: "City 2022", slug: "honda-city-2022", specsTemplate: JSON.stringify({ variant: ["V", "VX", "ZX"], fuelType: ["Petrol", "Hybrid"], transmission: ["Manual", "CVT"] }) } }),
    prisma.model.create({ data: { brandId: bMaruti.id, name: "Swift 2022", slug: "maruti-swift-2022", specsTemplate: JSON.stringify({ variant: ["LXi", "VXi", "ZXi", "ZXi+"], fuelType: ["Petrol", "CNG"], transmission: ["Manual", "AMT"] }) } }),
    prisma.model.create({ data: { brandId: bTata.id, name: "Nexon 2023", slug: "tata-nexon-2023", specsTemplate: JSON.stringify({ variant: ["Smart", "Pure", "Creative", "Fearless"], fuelType: ["Petrol", "Diesel", "Electric"], transmission: ["Manual", "AMT"] }) } }),
    // Bikes
    prisma.model.create({ data: { brandId: bRoyalEnfield.id, name: "Classic 350", slug: "royal-enfield-classic-350", specsTemplate: JSON.stringify({ variant: ["Halcyon", "Signals", "Dark"], color: ["Chrome Red", "Stealth Black", "Gunmetal Grey", "Metallo Silver"] }) } }),
    prisma.model.create({ data: { brandId: bYamaha.id, name: "MT-15 V2", slug: "yamaha-mt-15-v2", specsTemplate: JSON.stringify({ color: ["Metallic Black", "Racing Blue", "Ice Fluo"] }) } }),
    prisma.model.create({ data: { brandId: bHondaBike.id, name: "CB350", slug: "honda-cb350", specsTemplate: JSON.stringify({ variant: ["DLX", "DLX Pro"], color: ["Athletic Blue Metallic", "Pearl Night Star Black", "Precious Gold Metallic"] }) } }),
    // Gaming
    prisma.model.create({ data: { brandId: bSony.id, name: "PS5 Slim", slug: "ps5-slim", specsTemplate: JSON.stringify({ edition: ["Standard", "Digital"], storage: ["1TB"] }) } }),
    prisma.model.create({ data: { brandId: bMicrosoft.id, name: "Xbox Series X", slug: "xbox-series-x", specsTemplate: JSON.stringify({ storage: ["1TB"] }) } }),
    prisma.model.create({ data: { brandId: bNintendo.id, name: "Switch OLED", slug: "nintendo-switch-oled", specsTemplate: JSON.stringify({ color: ["White", "Neon Blue/Red"] }) } }),
    // Accessories
    prisma.model.create({ data: { brandId: bAppleAcc.id, name: "AirPods Pro 2", slug: "airpods-pro-2", specsTemplate: JSON.stringify({ connector: ["USB-C", "Lightning"] }) } }),
    prisma.model.create({ data: { brandId: bSonyAcc.id, name: "WH-1000XM5", slug: "sony-wh-1000xm5", specsTemplate: JSON.stringify({ color: ["Black", "Silver", "Midnight Blue"] }) } }),
  ]);

  const [
    mIPhone15PM, mIPhone15P, mIPhone14, mIPhone13Mini, mIPhone11,
    mGalaxyS24U, mGalaxyS23,
    mOnePlus12,
    mPixel8Pro,
    mXiaomi14,
    mDellXPS15, mThinkPadX1, mHPSpectre, mASUSROG,
    mIPadProM2, mTabS9FE,
    mMBAirM2, mMBPro14M3,
    mCreta, mCity, mSwift, mNexon,
    mClassic350, mMT15, mCB350,
    mPS5, mXboxSX, mSwitchOLED,
    mAirPods, mWH1000XM5,
  ] = models;

  // ============================================================
  // PRODUCTS (Category + Brand + Model → unique product with slug)
  // ============================================================
  console.log("  Creating products...");

  const productData = [
    { categoryId: catPhones.id, brandId: bApplePhone.id, modelId: mIPhone15PM.id, slug: "apple-iphone-15-pro-max", displayName: "iPhone 15 Pro Max" },
    { categoryId: catPhones.id, brandId: bApplePhone.id, modelId: mIPhone15P.id, slug: "apple-iphone-15-pro", displayName: "iPhone 15 Pro" },
    { categoryId: catPhones.id, brandId: bApplePhone.id, modelId: mIPhone14.id, slug: "apple-iphone-14", displayName: "iPhone 14" },
    { categoryId: catPhones.id, brandId: bApplePhone.id, modelId: mIPhone13Mini.id, slug: "apple-iphone-13-mini", displayName: "iPhone 13 Mini" },
    { categoryId: catPhones.id, brandId: bApplePhone.id, modelId: mIPhone11.id, slug: "apple-iphone-11", displayName: "iPhone 11" },
    { categoryId: catPhones.id, brandId: bSamsung.id, modelId: mGalaxyS24U.id, slug: "samsung-galaxy-s24-ultra", displayName: "Samsung Galaxy S24 Ultra" },
    { categoryId: catPhones.id, brandId: bSamsung.id, modelId: mGalaxyS23.id, slug: "samsung-galaxy-s23", displayName: "Samsung Galaxy S23" },
    { categoryId: catPhones.id, brandId: bOnePlus.id, modelId: mOnePlus12.id, slug: "oneplus-12", displayName: "OnePlus 12" },
    { categoryId: catPhones.id, brandId: bGoogle.id, modelId: mPixel8Pro.id, slug: "google-pixel-8-pro", displayName: "Google Pixel 8 Pro" },
    { categoryId: catPhones.id, brandId: bXiaomi.id, modelId: mXiaomi14.id, slug: "xiaomi-14", displayName: "Xiaomi 14" },
    { categoryId: catLaptops.id, brandId: bDell.id, modelId: mDellXPS15.id, slug: "dell-xps-15-9530", displayName: "Dell XPS 15 9530" },
    { categoryId: catLaptops.id, brandId: bLenovo.id, modelId: mThinkPadX1.id, slug: "lenovo-thinkpad-x1-carbon", displayName: "ThinkPad X1 Carbon" },
    { categoryId: catLaptops.id, brandId: bHP.id, modelId: mHPSpectre.id, slug: "hp-spectre-x360-14", displayName: "HP Spectre x360 14" },
    { categoryId: catLaptops.id, brandId: bASUS.id, modelId: mASUSROG.id, slug: "asus-rog-strix-g16", displayName: "ASUS ROG Strix G16" },
    { categoryId: catTablets.id, brandId: bAppleTablet.id, modelId: mIPadProM2.id, slug: "apple-ipad-pro-12-9-m2", displayName: "iPad Pro 12.9\" M2" },
    { categoryId: catTablets.id, brandId: bSamsungTablet.id, modelId: mTabS9FE.id, slug: "samsung-galaxy-tab-s9-fe", displayName: "Galaxy Tab S9 FE" },
    { categoryId: catMacbooks.id, brandId: bAppleMac.id, modelId: mMBAirM2.id, slug: "apple-macbook-air-m2", displayName: "MacBook Air M2 2023" },
    { categoryId: catMacbooks.id, brandId: bAppleMac.id, modelId: mMBPro14M3.id, slug: "apple-macbook-pro-14-m3", displayName: "MacBook Pro 14\" M3" },
    { categoryId: catCars.id, brandId: bHyundai.id, modelId: mCreta.id, slug: "hyundai-creta-2023", displayName: "Hyundai Creta 2023" },
    { categoryId: catCars.id, brandId: bHondaCar.id, modelId: mCity.id, slug: "honda-city-2022", displayName: "Honda City 2022" },
    { categoryId: catCars.id, brandId: bMaruti.id, modelId: mSwift.id, slug: "maruti-swift-2022", displayName: "Maruti Swift 2022" },
    { categoryId: catCars.id, brandId: bTata.id, modelId: mNexon.id, slug: "tata-nexon-2023", displayName: "Tata Nexon 2023" },
    { categoryId: catBikes.id, brandId: bRoyalEnfield.id, modelId: mClassic350.id, slug: "royal-enfield-classic-350", displayName: "Royal Enfield Classic 350" },
    { categoryId: catBikes.id, brandId: bYamaha.id, modelId: mMT15.id, slug: "yamaha-mt-15-v2", displayName: "Yamaha MT-15 V2" },
    { categoryId: catBikes.id, brandId: bHondaBike.id, modelId: mCB350.id, slug: "honda-cb350", displayName: "Honda CB350" },
    { categoryId: catGaming.id, brandId: bSony.id, modelId: mPS5.id, slug: "sony-ps5-slim", displayName: "PS5 Slim" },
    { categoryId: catGaming.id, brandId: bMicrosoft.id, modelId: mXboxSX.id, slug: "microsoft-xbox-series-x", displayName: "Xbox Series X" },
    { categoryId: catGaming.id, brandId: bNintendo.id, modelId: mSwitchOLED.id, slug: "nintendo-switch-oled", displayName: "Nintendo Switch OLED" },
    { categoryId: catAccessories.id, brandId: bAppleAcc.id, modelId: mAirPods.id, slug: "apple-airpods-pro-2", displayName: "AirPods Pro 2" },
    { categoryId: catAccessories.id, brandId: bSonyAcc.id, modelId: mWH1000XM5.id, slug: "sony-wh-1000xm5", displayName: "Sony WH-1000XM5" },
  ];

  const products = await Promise.all(
    productData.map((p) => prisma.product.create({ data: p }))
  );

  // Index products by slug for easy lookup
  const productMap = new Map(products.map((p) => [p.slug, p]));

  // ============================================================
  // USERS + VENDORS
  // ============================================================
  console.log("  Creating vendors...");

  const vendorData = [
    { name: "Rahul Sharma", email: "rahul@phonehub.in", phone: "+919876543210", storeName: "PhoneHub", storeSlug: "phonehub", bio: "Mumbai's most trusted phone dealer since 2018. All devices thoroughly tested with 7-day replacement guarantee.", locationCity: "Mumbai", certLevel: "premium", kycStatus: "verified" },
    { name: "Deepak Verma", email: "deepak@laptopworld.in", phone: "+919876543211", storeName: "LaptopWorld", storeSlug: "laptopworld", bio: "Certified pre-owned laptops with minimum 6 months warranty. Specializing in business and gaming laptops.", locationCity: "Delhi", certLevel: "trusted", kycStatus: "verified" },
    { name: "Priya Nair", email: "priya@gadgetking.in", phone: "+919876543212", storeName: "GadgetKing", storeSlug: "gadgetking", bio: "Your one-stop shop for premium used smartphones. We stock only flagship devices in excellent condition.", locationCity: "Bangalore", certLevel: "verified", kycStatus: "verified" },
    { name: "Amit Patel", email: "amit@tabzone.in", phone: "+919876543213", storeName: "TabZone", storeSlug: "tabzone", bio: "Tablet specialists — iPads, Samsung tabs, and more. Every device screen-tested and battery-checked.", locationCity: "Pune", certLevel: "verified", kycStatus: "verified" },
    { name: "Suresh Reddy", email: "suresh@automart.in", phone: "+919876543214", storeName: "AutoMart", storeSlug: "automart", bio: "Certified pre-owned cars with full service history. 150-point inspection on every vehicle.", locationCity: "Hyderabad", certLevel: "trusted", kycStatus: "verified" },
    { name: "Karthik Rajan", email: "karthik@bikezone.in", phone: "+919876543215", storeName: "BikeZone", storeSlug: "bikezone", bio: "Premium used bikes — Royal Enfield, Yamaha, Honda and more. All bikes serviced before sale.", locationCity: "Chennai", certLevel: "verified", kycStatus: "verified" },
    { name: "Sneha Gupta", email: "sneha@mobideals.in", phone: "+919876543216", storeName: "MobiDeals", storeSlug: "mobideals", bio: "Budget-friendly smartphones from all major brands. Best prices in Kolkata guaranteed.", locationCity: "Kolkata", certLevel: "verified", kycStatus: "verified" },
    { name: "Vikas Kumar", email: "vikas@carbazaar.in", phone: "+919876543217", storeName: "CarBazaar", storeSlug: "carbazaar", bio: "Premium pre-owned cars at the best prices. Finance options available. Free test drive!", locationCity: "Mumbai", certLevel: "premium", kycStatus: "verified" },
  ];

  const vendorUsers = [];
  for (const v of vendorData) {
    const user = await prisma.user.create({
      data: {
        name: v.name,
        email: v.email,
        phone: v.phone,
        role: "vendor",
        locationCity: v.locationCity,
        isActive: true,
      },
    });
    const vendor = await prisma.vendor.create({
      data: {
        userId: user.id,
        storeName: v.storeName,
        storeSlug: v.storeSlug,
        bio: v.bio,
        locationCity: v.locationCity,
        kycStatus: v.kycStatus,
        certificationLevel: v.certLevel,
        ratingAvg: 3.8 + Math.random() * 1.2, // 3.8-5.0
        ratingCount: Math.floor(20 + Math.random() * 200),
        totalSales: Math.floor(50 + Math.random() * 500),
      },
    });
    vendorUsers.push({ user, vendor });
  }

  const vPhoneHub = vendorUsers[0].vendor;
  const vLaptopWorld = vendorUsers[1].vendor;
  const vGadgetKing = vendorUsers[2].vendor;
  const vTabZone = vendorUsers[3].vendor;
  const vAutoMart = vendorUsers[4].vendor;
  const vBikeZone = vendorUsers[5].vendor;
  const vMobiDeals = vendorUsers[6].vendor;
  const vCarBazaar = vendorUsers[7].vendor;

  // ============================================================
  // LISTINGS
  // ============================================================
  console.log("  Creating listings...");

  const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata"];

  interface ListingSeed {
    productSlug: string;
    vendorId: string;
    specs: Record<string, string>;
    condition: string;
    price: number; // in rupees, will be stored as paise
    originalPrice?: number;
    description?: string;
    city: string;
  }

  const listingsData: ListingSeed[] = [
    // iPhone 15 Pro Max — Multiple listings to demonstrate product grouping
    { productSlug: "apple-iphone-15-pro-max", vendorId: vPhoneHub.id, specs: { storage: "256GB", color: "Black Titanium" }, condition: "Like New", price: 109999, originalPrice: 159900, description: "Barely used, purchased 2 months ago. Complete box with all accessories. Apple warranty active till March 2025.", city: "Mumbai" },
    { productSlug: "apple-iphone-15-pro-max", vendorId: vGadgetKing.id, specs: { storage: "256GB", color: "Natural Titanium" }, condition: "Excellent", price: 99999, originalPrice: 159900, description: "9/10 condition. Minor micro-scratches on screen, invisible during use. Battery health 96%.", city: "Bangalore" },
    { productSlug: "apple-iphone-15-pro-max", vendorId: vPhoneHub.id, specs: { storage: "512GB", color: "Blue Titanium" }, condition: "Like New", price: 129999, originalPrice: 179900, description: "Immaculate condition. Comes with original box, charger, and Apple Care+ till June 2025.", city: "Mumbai" },
    { productSlug: "apple-iphone-15-pro-max", vendorId: vMobiDeals.id, specs: { storage: "256GB", color: "White Titanium" }, condition: "Good", price: 89999, originalPrice: 159900, description: "Used for 8 months. Some wear on edges. Battery health 91%. Screen perfect.", city: "Kolkata" },

    // iPhone 15 Pro
    { productSlug: "apple-iphone-15-pro", vendorId: vPhoneHub.id, specs: { storage: "128GB", color: "Black Titanium" }, condition: "Excellent", price: 89999, originalPrice: 134900, city: "Mumbai" },
    { productSlug: "apple-iphone-15-pro", vendorId: vGadgetKing.id, specs: { storage: "256GB", color: "Natural Titanium" }, condition: "Like New", price: 99999, originalPrice: 144900, city: "Bangalore" },

    // iPhone 14
    { productSlug: "apple-iphone-14", vendorId: vPhoneHub.id, specs: { storage: "128GB", color: "Blue" }, condition: "Good", price: 38999, originalPrice: 79900, city: "Mumbai" },
    { productSlug: "apple-iphone-14", vendorId: vMobiDeals.id, specs: { storage: "128GB", color: "Black" }, condition: "Better", price: 42999, originalPrice: 79900, city: "Kolkata" },
    { productSlug: "apple-iphone-14", vendorId: vGadgetKing.id, specs: { storage: "256GB", color: "Purple" }, condition: "Like New", price: 52999, originalPrice: 89900, city: "Bangalore" },

    // iPhone 13 Mini
    { productSlug: "apple-iphone-13-mini", vendorId: vMobiDeals.id, specs: { storage: "128GB", color: "Midnight" }, condition: "Good", price: 28500, originalPrice: 69900, city: "Kolkata" },
    { productSlug: "apple-iphone-13-mini", vendorId: vPhoneHub.id, specs: { storage: "256GB", color: "Blue" }, condition: "Excellent", price: 34999, originalPrice: 79900, city: "Mumbai" },

    // iPhone 11 — Our showcase product for grouping demo
    { productSlug: "apple-iphone-11", vendorId: vPhoneHub.id, specs: { storage: "64GB", color: "Black" }, condition: "Good", price: 14999, originalPrice: 49900, city: "Mumbai" },
    { productSlug: "apple-iphone-11", vendorId: vMobiDeals.id, specs: { storage: "64GB", color: "White" }, condition: "Rough", price: 11999, originalPrice: 49900, city: "Kolkata" },
    { productSlug: "apple-iphone-11", vendorId: vGadgetKing.id, specs: { storage: "128GB", color: "Red" }, condition: "Better", price: 18999, originalPrice: 54900, city: "Bangalore" },
    { productSlug: "apple-iphone-11", vendorId: vPhoneHub.id, specs: { storage: "128GB", color: "Green" }, condition: "Like New", price: 22999, originalPrice: 54900, city: "Mumbai" },
    { productSlug: "apple-iphone-11", vendorId: vMobiDeals.id, specs: { storage: "64GB", color: "Purple" }, condition: "Good", price: 13999, originalPrice: 49900, city: "Delhi" },
    { productSlug: "apple-iphone-11", vendorId: vGadgetKing.id, specs: { storage: "256GB", color: "Black" }, condition: "Excellent", price: 24999, originalPrice: 64900, city: "Bangalore" },

    // Samsung Galaxy S24 Ultra
    { productSlug: "samsung-galaxy-s24-ultra", vendorId: vGadgetKing.id, specs: { storage: "256GB", color: "Titanium Black" }, condition: "Excellent", price: 79999, originalPrice: 129999, city: "Bangalore" },
    { productSlug: "samsung-galaxy-s24-ultra", vendorId: vPhoneHub.id, specs: { storage: "512GB", color: "Titanium Grey" }, condition: "Like New", price: 94999, originalPrice: 144999, city: "Mumbai" },
    { productSlug: "samsung-galaxy-s24-ultra", vendorId: vMobiDeals.id, specs: { storage: "256GB", color: "Titanium Violet" }, condition: "Good", price: 62500, originalPrice: 129999, city: "Kolkata" },

    // Galaxy S23
    { productSlug: "samsung-galaxy-s23", vendorId: vGadgetKing.id, specs: { storage: "128GB", color: "Phantom Black" }, condition: "Good", price: 32999, originalPrice: 74999, city: "Bangalore" },

    // OnePlus 12
    { productSlug: "oneplus-12", vendorId: vPhoneHub.id, specs: { storage: "256GB", color: "Silky Black" }, condition: "Excellent", price: 42999, originalPrice: 64999, city: "Mumbai" },
    { productSlug: "oneplus-12", vendorId: vGadgetKing.id, specs: { storage: "512GB", color: "Flowy Emerald" }, condition: "Like New", price: 52999, originalPrice: 69999, city: "Bangalore" },

    // Dell XPS 15
    { productSlug: "dell-xps-15-9530", vendorId: vLaptopWorld.id, specs: { processor: "Intel i7", ram: "16GB", storage: "1TB SSD" }, condition: "Like New", price: 85000, originalPrice: 149990, city: "Delhi" },
    { productSlug: "dell-xps-15-9530", vendorId: vLaptopWorld.id, specs: { processor: "Intel i9", ram: "32GB", storage: "1TB SSD" }, condition: "Excellent", price: 105000, originalPrice: 189990, city: "Delhi" },

    // ThinkPad X1 Carbon
    { productSlug: "lenovo-thinkpad-x1-carbon", vendorId: vLaptopWorld.id, specs: { processor: "Intel i7", ram: "16GB", storage: "512GB SSD" }, condition: "Excellent", price: 78500, originalPrice: 156990, city: "Delhi" },
    { productSlug: "lenovo-thinkpad-x1-carbon", vendorId: vLaptopWorld.id, specs: { processor: "Intel i5", ram: "16GB", storage: "256GB SSD" }, condition: "Good", price: 58000, originalPrice: 134990, city: "Delhi" },

    // HP Spectre x360
    { productSlug: "hp-spectre-x360-14", vendorId: vLaptopWorld.id, specs: { processor: "Intel i7", ram: "16GB", storage: "512GB SSD" }, condition: "Like New", price: 82000, originalPrice: 149990, city: "Delhi" },

    // ASUS ROG Strix
    { productSlug: "asus-rog-strix-g16", vendorId: vLaptopWorld.id, specs: { processor: "Intel i7", ram: "16GB", storage: "1TB SSD" }, condition: "Excellent", price: 89999, originalPrice: 159990, city: "Delhi" },

    // iPad Pro
    { productSlug: "apple-ipad-pro-12-9-m2", vendorId: vTabZone.id, specs: { storage: "256GB", connectivity: "Wi-Fi" }, condition: "Like New", price: 68000, originalPrice: 112900, city: "Pune" },
    { productSlug: "apple-ipad-pro-12-9-m2", vendorId: vTabZone.id, specs: { storage: "512GB", connectivity: "Wi-Fi + Cellular" }, condition: "Excellent", price: 82000, originalPrice: 139900, city: "Pune" },

    // Galaxy Tab S9 FE
    { productSlug: "samsung-galaxy-tab-s9-fe", vendorId: vTabZone.id, specs: { storage: "128GB", connectivity: "Wi-Fi" }, condition: "Like New", price: 27999, originalPrice: 44999, city: "Delhi" },

    // MacBook Air M2
    { productSlug: "apple-macbook-air-m2", vendorId: vLaptopWorld.id, specs: { ram: "8GB", storage: "512GB", color: "Midnight" }, condition: "Excellent", price: 72999, originalPrice: 119900, city: "Delhi" },
    { productSlug: "apple-macbook-air-m2", vendorId: vLaptopWorld.id, specs: { ram: "16GB", storage: "512GB", color: "Space Grey" }, condition: "Like New", price: 84999, originalPrice: 139900, city: "Delhi" },

    // MacBook Pro 14" M3
    { productSlug: "apple-macbook-pro-14-m3", vendorId: vLaptopWorld.id, specs: { chip: "M3 Pro", ram: "18GB", storage: "512GB" }, condition: "Like New", price: 145000, originalPrice: 199900, city: "Bangalore" },

    // Cars
    { productSlug: "hyundai-creta-2023", vendorId: vAutoMart.id, specs: { variant: "SX", fuelType: "Diesel", transmission: "Automatic", kmDriven: "10,000-30,000" }, condition: "Excellent", price: 1420000, originalPrice: 1850000, description: "Single owner, full service history at authorized center. Insurance valid till Dec 2025.", city: "Hyderabad" },
    { productSlug: "hyundai-creta-2023", vendorId: vCarBazaar.id, specs: { variant: "SX(O)", fuelType: "Petrol", transmission: "Automatic", kmDriven: "Under 10,000" }, condition: "Excellent", price: 1550000, originalPrice: 1990000, description: "Almost new! Only 8,000 km driven. Panoramic sunroof, ADAS features. All accessories included.", city: "Mumbai" },

    { productSlug: "honda-city-2022", vendorId: vAutoMart.id, specs: { variant: "V CVT", fuelType: "Petrol", transmission: "CVT", kmDriven: "10,000-30,000" }, condition: "Excellent", price: 1150000, originalPrice: 1500000, city: "Hyderabad" },

    { productSlug: "maruti-swift-2022", vendorId: vAutoMart.id, specs: { variant: "ZXi", fuelType: "Petrol", transmission: "Manual", kmDriven: "10,000-30,000" }, condition: "Excellent", price: 720000, originalPrice: 899000, city: "Pune" },
    { productSlug: "maruti-swift-2022", vendorId: vCarBazaar.id, specs: { variant: "ZXi+", fuelType: "Petrol", transmission: "AMT", kmDriven: "Under 10,000" }, condition: "Excellent", price: 795000, originalPrice: 975000, city: "Mumbai" },

    { productSlug: "tata-nexon-2023", vendorId: vAutoMart.id, specs: { variant: "Fearless", fuelType: "Diesel", transmission: "Manual", kmDriven: "10,000-30,000" }, condition: "Excellent", price: 1180000, originalPrice: 1540000, city: "Hyderabad" },

    // Bikes
    { productSlug: "royal-enfield-classic-350", vendorId: vBikeZone.id, specs: { variant: "Halcyon", color: "Chrome Red", kmDriven: "5,000-15,000" }, condition: "Good", price: 145000, originalPrice: 199000, city: "Chennai" },
    { productSlug: "royal-enfield-classic-350", vendorId: vBikeZone.id, specs: { variant: "Signals", color: "Stealth Black", kmDriven: "Under 5,000" }, condition: "Excellent", price: 172000, originalPrice: 215000, city: "Chennai" },

    { productSlug: "yamaha-mt-15-v2", vendorId: vBikeZone.id, specs: { color: "Racing Blue", kmDriven: "5,000-15,000" }, condition: "Good", price: 128000, originalPrice: 167000, city: "Pune" },

    { productSlug: "honda-cb350", vendorId: vBikeZone.id, specs: { variant: "DLX Pro", color: "Athletic Blue Metallic", kmDriven: "Under 5,000" }, condition: "Like New", price: 178000, originalPrice: 215000, city: "Chennai" },

    // Gaming
    { productSlug: "sony-ps5-slim", vendorId: vGadgetKing.id, specs: { edition: "Digital", storage: "1TB" }, condition: "Like New", price: 32999, originalPrice: 39990, city: "Bangalore" },
    { productSlug: "sony-ps5-slim", vendorId: vPhoneHub.id, specs: { edition: "Standard", storage: "1TB" }, condition: "Excellent", price: 38999, originalPrice: 49990, city: "Mumbai" },

    { productSlug: "microsoft-xbox-series-x", vendorId: vGadgetKing.id, specs: { storage: "1TB" }, condition: "Excellent", price: 34999, originalPrice: 49990, city: "Bangalore" },

    { productSlug: "nintendo-switch-oled", vendorId: vGadgetKing.id, specs: { color: "Neon Blue/Red" }, condition: "Like New", price: 24999, originalPrice: 34990, city: "Bangalore" },

    // Accessories
    { productSlug: "apple-airpods-pro-2", vendorId: vPhoneHub.id, specs: { connector: "USB-C" }, condition: "Excellent", price: 14999, originalPrice: 24900, city: "Mumbai" },
    { productSlug: "apple-airpods-pro-2", vendorId: vGadgetKing.id, specs: { connector: "USB-C" }, condition: "Like New", price: 17999, originalPrice: 24900, city: "Bangalore" },

    { productSlug: "sony-wh-1000xm5", vendorId: vGadgetKing.id, specs: { color: "Black" }, condition: "Excellent", price: 18999, originalPrice: 29990, city: "Bangalore" },
  ];

  const now = Date.now();
  for (let i = 0; i < listingsData.length; i++) {
    const l = listingsData[i];
    const product = productMap.get(l.productSlug);
    if (!product) {
      console.warn(`  ⚠ Product not found: ${l.productSlug}`);
      continue;
    }

    await prisma.listing.create({
      data: {
        productId: product.id,
        vendorId: l.vendorId,
        specs: JSON.stringify(l.specs),
        condition: l.condition,
        price: l.price * 100, // Convert to paise
        originalPrice: l.originalPrice ? l.originalPrice * 100 : null,
        description: l.description || null,
        status: "active",
        isFeatured: i < 6, // First 6 are featured
        adminCertified: i < 10, // First 10 are certified
        viewCount: Math.floor(50 + Math.random() * 500),
        inquiryCount: Math.floor(2 + Math.random() * 30),
        // Stagger creation times so "time ago" is varied
        createdAt: new Date(now - (i * 1800000 + Math.random() * 3600000)), // 30min to 1h apart
      },
    });
  }

  console.log(`  ✅ Created ${listingsData.length} listings`);

  // ============================================================
  // SAMPLE BUYER USERS + REVIEWS
  // ============================================================
  console.log("  Creating sample reviews...");

  const buyer1 = await prisma.user.create({ data: { name: "Ankit Singh", email: "ankit@gmail.com", phone: "+919000000001", role: "buyer", locationCity: "Mumbai" } });
  const buyer2 = await prisma.user.create({ data: { name: "Meera Joshi", email: "meera@gmail.com", phone: "+919000000002", role: "buyer", locationCity: "Delhi" } });
  const buyer3 = await prisma.user.create({ data: { name: "Ravi Kumar", email: "ravi@gmail.com", phone: "+919000000003", role: "buyer", locationCity: "Bangalore" } });

  // Create orders and reviews for top vendors
  const sampleListings = await prisma.listing.findMany({ take: 6, where: { status: "active" } });
  const buyers = [buyer1, buyer2, buyer3];
  const reviewComments = [
    "Great product, exactly as described. Fast delivery!",
    "Good deal, device in better condition than expected.",
    "Excellent service. Will buy again from this seller.",
    "Product was as described. Packaging could be better.",
    "Very happy with the purchase. Highly recommended!",
    "Fair price and honest seller. Smooth transaction.",
  ];

  for (let i = 0; i < Math.min(sampleListings.length, 6); i++) {
    const listing = sampleListings[i];
    const buyer = buyers[i % buyers.length];
    const order = await prisma.order.create({
      data: {
        listingId: listing.id,
        buyerId: buyer.id,
        vendorId: listing.vendorId,
        amount: listing.price,
        commissionAmount: Math.floor(listing.price * 0.07),
        paymentStatus: "released",
        orderStatus: "delivered",
      },
    });
    await prisma.review.create({
      data: {
        orderId: order.id,
        buyerId: buyer.id,
        vendorId: listing.vendorId,
        listingId: listing.id,
        rating: 4 + Math.floor(Math.random() * 2), // 4 or 5
        comment: reviewComments[i],
        isVerifiedPurchase: true,
      },
    });
  }

  // ============================================================
  // ADMIN USER
  // ============================================================
  console.log("  Creating admin user...");

  await prisma.user.create({
    data: {
      name: "Second App Admin",
      email: "admin@gosecond.in",
      phone: "9999999999",
      role: "admin",
      locationCity: "Mumbai",
      isActive: true,
    },
  });

  console.log("  ✅ Admin login: phone 9999999999, OTP 123456");

  // ============================================================
  // SUMMARY
  // ============================================================
  const counts = {
    categories: await prisma.category.count(),
    brands: await prisma.brand.count(),
    models: await prisma.model.count(),
    products: await prisma.product.count(),
    vendors: await prisma.vendor.count(),
    listings: await prisma.listing.count(),
    users: await prisma.user.count(),
    orders: await prisma.order.count(),
    reviews: await prisma.review.count(),
  };

  console.log("\n🎉 Seeding complete!");
  console.log(`  Categories: ${counts.categories}`);
  console.log(`  Brands: ${counts.brands}`);
  console.log(`  Models: ${counts.models}`);
  console.log(`  Products: ${counts.products}`);
  console.log(`  Vendors: ${counts.vendors}`);
  console.log(`  Listings: ${counts.listings}`);
  console.log(`  Users: ${counts.users}`);
  console.log(`  Orders: ${counts.orders}`);
  console.log(`  Reviews: ${counts.reviews}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
