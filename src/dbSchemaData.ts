/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DbTableSchema, Product, Category, Coupon, Review, PurchaseCode, AppCustomer, PaymentSettings } from "./types";

// 1. Interactive e-commerce products
export const SAMPLE_CATEGORIES: Category[] = [
  {
    id: 1,
    category_name: "الملابس الرجالية",
    parent_id: null,
    slug: "mens-clothing",
    description: "أحدث تصاميم الأزياء الرجالية الفاخرة، من البدلات الرسمية إلى الملابس الكاجوال اليومية.",
    icon: "Shirt"
  },
  {
    id: 2,
    category_name: "الملابس النسائية",
    parent_id: null,
    slug: "womens-clothing",
    description: "فساتين سهرة، أزياء يومية مريحة، وتصاميم تجمع بين الأناقة العصرية والراحة الكلاسيكية.",
    icon: "Sparkles"
  },
  {
    id: 3,
    category_name: "الإكسسوارات الفاخرة",
    parent_id: null,
    slug: "luxury-accessories",
    description: "حقائب يد جلدية طبيعية، نظارات شمسية كلاسيكية، وساعات فاخرة تكمل إطلالتك الأنيقة.",
    icon: "Watch"
  }
];

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 1,
    product_name: "بدلة رجالية رسمية فاخرة",
    slug: "luxury-mens-suit",
    description: "بدلة رجالية رسمية مصممة خصيصاً من أفخر أنواع الصوف الإيطالي الممتاز. تتضمن جاكيت كلاسيكي وبنطلون متناسق، مثالية للاجتماعات الرسمية والمناسبات الخاصة الأنيقة.",
    specifications: "الخامة: 100% صوف إيطالي فائق النعومة (Super 120s) | البطانة: حرير تنفسي | القصة: سليم فيت عصرية (Modern Slim Fit) | بلد الصنع: ميلانو - إيطاليا | العناية: تنظيف جاف فقط.",
    price: 349.99,
    compare_at_price: 499.99,
    category_id: 1,
    category_name: "الملابس الرجالية",
    sku: "PRD-M-SUIT-01",
    is_active: true,
    image_url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&q=80&w=600"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["كحلي داكن", "رمادي فحمي", "أسود ملكي"],
    rating: 4.8,
    reviews_count: 24,
    stock: 15
  },
  {
    id: 2,
    product_name: "فستان سهرة كلاسيكي مطرز",
    slug: "evening-classic-dress",
    description: "فستان سهرة نسائي مذهل بتصميم كلاسيكي، مطرز يدوياً بحرفية عالية عند الأكمام والصدر. مصنوع من قماش الشيفون والحرير الناعم ليمنحك حضوراً ساحراً وطاغياً في السهرات الخاصة.",
    specifications: "الخامة: حرير طبيعي وشيفون فرنسي مبطن | التطريز: خيوط ذهبية وكريستال يدوي | الطول: ماكسي كامل | القصة: A-Line كلاسيكية | بلد الصنع: فلورنسا - إيطاليا.",
    price: 289.00,
    compare_at_price: 399.00,
    category_id: 2,
    category_name: "الملابس النسائية",
    sku: "PRD-W-DRES-02",
    is_active: true,
    image_url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=600",
    images: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600"
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["أحمر خمري", "أزرق نيلي", "أسود كلاسيكي"],
    rating: 4.9,
    reviews_count: 18,
    stock: 8
  },
  {
    id: 3,
    product_name: "حقيبة يد جلدية إيطالية طبيعية",
    slug: "italian-leather-handbag",
    description: "حقيبة يد نسائية مصنوعة يدوياً في إيطاليا من جلد العجل الطبيعي 100%. تمتاز بملمس فاخر وتصميم هندسي عملي مع مقبض متين وحزام كتف قابل للإزالة. تحتوي على جيوب داخلية متعددة لتنظيم مستلزماتك اليومية.",
    specifications: "الخامة: جلد عجل طبيعي معالج يدوياً (Full Grain Leather) | الإكسسوارات: سحابات وإبزيم معدني مقاوم للصدأ | الأبعاد: 32 سم × 24 سم × 12 سم | بلد الصنع: البندقية - إيطاليا.",
    price: 195.00,
    compare_at_price: null,
    category_id: 3,
    category_name: "الإكسسوارات الفاخرة",
    sku: "PRD-A-BAG-03",
    is_active: true,
    image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=600"
    ],
    sizes: ["Standard"],
    colors: ["بني هافان", "أسود فاخر", "جملي كلاسيكي"],
    rating: 4.7,
    reviews_count: 32,
    stock: 5
  },
  {
    id: 4,
    product_name: "قميص قطني صيفي كاجوال",
    slug: "summer-cotton-shirt",
    description: "قميص كاجوال رجالي مريح للغاية مصنوع من الكتان والقطن الطبيعي الخفيف والمقاوم للحرارة. مثالي للأجواء الصيفية الحارة والرحلات والأنشطة اليومية غير الرسمية.",
    specifications: "الخامة: 70% قطن مصري عضوي طويل التيلة، 30% كتان طبيعي | الياقة: ياقة إيطالية كلاسيكية | الملمس: ناعم جداً ومقاوم للتجعد البسيط | بلد الصنع: روما.",
    price: 45.50,
    compare_at_price: 65.00,
    category_id: 1,
    category_name: "الملابس الرجالية",
    sku: "PRD-M-SHRT-04",
    is_active: true,
    image_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1621072156002-e2fcc103e86e?auto=format&fit=crop&q=80&w=600"
    ],
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["أبيض ناصع", "أزرق سماوي", "أخضر زيتوني"],
    rating: 4.5,
    reviews_count: 14,
    stock: 45
  },
  {
    id: 5,
    product_name: "نظارة شمسية كلاسيكية بإطار ذهبي",
    slug: "classic-gold-sunglasses",
    description: "نظارات شمسية عصرية مستوحاة من الطراز القديم مع إطار معدني مطلي بالذهب ومقاوم للخدش والصدأ. العدسات مستقطبة (Polarized) توفر حماية كاملة 100% من الأشعة فوق البنفسجية الضارة وتمنحك رؤية فائقة الوضوح ومظهراً جذاباً.",
    specifications: "العدسات: عدسات بولارايزد فئة 3 UV400 | الإطار: تيتانيوم مطلي بذهب عيار 18 قيراط | الملحقات: علبة جلدية فاخرة وقطعة تنظيف من المايكروفايبر | الوزن: 24 جرام فائق الخفة.",
    price: 110.00,
    compare_at_price: 150.00,
    category_id: 3,
    category_name: "الإكسسوارات الفاخرة",
    sku: "PRD-A-GLASS-05",
    is_active: true,
    image_url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=600",
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=600"
    ],
    sizes: ["One Size"],
    colors: ["عدسات خضراء وإطار ذهبي", "عدسات سوداء وإطار فضي"],
    rating: 4.6,
    reviews_count: 9,
    stock: 3
  }
];

export const INITIAL_PRODUCT_REVIEWS: Review[] = [];

export const INITIAL_PURCHASE_CODES: PurchaseCode[] = [
  {
    id: 1,
    code: "VIP100-BUY",
    is_used: false,
    created_at: "2026-10-04 14:00"
  }
];

export const INITIAL_CUSTOMERS: AppCustomer[] = [
  {
    id: 1,
    username: "ahmed_ali",
    password: "sha256_b7336d3be9e3cf44588e404b93b33daaa181eb2eb1859663bf5fcf214b9c1d68",
    full_name: "أحمد علي",
    phone: "01012345678",
    is_vip: true,
    purchases_count: 2,
    created_at: "2026-10-01 10:30"
  },
  {
    id: 2,
    username: "sara_fashion",
    password: "sha256_d2c18d7f87258e72e1285db21d743a492803b98436eb469d8d6728096f21272f",
    full_name: "سارة عمر",
    phone: "01198765432",
    is_vip: true,
    purchases_count: 1,
    created_at: "2026-10-02 14:15"
  },
  {
    id: 3,
    username: "mahmoud_vip",
    password: "sha256_a3b2c1f0987654321fedcba0123456789abcdef0123456789abcdef012345678",
    full_name: "محمود حسن",
    phone: "01234567890",
    is_vip: true,
    purchases_count: 0,
    created_at: "2026-10-03 18:40"
  }
];

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  whatsapp_number: "01014955160",
  instapay_address: "boutique@instapay",
  instapay_phone: "01014955160",
  instapay_recipient_name: "أحمد كامل (بوتيك الأناقة)",
  wallet_phone: "01014955160",
  wallet_recipient_name: "أحمد كامل (فودافون كاش / المحفظة)",
  fawry_code: "987654321",
  fawry_phone: "01014955160",
  fawry_recipient_name: "أحمد كامل (ماي فوري)"
};

export const SAMPLE_COUPONS: Coupon[] = [
  {
    id: 1,
    coupon_code: "KAMEL10",
    discount_type: "percentage",
    discount_value: 10,
    max_discount_amount: 200,
    min_order_amount: 50,
    is_active: true
  },
  {
    id: 2,
    coupon_code: "SAMRA50",
    discount_type: "fixed",
    discount_value: 50,
    max_discount_amount: 200,
    min_order_amount: 250,
    is_active: true
  },
  {
    id: 3,
    coupon_code: "FASHION20",
    discount_type: "percentage",
    discount_value: 20,
    max_discount_amount: 200,
    min_order_amount: 100,
    is_active: true
  }
];

