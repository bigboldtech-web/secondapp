class ListingCard {
  final String id;
  final String title;
  final int price;
  final int? originalPrice;
  final String condition;
  final Map<String, String> specs;
  final String? thumbnail;
  final String vendorName;
  final String vendorSlug;
  final String vendorCertification;
  final String productSlug;
  final String categorySlug;
  final String location;
  final DateTime createdAt;
  final bool isFeatured;
  final bool adminCertified;

  const ListingCard({
    required this.id,
    required this.title,
    required this.price,
    required this.originalPrice,
    required this.condition,
    required this.specs,
    required this.thumbnail,
    required this.vendorName,
    required this.vendorSlug,
    required this.vendorCertification,
    required this.productSlug,
    required this.categorySlug,
    required this.location,
    required this.createdAt,
    required this.isFeatured,
    required this.adminCertified,
  });

  factory ListingCard.fromJson(Map<String, dynamic> json) {
    final rawSpecs = json["specs"] as Map<String, dynamic>? ?? const {};
    return ListingCard(
      id: json["id"] as String,
      title: json["title"] as String,
      price: json["price"] as int,
      originalPrice: json["originalPrice"] as int?,
      condition: json["condition"] as String,
      specs: rawSpecs.map((k, v) => MapEntry(k, v.toString())),
      thumbnail: json["thumbnail"] as String?,
      vendorName: json["vendorName"] as String,
      vendorSlug: json["vendorSlug"] as String,
      vendorCertification: json["vendorCertification"] as String,
      productSlug: json["productSlug"] as String,
      categorySlug: json["categorySlug"] as String,
      location: json["location"] as String,
      createdAt: DateTime.parse(json["createdAt"] as String),
      isFeatured: json["isFeatured"] as bool? ?? false,
      adminCertified: json["adminCertified"] as bool? ?? false,
    );
  }
}

class ListingDetail {
  final String id;
  final int price;
  final int? originalPrice;
  final String condition;
  final Map<String, String> specs;
  final String? description;
  final List<String> photos;
  final String? videoUrl;
  final int viewCount;
  final int inquiryCount;
  final DateTime createdAt;
  final ProductInfo product;
  final VendorInfo vendor;

  const ListingDetail({
    required this.id,
    required this.price,
    required this.originalPrice,
    required this.condition,
    required this.specs,
    required this.description,
    required this.photos,
    required this.videoUrl,
    required this.viewCount,
    required this.inquiryCount,
    required this.createdAt,
    required this.product,
    required this.vendor,
  });

  factory ListingDetail.fromJson(Map<String, dynamic> json) {
    final rawSpecs = json["specs"] as Map<String, dynamic>? ?? const {};
    return ListingDetail(
      id: json["id"] as String,
      price: json["price"] as int,
      originalPrice: json["originalPrice"] as int?,
      condition: json["condition"] as String,
      specs: rawSpecs.map((k, v) => MapEntry(k, v.toString())),
      description: json["description"] as String?,
      photos: ((json["photos"] as List?) ?? const []).map((p) => p.toString()).toList(),
      videoUrl: json["videoUrl"] as String?,
      viewCount: json["viewCount"] as int? ?? 0,
      inquiryCount: json["inquiryCount"] as int? ?? 0,
      createdAt: DateTime.parse(json["createdAt"] as String),
      product: ProductInfo.fromJson(json["product"] as Map<String, dynamic>),
      vendor: VendorInfo.fromJson(json["vendor"] as Map<String, dynamic>),
    );
  }
}

class ProductInfo {
  final String displayName;
  final String slug;
  final String categoryName;
  final String brandName;

  const ProductInfo({
    required this.displayName,
    required this.slug,
    required this.categoryName,
    required this.brandName,
  });

  factory ProductInfo.fromJson(Map<String, dynamic> json) {
    return ProductInfo(
      displayName: json["displayName"] as String,
      slug: json["slug"] as String,
      categoryName: (json["category"] as Map<String, dynamic>)["name"] as String,
      brandName: (json["brand"] as Map<String, dynamic>)["name"] as String,
    );
  }
}

class VendorInfo {
  final String id;
  final String storeName;
  final String storeSlug;
  final String certificationLevel;
  final double ratingAvg;
  final int ratingCount;
  final int totalSales;
  final String? locationCity;

  const VendorInfo({
    required this.id,
    required this.storeName,
    required this.storeSlug,
    required this.certificationLevel,
    required this.ratingAvg,
    required this.ratingCount,
    required this.totalSales,
    required this.locationCity,
  });

  factory VendorInfo.fromJson(Map<String, dynamic> json) {
    return VendorInfo(
      id: json["id"] as String,
      storeName: json["storeName"] as String,
      storeSlug: json["storeSlug"] as String,
      certificationLevel: json["certificationLevel"] as String,
      ratingAvg: (json["ratingAvg"] as num?)?.toDouble() ?? 0,
      ratingCount: json["ratingCount"] as int? ?? 0,
      totalSales: json["totalSales"] as int? ?? 0,
      locationCity: json["locationCity"] as String?,
    );
  }
}

class Category {
  final String id;
  final String name;
  final String slug;
  final int listingCount;

  const Category({
    required this.id,
    required this.name,
    required this.slug,
    required this.listingCount,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json["id"] as String,
      name: json["name"] as String,
      slug: json["slug"] as String,
      listingCount: json["listingCount"] as int? ?? 0,
    );
  }
}

class AppUser {
  final String id;
  final String name;
  final String? phone;
  final String? email;
  final String role;
  final String? locationCity;

  const AppUser({
    required this.id,
    required this.name,
    required this.phone,
    required this.email,
    required this.role,
    required this.locationCity,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json["id"] as String,
      name: json["name"] as String,
      phone: json["phone"] as String?,
      email: json["email"] as String?,
      role: json["role"] as String? ?? "buyer",
      locationCity: json["locationCity"] as String?,
    );
  }
}
