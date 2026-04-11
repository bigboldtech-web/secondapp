export type UserRole = "buyer" | "vendor" | "admin";

export type KycStatus = "pending" | "verified" | "rejected";

export type CertificationLevel = "unverified" | "verified" | "trusted" | "premium";

export type ElectronicsCondition = "Rough" | "Good" | "Better" | "Best" | "Like New";

export type VehicleCondition = "Fair" | "Good" | "Excellent" | "Certified";

export type ListingStatus = "draft" | "pending" | "active" | "sold" | "expired" | "rejected";

export type OrderStatus = "placed" | "confirmed" | "shipped" | "delivered" | "cancelled" | "disputed";

export type PaymentStatus = "pending" | "held" | "released" | "refunded";

export type NotificationType = "alert" | "order" | "chat" | "system" | "promotion";

export type MessageType = "text" | "image" | "system";

export type ReactionType = "like" | "helpful" | "great_price";