// 2. MySQL Database Schema definitions
export const DB_SCHEMAS: DbTableSchema[] = [
  {
    tableName: "roles",
    description: "Defines system user roles for administrative and customer controls.",
    arabicDescription: "جدول الصلاحيات والأدوار لتحديد مستويات التحكم في النظام (مدير، موظف، عميل).",
    group: "users",
    columns: [
      { name: "id", type: "INT UNSIGNED", isPk: true, isFk: false, nullable: false, defaultValue: "AUTO_INCREMENT", description: "المعرف الفريد للصلاحية" },
      { name: "role_name", type: "VARCHAR(50)", isPk: false, isFk: false, nullable: false, description: "اسم الصلاحية (admin, customer, manager)" },
      { name: "description", type: "VARCHAR(255)", isPk: false, isFk: false, nullable: true, description: "شرح مهام ووظائف هذه الصلاحية" },
      { name: "created_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "تاريخ الإنشاء" },
      { name: "updated_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: true, defaultValue: "NULL ON UPDATE CURRENT_TIMESTAMP", description: "تاريخ آخر تحديث" }
    ]
  },
  {
    tableName: "users",
    description: "Core authentication and credential records for all managers, staff, and customers.",
    arabicDescription: "جدول المستخدمين الأساسي لتخزين بيانات الاعتماد للعملاء والمشرفين.",
    group: "users",
    columns: [
      { name: "id", type: "INT UNSIGNED", isPk: true, isFk: false, nullable: false, defaultValue: "AUTO_INCREMENT", description: "المعرف الفريد للمستخدم" },
      { name: "username", type: "VARCHAR(100)", isPk: false, isFk: false, nullable: false, description: "اسم المستخدم الفريد للدخول" },
      { name: "email", type: "VARCHAR(150)", isPk: false, isFk: false, nullable: false, description: "البريد الإلكتروني الفريد للمستخدم (مفهرس)" },
      { name: "password_hash", type: "VARCHAR(255)", isPk: false, isFk: false, nullable: false, description: "كلمة المرور المشفرة بخوارزمية آمنة (مثل bcrypt)" },
      { name: "role_id", type: "INT UNSIGNED", isPk: false, isFk: true, fkRef: "roles.id", nullable: false, description: "مفتاح أجنبي يربط المستخدم بصلاحية معينة" },
      { name: "is_active", type: "TINYINT(1)", isPk: false, isFk: false, nullable: false, defaultValue: "1", description: "حالة الحساب (نشط / معطل)" },
      { name: "created_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "تاريخ التسجيل والإنشاء" },
      { name: "updated_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: true, defaultValue: "NULL ON UPDATE CURRENT_TIMESTAMP", description: "تاريخ آخر تعديل للبيانات" },
      { name: "deleted_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: true, defaultValue: "NULL", description: "حقل الحذف الناعم (Soft Delete)" }
    ]
  },
  {
    tableName: "customers",
    description: "Detailed information about clients including profiles, preferences, and loyalty rewards.",
    arabicDescription: "جدول تفاصيل العملاء الإضافية مثل الاسم، الهاتف، ونقاط الولاء المجمعة.",
    group: "users",
    columns: [
      { name: "id", type: "INT UNSIGNED", isPk: true, isFk: false, nullable: false, defaultValue: "AUTO_INCREMENT", description: "المعرف الفريد للعميل" },
      { name: "user_id", type: "INT UNSIGNED", isPk: false, isFk: true, fkRef: "users.id", nullable: false, description: "يربط العميل ببيانات حسابه الأساسية (علاقة 1-إلى-1)" },
      { name: "first_name", type: "VARCHAR(100)", isPk: false, isFk: false, nullable: false, description: "الاسم الأول للعميل" },
      { name: "last_name", type: "VARCHAR(100)", isPk: false, isFk: false, nullable: false, description: "اسم العائلة" },
      { name: "phone", type: "VARCHAR(20)", isPk: false, isFk: false, nullable: true, description: "رقم الجوال الخاص بالتواصل والشحن" },
      { name: "gender", type: "ENUM('male', 'female')", isPk: false, isFk: false, nullable: true, description: "الجنس لتصنيف وفلترة العروض" },
      { name: "birth_date", type: "DATE", isPk: false, isFk: false, nullable: true, description: "تاريخ الميلاد لإرسال تهاني وكوبونات الخصم" },
      { name: "loyalty_points", type: "INT", isPk: false, isFk: false, nullable: false, defaultValue: "0", description: "رصيد نقاط الولاء الخاصة بالعميل" },
      { name: "created_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "تاريخ إنشاء البروفايل" },
      { name: "updated_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: true, defaultValue: "NULL ON UPDATE CURRENT_TIMESTAMP", description: "تاريخ التعديل" }
    ]
  },
  {
    tableName: "addresses",
    description: "Stores physical addresses for billing and delivery, linked to customers.",
    arabicDescription: "جدول عناوين الشحن والفواتير المتعددة الخاصة بالعميل (علاقة 1-إلى-متعدد).",
    group: "users",
    columns: [
      { name: "id", type: "INT UNSIGNED", isPk: true, isFk: false, nullable: false, defaultValue: "AUTO_INCREMENT", description: "المعرف الفريد للعنوان" },
      { name: "customer_id", type: "INT UNSIGNED", isPk: false, isFk: true, fkRef: "customers.id", nullable: false, description: "يرتبط العنوان بالعميل مالك العنوان" },
      { name: "address_line1", type: "VARCHAR(255)", isPk: false, isFk: false, nullable: false, description: "العنوان الرئيسي (الشارع، اسم البناية، رقم الشقة)" },
      { name: "address_line2", type: "VARCHAR(255)", isPk: false, isFk: false, nullable: true, description: "العنوان الفرعي أو علامة مميزة قريبة" },
      { name: "city", type: "VARCHAR(100)", isPk: false, isFk: false, nullable: false, description: "المدينة (مثل الرياض، عمان، دبي)" },
      { name: "state", type: "VARCHAR(100)", isPk: false, isFk: false, nullable: false, description: "المنطقة أو المحافظة" },
      { name: "postal_code", type: "VARCHAR(20)", isPk: false, isFk: false, nullable: true, description: "الرمز البريدي لتسهيل التوزيع والتوصيل" },
      { name: "country", type: "VARCHAR(100)", isPk: false, isFk: false, nullable: false, description: "الدولة" },
      { name: "is_default", type: "TINYINT(1)", isPk: false, isFk: false, nullable: false, defaultValue: "0", description: "هل هذا هو عنوان التوصيل الرئيسي؟" },
      { name: "created_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "تاريخ التسجيل" }
    ]
  },
  {
    tableName: "categories",
    description: "Hierarchical product organization supporting primary and sub-categories.",
    arabicDescription: "جدول تصنيفات المنتجات (الملابس الرجالية، النسائية، الإكسسوارات) مع دعم المستويات الفرعية.",
    group: "products",
    columns: [
      { name: "id", type: "INT UNSIGNED", isPk: true, isFk: false, nullable: false, defaultValue: "AUTO_INCREMENT", description: "المعرف الفريد للتصنيف" },
      { name: "category_name", type: "VARCHAR(100)", isPk: false, isFk: false, nullable: false, description: "اسم التصنيف" },
      { name: "parent_id", type: "INT UNSIGNED", isPk: false, isFk: true, fkRef: "categories.id", nullable: true, description: "ربط التصنيف بتصنيف أب لإنشاء شجرة تصنيفات" },
      { name: "slug", type: "VARCHAR(100)", isPk: false, isFk: false, nullable: false, description: "رابط التصنيف الصديق لمحركات البحث (SEO)" },
      { name: "description", type: "TEXT", isPk: false, isFk: false, nullable: true, description: "شرح تفصيلي لما يحتويه هذا التصنيف" },
      { name: "created_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "تاريخ الإنشاء" },
      { name: "updated_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: true, defaultValue: "NULL ON UPDATE CURRENT_TIMESTAMP", description: "تاريخ التعديل" }
    ]
  },
  {
    tableName: "products",
    description: "E-commerce product catalog detailing items, descriptions, and structural properties.",
    arabicDescription: "جدول المنتجات الرئيسي لتخزين الاسم، الوصف، السعر، الباركود SKU، والربط مع التصنيف الرئيسي.",
    group: "products",
    columns: [
      { name: "id", type: "INT UNSIGNED", isPk: true, isFk: false, nullable: false, defaultValue: "AUTO_INCREMENT", description: "المعرف الفريد للمنتج" },
      { name: "product_name", type: "VARCHAR(255)", isPk: false, isFk: false, nullable: false, description: "اسم المنتج المعروض" },
      { name: "slug", type: "VARCHAR(255)", isPk: false, isFk: false, nullable: false, description: "رابط فريد صديق لمحركات البحث (SEO)" },
      { name: "description", type: "TEXT", isPk: false, isFk: false, nullable: true, description: "وصف تفصيلي للمنتج ومواصفاته وخاماته" },
      { name: "price", type: "DECIMAL(10,2)", isPk: false, isFk: false, nullable: false, description: "سعر المنتج الفعلي المعتمد للبيع" },
      { name: "compare_at_price", type: "DECIMAL(10,2)", isPk: false, isFk: false, nullable: true, description: "السعر الأصلي قبل الخصم (لإظهار نسبة التوفير)" },
      { name: "category_id", type: "INT UNSIGNED", isPk: false, isFk: true, fkRef: "categories.id", nullable: false, description: "ربط المنتج بالتصنيف الذي ينتمي إليه" },
      { name: "sku", type: "VARCHAR(100)", isPk: false, isFk: false, nullable: false, description: "رمز حفظ المخزون الفريد (Stock Keeping Unit)" },
      { name: "is_active", type: "TINYINT(1)", isPk: false, isFk: false, nullable: false, defaultValue: "1", description: "حالة العرض والبيع (متاح / مخفي)" },
      { name: "created_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "تاريخ الإضافة" },
      { name: "updated_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: true, defaultValue: "NULL ON UPDATE CURRENT_TIMESTAMP", description: "تاريخ آخر تحديث للمنتج" },
      { name: "deleted_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: true, defaultValue: "NULL", description: "حقل الحذف الناعم لإخفاء المنتج دون تدمير سجلات المشتريات القديمة" }
    ]
  },
  {
    tableName: "product_images",
    description: "Maintains links to product visual assets and gallery order.",
    arabicDescription: "جدول صور المنتجات المتعددة لتمكين وجود معرض صور لكل منتج مع تحديد الصورة الرئيسية.",
    group: "products",
    columns: [
      { name: "id", type: "INT UNSIGNED", isPk: true, isFk: false, nullable: false, defaultValue: "AUTO_INCREMENT", description: "معرف الصورة الفريد" },
      { name: "product_id", type: "INT UNSIGNED", isPk: false, isFk: true, fkRef: "products.id", nullable: false, description: "معرف المنتج المرتبط بالصورة" },
      { name: "image_url", type: "VARCHAR(255)", isPk: false, isFk: false, nullable: false, description: "رابط الصورة على خادم التخزين السحابي" },
      { name: "is_primary", type: "TINYINT(1)", isPk: false, isFk: false, nullable: false, defaultValue: "0", description: "هل هي الصورة الرئيسية للمنتج في نتائج البحث والكتالوج؟" },
      { name: "created_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "تاريخ الإضافة" }
    ]
  },
  {
    tableName: "inventory",
    description: "Tracks physical stocks, thresholds, and storage locations per product.",
    arabicDescription: "جدول إدارة المخزون لتتبع كميات المنتجات المتوفرة ومستويات التنبيه بنفاد الكمية.",
    group: "products",
    columns: [
      { name: "id", type: "INT UNSIGNED", isPk: true, isFk: false, nullable: false, defaultValue: "AUTO_INCREMENT", description: "معرف السجل المخزني" },
      { name: "product_id", type: "INT UNSIGNED", isPk: false, isFk: true, fkRef: "products.id", nullable: false, description: "معرف المنتج المرتبط (علاقة 1-إلى-1 غالباً أو لكل فرع)" },
      { name: "quantity", type: "INT", isPk: false, isFk: false, nullable: false, defaultValue: "0", description: "الكمية الفعلية الحالية المتاحة بالمستودع" },
      { name: "low_stock_threshold", type: "INT", isPk: false, isFk: false, nullable: false, defaultValue: "5", description: "الحد الأدنى الذي يطلق تنبيهاً للمدراء بنقص الكمية" },
      { name: "location", type: "VARCHAR(100)", isPk: false, isFk: false, nullable: true, description: "موقع التخزين المادي داخل المستودع (رقم الرف/القسم)" },
      { name: "updated_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: true, defaultValue: "NULL ON UPDATE CURRENT_TIMESTAMP", description: "تاريخ آخر تحديث لكمية المخزون" }
    ]
  },
  {
    tableName: "carts",
    description: "Active shopping cart sessions linked to customers or temporary tokens.",
    arabicDescription: "جدول عربات التسوق النشطة للعملاء أو الزوار لتخزين السلال قبل إتمام الدفع والطلب.",
    group: "carts",
    columns: [
      { name: "id", type: "INT UNSIGNED", isPk: true, isFk: false, nullable: false, defaultValue: "AUTO_INCREMENT", description: "معرف السلة الفريد" },
      { name: "customer_id", type: "INT UNSIGNED", isPk: false, isFk: true, fkRef: "customers.id", nullable: true, description: "معرف العميل (NULL للزوار غير المسجلين)" },
      { name: "session_token", type: "VARCHAR(255)", isPk: false, isFk: false, nullable: false, description: "رمز الجلسة الفريد لربط السلة بالمتصفح" },
      { name: "created_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "تاريخ بدء التسوق وإنشاء السلة" },
      { name: "updated_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: true, defaultValue: "NULL ON UPDATE CURRENT_TIMESTAMP", description: "تاريخ آخر تفاعل" }
    ]
  },
  {
    tableName: "cart_items",
    description: "Specific quantities of items added to a customer's active cart.",
    arabicDescription: "جدول عناصر سلة التسوق الفرعية لتخزين المنتجات والكميات المحددة قبل الانتقال للشراء.",
    group: "carts",
    columns: [
      { name: "id", type: "INT UNSIGNED", isPk: true, isFk: false, nullable: false, defaultValue: "AUTO_INCREMENT", description: "معرف عنصر السلة الفريد" },
      { name: "cart_id", type: "INT UNSIGNED", isPk: false, isFk: true, fkRef: "carts.id", nullable: false, description: "رقم السلة التابع لها العنصر" },
      { name: "product_id", type: "INT UNSIGNED", isPk: false, isFk: true, fkRef: "products.id", nullable: false, description: "معرف المنتج المضاف" },
      { name: "quantity", type: "INT", isPk: false, isFk: false, nullable: false, defaultValue: "1", description: "الكمية المطلوبة من المنتج" },
      { name: "created_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "تاريخ الإضافة" }
    ]
  },
  {
    tableName: "orders",
    description: "Core sales orders detailing customers, pricing, and references.",
    arabicDescription: "جدول الطلبات الرئيسي لتخزين فواتير المبيعات، الإجماليات، الخصومات وحالة الطلب الأساسية.",
    group: "orders",
    columns: [
      { name: "id", type: "INT UNSIGNED", isPk: true, isFk: false, nullable: false, defaultValue: "AUTO_INCREMENT", description: "معرف الطلب الفريد" },
      { name: "customer_id", type: "INT UNSIGNED", isPk: false, isFk: true, fkRef: "customers.id", nullable: false, description: "العميل الذي قام بإصدار الطلب" },
      { name: "order_number", type: "VARCHAR(50)", isPk: false, isFk: false, nullable: false, description: "رقم الطلب التسلسلي المعروض للعميل (مثل ORD-2026-001)" },
      { name: "total_amount", type: "DECIMAL(10,2)", isPk: false, isFk: false, nullable: false, description: "إجمالي قيمة المنتجات قبل أي خصم أو ضرائب أو شحن" },
      { name: "discount_amount", type: "DECIMAL(10,2)", isPk: false, isFk: false, nullable: false, defaultValue: "0.00", description: "قيمة الخصم المالي المطبق" },
      { name: "shipping_amount", type: "DECIMAL(10,2)", isPk: false, isFk: false, nullable: false, defaultValue: "0.00", description: "رسوم التوصيل والشحن" },
      { name: "tax_amount", type: "DECIMAL(10,2)", isPk: false, isFk: false, nullable: false, defaultValue: "0.00", description: "قيمة الضريبة المضافة المحتسبة" },
      { name: "net_amount", type: "DECIMAL(10,2)", isPk: false, isFk: false, nullable: false, description: "المبلغ النهائي المطلوب دفعه (الصافي)" },
      { name: "coupon_id", type: "INT UNSIGNED", isPk: false, isFk: true, fkRef: "coupons.id", nullable: true, description: "رقم كوبون الخصم المطبق على الطلب إن وجد" },
      { name: "shipping_address_id", type: "INT UNSIGNED", isPk: false, isFk: true, fkRef: "addresses.id", nullable: false, description: "العنوان الذي حدده العميل لتسليم هذا الطلب" },
      { name: "order_status", type: "VARCHAR(50)", isPk: false, isFk: false, nullable: false, defaultValue: "'Pending'", description: "حالة الطلب الحالية (Pending, Processing, Shipped, Delivered, Cancelled)" },
      { name: "created_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "تاريخ ووقت إتمام عملية الشراء" },
      { name: "updated_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: true, defaultValue: "NULL ON UPDATE CURRENT_TIMESTAMP", description: "تاريخ آخر تحديث لحالة أو تفاصيل الطلب" }
    ]
  },
  {
    tableName: "order_items",
    description: "Line-item components detailing product cost, quantity, and subtotal per order.",
    arabicDescription: "جدول تفاصيل عناصر الطلب لتخزين سعر الشراء لكل منتج في وقت الطلب لضمان ثبات الفواتير تاريخياً.",
    group: "orders",
    columns: [
      { name: "id", type: "INT UNSIGNED", isPk: true, isFk: false, nullable: false, defaultValue: "AUTO_INCREMENT", description: "معرف السجل الفريد" },
      { name: "order_id", type: "INT UNSIGNED", isPk: false, isFk: true, fkRef: "orders.id", nullable: false, description: "رقم الطلب المرتبط بالعنصر" },
      { name: "product_id", type: "INT UNSIGNED", isPk: false, isFk: true, fkRef: "products.id", nullable: false, description: "معرف المنتج المباع" },
      { name: "quantity", type: "INT", isPk: false, isFk: false, nullable: false, description: "الكمية المشتراة" },
      { name: "unit_price", type: "DECIMAL(10,2)", isPk: false, isFk: false, nullable: false, description: "سعر الحبة وقت الشراء (قد يختلف عن السعر الحالي للمنتج بسبب العروض)" },
      { name: "subtotal", type: "DECIMAL(10,2)", isPk: false, isFk: false, nullable: false, description: "إجمالي قيمة العناصر (الكمية × سعر الوحدة)" }
    ]
  },
  {
    tableName: "payments",
    description: "Financial transactions, gateway details, and processing status.",
    arabicDescription: "جدول عمليات الدفع والتحويلات المالية، لتخزين مراجع المعاملات وطرق الدفع والتحقق الحسابي.",
    group: "orders",
    columns: [
      { name: "id", type: "INT UNSIGNED", isPk: true, isFk: false, nullable: false, defaultValue: "AUTO_INCREMENT", description: "معرف عملية الدفع" },
      { name: "order_id", type: "INT UNSIGNED", isPk: false, isFk: true, fkRef: "orders.id", nullable: false, description: "الطلب المرتبط بالدفع" },
      { name: "payment_method", type: "VARCHAR(50)", isPk: false, isFk: false, nullable: false, description: "طريقة الدفع (Credit Card, PayPal, Apple Pay, COD)" },
      { name: "transaction_reference", type: "VARCHAR(150)", isPk: false, isFk: false, nullable: true, description: "رقم المعاملة الفريد المرجع من بوابة الدفع الخارجية" },
      { name: "amount", type: "DECIMAL(10,2)", isPk: false, isFk: false, nullable: false, description: "المبلغ الذي تم دفعه فعلياً" },
      { name: "payment_status", type: "VARCHAR(50)", isPk: false, isFk: false, nullable: false, defaultValue: "'Pending'", description: "حالة الدفع الحالية (Pending, Completed, Failed, Refunded)" },
      { name: "paid_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: true, description: "تاريخ الدفع الفعلي والناجح" },
      { name: "created_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "تاريخ إنشاء المعاملة" }
    ]
  },
  {
    tableName: "shipping",
    description: "Delivery logs, shipping methods, courier allocations, and real-time statuses.",
    arabicDescription: "جدول معلومات الشحن والتوصيل، لتخزين أرقام التتبع، الشركات الناقلة، وتواريخ التسليم المتوقعة.",
    group: "orders",
    columns: [
      { name: "id", type: "INT UNSIGNED", isPk: true, isFk: false, nullable: false, defaultValue: "AUTO_INCREMENT", description: "معرف سجل الشحن الفريد" },
      { name: "order_id", type: "INT UNSIGNED", isPk: false, isFk: true, fkRef: "orders.id", nullable: false, description: "الطلب المراد شحنه وتوصيله" },
      { name: "shipping_method", type: "VARCHAR(100)", isPk: false, isFk: false, nullable: false, description: "طريقة الشحن (Fast Shipping, standard, Aramex, DHL)" },
      { name: "tracking_number", type: "VARCHAR(150)", isPk: false, isFk: false, nullable: true, description: "رقم تتبع الشحنة الممنوح من شركة النقل" },
      { name: "shipping_status", type: "VARCHAR(50)", isPk: false, isFk: false, nullable: false, defaultValue: "'Pending'", description: "حالة التوصيل (Pending, In Transit, Delivered, Returned)" },
      { name: "estimated_delivery", type: "DATE", isPk: false, isFk: false, nullable: true, description: "التاريخ المتوقع لتسليم الشحنة للعميل" },
      { name: "shipped_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: true, description: "وقت خروج الشحنة الفعلي من مستودعنا" },
      { name: "delivered_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: true, description: "وقت تسلم العميل للشحنة وتوقيع الإيصال" }
    ]
  },
  {
    tableName: "coupons",
    description: "Discount vouchers and promotional campaigns with validity and constraints.",
    arabicDescription: "جدول كوبونات الخصم لتخزين الرموز الترويجية، قيمتها، حدود الاستخدام، وتواريخ الصلاحية.",
    group: "services",
    columns: [
      { name: "id", type: "INT UNSIGNED", isPk: true, isFk: false, nullable: false, defaultValue: "AUTO_INCREMENT", description: "معرف الكوبون الفريد" },
      { name: "coupon_code", type: "VARCHAR(50)", isPk: false, isFk: false, nullable: false, description: "كود الكوبون الذي يكتبه العميل لتفعيل الخصم" },
      { name: "discount_type", type: "ENUM('percentage', 'fixed')", isPk: false, isFk: false, nullable: false, description: "نوع الخصم: نسبة مئوية (مثل 10%) أو مبلغ ثابت (مثل 50$)" },
      { name: "discount_value", type: "DECIMAL(10,2)", isPk: false, isFk: false, nullable: false, description: "قيمة الخصم الممنوحة" },
      { name: "min_order_amount", type: "DECIMAL(10,2)", isPk: false, isFk: false, nullable: false, defaultValue: "0.00", description: "الحد الأدنى لقيمة الطلب لتطبيق الخصم" },
      { name: "usage_limit", type: "INT", isPk: false, isFk: false, nullable: true, description: "أقصى عدد مرات متاح لاستخدام هذا الكوبون بالمتجر" },
      { name: "times_used", type: "INT", isPk: false, isFk: false, nullable: false, defaultValue: "0", description: "عدد المرات التي تم فيها تفعيل الكوبون حتى الآن" },
      { name: "expires_at", type: "DATETIME", isPk: false, isFk: false, nullable: true, description: "تاريخ انتهاء صلاحية الكوبون" },
      { name: "is_active", type: "TINYINT(1)", isPk: false, isFk: false, nullable: false, defaultValue: "1", description: "هل الكوبون مفعل حالياً؟" },
      { name: "created_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "تاريخ الإنشاء" }
    ]
  },
  {
    tableName: "reviews",
    description: "Tracks customer feedback, rating stars, and testimonial approvals.",
    arabicDescription: "جدول التقييمات والتعليقات الخاصة بالعملاء حول جودة ومظهر المنتجات المشتراة.",
    group: "services",
    columns: [
      { name: "id", type: "INT UNSIGNED", isPk: true, isFk: false, nullable: false, defaultValue: "AUTO_INCREMENT", description: "معرف التقييم الفريد" },
      { name: "customer_id", type: "INT UNSIGNED", isPk: false, isFk: true, fkRef: "customers.id", nullable: false, description: "العميل كاتب التقييم" },
      { name: "product_id", type: "INT UNSIGNED", isPk: false, isFk: true, fkRef: "products.id", nullable: false, description: "المنتج الذي يخصه التقييم" },
      { name: "rating", type: "TINYINT UNSIGNED", isPk: false, isFk: false, nullable: false, description: "عدد النجوم (من 1 إلى 5 نجوم)" },
      { name: "comment", type: "TEXT", isPk: false, isFk: false, nullable: true, description: "التعليق المكتوب من العميل بالتفصيل" },
      { name: "is_approved", type: "TINYINT(1)", isPk: false, isFk: false, nullable: false, defaultValue: "0", description: "هل تمت مراجعة التقييم والموافقة على نشره علناً؟" },
      { name: "created_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "تاريخ إضافة التعليق والتقييم" }
    ]
  },
  {
    tableName: "order_status_history",
    description: "Maintains an audit trail of order progression events.",
    arabicDescription: "جدول سجل حالات الطلب لتتبع رحلة وتحديثات الطلبات تاريخياً ومعرفة من قام بالتحديث والسبب.",
    group: "orders",
    columns: [
      { name: "id", type: "INT UNSIGNED", isPk: true, isFk: false, nullable: false, defaultValue: "AUTO_INCREMENT", description: "المعرف الفريد" },
      { name: "order_id", type: "INT UNSIGNED", isPk: false, isFk: true, fkRef: "orders.id", nullable: false, description: "الطلب المرتبط بهذا التغيير" },
      { name: "status_name", type: "VARCHAR(50)", isPk: false, isFk: false, nullable: false, description: "الحالة الجديدة التي تحول إليها الطلب" },
      { name: "changed_by_user_id", type: "INT UNSIGNED", isPk: false, isFk: true, fkRef: "users.id", nullable: false, description: "المستخدم (المدير أو الموظف أو العميل) الذي قام بالتعديل" },
      { name: "notes", type: "VARCHAR(255)", isPk: false, isFk: false, nullable: true, description: "ملاحظات وتفاصيل التغيير (مثال: تم التغليف وتجهيز الشحنة)" },
      { name: "created_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "تاريخ ووقت التحول وتحديث الحالة" }
    ]
  },
  {
    tableName: "activity_logs",
    description: "Security logging mapping critical system actions and actor telemetry.",
    arabicDescription: "جدول سجل العمليات الأمنية والتحركات الحساسة بالموقع لمراقبة الأمان وتدقيق البيانات.",
    group: "services",
    columns: [
      { name: "id", type: "INT UNSIGNED", isPk: true, isFk: false, nullable: false, defaultValue: "AUTO_INCREMENT", description: "معرف سجل العملية الفريد" },
      { name: "user_id", type: "INT UNSIGNED", isPk: false, isFk: true, fkRef: "users.id", nullable: true, description: "المستخدم فاعل العملية (NULL للعمليات العامة غير المسجلة)" },
      { name: "action", type: "VARCHAR(100)", isPk: false, isFk: false, nullable: false, description: "نوع العملية (مثل: تسجيل دخول، تحديث مخزون، تفعيل خصم)" },
      { name: "ip_address", type: "VARCHAR(45)", isPk: false, isFk: false, nullable: true, description: "عنوان IP للعميل لحمايته ومتابعة الأمن" },
      { name: "details", type: "TEXT", isPk: false, isFk: false, nullable: true, description: "تفاصيل مشروحة تفيد المراجع للموقع" },
      { name: "created_at", type: "TIMESTAMP", isPk: false, isFk: false, nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "تاريخ ووقت تسجيل الحدث" }
    ]
  }
];

// 3. MySQL DML & DDL Code block text
export const FULL_MYSQL_SCRIPT = `-- =========================================================================
-- تصميم وإعداد قاعدة بيانات متجر الملابس والإكسسوارات الاحترافي
-- إعداد وتصميم: كامل أبو سمرة – kamel3lom
-- التوافقية: MySQL 8.0+
-- محرك البيانات والترميز: ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
-- =========================================================================

-- 1. إنشاء قاعدة البيانات وتفعيلها
CREATE DATABASE IF NOT EXISTS \`kamel_fashion_db\` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE \`kamel_fashion_db\`;

-- تعطيل قيود المفاتيح الأجنبية مؤقتاً لضمان حذف سليم دون تداخل
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS \`activity_logs\`;
DROP TABLE IF EXISTS \`order_status_history\`;
DROP TABLE IF EXISTS \`reviews\`;
DROP TABLE IF EXISTS \`shipping\`;
DROP TABLE IF EXISTS \`payments\`;
DROP TABLE IF EXISTS \`order_items\`;
DROP TABLE IF EXISTS \`orders\`;
DROP TABLE IF EXISTS \`cart_items\`;
DROP TABLE IF EXISTS \`carts\`;
DROP TABLE IF EXISTS \`inventory\`;
DROP TABLE IF EXISTS \`product_images\`;
DROP TABLE IF EXISTS \`products\`;
DROP TABLE IF EXISTS \`categories\`;
DROP TABLE IF EXISTS \`addresses\`;
DROP TABLE IF EXISTS \`customers\`;
DROP TABLE IF EXISTS \`users\`;
DROP TABLE IF EXISTS \`roles\`;
DROP TABLE IF EXISTS \`coupons\`;

SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------------------------
-- 2. إنشاء الجداول مع القيود والمفاتيح الأساسية والأجنبية
-- -------------------------------------------------------------------------

-- [جدول الصلاحيات - roles]
CREATE TABLE \`roles\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`role_name\` VARCHAR(50) NOT NULL,
  \`description\` VARCHAR(255) DEFAULT NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uq_role_name\` (\`role_name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [جدول المستخدمين - users]
CREATE TABLE \`users\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`username\` VARCHAR(100) NOT NULL,
  \`email\` VARCHAR(150) NOT NULL,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`role_id\` INT UNSIGNED NOT NULL,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT '1',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  \`deleted_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uq_username\` (\`username\`),
  UNIQUE KEY \`uq_email\` (\`email\`),
  KEY \`fk_users_roles_idx\` (\`role_id\`),
  CONSTRAINT \`fk_users_roles\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\` (\`id\`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [جدول العملاء - customers]
CREATE TABLE \`customers\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`first_name\` VARCHAR(100) NOT NULL,
  \`last_name\` VARCHAR(100) NOT NULL,
  \`phone\` VARCHAR(20) DEFAULT NULL,
  \`gender\` ENUM('male','female') DEFAULT NULL,
  \`birth_date\` DATE DEFAULT NULL,
  \`loyalty_points\` INT NOT NULL DEFAULT '0',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uq_customer_user\` (\`user_id\`),
  CONSTRAINT \`fk_customers_users\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [جدول العناوين - addresses]
CREATE TABLE \`addresses\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`customer_id\` INT UNSIGNED NOT NULL,
  \`address_line1\` VARCHAR(255) NOT NULL,
  \`address_line2\` VARCHAR(255) DEFAULT NULL,
  \`city\` VARCHAR(100) NOT NULL,
  \`state\` VARCHAR(100) NOT NULL,
  \`postal_code\` VARCHAR(20) DEFAULT NULL,
  \`country\` VARCHAR(100) NOT NULL,
  \`is_default\` TINYINT(1) NOT NULL DEFAULT '0',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`fk_addresses_customers_idx\` (\`customer_id\`),
  CONSTRAINT \`fk_addresses_customers\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [جدول تصنيفات المنتجات - categories]
CREATE TABLE \`categories\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`category_name\` VARCHAR(100) NOT NULL,
  \`parent_id\` INT UNSIGNED DEFAULT NULL,
  \`slug\` VARCHAR(100) NOT NULL,
  \`description\` TEXT,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uq_category_slug\` (\`slug\`),
  KEY \`fk_categories_parent_idx\` (\`parent_id\`),
  CONSTRAINT \`fk_categories_parent\` FOREIGN KEY (\`parent_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [جدول المنتجات - products]
CREATE TABLE \`products\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`product_name\` VARCHAR(255) NOT NULL,
  \`slug\` VARCHAR(255) NOT NULL,
  \`description\` TEXT,
  \`price\` DECIMAL(10,2) NOT NULL,
  \`compare_at_price\` DECIMAL(10,2) DEFAULT NULL,
  \`category_id\` INT UNSIGNED NOT NULL,
  \`sku\` VARCHAR(100) NOT NULL,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT '1',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  \`deleted_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uq_product_sku\` (\`sku\`),
  UNIQUE KEY \`uq_product_slug\` (\`slug\`),
  KEY \`fk_products_categories_idx\` (\`category_id\`),
  CONSTRAINT \`fk_products_categories\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON UPDATE CASCADE,
  CONSTRAINT \`chk_product_price\` CHECK (\`price\` >= 0.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [جدول صور المنتجات - product_images]
CREATE TABLE \`product_images\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`product_id\` INT UNSIGNED NOT NULL,
  \`image_url\` VARCHAR(255) NOT NULL,
  \`is_primary\` TINYINT(1) NOT NULL DEFAULT '0',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`fk_images_products_idx\` (\`product_id\`),
  CONSTRAINT \`fk_images_products\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [جدول المخزون - inventory]
CREATE TABLE \`inventory\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`product_id\` INT UNSIGNED NOT NULL,
  \`quantity\` INT NOT NULL DEFAULT '0',
  \`low_stock_threshold\` INT NOT NULL DEFAULT '5',
  \`location\` VARCHAR(100) DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uq_inventory_product\` (\`product_id\`),
  CONSTRAINT \`fk_inventory_products\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`chk_inventory_qty\` CHECK (\`quantity\` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [جدول الكوبونات - coupons]
CREATE TABLE \`coupons\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`coupon_code\` VARCHAR(50) NOT NULL,
  \`discount_type\` ENUM('percentage','fixed') NOT NULL,
  \`discount_value\` DECIMAL(10,2) NOT NULL,
  \`min_order_amount\` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  \`usage_limit\` INT DEFAULT NULL,
  \`times_used\` INT NOT NULL DEFAULT '0',
  \`expires_at\` DATETIME DEFAULT NULL,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT '1',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uq_coupon_code\` (\`coupon_code\`),
  CONSTRAINT \`chk_coupon_discount\` CHECK (\`discount_value\` > 0.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [جدول السلة - carts]
CREATE TABLE \`carts\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`customer_id\` INT UNSIGNED DEFAULT NULL,
  \`session_token\` VARCHAR(255) NOT NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`fk_carts_customers_idx\` (\`customer_id\`),
  CONSTRAINT \`fk_carts_customers\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [جدول عناصر السلة - cart_items]
CREATE TABLE \`cart_items\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`cart_id\` INT UNSIGNED NOT NULL,
  \`product_id\` INT UNSIGNED NOT NULL,
  \`quantity\` INT NOT NULL DEFAULT '1',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uq_cart_product\` (\`cart_id\`,\`product_id\`),
  KEY \`fk_items_products_idx\` (\`product_id\`),
  CONSTRAINT \`fk_items_carts\` FOREIGN KEY (\`cart_id\`) REFERENCES \`carts\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`fk_items_products\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`chk_cart_qty\` CHECK (\`quantity\` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [جدول الطلبات - orders]
CREATE TABLE \`orders\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`customer_id\` INT UNSIGNED NOT NULL,
  \`order_number\` VARCHAR(50) NOT NULL,
  \`total_amount\` DECIMAL(10,2) NOT NULL,
  \`discount_amount\` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  \`shipping_amount\` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  \`tax_amount\` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  \`net_amount\` DECIMAL(10,2) NOT NULL,
  \`coupon_id\` INT UNSIGNED DEFAULT NULL,
  \`shipping_address_id\` INT UNSIGNED NOT NULL,
  \`order_status\` VARCHAR(50) NOT NULL DEFAULT 'Pending',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uq_order_number\` (\`order_number\`),
  KEY \`fk_orders_customers_idx\` (\`customer_id\`),
  KEY \`fk_orders_coupons_idx\` (\`coupon_id\`),
  KEY \`fk_orders_addresses_idx\` (\`shipping_address_id\`),
  CONSTRAINT \`fk_orders_addresses\` FOREIGN KEY (\`shipping_address_id\`) REFERENCES \`addresses\` (\`id\`) ON UPDATE CASCADE,
  CONSTRAINT \`fk_orders_coupons\` FOREIGN KEY (\`coupon_id\`) REFERENCES \`coupons\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT \`fk_orders_customers\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\` (\`id\`) ON UPDATE CASCADE,
  CONSTRAINT \`chk_order_total\` CHECK (\`total_amount\` >= 0.00),
  CONSTRAINT \`chk_order_net\` CHECK (\`net_amount\` >= 0.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [جدول عناصر الطلب - order_items]
CREATE TABLE \`order_items\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`order_id\` INT UNSIGNED NOT NULL,
  \`product_id\` INT UNSIGNED NOT NULL,
  \`quantity\` INT NOT NULL,
  \`unit_price\` DECIMAL(10,2) NOT NULL,
  \`subtotal\` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`fk_orditems_orders_idx\` (\`order_id\`),
  KEY \`fk_orditems_products_idx\` (\`product_id\`),
  CONSTRAINT \`fk_orditems_orders\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`fk_orditems_products\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON UPDATE CASCADE,
  CONSTRAINT \`chk_item_subtotal\` CHECK (\`subtotal\` = \`quantity\` * \`unit_price\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [جدول المدفوعات - payments]
CREATE TABLE \`payments\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`order_id\` INT UNSIGNED NOT NULL,
  \`payment_method\` VARCHAR(50) NOT NULL,
  \`transaction_reference\` VARCHAR(150) DEFAULT NULL,
  \`amount\` DECIMAL(10,2) NOT NULL,
  \`payment_status\` VARCHAR(50) NOT NULL DEFAULT 'Pending',
  \`paid_at\` TIMESTAMP NULL DEFAULT NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uq_payment_transaction\` (\`transaction_reference\`),
  KEY \`fk_payments_orders_idx\` (\`order_id\`),
  CONSTRAINT \`fk_payments_orders\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`chk_payment_amt\` CHECK (\`amount\` >= 0.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [جدول الشحن - shipping]
CREATE TABLE \`shipping\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`order_id\` INT UNSIGNED NOT NULL,
  \`shipping_method\` VARCHAR(100) NOT NULL,
  \`tracking_number\` VARCHAR(150) DEFAULT NULL,
  \`shipping_status\` VARCHAR(50) NOT NULL DEFAULT 'Pending',
  \`estimated_delivery\` DATE DEFAULT NULL,
  \`shipped_at\` TIMESTAMP NULL DEFAULT NULL,
  \`delivered_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uq_shipping_tracking\` (\`tracking_number\`),
  KEY \`fk_shipping_orders_idx\` (\`order_id\`),
  CONSTRAINT \`fk_shipping_orders\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [جدول المراجعات - reviews]
CREATE TABLE \`reviews\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`customer_id\` INT UNSIGNED NOT NULL,
  \`product_id\` INT UNSIGNED NOT NULL,
  \`rating\` TINYINT UNSIGNED NOT NULL,
  \`comment\` TEXT DEFAULT NULL,
  \`is_approved\` TINYINT(1) NOT NULL DEFAULT '0',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`fk_reviews_customers_idx\` (\`customer_id\`),
  KEY \`fk_reviews_products_idx\` (\`product_id\`),
  CONSTRAINT \`fk_reviews_customers\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`fk_reviews_products\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`chk_review_stars\` CHECK (\`rating\` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [جدول سجل تتبع حالات الطلب - order_status_history]
CREATE TABLE \`order_status_history\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`order_id\` INT UNSIGNED NOT NULL,
  \`status_name\` VARCHAR(50) NOT NULL,
  \`changed_by_user_id\` INT UNSIGNED NOT NULL,
  \`notes\` VARCHAR(255) DEFAULT NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`fk_history_orders_idx\` (\`order_id\`),
  KEY \`fk_history_users_idx\` (\`changed_by_user_id\`),
  CONSTRAINT \`fk_history_orders\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`fk_history_users\` FOREIGN KEY (\`changed_by_user_id\`) REFERENCES \`users\` (\`id\`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [جدول سجل العمليات - activity_logs]
CREATE TABLE \`activity_logs\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`user_id\` INT UNSIGNED DEFAULT NULL,
  \`action\` VARCHAR(100) NOT NULL,
  \`ip_address\` VARCHAR(45) DEFAULT NULL,
  \`details\` TEXT,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`fk_logs_users_idx\` (\`user_id\`),
  CONSTRAINT \`fk_logs_users\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 3. الفهارس لتحسين الأداء (Performance Indexes)
-- -------------------------------------------------------------------------

CREATE INDEX \`idx_users_email\` ON \`users\` (\`email\`);
CREATE INDEX \`idx_products_sku\` ON \`products\` (\`sku\`);
CREATE INDEX \`idx_products_slug\` ON \`products\` (\`slug\`);
CREATE INDEX \`idx_orders_customer_id\` ON \`orders\` (\`customer_id\`);
CREATE INDEX \`idx_orders_order_status\` ON \`orders\` (\`order_status\`);
CREATE INDEX \`idx_payments_payment_status\` ON \`payments\` (\`payment_status\`);
CREATE INDEX \`idx_shipping_shipping_status\` ON \`shipping\` (\`shipping_status\`);
CREATE INDEX \`idx_activity_logs_created\` ON \`activity_logs\` (\`created_at\`);

-- -------------------------------------------------------------------------
-- 4. إدخال البيانات التجريبية والمطابقة لشروط العميل
-- -------------------------------------------------------------------------

-- [إضافة الصلاحيات]
INSERT INTO \`roles\` (\`id\`, \`role_name\`, \`description\`) VALUES
(1, 'Admin', 'مدير النظام بكامل الصلاحيات الفنية والإدارية والمخزنية'),
(2, 'Customer', 'عميل مسجل يتسوق ويقدم طلبات ويكتب مراجعات');

-- [إضافة مستخدم مدير + عميلين تجريبيين]
INSERT INTO \`users\` (\`id\`, \`username\`, \`email\`, \`password_hash\`, \`role_id\`, \`is_active\`) VALUES
(1, 'kamel3lom', 'kamel@samra.com', '$2b$12$R.W3K4Kz8vKOm8fTzY3OWePBeLd3tB3bB.m1R4aZpBe7T2tK7K1Ke', 1, 1), -- كلمة المرور الافتراضية مشفرة: 'AdminPass123'
(2, 'ahmed_ali', 'ahmed@gmail.com', '$2b$12$K.zM2x4x8vKPm8fTzY3OWePBeLd3tB3bB.m1R4aZpBe7T2tK7K2Ke', 2, 1),  -- كلمة المرور الافتراضية مشفرة: 'CustomerPass123'
(3, 'sara_omar', 'sara@outlook.com', '$2b$12$L.xM3y5y9vKQm9fTzY4OWePBeLd4tB4bB.m2R5aZpBe8T3tK8K3Ke', 2, 1);

-- [تفاصيل العملاء]
INSERT INTO \`customers\` (\`id\`, \`user_id\`, \`first_name\`, \`last_name\`, \`phone\`, \`gender\`, \`birth_date\`, \`loyalty_points\`) VALUES
(1, 2, 'أحمد', 'علي', '0599112233', 'male', '1995-04-12', 150),
(2, 3, 'سارة', 'عمر', '0599445566', 'female', '1998-08-25', 380);

-- [عناوين العملاء]
INSERT INTO \`addresses\` (\`id\`, \`customer_id\`, \`address_line1\`, \`address_line2\`, \`city\`, \`state\`,\`postal_code\`, \`country\`, \`is_default\`) VALUES
(1, 1, 'شارع الملك فهد، حي المروج', 'مبنى 44، شقة 10', 'الرياض', 'الرياض', '12281', 'السعودية', 1),
(2, 2, 'شارع المدينة، عمارة الأمل', 'الطابق الثالث', 'عمان', 'العاصمة', '11190', 'الأردن', 1);

-- [تصنيفات الملابس والإكسسوارات]
INSERT INTO \`categories\` (\`id\`, \`category_name\`, \`parent_id\`, \`slug\`, \`description\`) VALUES
(1, 'الملابس الرجالية', NULL, 'mens-clothing', 'أحدث صيحات البدلات والأزياء الرجالية الكلاسيكية واليومية'),
(2, 'الملابس النسائية', NULL, 'womens-clothing', 'فساتين فاخرة وأزياء نسائية متميزة لجميع المناسبات'),
(3, 'الإكسسوارات الفاخرة', NULL, 'luxury-accessories', 'حقائب يد من الجلد الإيطالي، نظارات شمسية، وساعات أنيقة');

-- [خمسة منتجات واقعية تتبع التصنيفات]
INSERT INTO \`products\` (\`id\`, \`product_name\`, \`slug\`, \`description\`, \`price\`, \`compare_at_price\`, \`category_id\`, \`sku\`, \`is_active\`) VALUES
(1, 'بدلة رجالية رسمية فاخرة', 'luxury-mens-suit', 'بدلة رسمية كلاسيكية من الصوف الإيطالي الممتاز بقصة عصرية متناسقة', 349.99, 499.99, 1, 'PRD-M-SUIT-01', 1),
(2, 'فستان سهرة كلاسيكي مطرز', 'evening-classic-dress', 'فستان سهرة ناعم مصنوع من الحرير الطبيعي ومطرز بخيوط ذهبية أنيقة', 289.00, 399.00, 2, 'PRD-W-DRES-02', 1),
(3, 'حقيبة يد جلدية إيطالية طبيعية', 'italian-leather-handbag', 'حقيبة مصنوعة يدوياً من جلد العجل الطبيعي المقاوم للخدوش وسحابات برونزية', 195.00, NULL, 3, 'PRD-A-BAG-03', 1),
(4, 'قميص قطني صيفي كاجوال', 'summer-cotton-shirt', 'قميص كاجوال ناعم وبارد مثالي للطقس الصيفي مصنوع من القطن العضوي', 45.50, 65.00, 1, 'PRD-M-SHRT-04', 1),
(5, 'نظارة شمسية كلاسيكية بإطار ذهبي', 'classic-gold-sunglasses', 'نظارة حماية كاملة من أشعة الشمس فوق البنفسجية بإطار مطلي بالذهب والبلاتين', 110.00, 150.00, 3, 'PRD-A-GLASS-05', 1);

-- [صور المنتجات]
INSERT INTO \`product_images\` (\`id\`, \`product_id\`, \`image_url\`, \`is_primary\`) VALUES
(1, 1, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80', 1),
(2, 2, 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80', 1),
(3, 3, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80', 1),
(4, 4, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80', 1),
(5, 5, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80', 1);

-- [تأسيس كميات المخزون والموقع لكل منتج]
INSERT INTO \`inventory\` (\`id\`, \`product_id\`, \`quantity\`, \`low_stock_threshold\`, \`location\`) VALUES
(1, 1, 15, 5, 'مستودع أ - رف 12'),
(2, 2, 8, 3, 'مستودع أ - رف 15'),
(3, 3, 5, 2, 'مستودع ب - رف 02'),
(4, 4, 45, 10, 'مستودع أ - رف 22'),
(5, 5, 3, 2, 'مستودع ب - رف 08'); -- كمية منخفضة لإطلاق تنبيه النواقص

-- [إعداد كوبونات الخصم]
INSERT INTO \`coupons\` (\`id\`, \`coupon_code\`, \`discount_type\`, \`discount_value\`, \`min_order_amount\`, \`usage_limit\`, \`times_used\`, \`is_active\`) VALUES
(1, 'KAMEL10', 'percentage', 10.00, 50.00, 100, 2, 1),
(2, 'SAMRA50', 'fixed', 50.00, 250.00, 50, 0, 1);

-- [طلبات تجريبية - طلبين واقعيين]
-- الطلب 1: قام به العميل أحمد علي، اشترى القميص الكاجوال والنظارة الذهبية، وطبق كوبون KAMEL10
INSERT INTO \`orders\` (\`id\`, \`customer_id\`, \`order_number\`, \`total_amount\`, \`discount_amount\`, \`shipping_amount\`, \`tax_amount\`, \`net_amount\`, \`coupon_id\`, \`shipping_address_id\`, \`order_status\`) VALUES
(1, 1, 'ORD-2026-0001', 155.50, 15.55, 15.00, 23.33, 178.28, 1, 1, 'Processing'),
-- الطلب 2: قامت به العميل سارة عمر، اشترت فستان السهرة الكلاسيكي، لم تطبق كوبون
(2, 2, 'ORD-2026-0002', 289.00, 0.00, 0.00, 43.35, 332.35, NULL, 2, 'Pending');

-- [تفاصيل عناصر الطلبات]
INSERT INTO \`order_items\` (\`id\`, \`order_id\`, \`product_id\`, \`quantity\`, \`unit_price\`, \`subtotal\`) VALUES
(1, 1, 4, 1, 45.50, 45.50),   -- قميص صيفي
(2, 1, 5, 1, 110.00, 110.00), -- نظارة شمسية ذهبية
(3, 2, 2, 1, 289.00, 289.00); -- فستان سهرة

-- [مدفوعات تجريبية]
INSERT INTO \`payments\` (\`id\`, \`order_id\`, \`payment_method\`, \`transaction_reference\`, \`amount\`, \`payment_status\`, \`paid_at\`) VALUES
(1, 1, 'Credit Card', 'TXN-PAYPAL-998822', 178.28, 'Completed', '2026-07-03 10:00:00'),
(2, 2, 'Cash On Delivery', 'TXN-COD-PENDING-002', 332.35, 'Pending', NULL);

-- [بيانات شحن الطلبات]
INSERT INTO \`shipping\` (\`id\`, \`order_id\`, \`shipping_method\`, \`tracking_number\`, \`shipping_status\`, \`estimated_delivery\`, \`shipped_at\`) VALUES
(1, 1, 'Aramex Express', 'ARM-TRK-7711229', 'In Transit', '2026-07-06', '2026-07-03 14:30:00'),
(2, 2, 'Standard Delivery', NULL, 'Pending', '2026-07-08', NULL);

-- [مراجعات وتقييمات المنتجات]
INSERT INTO \`reviews\` (\`id\`, \`customer_id\`, \`product_id\`, \`rating\`, \`comment\`, \`is_approved\`) VALUES
(1, 1, 4, 5, 'القميص مريح جداً وملمسه رائع على الجسم، والقياس مضبوط تماماً. شكراً كامل أبو سمرة!', 1),
(2, 2, 2, 5, 'فستان رائع جداً وتطريزه غاية في الدقة والجمال، يستحق كل قرش، والشحن سريع جداً.', 1);

-- [تتبع تاريخ حالات الطلب]
INSERT INTO \`order_status_history\` (\`id\`, \`order_id\`, \`status_name\`, \`changed_by_user_id\`, \`notes\`) VALUES
(1, 1, 'Pending', 2, 'قام العميل بإنشاء الطلب واختيار الدفع الإلكتروني'),
(2, 1, 'Processing', 1, 'تم تأكيد استلام الدفعة وجاري الآن تعبئة وتغليف الملابس بالمستودع'),
(3, 2, 'Pending', 3, 'قامت العميلة سارة بإنشاء الطلب واختيار الدفع عند الاستلام (COD)');

-- [سجل العمليات الحساسة والأمنية - activity_logs]
INSERT INTO \`activity_logs\` (\`id\`, \`user_id\`, \`action\`, \`ip_address\`, \`details\`) VALUES
(1, 1, 'LOGIN', '192.168.1.10', 'قام المدير كامل أبو سمرة بتسجيل الدخول إلى لوحة التحكم الإدارية'),
(2, 1, 'STOCK_UPDATE', '192.168.1.10', 'تحديث كمية المنتج (حقيبة يد جلدية) في المستودع ب إلى 5 قطع'),
(3, 2, 'CHECKOUT', '197.34.12.50', 'إتمام الطلب رقم ORD-2026-0001 والدفع بنجاح عبر الفيزا كارد');

COMMIT;
`;

// Helper array representation for local JS-based database sandbox execution
export const MOCK_DB: Record<string, any[]> = {
  roles: [
    { id: 1, role_name: "Admin", description: "مدير النظام بكامل الصلاحيات الفنية والإدارية والمخزنية", created_at: "2026-07-03 09:00:00", updated_at: null },
    { id: 2, role_name: "Customer", description: "عميل مسجل يتسوق ويقدم طلبات ويكتب مراجعات", created_at: "2026-07-03 09:01:00", updated_at: null }
  ],
  users: [
    { id: 1, username: "kamel3lom", email: "kamel@samra.com", password_hash: "$2b$12$R.W3K4Kz8vKOm8fTzY3O...", role_id: 1, is_active: 1, created_at: "2026-07-03 09:05:00", updated_at: null, deleted_at: null },
    { id: 2, username: "ahmed_ali", email: "ahmed@gmail.com", password_hash: "$2b$12$K.zM2x4x8vKPm8fTzY3O...", role_id: 2, is_active: 1, created_at: "2026-07-03 09:10:00", updated_at: null, deleted_at: null },
    { id: 3, username: "sara_omar", email: "sara@outlook.com", password_hash: "$2b$12$L.xM3y5y9vKQm9fTzY4O...", role_id: 2, is_active: 1, created_at: "2026-07-03 09:12:00", updated_at: null, deleted_at: null }
  ],
  customers: [
    { id: 1, user_id: 2, first_name: "أحمد", last_name: "علي", phone: "0599112233", gender: "male", birth_date: "1995-04-12", loyalty_points: 150, created_at: "2026-07-03 09:11:00", updated_at: null },
    { id: 2, user_id: 3, first_name: "سارة", last_name: "عمر", phone: "0599445566", gender: "female", birth_date: "1998-08-25", loyalty_points: 380, created_at: "2026-07-03 09:13:00", updated_at: null }
  ],
  addresses: [
    { id: 1, customer_id: 1, address_line1: "شارع الملك فهد، حي المروج", address_line2: "مبنى 44، شقة 10", city: "الرياض", state: "الرياض", postal_code: "12281", country: "السعودية", is_default: 1, created_at: "2026-07-03 09:15:00" },
    { id: 2, customer_id: 2, address_line1: "شارع المدينة، عمارة الأمل", address_line2: "الطابق الثالث", city: "عمان", state: "العاصمة", postal_code: "11190", country: "الأردن", is_default: 1, created_at: "2026-07-03 09:16:00" }
  ],
  categories: [
    { id: 1, category_name: "الملابس الرجالية", parent_id: null, slug: "mens-clothing", description: "أحدث صيحات البدلات والأزياء الرجالية الكلاسيكية واليومية", created_at: "2026-07-03 09:20:00", updated_at: null },
    { id: 2, category_name: "الملابس النسائية", parent_id: null, slug: "womens-clothing", description: "فساتين فاخرة وأزياء نسائية متميزة لجميع المناسبات", created_at: "2026-07-03 09:21:00", updated_at: null },
    { id: 3, category_name: "الإكسسوارات الفاخرة", parent_id: null, slug: "luxury-accessories", description: "حقائب يد من الجلد الإيطالي، نظارات شمسية، وساعات أنيقة", created_at: "2026-07-03 09:22:00", updated_at: null }
  ],
  products: [
    { id: 1, product_name: "بدلة رجالية رسمية فاخرة", slug: "luxury-mens-suit", description: "بدلة رسمية كلاسيكية من الصوف الإيطالي الممتاز بقصة عصرية متناسقة", price: 349.99, compare_at_price: 499.99, category_id: 1, sku: "PRD-M-SUIT-01", is_active: 1, created_at: "2026-07-03 09:25:00", updated_at: null, deleted_at: null },
    { id: 2, product_name: "فستان سهرة كلاسيكي مطرز", slug: "evening-classic-dress", description: "فستان سهرة ناعم مصنوع من الحرير الطبيعي ومطرز بخيوط ذهبية أنيقة", price: 289.00, compare_at_price: 399.00, category_id: 2, sku: "PRD-W-DRES-02", is_active: 1, created_at: "2026-07-03 09:26:00", updated_at: null, deleted_at: null },
    { id: 3, product_name: "حقيبة يد جلدية إيطالية طبيعية", slug: "italian-leather-handbag", description: "حقيبة مصنوعة يدوياً من جلد العجل الطبيعي المقاوم للخدوش وسحابات برونزية", price: 195.00, compare_at_price: null, category_id: 3, sku: "PRD-A-BAG-03", is_active: 1, created_at: "2026-07-03 09:27:00", updated_at: null, deleted_at: null },
    { id: 4, product_name: "قميص قطني صيفي كاجوال", slug: "summer-cotton-shirt", description: "قميص كاجوال ناعم وبارد مثالي للطقس الصيفي مصنوع من القطن العضوي", price: 45.50, compare_at_price: 65.00, category_id: 1, sku: "PRD-M-SHRT-04", is_active: 1, created_at: "2026-07-03 09:28:00", updated_at: null, deleted_at: null },
    { id: 5, product_name: "نظارة شمسية كلاسيكية بإطار ذهبي", slug: "classic-gold-sunglasses", description: "نظارة حماية كاملة من أشعة الشمس فوق البنفسجية بإطار مطلي بالذهب والبلاتين", price: 110.00, compare_at_price: 150.00, category_id: 3, sku: "PRD-A-GLASS-05", is_active: 1, created_at: "2026-07-03 09:29:00", updated_at: null, deleted_at: null }
  ],
  product_images: [
    { id: 1, product_id: 1, image_url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80", is_primary: 1, created_at: "2026-07-03 09:25:30" },
    { id: 2, product_id: 2, image_url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80", is_primary: 1, created_at: "2026-07-03 09:26:30" },
    { id: 3, product_id: 3, image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80", is_primary: 1, created_at: "2026-07-03 09:27:30" },
    { id: 4, product_id: 4, image_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80", is_primary: 1, created_at: "2026-07-03 09:28:30" },
    { id: 5, product_id: 5, image_url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80", is_primary: 1, created_at: "2026-07-03 09:29:30" }
  ],
  inventory: [
    { id: 1, product_id: 1, quantity: 15, low_stock_threshold: 5, location: "مستودع أ - رف 12" },
    { id: 2, product_id: 2, quantity: 8, low_stock_threshold: 3, location: "مستودع أ - رف 15" },
    { id: 3, product_id: 3, quantity: 5, low_stock_threshold: 2, location: "مستودع ب - رف 02" },
    { id: 4, product_id: 4, quantity: 45, low_stock_threshold: 10, location: "مستودع أ - رف 22" },
    { id: 5, product_id: 5, quantity: 3, low_stock_threshold: 2, location: "مستودع ب - رف 08" }
  ],
  coupons: [
    { id: 1, coupon_code: "KAMEL10", discount_type: "percentage", discount_value: 10.00, min_order_amount: 50.00, usage_limit: 100, times_used: 2, is_active: 1, created_at: "2026-07-03 09:30:00" },
    { id: 2, coupon_code: "SAMRA50", discount_type: "fixed", discount_value: 50.00, min_order_amount: 250.00, usage_limit: 50, times_used: 0, is_active: 1, created_at: "2026-07-03 09:31:00" }
  ],
  carts: [
    { id: 1, customer_id: 1, session_token: "sess_ahmed_123456789", created_at: "2026-07-03 09:32:00", updated_at: null }
  ],
  cart_items: [
    { id: 1, cart_id: 1, product_id: 3, quantity: 1, created_at: "2026-07-03 09:33:00" }
  ],
  orders: [
    { id: 1, customer_id: 1, order_number: "ORD-2026-0001", total_amount: 155.50, discount_amount: 15.55, shipping_amount: 15.00, tax_amount: 23.33, net_amount: 178.28, coupon_id: 1, shipping_address_id: 1, order_status: "Processing", created_at: "2026-07-03 09:45:00", updated_at: "2026-07-03 10:05:00" },
    { id: 2, customer_id: 2, order_number: "ORD-2026-0002", total_amount: 289.00, discount_amount: 0.00, shipping_amount: 0.00, tax_amount: 43.35, net_amount: 332.35, coupon_id: null, shipping_address_id: 2, order_status: "Pending", created_at: "2026-07-03 09:50:00", updated_at: null }
  ],
  order_items: [
    { id: 1, order_id: 1, product_id: 4, quantity: 1, unit_price: 45.50, subtotal: 45.50 },
    { id: 2, order_id: 1, product_id: 5, quantity: 1, unit_price: 110.00, subtotal: 110.00 },
    { id: 3, order_id: 2, product_id: 2, quantity: 1, unit_price: 289.00, subtotal: 289.00 }
  ],
  payments: [
    { id: 1, order_id: 1, payment_method: "Credit Card", transaction_reference: "TXN-PAYPAL-998822", amount: 178.28, payment_status: "Completed", paid_at: "2026-07-03 10:00:00", created_at: "2026-07-03 09:46:00" },
    { id: 2, order_id: 2, payment_method: "Cash On Delivery", transaction_reference: "TXN-COD-PENDING-002", amount: 332.35, payment_status: "Pending", paid_at: null, created_at: "2026-07-03 09:51:00" }
  ],
  shipping: [
    { id: 1, order_id: 1, shipping_method: "Aramex Express", tracking_number: "ARM-TRK-7711229", shipping_status: "In Transit", estimated_delivery: "2026-07-06", shipped_at: "2026-07-03 14:30:00", delivered_at: null },
    { id: 2, order_id: 2, shipping_method: "Standard Delivery", tracking_number: null, shipping_status: "Pending", estimated_delivery: "2026-07-08", shipped_at: null, delivered_at: null }
  ],
  reviews: [
    { id: 1, customer_id: 1, product_id: 4, rating: 5, comment: "القميص مريح جداً وملمسه رائع على الجسم، والقياس مضبوط تماماً. شكراً كامل أبو سمرة!", is_approved: 1, created_at: "2026-07-03 11:15:00" },
    { id: 2, customer_id: 2, product_id: 2, rating: 5, comment: "فستان رائع جداً وتطريزه غاية في الدقة والجمال، يستحق كل قرش، والشحن سريع جداً.", is_approved: 1, created_at: "2026-07-03 11:20:00" }
  ],
  order_status_history: [
    { id: 1, order_id: 1, status_name: "Pending", changed_by_user_id: 2, notes: "قام العميل بإنشاء الطلب واختيار الدفع الإلكتروني", created_at: "2026-07-03 09:45:00" },
    { id: 2, order_id: 1, status_name: "Processing", changed_by_user_id: 1, notes: "تم تأكيد استلام الدفعة وجاري الآن تعبئة وتغليف الملابس بالمستودع", created_at: "2026-07-03 10:05:00" },
    { id: 3, order_id: 2, status_name: "Pending", changed_by_user_id: 3, notes: "قامت العميلة سارة بإنشاء الطلب واختيار الدفع عند الاستلام (COD)", created_at: "2026-07-03 09:50:00" }
  ],
  activity_logs: [
    { id: 1, user_id: 1, action: "LOGIN", ip_address: "192.168.1.10", details: "قام المدير كامل أبو سمرة بتسجيل الدخول إلى لوحة التحكم الإدارية", created_at: "2026-07-03 09:06:00" },
    { id: 2, user_id: 1, action: "STOCK_UPDATE", ip_address: "192.168.1.10", details: "تحديث كمية المنتج (حقيبة يد جلدية) في المستودع ب إلى 5 قطع", created_at: "2026-07-03 09:30:00" },
    { id: 3, user_id: 2, action: "CHECKOUT", ip_address: "197.34.12.50", details: "إتمام الطلب رقم ORD-2026-0001 والدفع بنجاح عبر الفيزا كارد", created_at: "2026-07-03 09:45:30" }
  ]
};

// Definitions of the 10 core operational queries requested
export interface PresetQuery {
  id: string;
  title: string;
  description: string;
  sql: string;
}

export const PRESET_QUERIES: PresetQuery[] = [
  {
    id: "q1",
    title: "عرض جميع المنتجات المتاحة في المخزون",
    description: "جلب كافة المنتجات التي تزيد كميتها المتاحة في جدول المخزون عن صفر مع تفاصيل السعر والتصنيف.",
    sql: `SELECT p.id, p.product_name, p.sku, p.price, c.category_name, i.quantity, i.location
FROM products p
INNER JOIN categories c ON p.category_id = c.id
INNER JOIN inventory i ON p.id = i.product_id
WHERE i.quantity > 0 AND p.is_active = 1;`
  },
  {
    id: "q2",
    title: "عرض منتجات تصنيف معين",
    description: "عرض كافة المنتجات التابعة لتصنيف 'الملابس الرجالية' (category_id = 1).",
    sql: `SELECT p.id, p.product_name, p.sku, p.price, i.quantity
FROM products p
LEFT JOIN inventory i ON p.id = i.product_id
WHERE p.category_id = 1 AND p.is_active = 1;`
  },
  {
    id: "q3",
    title: "عرض تفاصيل طلب كامل برقم الطلب",
    description: "جلب كافة تفاصيل الفاتورة والعناصر المشتراة لطلب معين برقم الطلب 'ORD-2026-0001' بما يشمل معلومات العميل والمنتجات المشتراة.",
    sql: `SELECT o.order_number, concat(cust.first_name, ' ', cust.last_name) AS customer_name,
       p.product_name, oi.quantity, oi.unit_price, oi.subtotal, o.net_amount, o.order_status
FROM orders o
INNER JOIN customers cust ON o.customer_id = cust.id
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id
WHERE o.order_number = 'ORD-2026-0001';`
  },
  {
    id: "q4",
    title: "حساب إجمالي مبيعات اليوم",
    description: "احتساب مجموع المبالغ الصافية (net_amount) لجميع الطلبات التي تمت اليوم والمكتملة أو قيد المعالجة.",
    sql: `SELECT COUNT(id) AS total_orders, IFNULL(SUM(net_amount), 0.00) AS daily_sales_total
FROM orders
WHERE DATE(created_at) = CURRENT_DATE() AND order_status IN ('Processing', 'Shipped', 'Delivered');`
  },
  {
    id: "q5",
    title: "عرض أكثر المنتجات مبيعاً",
    description: "جلب المنتجات الأكثر مبيعاً مرتّبة تنازلياً حسب إجمالي الكميات المطلوبة في عناصر الطلبات.",
    sql: `SELECT p.id, p.product_name, p.sku, SUM(oi.quantity) AS total_units_sold, SUM(oi.subtotal) AS total_revenue
FROM order_items oi
INNER JOIN products p ON oi.product_id = p.id
GROUP BY p.id, p.product_name, p.sku
ORDER BY total_units_sold DESC;`
  },
  {
    id: "q6",
    title: "عرض العملاء الأكثر شراءً",
    description: "عرض ترتيب العملاء حسب إجمالي المبالغ المدفوعة في طلباتهم لتقديم مكافآت ونقاط ولاء إضافية.",
    sql: `SELECT c.id, concat(c.first_name, ' ', c.last_name) AS customer_name, c.phone,
       COUNT(o.id) AS total_orders, SUM(o.net_amount) AS total_spent
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id
GROUP BY c.id, customer_name, c.phone
ORDER BY total_spent DESC;`
  },
  {
    id: "q7",
    title: "تحديث حالة الطلب",
    description: "مثال على تحديث حالة الطلب رقم ORD-2026-0002 ليصبح قيد التجهيز 'Processing'.",
    sql: `UPDATE orders 
SET order_status = 'Processing', updated_at = NOW() 
WHERE order_number = 'ORD-2026-0002';`
  },
  {
    id: "q8",
    title: "خصم الكمية من المخزون بعد إتمام الطلب",
    description: "مثال لتخفيض كمية المخزون لمنتج فستان السهرة (product_id = 2) بمقدار حبة واحدة بعد إتمام شرائه.",
    sql: `UPDATE inventory 
SET quantity = quantity - 1 
WHERE product_id = 2;`
  },
  {
    id: "q9",
    title: "عرض الطلبات غير المدفوعة",
    description: "عرض كافة الطلبات التي لا تزال حالة الدفع الخاصة بها معلقة 'Pending' لمتابعة سدادها.",
    sql: `SELECT o.order_number, concat(c.first_name, ' ', c.last_name) AS customer_name,
       o.net_amount, p.payment_method, p.payment_status, o.created_at
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id
INNER JOIN payments p ON o.id = p.order_id
WHERE p.payment_status = 'Pending';`
  },
  {
    id: "q10",
    title: "عرض المنتجات منخفضة المخزون",
    description: "تحديد المنتجات التي وصلت كميتها المتاحة حالياً في الكتالوج إلى مستويات أقل من حد الإنذار المسموح به لكل منتج لتنبيه كامل أبو سمرة بضرورة إعادة الشراء.",
    sql: `SELECT p.product_name, p.sku, i.quantity, i.low_stock_threshold, i.location
FROM inventory i
INNER JOIN products p ON i.product_id = p.id
WHERE i.quantity <= i.low_stock_threshold;`
  }
];
