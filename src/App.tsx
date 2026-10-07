/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, 
  Database, 
  Terminal, 
  Sparkles, 
  Layers, 
  Activity, 
  UserCheck, 
  X, 
  Check, 
  HelpCircle,
  Clock,
  Settings,
  Lock,
  Plus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Snowflake,
  Archive,
  RefreshCw,
  Trash2,
  Edit2,
  Sliders,
  CheckCircle2,
  Percent,
  CreditCard,
  Search,
  Copy,
  MessageCircle,
  LogOut,
  User,
  Users,
  Eye,
  EyeOff,
  Cloud,
  Wifi,
  Image,
  Link2,
  ExternalLink
} from "lucide-react";
import StoreFront from "./components/StoreFront";
import DbDesigner from "./components/DbDesigner";
import WinterSnowEffect from "./components/WinterSnowEffect";
import { MockSqlEngine } from "./sqlEngine";
import { ActivityLog, Product, Coupon, PurchaseCode, AppCustomer, PaymentSettings, CartItem } from "./types";
import { 
  SAMPLE_PRODUCTS, 
  SAMPLE_COUPONS, 
  INITIAL_PURCHASE_CODES, 
  INITIAL_CUSTOMERS, 
  DEFAULT_PAYMENT_SETTINGS 
} from "./dbSchemaData";
import { subscribeToRealtimeNode, syncDataToCloud } from "./firebase";
import { hashPassword, maskPassword } from "./utils/crypto";
import { loadLocalData, saveLocalData, cacheImagesInBrowser } from "./utils/cacheManager";

export default function App() {
  const [activeView, setActiveView] = useState<"storefront" | "designer">("storefront");
  
  // Dynamic Site Configuration editable via Gear Settings (Loaded from cache for 0ms startup)
  const [siteConfig, setSiteConfig] = useState(() => 
    loadLocalData("siteConfig", {
      siteName: "mr mars store",
      developerCredit: "بإشراف المطور: Amir Lamay",
      showDevCreditAtTop: false,
      heroTitle: "بوتيك الأناقة العصرية",
      heroSubtitle: "تصاميم فاخرة منتقاة بعناية للملابسو الفساتين الكلاسيكية والإكسسوارات المتميزة، صُممت لتمنحك إطلالة فريدة تعبر عن هويتك الراقية.",
      heroBgImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200",
      topMarqueeText: "بوتيك الأناقة العصرية: شحن مجاني لكافة الطلبات فوق 500 ج.م • عروض وخصومات حصرية متجددة يومياً • خدمة عملاء ودعم متواصل 24/7",
      featuredPopupProductId: null as number | null,
      promoBannerImage: "",
      promoBannerLink: "",
      isPopupDisabled: false
    })
  );

  // Winter Star-Snow effect toggle
  const [isWinterSnowEnabled, setIsWinterSnowEnabled] = useState(true);

  // Products Database state (Loaded from browser cache for instant speed)
  const [products, setProducts] = useState<Product[]>(() => 
    loadLocalData("products", SAMPLE_PRODUCTS.map(p => ({
      ...p,
      discount_percentage: p.compare_at_price ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100) : undefined,
      is_featured_marquee: true,
      is_archived: false,
      reviews_count: 0
    })))
  );

  // Coupons state (Loaded from cache)
  const [coupons, setCoupons] = useState<Coupon[]>(() => 
    loadLocalData("coupons", SAMPLE_COUPONS)
  );

  // Single-use 100% Purchase Codes state (Loaded from cache)
  const [purchaseCodes, setPurchaseCodes] = useState<PurchaseCode[]>(() => 
    loadLocalData("purchaseCodes", INITIAL_PURCHASE_CODES)
  );

  // Shopping Cart state isolated per user account (empty by default)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Egyptian Payment Methods Settings state (Loaded from cache)
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() => 
    loadLocalData("paymentSettings", DEFAULT_PAYMENT_SETTINGS)
  );
  const [tempPaymentSettings, setTempPaymentSettings] = useState<PaymentSettings>(() => 
    loadLocalData("paymentSettings", DEFAULT_PAYMENT_SETTINGS)
  );
  const [paymentSaveSuccess, setPaymentSaveSuccess] = useState(false);

  // Customers & Accounts Database state (Loaded from cache)
  const [customers, setCustomers] = useState<AppCustomer[]>(() => 
    loadLocalData("customers", INITIAL_CUSTOMERS)
  );
  const [currentUser, setCurrentUser] = useState<AppCustomer | null>(null);
  const [showUserAuthModal, setShowUserAuthModal] = useState(false);
  const [userAuthMode, setUserAuthMode] = useState<"register" | "login">("register");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [userAuthError, setUserAuthError] = useState("");
  const [userAuthSuccess, setUserAuthSuccess] = useState("");

  // Switch and load isolated cart whenever customer session changes
  useEffect(() => {
    const key = currentUser ? `mr_cart_user_${currentUser.id}` : "mr_cart_guest";
    try {
      const saved = localStorage.getItem(key);
      setCart(saved ? JSON.parse(saved) : []);
    } catch {
      setCart([]);
    }
  }, [currentUser]);

  // Persist cart items uniquely for current user
  useEffect(() => {
    const key = currentUser ? `mr_cart_user_${currentUser.id}` : "mr_cart_guest";
    try {
      localStorage.setItem(key, JSON.stringify(cart));
    } catch {
      // ignore storage error
    }
  }, [cart, currentUser]);

  // Customer Management in Settings state
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
  const [editCustUsername, setEditCustUsername] = useState("");
  const [editCustPassword, setEditCustPassword] = useState("");
  const [editCustFullName, setEditCustFullName] = useState("");
  const [editCustPhone, setEditCustPhone] = useState("");
  const [editCustVip, setEditCustVip] = useState(false);

  // Settings & Authentication States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isSettingsUnlocked, setIsSettingsUnlocked] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [settingsTab, setSettingsTab] = useState<"site" | "coupons" | "marquee_winter" | "archived" | "payment" | "customers" | "database">("site");

  // Temp form states for settings editing
  const [tempSiteName, setTempSiteName] = useState(siteConfig.siteName);
  const [tempDeveloperCredit, setTempDeveloperCredit] = useState(siteConfig.developerCredit);
  const [tempShowDevCreditAtTop, setTempShowDevCreditAtTop] = useState(siteConfig.showDevCreditAtTop);
  const [tempHeroTitle, setTempHeroTitle] = useState(siteConfig.heroTitle);
  const [tempHeroSubtitle, setTempHeroSubtitle] = useState(siteConfig.heroSubtitle);
  const [tempHeroBgImage, setTempHeroBgImage] = useState(siteConfig.heroBgImage);
  const [tempTopMarqueeText, setTempTopMarqueeText] = useState(siteConfig.topMarqueeText || "بوتيك الأناقة العصرية: شحن مجاني لكافة الطلبات فوق 500 ج.م • عروض وخصومات حصرية متجددة يومياً • خدمة عملاء ودعم متواصل 24/7");
  const [tempFeaturedPopupProductId, setTempFeaturedPopupProductId] = useState<number | null>(siteConfig.featuredPopupProductId || null);
  const [tempPromoBannerImage, setTempPromoBannerImage] = useState(siteConfig.promoBannerImage || "");
  const [tempPromoBannerLink, setTempPromoBannerLink] = useState(siteConfig.promoBannerLink || "");
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Entrance Featured Product Modal & Follow-up Register Modal
  const [showFeaturedProductModal, setShowFeaturedProductModal] = useState(true);
  const [showFollowupRegisterModal, setShowFollowupRegisterModal] = useState(false);
  const [activePopupProduct, setActivePopupProduct] = useState<Product | null>(null);

  // Auto-pick popup product from settings or randomly from catalog
  useEffect(() => {
    if (products.length > 0) {
      if (siteConfig.featuredPopupProductId) {
        const found = products.find(p => p.id === siteConfig.featuredPopupProductId && !p.is_archived);
        if (found) {
          setActivePopupProduct(found);
          return;
        }
      }
      const available = products.filter(p => !p.is_archived);
      if (available.length > 0) {
        const randomIndex = Math.floor(Math.random() * available.length);
        setActivePopupProduct(available[randomIndex]);
      }
    }
  }, [products, siteConfig.featuredPopupProductId]);

  const handleCloseFeaturedProductModal = () => {
    setShowFeaturedProductModal(false);
    if (!currentUser) {
      setShowFollowupRegisterModal(true);
    }
  };

  // Coupon Creation form states
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState<string>("20");
  const [newCouponMaxLimit, setNewCouponMaxLimit] = useState<string>("200");
  const [newCouponMinOrder, setNewCouponMinOrder] = useState<string>("50");
  const [editingCouponId, setEditingCouponId] = useState<number | null>(null);

  // Purchase Code setting state
  const [customPurchaseCodeName, setCustomPurchaseCodeName] = useState("");

  // Trigger for Add Product Modal
  const [isAddProductTriggered, setIsAddProductTriggered] = useState(false);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: 1,
      user_id: 1,
      action: "INIT_DB",
      ip_address: "127.0.0.1",
      details: "تم تأسيس هيكل متجر الأناقة وتغذية المنتجات والكتالوج بنجاح.",
      created_at: new Date().toISOString().replace("T", " ").substring(0, 19)
    }
  ]);

  const [showLogDrawer, setShowLogDrawer] = useState(false);

  // Initialize SQL Engine once
  const sqlEngine = useMemo(() => new MockSqlEngine(), []);

  // Firebase Realtime Synchronization across all users, browsers, and mobile devices
  useEffect(() => {
    // 1. Subscribe to Products
    const unsubProds = subscribeToRealtimeNode<Product[]>("products", (cloudProds) => {
      if (Array.isArray(cloudProds) && cloudProds.length > 0) {
        setProducts(cloudProds);
      }
    });

    // 2. Subscribe to Coupons
    const unsubCoupons = subscribeToRealtimeNode<Coupon[]>("coupons", (cloudCoupons) => {
      if (Array.isArray(cloudCoupons) && cloudCoupons.length > 0) {
        setCoupons(cloudCoupons);
      }
    });

    // 3. Subscribe to 100% Purchase Codes
    const unsubCodes = subscribeToRealtimeNode<PurchaseCode[]>("purchaseCodes", (cloudCodes) => {
      if (Array.isArray(cloudCodes) && cloudCodes.length > 0) {
        setPurchaseCodes(cloudCodes);
      }
    });

    // 4. Subscribe to Payment Settings
    const unsubPayment = subscribeToRealtimeNode<PaymentSettings>("paymentSettings", (cloudPayment) => {
      if (cloudPayment && cloudPayment.whatsapp_number) {
        setPaymentSettings(cloudPayment);
        setTempPaymentSettings(cloudPayment);
      }
    });

    // 5. Subscribe to Customers
    const unsubCustomers = subscribeToRealtimeNode<AppCustomer[]>("customers", (cloudCusts) => {
      if (Array.isArray(cloudCusts) && cloudCusts.length > 0) {
        setCustomers(cloudCusts);
      }
    });

    // 6. Subscribe to Site Config
    const unsubSite = subscribeToRealtimeNode<typeof siteConfig>("siteConfig", (cloudConfig) => {
      if (cloudConfig && cloudConfig.siteName) {
        setSiteConfig(cloudConfig);
      }
    });

    return () => {
      unsubProds();
      unsubCoupons();
      unsubCodes();
      unsubPayment();
      unsubCustomers();
      unsubSite();
    };
  }, []);

  // Cloud synced product updater passed to StoreFront and Admin actions
  const handleUpdateProducts = (action: Product[] | ((prev: Product[]) => Product[])) => {
    setProducts(prev => {
      const next = typeof action === "function" ? action(prev) : action;
      syncDataToCloud("products", next);
      return next;
    });
  };

  const handleAddActivity = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: activityLogs.length + 1,
      user_id: 1,
      action,
      ip_address: "127.0.0.1",
      details,
      created_at: new Date().toISOString().replace("T", " ").substring(0, 19)
    };
    setActivityLogs(prev => {
      const next = [newLog, ...prev];
      syncDataToCloud("activityLogs", next.slice(0, 50));
      return next;
    });
  };

  // Open Settings Gear handler
  const handleOpenSettings = () => {
    if (isSettingsUnlocked) {
      setTempSiteName(siteConfig.siteName);
      setTempDeveloperCredit(siteConfig.developerCredit);
      setTempShowDevCreditAtTop(siteConfig.showDevCreditAtTop || false);
      setTempHeroTitle(siteConfig.heroTitle);
      setTempHeroSubtitle(siteConfig.heroSubtitle);
      setTempHeroBgImage(siteConfig.heroBgImage || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200");
      setTempTopMarqueeText(siteConfig.topMarqueeText || "بوتيك الأناقة العصرية: شحن مجاني لكافة الطلبات فوق 500 ج.م • عروض وخصومات حصرية متجددة يومياً • خدمة عملاء ودعم متواصل 24/7");
      setTempFeaturedPopupProductId(siteConfig.featuredPopupProductId || null);
      setTempPromoBannerImage(siteConfig.promoBannerImage || "");
      setTempPromoBannerLink(siteConfig.promoBannerLink || "");
      setShowSettingsModal(true);
    } else {
      setAdminPasswordInput("");
      setAuthError("");
      setShowAuthModal(true);
    }
  };

  // Handle password submission (0000)
  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === "0000") {
      setIsSettingsUnlocked(true);
      setShowAuthModal(false);
      setTempSiteName(siteConfig.siteName);
      setTempDeveloperCredit(siteConfig.developerCredit);
      setTempShowDevCreditAtTop(siteConfig.showDevCreditAtTop || false);
      setTempHeroTitle(siteConfig.heroTitle);
      setTempHeroSubtitle(siteConfig.heroSubtitle);
      setTempHeroBgImage(siteConfig.heroBgImage || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200");
      setTempTopMarqueeText(siteConfig.topMarqueeText || "بوتيك الأناقة العصرية: شحن مجاني لكافة الطلبات فوق 500 ج.م • عروض وخصومات حصرية متجددة يومياً • خدمة عملاء ودعم متواصل 24/7");
      setTempFeaturedPopupProductId(siteConfig.featuredPopupProductId || null);
      setTempPromoBannerImage(siteConfig.promoBannerImage || "");
      setTempPromoBannerLink(siteConfig.promoBannerLink || "");
      setShowSettingsModal(true);
      handleAddActivity("ADMIN_UNLOCK", "تم تسجيل دخول المسؤول إلى لوحة إعدادات البوتيك بنجاح.");
    } else {
      setAuthError("كلمة المرور غير صحيحة، يرجى إعادة المحاولة.");
    }
  };

  // Save Settings Changes
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const newConfig = {
      siteName: tempSiteName.trim() || siteConfig.siteName,
      developerCredit: tempDeveloperCredit.trim() || siteConfig.developerCredit,
      showDevCreditAtTop: !!tempShowDevCreditAtTop,
      heroTitle: tempHeroTitle.trim() || siteConfig.heroTitle,
      heroSubtitle: tempHeroSubtitle.trim() || siteConfig.heroSubtitle,
      heroBgImage: tempHeroBgImage.trim() || siteConfig.heroBgImage,
      topMarqueeText: tempTopMarqueeText.trim(),
      featuredPopupProductId: tempFeaturedPopupProductId ? Number(tempFeaturedPopupProductId) : null,
      promoBannerImage: tempPromoBannerImage.trim(),
      promoBannerLink: tempPromoBannerLink.trim()
    };
    setSiteConfig(newConfig);
    syncDataToCloud("siteConfig", newConfig);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
    handleAddActivity("UPDATE_SITE_CONFIG", "تم تحديث نصوص وهوية الموقع وخلفية الواجهة والشريط المتحرك وصورة رابط العروض ومزامنتها سحابياً.");
  };

  // Coupon handlers
  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponDiscount) return;

    const val = parseFloat(newCouponDiscount) || 10;
    const maxVal = newCouponMaxLimit ? parseFloat(newCouponMaxLimit) : undefined;
    const minVal = parseFloat(newCouponMinOrder) || 0;

    let updatedCoupons: Coupon[];
    if (editingCouponId) {
      updatedCoupons = coupons.map(c => c.id === editingCouponId ? {
        ...c,
        coupon_code: newCouponCode.trim().toUpperCase(),
        discount_value: val,
        max_discount_amount: maxVal,
        min_order_amount: minVal
      } : c);
      setCoupons(updatedCoupons);
      setEditingCouponId(null);
      handleAddActivity("UPDATE_COUPON", `تم تحديث بيانات كوبون الخصم ${newCouponCode.toUpperCase()}.`);
    } else {
      const newC: Coupon = {
        id: Date.now(),
        coupon_code: newCouponCode.trim().toUpperCase(),
        discount_type: "percentage",
        discount_value: val,
        max_discount_amount: maxVal,
        min_order_amount: minVal,
        is_active: true
      };
      updatedCoupons = [newC, ...coupons];
      setCoupons(updatedCoupons);
      handleAddActivity("ADD_COUPON", `تمت إضافة كوبون خصم جديد ${newC.coupon_code} بنسبة ${val}% وحد أقصى ${maxVal || "غير محدد"}.`);
    }
    syncDataToCloud("coupons", updatedCoupons);

    setNewCouponCode("");
    setNewCouponDiscount("20");
    setNewCouponMaxLimit("200");
  };

  const handleToggleCoupon = (id: number) => {
    const updated = coupons.map(c => c.id === id ? { ...c, is_active: !c.is_active } : c);
    setCoupons(updated);
    syncDataToCloud("coupons", updated);
  };

  const handleDeleteCoupon = (id: number) => {
    const updated = coupons.filter(c => c.id !== id);
    setCoupons(updated);
    syncDataToCloud("coupons", updated);
    handleAddActivity("DELETE_COUPON", `تم حذف كوبون الخصم رقم ${id}.`);
  };

  // Add/Update 100% Purchase code
  const handleSetPurchaseCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPurchaseCodeName.trim()) return;

    const newCodeItem: PurchaseCode = {
      id: Date.now(),
      code: customPurchaseCodeName.trim().toUpperCase(),
      is_used: false,
      created_at: new Date().toISOString().replace("T", " ").substring(0, 16)
    };
    const updated = [newCodeItem, ...purchaseCodes];
    setPurchaseCodes(updated);
    syncDataToCloud("purchaseCodes", updated);
    setCustomPurchaseCodeName("");
    handleAddActivity("NEW_PURCHASE_CODE", `تم إصدار كود شراء جديد بنسبة خصم 100%: ${newCodeItem.code}.`);
  };

  // When purchase code is consumed in StoreFront checkout
  const handleConsumePurchaseCode = (codeStr: string) => {
    // 1. Mark current as used
    const updated = purchaseCodes.map(pc => 
      pc.code.toUpperCase() === codeStr.toUpperCase() ? { ...pc, is_used: true } : pc
    );
    // 2. Automatically generate a new purchase code for next VIP customer
    const autoNextCode = `VIP100-${Math.floor(1000 + Math.random() * 9000)}`;
    const nextItem: PurchaseCode = {
      id: Date.now(),
      code: autoNextCode,
      is_used: false,
      created_at: new Date().toISOString().replace("T", " ").substring(0, 16)
    };
    const finalCodes = [nextItem, ...updated];
    setPurchaseCodes(finalCodes);
    syncDataToCloud("purchaseCodes", finalCodes);
    handleAddActivity("CONSUME_PURCHASE_CODE", `تم استخدام كود الشراء ${codeStr} بنجاح، وتوليد كود شراء جديد لحظياً: ${autoNextCode}.`);
  };

  // Restore archived product
  const handleRestoreProduct = (id: number) => {
    handleUpdateProducts(prev => prev.map(p => p.id === id ? { ...p, is_archived: false } : p));
    handleAddActivity("RESTORE_PRODUCT", `تمت استعادة المنتج رقم ${id} من الأرشيف وإعادته لواجهة المتجر.`);
  };

  // Toggle product in marquee
  const handleToggleMarqueeProduct = (id: number) => {
    handleUpdateProducts(prev => prev.map(p => p.id === id ? { ...p, is_featured_marquee: !p.is_featured_marquee } : p));
  };

  // Payment Settings Save Handler
  const handleSavePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentSettings(tempPaymentSettings);
    syncDataToCloud("paymentSettings", tempPaymentSettings);
    setPaymentSaveSuccess(true);
    setTimeout(() => setPaymentSaveSuccess(false), 2500);
    handleAddActivity("UPDATE_PAYMENT_CONFIG", "تم تحديث حسابات وبيانات طرق الدفع في إعدادات البوتيك ومزامنتها سحابياً.");
  };

  // Automatic VIP on user purchase
  const handleUserPurchase = (customerInfo: { username?: string; phone: string; name: string }) => {
    setCustomers(prev => {
      const updated = prev.map(cust => {
        const matchesCurrent = currentUser && cust.id === currentUser.id;
        const matchesPhone = customerInfo.phone && cust.phone === customerInfo.phone;
        const matchesUsername = customerInfo.username && cust.username.toLowerCase() === customerInfo.username.toLowerCase();
        
        if (matchesCurrent || matchesPhone || matchesUsername) {
          return {
            ...cust,
            purchases_count: cust.purchases_count + 1,
            is_vip: true // Automatically VIP on purchase!
          };
        }
        return cust;
      });
      syncDataToCloud("customers", updated);
      return updated;
    });

    if (currentUser) {
      setCurrentUser(prev => prev ? {
        ...prev,
        purchases_count: prev.purchases_count + 1,
        is_vip: true
      } : null);
    }
  };

  // User Registration with SHA-256 Client-side Encryption
  const handleUserRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserAuthError("");
    setUserAuthSuccess("");

    if (!authUsername.trim()) {
      setUserAuthError("يرجى إدخال اسم المستخدم.");
      return;
    }
    if (!authPassword) {
      setUserAuthError("يرجى إدخال كلمة المرور (مسموح بحروف، أرقام، رموز).");
      return;
    }

    const exists = customers.some(c => c.username.toLowerCase() === authUsername.trim().toLowerCase());
    if (exists) {
      setUserAuthError("اسم المستخدم مسجل مسبقاً، يرجى اختيار اسم مستخدم آخر أو تسجيل الدخول.");
      return;
    }

    // Encrypt password before storage
    const encryptedPassword = await hashPassword(authPassword);

    const newCust: AppCustomer = {
      id: Date.now(),
      username: authUsername.trim(),
      password: encryptedPassword,
      full_name: authFullName.trim() || authUsername.trim(),
      phone: authPhone.trim() || undefined,
      is_vip: false,
      purchases_count: 0,
      created_at: new Date().toISOString().replace("T", " ").substring(0, 16)
    };

    // Newest customer at the top and sync to Cloud
    const nextCustomers = [newCust, ...customers];
    setCustomers(nextCustomers);
    syncDataToCloud("customers", nextCustomers);
    setCurrentUser(newCust);
    setUserAuthSuccess(`أهلاً بك يا ${newCust.username}! تم تشفير بياناتك وإنشاء حسابك بنجاح.`);
    handleAddActivity("REGISTER_USER", `تم تسجيل حساب عميل جديد بالاسم "${newCust.username}" مع تشفير كامل لكلمة المرور.`);
    
    setTimeout(() => {
      setShowUserAuthModal(false);
      setUserAuthSuccess("");
      setAuthUsername("");
      setAuthPassword("");
      setAuthFullName("");
      setAuthPhone("");
    }, 1200);
  };

  // User Login with Hash Comparison
  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserAuthError("");
    setUserAuthSuccess("");

    const inputHash = await hashPassword(authPassword);

    const found = customers.find(
      c => c.username.toLowerCase() === authUsername.trim().toLowerCase() && 
      (c.password === inputHash || c.password === authPassword)
    );

    if (found) {
      const updatedUser = {
        ...found,
        is_vip: found.purchases_count > 0 ? true : found.is_vip
      };
      setCurrentUser(updatedUser);
      setUserAuthSuccess(`مرحباً بك مجدداً يا ${found.username}! تم تسجيل دخولك بنجاح.`);
      handleAddActivity("LOGIN_USER", `تم تسجيل دخول العميل "${found.username}".`);
      
      setTimeout(() => {
        setShowUserAuthModal(false);
        setUserAuthSuccess("");
        setAuthUsername("");
        setAuthPassword("");
      }, 1000);
    } else {
      setUserAuthError("اسم المستخدم أو كلمة المرور غير صحيحة.");
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      handleAddActivity("LOGOUT_USER", `تم تسجيل خروج العميل "${currentUser.username}".`);
    }
    setCurrentUser(null);
  };

  // VIP Status Toggle in Settings
  const handleToggleVip = (id: number) => {
    setCustomers(prev => {
      const updated = prev.map(c => {
        if (c.id === id) {
          const nextVip = !c.is_vip;
          handleAddActivity("TOGGLE_VIP", `تم ${nextVip ? "تفعيل" : "إلغاء"} شارة VIP للعميل "${c.username}".`);
          return { ...c, is_vip: nextVip };
        }
        return c;
      });
      syncDataToCloud("customers", updated);
      return updated;
    });

    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => prev ? { ...prev, is_vip: !prev.is_vip } : null);
    }
  };

  // Delete Customer in Settings
  const handleDeleteCustomer = (id: number, username: string) => {
    if (confirm(`هل أنت متأكد من حذف حساب العميل "${username}" نهائياً من قاعدة البيانات؟`)) {
      setCustomers(prev => {
        const updated = prev.filter(c => c.id !== id);
        syncDataToCloud("customers", updated);
        return updated;
      });
      if (currentUser && currentUser.id === id) {
        setCurrentUser(null);
      }
      handleAddActivity("DELETE_CUSTOMER", `تم حذف حساب العميل "${username}" من قاعدة البيانات.`);
    }
  };

  // Start Editing Customer
  const handleStartEditCustomer = (cust: AppCustomer) => {
    setEditingCustomerId(cust.id);
    setEditCustUsername(cust.username);
    setEditCustPassword("");
    setEditCustFullName(cust.full_name || "");
    setEditCustPhone(cust.phone || "");
    setEditCustVip(cust.is_vip);
  };

  // Save Customer Edit with Hashed Password
  const handleSaveEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomerId || !editCustUsername.trim()) return;

    let finalPassword: string | undefined = undefined;
    if (editCustPassword.trim()) {
      finalPassword = await hashPassword(editCustPassword.trim());
    }

    setCustomers(prev => {
      const updated = prev.map(c => {
        if (c.id === editingCustomerId) {
          return {
            ...c,
            username: editCustUsername.trim(),
            password: finalPassword || c.password,
            full_name: editCustFullName.trim() || c.full_name,
            phone: editCustPhone.trim() || c.phone,
            is_vip: editCustVip
          };
        }
        return c;
      });
      syncDataToCloud("customers", updated);
      return updated;
    });

    if (currentUser && currentUser.id === editingCustomerId) {
      setCurrentUser(prev => prev ? {
        ...prev,
        username: editCustUsername.trim(),
        password: finalPassword || prev.password,
        full_name: editCustFullName.trim() || prev.full_name,
        phone: editCustPhone.trim() || prev.phone,
        is_vip: editCustVip
      } : null);
    }

    handleAddActivity("UPDATE_CUSTOMER", `تم تعديل بيانات حساب العميل "${editCustUsername}".`);
    setEditingCustomerId(null);
  };

  // Simulate order creation on database side
  const handleSimulateOrderCreation = (orderData: {
    customerName: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    items: { product_id: number; quantity: number; price: number }[];
    total: number;
    discount: number;
    net: number;
    coupon_code?: string;
    payment_method: string;
    shipping_method: string;
  }) => {
    const dbState = sqlEngine.getDatabaseState();
    
    // 1. Insert into orders
    const orderId = dbState.orders.length + 1;
    const orderNum = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
    
    dbState.orders.push({
      id: orderId,
      order_number: orderNum,
      customer_id: 1, // Ahmed Ali
      coupon_id: orderData.coupon_code ? 1 : null,
      subtotal_amount: orderData.total,
      discount_amount: orderData.discount,
      shipping_cost: orderData.shipping_method === "Standard Delivery" ? 0 : 15,
      tax_amount: (orderData.total - orderData.discount) * 0.15,
      net_amount: orderData.net,
      order_status: "Pending",
      created_at: nowStr,
      updated_at: nowStr
    });

    // 2. Insert into order_items and update inventory quantities
    orderData.items.forEach((item, idx) => {
      dbState.order_items.push({
        id: dbState.order_items.length + 1,
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
        created_at: nowStr,
        updated_at: nowStr
      });

      // Update local db inventory
      const invItem = dbState.inventory.find((i: any) => i.product_id === item.product_id);
      if (invItem) {
        invItem.quantity = Math.max(0, invItem.quantity - item.quantity);
        invItem.updated_at = nowStr;
      }
    });

    // 3. Insert into payments
    dbState.payments.push({
      id: dbState.payments.length + 1,
      order_id: orderId,
      transaction_reference: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
      amount: orderData.net,
      payment_method: orderData.payment_method,
      payment_status: orderData.payment_method === "Cash on Delivery" ? "Pending" : "Completed",
      created_at: nowStr,
      updated_at: nowStr
    });

    // 4. Insert into shipping
    dbState.shipping.push({
      id: dbState.shipping.length + 1,
      order_id: orderId,
      tracking_number: `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
      shipping_method: orderData.shipping_method,
      shipping_status: "Pending",
      estimated_delivery_date: "2026-07-06 18:00:00",
      created_at: nowStr,
      updated_at: nowStr
    });

    // 5. Append order status history
    dbState.order_status_history.push({
      id: dbState.order_status_history.length + 1,
      order_id: orderId,
      status_name: "Pending",
      changed_by_user_id: 1, // Admin (Kamel)
      notes: "تم إنشاء الطلب بشكل تلقائي بعد نجاح معالجة السلة",
      created_at: nowStr
    });

    // 6. Append activity logs
    dbState.activity_logs.push({
      id: dbState.activity_logs.length + 1,
      user_id: 1,
      action: "ORDER_CREATED",
      ip_address: "127.0.0.1",
      details: `تم إنشاء الفاتورة والطلب رقم ${orderNum} بنجاح وخصم كميات المنتجات من جدول المخزون.`,
      created_at: nowStr
    });
  };

  return (
    <div className="w-full min-h-screen bg-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950" dir="rtl">
      
      {/* Top Announcement Moving Marquee Bar (Above Settings and Site Name) */}
      {siteConfig.topMarqueeText && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm py-1.5 sm:py-2 overflow-hidden border-b border-amber-600/30 select-none shadow-xs">
          <div className="animate-marquee flex items-center whitespace-nowrap gap-8">
            <span>{siteConfig.topMarqueeText}</span>
            <span className="text-amber-800">•</span>
            <span>{siteConfig.topMarqueeText}</span>
            <span className="text-amber-800">•</span>
            <span>{siteConfig.topMarqueeText}</span>
          </div>
        </div>
      )}

      {/* Top Header Navigation */}
      <div className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Author (Customizable from Settings) */}
          <div className="flex items-center gap-2 sm:gap-3 text-right">
            <span className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black font-mono shadow-md text-xs sm:text-sm shrink-0">
              M
            </span>
            <div className="flex flex-row items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
              <span className="text-xs sm:text-base font-black text-white leading-tight whitespace-nowrap">
                {siteConfig.siteName}
              </span>
              {siteConfig.showDevCreditAtTop && (
                <span className="text-[10px] sm:text-xs text-amber-400 font-bold whitespace-nowrap bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  {siteConfig.developerCredit}
                </span>
              )}
            </div>
            {/* Realtime Firebase Cloud & Encryption Status Indicator */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1 text-[10px] mr-2">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>سحابي Firebase ⚡</span>
              </span>
              <span className="text-slate-700">|</span>
              <span className="flex items-center gap-1 text-slate-300">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>تشفير SHA-256</span>
              </span>
            </div>
          </div>

          {/* Quick Action Controls on Top Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* If in designer mode, show return to storefront button */}
            {activeView === "designer" && (
              <button
                onClick={() => setActiveView("storefront")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-sm"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                العودة للمتجر
              </button>
            )}

            {/* Add Product Button (Admin Only - Hidden for normal visitors) */}
            {isSettingsUnlocked && (
              <button
                onClick={() => {
                  if (activeView !== "storefront") setActiveView("storefront");
                  setIsAddProductTriggered(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-md shrink-0"
                title="إضافة منتج جديد للمتجر (صلاحية المشرف)"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">أضف منتج</span>
              </button>
            )}

            {/* Shopping Cart Trigger (Placed where Log was, Log is hidden) */}
            <button
              onClick={() => {
                if (activeView !== "storefront") setActiveView("storefront");
                setIsCartOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold transition-all shadow-sm group"
              title="سلة التسوق"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400 group-hover:text-slate-950 transition-colors" />
              <span className="hidden sm:inline">سلة التسوق</span>
              <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-full font-black min-w-[18px] text-center">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </button>

            {/* Account Registration / Login Trigger */}
            <button
              onClick={() => setShowUserAuthModal(true)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                currentUser 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" 
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
              }`}
              title={currentUser ? `حساب: ${currentUser.username}` : "تسجيل حساب جديد"}
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline max-w-[110px] truncate">
                {currentUser ? currentUser.username : "تسجيل حساب"}
              </span>
              {currentUser?.is_vip && (
                <span className="text-[9px] bg-amber-500 text-slate-950 px-1 py-0.2 rounded font-black flex items-center gap-0.5">
                  ⭐ VIP
                </span>
              )}
            </button>

            {/* Quick Winter Snow Stars Toggle */}
            <button
              onClick={() => {
                setIsWinterSnowEnabled(!isWinterSnowEnabled);
                handleAddActivity("TOGGLE_WINTER", `تم ${!isWinterSnowEnabled ? "تشغيل" : "إيقاف"} ثلج النجوم الشتوي.`);
              }}
              className={`p-2 rounded-xl border transition-all ${
                isWinterSnowEnabled 
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-sm" 
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
              title={isWinterSnowEnabled ? "إيقاف ثلج النجوم الشتوي" : "تشغيل ثلج النجوم الشتوي"}
            >
              <Snowflake className={`w-4 h-4 ${isWinterSnowEnabled ? "animate-spin" : ""}`} />
            </button>

            {/* Gear Button (Settings with masked password '0000') */}
            <button
              onClick={handleOpenSettings}
              className={`p-2 rounded-xl border transition-all ${
                isSettingsUnlocked 
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-md" 
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
              title="إعدادات الموقع وتخصيص النصوص"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Winter Snow Stars Effect */}
      {isWinterSnowEnabled && <WinterSnowEffect />}

      {/* Main Content Render */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {activeView === "storefront" ? (
              <StoreFront 
                siteConfig={siteConfig}
                products={products}
                setProducts={handleUpdateProducts}
                coupons={coupons}
                purchaseCodes={purchaseCodes}
                onConsumePurchaseCode={handleConsumePurchaseCode}
                isAdmin={isSettingsUnlocked}
                onAddActivity={handleAddActivity}
                onSimulateOrderCreation={handleSimulateOrderCreation}
                isAddProductOpen={isAddProductTriggered}
                onCloseAddProduct={() => setIsAddProductTriggered(false)}
                cart={cart}
                setCart={setCart}
                isCartOpen={isCartOpen}
                setIsCartOpen={setIsCartOpen}
                paymentSettings={paymentSettings}
                currentUser={currentUser}
                onUserPurchase={handleUserPurchase}
                onOpenRegisterModal={() => setShowUserAuthModal(true)}
              />
            ) : (
              <DbDesigner 
                sqlEngine={sqlEngine}
                activityLogs={activityLogs}
                onAddActivity={handleAddActivity}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Admin Password Modal (Masked Password '0000') */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setShowAuthModal(false)}></div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-right z-10 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">تسجيل دخول المسؤول</h3>
                  <div className="h-8 w-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                يرجى إدخال رمز المرور السري الخاص بإدارة البوتيك للوصول إلى خيارات تعديل اسم المتجر وهوية الموقع:
              </p>

              <form onSubmit={handleVerifyPassword} className="space-y-4">
                <div>
                  <input
                    type="password"
                    autoFocus
                    value={adminPasswordInput}
                    onChange={(e) => {
                      setAdminPasswordInput(e.target.value);
                      setAuthError("");
                    }}
                    placeholder="••••"
                    className="w-full text-center tracking-[0.5em] text-lg font-bold py-3 bg-slate-950 border border-slate-700 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {authError && (
                    <p className="text-[11px] text-red-400 font-semibold mt-1.5 text-center">{authError}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md"
                  >
                    تأكيد الدخول
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal with Persistent Visible Sidebar */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5">
            <div className="absolute inset-0" onClick={() => setShowSettingsModal(false)}></div>
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl text-right z-10 flex flex-col max-h-[92vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 p-4 sm:p-5 bg-slate-950/50">
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                  title="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2.5">
                  <div>
                    <h3 className="font-bold text-white text-base">لوحة إعدادات وإدارة البوتيك</h3>
                    <p className="text-[11px] text-slate-400">تحكم كامل بالهوية، الأكواد، البانرات الترويجية، وطرق الدفع والعملاء</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-inner">
                    <Settings className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Main Content: Persistent Sidebar + Active Content */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
                {/* Persistent Sidebar (Always Visible, Never Closed) */}
                <div className="w-full md:w-60 bg-slate-950/90 border-b md:border-b-0 md:border-l border-slate-800 p-3 sm:p-4 flex flex-row md:flex-col gap-1.5 shrink-0 overflow-x-auto md:overflow-y-auto">
                  <div className="hidden md:block pb-2 mb-1 border-b border-slate-800/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block pr-2">
                      أقسام الإعدادات
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSettingsTab("site")}
                    className={`w-full px-3.5 py-2.5 rounded-xl font-bold flex items-center justify-between gap-2 transition-all cursor-pointer text-xs ${
                      settingsTab === "site" 
                        ? "bg-amber-500 text-slate-950 shadow-md" 
                        : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Settings className="w-4 h-4 shrink-0" />
                      <span>هوية الموقع</span>
                    </div>
                    {settingsTab === "site" && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 shrink-0"></span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettingsTab("coupons")}
                    className={`w-full px-3.5 py-2.5 rounded-xl font-bold flex items-center justify-between gap-2 transition-all cursor-pointer text-xs ${
                      settingsTab === "coupons" 
                        ? "bg-amber-500 text-slate-950 shadow-md" 
                        : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Tag className="w-4 h-4 shrink-0" />
                      <span>أكواد الخصم والشراء</span>
                    </div>
                    {settingsTab === "coupons" && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 shrink-0"></span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettingsTab("marquee_winter")}
                    className={`w-full px-3.5 py-2.5 rounded-xl font-bold flex items-center justify-between gap-2 transition-all cursor-pointer text-xs ${
                      settingsTab === "marquee_winter" 
                        ? "bg-amber-500 text-slate-950 shadow-md" 
                        : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Snowflake className={`w-4 h-4 shrink-0 ${settingsTab === "marquee_winter" ? "text-slate-950" : "text-blue-400"}`} />
                      <span>موسم الشتاء والشريط</span>
                    </div>
                    {settingsTab === "marquee_winter" && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 shrink-0"></span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettingsTab("archived")}
                    className={`w-full px-3.5 py-2.5 rounded-xl font-bold flex items-center justify-between gap-2 transition-all cursor-pointer text-xs ${
                      settingsTab === "archived" 
                        ? "bg-amber-500 text-slate-950 shadow-md" 
                        : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Archive className={`w-4 h-4 shrink-0 ${settingsTab === "archived" ? "text-slate-950" : "text-amber-400"}`} />
                      <span>المؤرشفة</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${settingsTab === "archived" ? "bg-slate-950/20 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                      {products.filter(p => p.is_archived).length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTempPaymentSettings(paymentSettings);
                      setSettingsTab("payment");
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl font-bold flex items-center justify-between gap-2 transition-all cursor-pointer text-xs ${
                      settingsTab === "payment" 
                        ? "bg-amber-500 text-slate-950 shadow-md" 
                        : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CreditCard className="w-4 h-4 shrink-0" />
                      <span>طرق الدفع</span>
                    </div>
                    {settingsTab === "payment" && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 shrink-0"></span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettingsTab("customers")}
                    className={`w-full px-3.5 py-2.5 rounded-xl font-bold flex items-center justify-between gap-2 transition-all cursor-pointer text-xs ${
                      settingsTab === "customers" 
                        ? "bg-amber-500 text-slate-950 shadow-md" 
                        : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Users className={`w-4 h-4 shrink-0 ${settingsTab === "customers" ? "text-slate-950" : "text-blue-400"}`} />
                      <span>العملاء</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${settingsTab === "customers" ? "bg-slate-950/20 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                      {customers.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettingsTab("database")}
                    className={`w-full px-3.5 py-2.5 rounded-xl font-bold flex items-center justify-between gap-2 transition-all cursor-pointer text-xs ${
                      settingsTab === "database" 
                        ? "bg-amber-500 text-slate-950 shadow-md" 
                        : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Database className={`w-4 h-4 shrink-0 ${settingsTab === "database" ? "text-slate-950" : "text-emerald-400"}`} />
                      <span>MySQL</span>
                    </div>
                    {settingsTab === "database" && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 shrink-0"></span>}
                  </button>
                </div>

                {/* Tab Content Panel (Scrollable) */}
                <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5">
                  {saveSuccessNotice && (
                    <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      تم حفظ وتحديث البيانات بنجاح!
                    </div>
                  )}

              {/* Tab 1: Site Identity & Text */}
              {settingsTab === "site" && (
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      اسم الموقع والشريط العلوي:
                    </label>
                    <input
                      type="text"
                      value={tempSiteName}
                      onChange={(e) => setTempSiteName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      placeholder="mr mars store"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      نص إشراف المطور والجهة الإشرافية:
                    </label>
                    <input
                      type="text"
                      value={tempDeveloperCredit}
                      onChange={(e) => setTempDeveloperCredit(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      placeholder="بإشراف المطور: Amir Lamay"
                    />
                  </div>

                  {/* Toggle show developer supervision at the top */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="block text-xs font-bold text-white">إظهار إشراف المطور في الشريط العلوي</span>
                      <span className="block text-[11px] text-slate-400">الافتراضي: إخفاؤه من الأعلى وظهوره فقط في أسفل الموقع</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={tempShowDevCreditAtTop} 
                        onChange={(e) => setTempShowDevCreditAtTop(e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      عنوان الواجهة الترحيبية (Hero Title):
                    </label>
                    <input
                      type="text"
                      value={tempHeroTitle}
                      onChange={(e) => setTempHeroTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      placeholder="بوتيك الأناقة العصرية"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      وصف الواجهة الترحيبية (Hero Description):
                    </label>
                    <textarea
                      rows={3}
                      value={tempHeroSubtitle}
                      onChange={(e) => setTempHeroSubtitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
                      placeholder="تصاميم فاخرة منتقاة بعناية للملابسو الفساتين الكلاسيكية والإكسسوارات المتميزة..."
                    />
                  </div>

                  {/* Hero Background Image URL & File Upload */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      صورة خلفية الواجهة الرئيسية (Hero Background):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={tempHeroBgImage}
                        onChange={(e) => setTempHeroBgImage(e.target.value)}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        placeholder="https://images.unsplash.com/..."
                      />
                      <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer flex items-center gap-1.5 shrink-0">
                        <span>رفع صورة</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result) setTempHeroBgImage(ev.target.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    {/* Background Preview */}
                    {tempHeroBgImage && (
                      <div className="relative h-20 w-full rounded-xl overflow-hidden border border-slate-800 mt-2">
                        <img src={tempHeroBgImage} alt="Hero Preview" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-2 bg-slate-950/80 text-[10px] text-amber-300 px-2 py-0.5 rounded">معاينة الخلفية الحالية</span>
                      </div>
                    )}
                  </div>

                  {/* Moving Marquee Ticker at the Top */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      الشريط المتحرك:
                    </label>
                    <textarea
                      rows={2}
                      value={tempTopMarqueeText}
                      onChange={(e) => setTempTopMarqueeText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
                      placeholder="اكتب هنا أي نص تريده ليظهر ويتحرك في الشريط العلوي أعلى اسم الموقع والإعدادات..."
                    />
                    <span className="text-[10px] text-slate-400 block">
                      يتحرك هذا الشريط باستمرار في أعلى الصفحة فوق الإعدادات واسم الموقع.
                    </span>
                  </div>

                  {/* Featured Popup Product Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      المنتج المحدد في الشاشة المنبثقة الترحيبية:
                    </label>
                    <select
                      value={tempFeaturedPopupProductId === null ? "" : tempFeaturedPopupProductId}
                      onChange={(e) => setTempFeaturedPopupProductId(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                    >
                      <option value="">عشوائي (يتم اختيار منتج عشوائي تلقائياً للزوار عند الدخول)</option>
                      {products.filter(p => !p.is_archived).map(p => (
                        <option key={p.id} value={p.id}>
                          {p.product_name} - {p.price} ج.م ({p.category_name})
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-400 block">
                      يظهر هذا المنتج للعملاء في نافذة منبثقة مميزة فور دخول الموقع مع السعر ونسبة الخصم.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                  >
                    حفظ التعديلات
                  </button>
                </form>
              )}

              {/* Tab 2: Coupons & 100% Purchase Codes */}
              {settingsTab === "coupons" && (
                <div className="space-y-6">
                  {/* Single-Use 100% Purchase Code Management */}
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        كود الشراء الفوري (نسبة 100% - استخدام لمرة واحدة):
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                        100% Discount
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      هذا الكود يمنح العميل خصم 100% ويُستخدم مرة واحدة فقط، ويتغير أوتوماتيكياً فور استخدامه لعملية شراء:
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex-1 bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-xs font-mono font-bold text-emerald-400 flex items-center justify-between">
                        <span>الكود النشط حالياً:</span>
                        <span className="text-amber-400 text-sm tracking-wider">
                          {purchaseCodes.find(pc => !pc.is_used)?.code || "لا يوجد كود نشط"}
                        </span>
                      </div>
                    </div>

                    {/* Set Custom Code */}
                    <form onSubmit={handleSetPurchaseCode} className="flex gap-2">
                      <input
                        type="text"
                        value={customPurchaseCodeName}
                        onChange={(e) => setCustomPurchaseCodeName(e.target.value)}
                        placeholder="اكتب كود الشراء المخصص (أرقام وحروف)..."
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all"
                      >
                        تحديث الكود
                      </button>
                    </form>
                  </div>

                  {/* Standard Coupons Management with Max Discount Limit */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-slate-800 pb-2">
                      <Tag className="w-4 h-4 text-amber-400" />
                      إدارة أكواد الخصم العادية والحدود القصوى:
                    </h4>

                    {/* Add / Edit Coupon Form */}
                    <form onSubmit={handleSaveCoupon} className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">
                            رمز الكود (حروف/أرقام):
                          </label>
                          <input
                            type="text"
                            required
                            value={newCouponCode}
                            onChange={(e) => setNewCouponCode(e.target.value)}
                            placeholder="WINTER20"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono uppercase focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">
                            نسبة الخصم (%):
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            max="100"
                            value={newCouponDiscount}
                            onChange={(e) => setNewCouponDiscount(e.target.value)}
                            placeholder="20"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">
                            أقصى قيمة للخصم (ج.م):
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={newCouponMaxLimit}
                            onChange={(e) => setNewCouponMaxLimit(e.target.value)}
                            placeholder="200"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">
                            الحد الأدنى للطلب (ج.م):
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={newCouponMinOrder}
                            onChange={(e) => setNewCouponMinOrder(e.target.value)}
                            placeholder="50"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        {editingCouponId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCouponId(null);
                              setNewCouponCode("");
                              setNewCouponDiscount("20");
                              setNewCouponMaxLimit("200");
                            }}
                            className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 text-xs hover:bg-slate-800"
                          >
                            إلغاء التعديل
                          </button>
                        )}
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md"
                        >
                          {editingCouponId ? "حفظ تعديل الكود" : "إضافة كود الخصم"}
                        </button>
                      </div>
                    </form>

                    {/* Coupons List */}
                    <div className="space-y-2">
                      {coupons.map((c) => (
                        <div key={c.id} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-black text-amber-400 text-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              {c.coupon_code}
                            </span>
                            <span className="text-slate-300">
                              خصم {c.discount_value}% {c.max_discount_amount ? `(حد أقصى ${c.max_discount_amount})` : ""}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${c.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                              {c.is_active ? "نشط" : "معطل"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleCoupon(c.id)}
                              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-slate-300"
                            >
                              {c.is_active ? "إيقاف" : "تفعيل"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCouponId(c.id);
                                setNewCouponCode(c.coupon_code);
                                setNewCouponDiscount(c.discount_value.toString());
                                setNewCouponMaxLimit(c.max_discount_amount?.toString() || "");
                                setNewCouponMinOrder(c.min_order_amount.toString());
                              }}
                              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-amber-400"
                              title="تعديل"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCoupon(c.id)}
                              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-red-400"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Promo Banner Image & Link for Popup Announcement */}
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Image className="w-4 h-4 text-amber-400" />
                        صورة العرض الترويجي للعملاء ورابط التوجه عند الضغط:
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                        الإعلان المنبثق
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      خاص بالشاشة المنبثقة: عند رفع صورة هنا، تظهر للعملاء كشاشة منبثقة فور دخول الموقع، ويمكن التوجه للرابط المسجل عند الضغط على الصورة أو إغلاقها بزر (X).
                    </p>

                    {/* Image URL & Upload Button */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-slate-300">
                          صورة الإعلان المنبثق (رابط أو رفع من الهاتف/الجهاز):
                        </label>
                        {tempPromoBannerImage && (
                          <button
                            type="button"
                            onClick={() => setTempPromoBannerImage("")}
                            className="text-[10px] text-red-400 hover:text-red-300 underline cursor-pointer"
                          >
                            إلغاء / حذف الصورة
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={tempPromoBannerImage}
                          onChange={(e) => setTempPromoBannerImage(e.target.value)}
                          placeholder="https://... أو اضغط رفع صورة"
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500"
                        />
                        <label className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer flex items-center gap-1.5 shrink-0 transition-all">
                          <Image className="w-3.5 h-3.5 text-amber-400" />
                          <span>رفع صورة</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  if (ev.target?.result) setTempPromoBannerImage(ev.target.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Target Link input */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-300">
                        رابط التوجه عند الضغط على الصورة:
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={tempPromoBannerLink}
                          onChange={(e) => setTempPromoBannerLink(e.target.value)}
                          placeholder="اكتب أو الصق الرابط الذي سوف يتوجه له العميل..."
                          className="w-full px-3 py-2 pl-8 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:ring-2 focus:ring-amber-500"
                          dir="ltr"
                        />
                        <Link2 className="w-4 h-4 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        عند الضغط على الصورة يمكن التوجه للرابط المسجل هنا مباشرة.
                      </span>
                    </div>

                    {/* Preview Image */}
                    {tempPromoBannerImage && (
                      <div className="relative rounded-xl overflow-hidden border border-slate-800 mt-2 bg-slate-900">
                        <img 
                          src={tempPromoBannerImage} 
                          alt="Banner Preview" 
                          className="w-full max-h-40 object-cover rounded-xl" 
                        />
                        <div className="absolute bottom-2 right-2 bg-slate-950/85 px-2 py-0.5 rounded text-[10px] text-amber-300 flex items-center gap-1">
                          <span>معاينة الصورة الحالية</span>
                          {tempPromoBannerLink && <ExternalLink className="w-3 h-3 text-emerald-400" />}
                        </div>
                      </div>
                    )}

                    {/* Save Button for Promo Banner */}
                    <div className="pt-1 flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => handleSaveSettings(e)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>حفظ بيانات الصورة والرابط</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Winter & Marquee */}
              {settingsTab === "marquee_winter" && (
                <div className="space-y-6">
                  {/* Winter Star-Snow Toggle */}
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-blue-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <Snowflake className="w-4 h-4 text-blue-400 animate-spin" />
                        تأثير ثلج النجوم الشتوي (Winter Star-Snow):
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsWinterSnowEnabled(!isWinterSnowEnabled);
                          handleAddActivity("TOGGLE_WINTER", `تم ${!isWinterSnowEnabled ? "تفعيل" : "إيقاف"} ثلج النجوم الشتوي.`);
                        }}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                          isWinterSnowEnabled 
                            ? "bg-blue-500 text-slate-950" 
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {isWinterSnowEnabled ? "مفعل ومضاء ❄️" : "معطل"}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      عند التفعيل، تتساقط نجوم وبلورات ثلجية من أعلى الشاشة إلى أسفلها برقة دون التأثير على تصفح أو النقر على المنتجات، لمنح الزوار أجواء شتوية ساحرة.
                    </p>
                  </div>

                  {/* Marquee Products Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-amber-400" />
                        المنتجات المختارة للعرض في الشريط المتحرك:
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        ({products.filter(p => !p.is_archived && p.is_featured_marquee).length} معروض بالشريط)
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      حدد المنتجات التي تريد أن تتحرك ببطء في الشريط أعلى زر "أضف منتج"، وتقف تلقائياً عند مرور الفأرة، والضغط عليها ينقل العميل للمنتج مباشرة:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                      {products.filter(p => !p.is_archived).map((p) => (
                        <label
                          key={p.id}
                          className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                            p.is_featured_marquee 
                              ? "bg-amber-500/10 border-amber-500/40 text-white" 
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={!!p.is_featured_marquee}
                            onChange={() => handleToggleMarqueeProduct(p.id)}
                            className="w-4 h-4 accent-amber-500 rounded"
                          />
                          <img src={p.image_url} alt="" className="w-9 h-9 object-cover rounded-lg" />
                          <div className="flex-1 text-right overflow-hidden">
                            <span className="block text-xs font-bold truncate">{p.product_name}</span>
                            <span className="text-[10px] text-amber-400">${p.price.toFixed(2)}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Archived Products */}
              {settingsTab === "archived" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Archive className="w-4 h-4 text-amber-500" />
                      المنتجات المؤرشفة (مخفية من المتجر ويمكن استعادتها):
                    </h4>
                  </div>

                  {products.filter(p => p.is_archived).length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs space-y-2">
                      <Archive className="w-10 h-10 mx-auto text-slate-700" />
                      <p>لا توجد منتجات مؤرشفة حالياً في البوتيك.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {products.filter(p => p.is_archived).map((p) => (
                        <div key={p.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <img src={p.image_url} alt="" className="w-10 h-10 object-cover rounded-lg" />
                            <div>
                              <span className="block font-bold text-white">{p.product_name}</span>
                              <span className="text-[11px] text-slate-400">{p.category_name} - ${p.price.toFixed(2)}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRestoreProduct(p.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            استعادة للمتجر
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Payment Settings */}
              {settingsTab === "payment" && (
                <form onSubmit={handleSavePaymentSettings} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-amber-500" />
                        إعدادات طرق الدفع والتحويل (إنستاباي، المحفظة، ماي فوري، واتساب):
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        اكتب هنا الأرقام وعناوين الحسابات وأسماء المستلمين التي ستظهر للعملاء في شاشة الدفع.
                      </p>
                    </div>
                  </div>

                  {paymentSaveSuccess && (
                    <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      تم حفظ إعدادات طرق الدفع بنجاح وتحديثها في شاشة الدفع!
                    </div>
                  )}

                  {/* Section 1: InstaPay */}
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                    <h5 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      1. إنستاباي InstaPay (تحويل لحظي)
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">عنوان إنستاباي (IPA أو المعرف)</label>
                        <input
                          type="text"
                          value={tempPaymentSettings.instapay_address}
                          onChange={e => setTempPaymentSettings({ ...tempPaymentSettings, instapay_address: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          placeholder="username@instapay"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">رقم هاتف إنستاباي (اختياري)</label>
                        <input
                          type="text"
                          value={tempPaymentSettings.instapay_phone}
                          onChange={e => setTempPaymentSettings({ ...tempPaymentSettings, instapay_phone: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          placeholder="01014955160"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 text-right">
                      <label className="text-[11px] font-semibold text-amber-300">الاسم الذي سوف يتم الدفع له (يظهر بخط صغير تحت العملية)</label>
                      <input
                        type="text"
                        value={tempPaymentSettings.instapay_recipient_name}
                        onChange={e => setTempPaymentSettings({ ...tempPaymentSettings, instapay_recipient_name: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        placeholder="اسم المستلم الثلاثي كما يظهر في إنستاباي"
                      />
                    </div>
                  </div>

                  {/* Section 2: Electronic Wallet */}
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                    <h5 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      2. المحفظة الإلكترونية (فودافون كاش / أورنج / اتصالات / وي)
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">رقم المحفظة (التحويل برقم هاتف)</label>
                        <input
                          type="text"
                          value={tempPaymentSettings.wallet_phone}
                          onChange={e => setTempPaymentSettings({ ...tempPaymentSettings, wallet_phone: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          placeholder="01014955160"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-amber-300">الاسم الذي سوف يتم الدفع له (يظهر بخط صغير تحت العملية)</label>
                        <input
                          type="text"
                          value={tempPaymentSettings.wallet_recipient_name}
                          onChange={e => setTempPaymentSettings({ ...tempPaymentSettings, wallet_recipient_name: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          placeholder="اسم صاحب المحفظة"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: MyFawry */}
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                    <h5 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      3. ماي فوري MyFawry (التحويل برقم هاتف أو كود)
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">رقم هاتف ماي فوري للتحويل</label>
                        <input
                          type="text"
                          value={tempPaymentSettings.fawry_phone}
                          onChange={e => setTempPaymentSettings({ ...tempPaymentSettings, fawry_phone: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          placeholder="01014955160"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">كود فوري / رقم التاجر (اختياري)</label>
                        <input
                          type="text"
                          value={tempPaymentSettings.fawry_code}
                          onChange={e => setTempPaymentSettings({ ...tempPaymentSettings, fawry_code: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          placeholder="987654321"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 text-right">
                      <label className="text-[11px] font-semibold text-amber-300">الاسم الذي سوف يتم الدفع له (يظهر بخط صغير تحت العملية)</label>
                      <input
                        type="text"
                        value={tempPaymentSettings.fawry_recipient_name}
                        onChange={e => setTempPaymentSettings({ ...tempPaymentSettings, fawry_recipient_name: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        placeholder="اسم المستلم في ماي فوري"
                      />
                    </div>
                  </div>

                  {/* Section 4: WhatsApp Number */}
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                    <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4" />
                      4. رقم الواتساب لإرسال رسالة الدفع وإتمام البيع
                    </h5>
                    <div className="space-y-1 text-right">
                      <label className="text-[11px] font-semibold text-slate-300">رقم الواتساب المعتمد للمتجر</label>
                      <input
                        type="text"
                        value={tempPaymentSettings.whatsapp_number}
                        onChange={e => setTempPaymentSettings({ ...tempPaymentSettings, whatsapp_number: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        placeholder="01014955160"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    حفظ إعدادات طرق الدفع والتحويل
                  </button>
                </form>
              )}

              {/* Tab: Customers & VIP Accounts */}
              {settingsTab === "customers" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-amber-500" />
                        قائمة العملاء وحسابات VIP المسجلة:
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        يظهر الأحدث في الأعلى، مع شارة VIP داخلية تُمنح تلقائياً عند الشراء أو يدوياً.
                      </p>
                    </div>
                    <span className="text-[11px] bg-slate-800 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-slate-700">
                      {customers.length} عميل
                    </span>
                  </div>

                  {/* Customer Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      value={customerSearchQuery}
                      onChange={e => setCustomerSearchQuery(e.target.value)}
                      placeholder="البحث باسم العميل أو اسم المستخدم أو رقم الهاتف..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500"
                    />
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  </div>

                  {/* Customer Inline Edit Modal/Card */}
                  {editingCustomerId && (
                    <form onSubmit={handleSaveEditCustomer} className="p-4 bg-slate-950 border-2 border-amber-500/40 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h5 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <Edit2 className="w-3.5 h-3.5" />
                          تعديل بيانات العميل: {editCustUsername}
                        </h5>
                        <button
                          type="button"
                          onClick={() => setEditingCustomerId(null)}
                          className="text-slate-400 hover:text-white text-xs"
                        >
                          إلغاء
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400">اسم المستخدم</label>
                          <input
                            type="text"
                            value={editCustUsername}
                            onChange={e => setEditCustUsername(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400">كلمة المرور (حروف، أرقام، رموز)</label>
                          <input
                            type="text"
                            value={editCustPassword}
                            onChange={e => setEditCustPassword(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400">الاسم الكامل</label>
                          <input
                            type="text"
                            value={editCustFullName}
                            onChange={e => setEditCustFullName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400">رقم الهاتف</label>
                          <input
                            type="text"
                            value={editCustPhone}
                            onChange={e => setEditCustPhone(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="editCustVipCheckbox"
                          checked={editCustVip}
                          onChange={e => setEditCustVip(e.target.checked)}
                          className="w-4 h-4 accent-amber-500 rounded"
                        />
                        <label htmlFor="editCustVipCheckbox" className="text-xs font-bold text-amber-400 cursor-pointer">
                          تفعيل شارة VIP للعميل (شراء فوري في أي وقت)
                        </label>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm"
                        >
                          حفظ التعديلات
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCustomerId(null)}
                          className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl hover:bg-slate-700"
                        >
                          إلغاء
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Customer List (Newest first, filtered by search query) */}
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {customers
                      .filter(c => {
                        const q = customerSearchQuery.trim().toLowerCase();
                        if (!q) return true;
                        return (
                          c.username.toLowerCase().includes(q) ||
                          (c.full_name && c.full_name.toLowerCase().includes(q)) ||
                          (c.phone && c.phone.includes(q))
                        );
                      })
                      .map((cust) => (
                        <div
                          key={cust.id}
                          className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white text-xs sm:text-sm">
                                {cust.full_name || cust.username}
                              </span>
                              <span className="text-[11px] text-amber-400 font-mono">
                                (@{cust.username})
                              </span>
                              {cust.is_vip && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs">
                                  ⭐ عميل VIP (شراء في أي وقت)
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                              <span>📱 {cust.phone || "بدون هاتف"}</span>
                              <span className="flex items-center gap-1 font-mono text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                كلمة المرور: مشفرة (SHA-256) ••••••••
                              </span>
                              <span className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-400 font-bold border border-slate-800">
                                عدد المشتريات: {cust.purchases_count}
                              </span>
                              <span className="text-slate-500">📅 {cust.created_at}</span>
                            </div>
                          </div>

                          {/* Action Buttons: VIP, Edit, Delete */}
                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleVip(cust.id)}
                              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
                                cust.is_vip
                                  ? "bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-sm"
                                  : "bg-slate-800 text-amber-400 hover:bg-slate-700 border border-amber-500/30"
                              }`}
                              title={cust.is_vip ? "إلغاء شارة VIP" : "منح شارة VIP"}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              {cust.is_vip ? "إلغاء VIP" : "زر VIP"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStartEditCustomer(cust)}
                              className="px-2.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white text-[11px] font-bold transition-all border border-blue-500/30 flex items-center gap-1"
                              title="تعديل بيانات العميل"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              تعديل
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteCustomer(cust.id, cust.username)}
                              className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-[11px] font-bold transition-all border border-red-500/30 flex items-center gap-1"
                              title="حذف العميل"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              حذف
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Tab 5: Database Designer Shortcut */}
              {settingsTab === "database" && (
                <div className="space-y-4 text-center py-4">
                  <div className="h-14 w-14 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
                    <Database className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-white">لوحة مصمم ومفسر قواعد البيانات MySQL</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    تم إخفاء لوحة قواعد البيانات من الواجهة العامة لتكون مخصصة للإدارة فقط عبر لوحة التحكم. يمكنك فتحها واستعراض كافة الجداول والاستعلامات التشغيلية.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSettingsModal(false);
                      setActiveView("designer");
                      handleAddActivity("OPEN_DESIGNER_ADMIN", "فتح لوحة مفسر ومصمم قواعد البيانات من إعدادات الإدارة.");
                    }}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    فتح لوحة قواعد البيانات الآن
                  </button>
                </div>
              )}
                </div>
              </div>

              {/* Logout & Quick Add */}
              <div className="border-t border-slate-800 p-3 sm:px-5 flex items-center justify-between bg-slate-950/80">
                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsModal(false);
                    if (activeView !== "storefront") setActiveView("storefront");
                    setIsAddProductTriggered(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500 text-amber-400 text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  أضف منتج جديد
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsUnlocked(false);
                    setShowSettingsModal(false);
                    handleAddActivity("ADMIN_LOCK", "تم قفل لوحة الإعدادات وتسجيل خروج المسؤول.");
                  }}
                  className="text-xs text-slate-500 hover:text-red-400 transition-all cursor-pointer"
                >
                  قفل الإعدادات والخروج
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User / Customer Account Registration & Authentication Modal */}
      <AnimatePresence>
        {showUserAuthModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setShowUserAuthModal(false)}></div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl text-right z-10 space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <button 
                  onClick={() => setShowUserAuthModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <div>
                    <h3 className="font-bold text-white text-base">
                      {currentUser ? "حساب العميل الشخصي" : "تسجيل حساب بالبوتيك"}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {currentUser ? "إدارة حسابك وعضوية VIP والمشتريات" : "تسجيل مستخدم جديد أو تسجيل الدخول"}
                    </p>
                  </div>
                  <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Logged in state display */}
              {currentUser ? (
                <div className="space-y-4 text-right">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-white text-base">
                        {currentUser.full_name || currentUser.username}
                      </span>
                      {currentUser.is_vip ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-md">
                          ⭐ عميل VIP
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          عميل مسجل
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-300 space-y-1.5 border-t border-slate-900 pt-2.5">
                      <p className="flex justify-between">
                        <span className="text-slate-500">اسم المستخدم:</span>
                        <strong className="text-amber-400 font-mono">@{currentUser.username}</strong>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-500">رقم الهاتف:</span>
                        <span className="font-mono text-white">{currentUser.phone || "غير مسجل"}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-500">عدد عمليات الشراء السابقة:</span>
                        <strong className="text-emerald-400">{currentUser.purchases_count} عملية</strong>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-500">تاريخ التسجيل:</span>
                        <span className="text-slate-400">{currentUser.created_at}</span>
                      </p>
                    </div>

                    {currentUser.is_vip && (
                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>أنت عميل VIP متميز! يمكنك الشراء الفوري في أي وقت والاستفادة من العروض الخاصة.</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowUserAuthModal(false)}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
                    >
                      إغلاق
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout();
                        setShowUserAuthModal(false);
                      }}
                      className="py-2.5 px-4 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white text-xs font-bold rounded-xl transition-all border border-red-500/30 flex items-center gap-1.5"
                    >
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              ) : (
                /* Registration / Sign in Tabs & Forms */
                <div className="space-y-4">
                  <div className="flex border-b border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setUserAuthMode("register");
                        setUserAuthError("");
                        setUserAuthSuccess("");
                      }}
                      className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-all ${
                        userAuthMode === "register"
                          ? "border-amber-500 text-amber-400"
                          : "border-transparent text-slate-400 hover:text-white"
                      }`}
                    >
                      إنشاء حساب جديد
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserAuthMode("login");
                        setUserAuthError("");
                        setUserAuthSuccess("");
                      }}
                      className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-all ${
                        userAuthMode === "login"
                          ? "border-amber-500 text-amber-400"
                          : "border-transparent text-slate-400 hover:text-white"
                      }`}
                    >
                      تسجيل الدخول
                    </button>
                  </div>

                  {userAuthError && (
                    <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-400 text-xs font-semibold">
                      {userAuthError}
                    </div>
                  )}

                  {userAuthSuccess && (
                    <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      {userAuthSuccess}
                    </div>
                  )}

                  {/* Security and Encryption Assurance Box */}
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-[11px] text-emerald-400 flex items-center gap-2 text-right">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>تشفير سحابي (SHA-256): كلمة المرور وبيانات الحساب مشفرة بالكامل لعدم ظهورها نهائياً.</span>
                  </div>

                  {userAuthMode === "register" ? (
                    /* Register Form */
                    <form onSubmit={handleUserRegister} className="space-y-3 text-right">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300">
                          اسم المستخدم <span className="text-amber-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={authUsername}
                          onChange={e => setAuthUsername(e.target.value)}
                          placeholder="حروف، أرقام، رموز، أي شيء..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          required
                        />
                        <span className="text-[10px] text-slate-500 block">
                          يمكن كتابة اسم المستخدم بأي أحرف أو أرقام أو رموز
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300">
                          كلمة المرور <span className="text-amber-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showAuthPassword ? "text" : "password"}
                            value={authPassword}
                            onChange={e => setAuthPassword(e.target.value)}
                            placeholder="حروف أو أرقام أو رموز..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowAuthPassword(!showAuthPassword)}
                            className="absolute left-2.5 top-2.5 text-slate-400 hover:text-white"
                          >
                            {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          كلمة المرور تقبل أي رموز أو أحرف أو أرقام بدون قيود
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300">الاسم الكامل (اختياري)</label>
                        <input
                          type="text"
                          value={authFullName}
                          onChange={e => setAuthFullName(e.target.value)}
                          placeholder="الاسم ثلاثي أو ثنائي"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300">رقم الهاتف (اختياري)</label>
                        <input
                          type="text"
                          value={authPhone}
                          onChange={e => setAuthPhone(e.target.value)}
                          placeholder="01014955160"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 mt-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
                      >
                        إنشاء الحساب والتسجيل الآن
                      </button>
                    </form>
                  ) : (
                    /* Login Form */
                    <form onSubmit={handleUserLogin} className="space-y-3 text-right">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300">اسم المستخدم</label>
                        <input
                          type="text"
                          value={authUsername}
                          onChange={e => setAuthUsername(e.target.value)}
                          placeholder="اسم المستخدم المسجل..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300">كلمة المرور</label>
                        <div className="relative">
                          <input
                            type={showAuthPassword ? "text" : "password"}
                            value={authPassword}
                            onChange={e => setAuthPassword(e.target.value)}
                            placeholder="كلمة المرور..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowAuthPassword(!showAuthPassword)}
                            className="absolute left-2.5 top-2.5 text-slate-400 hover:text-white"
                          >
                            {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 mt-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
                      >
                        تسجيل الدخول
                      </button>
                    </form>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Activity Log slide out Drawer */}
      <AnimatePresence>
        {showLogDrawer && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex justify-start">
            <div className="absolute inset-0" onClick={() => setShowLogDrawer(false)}></div>
            
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-slate-950 w-full max-w-md h-full flex flex-col border-l border-slate-800 shadow-2xl z-10 text-right"
            >
              {/* Log Header */}
              <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-950">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  سجل الأحداث والعمليات (Audit Logs)
                </h3>
                <button 
                  onClick={() => setShowLogDrawer(false)}
                  className="p-1.5 rounded-full hover:bg-slate-900 text-slate-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Log Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3.5 bg-slate-950">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  يتم رصد هذه الأحداث وتحديث جدول <code className="text-amber-400 font-mono">activity_logs</code> في الوقت الحقيقي بكل عملية نقوم بها في واجهة العميل أو لوحة التحكم للتدقيق الأمني:
                </p>

                <div className="space-y-3">
                  {activityLogs.map(log => (
                    <div key={log.id} className="p-3 bg-slate-900 border border-slate-800/60 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono text-emerald-400 font-bold bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                          {log.action}
                        </span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.created_at}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed text-right">{log.details}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Log footer */}
              <div className="p-4 bg-slate-900/40 border-t border-slate-800 text-[10px] text-slate-500 text-center">
                مبني لتسجيل عمليات الإدارة وفق متطلبات Amir Lamay
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1. Initial Entry Modal (Promo Banner or Featured Product) */}
      <AnimatePresence>
        {showFeaturedProductModal && (siteConfig.promoBannerImage || activePopupProduct) && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={handleCloseFeaturedProductModal}></div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={siteConfig.promoBannerImage 
                ? "relative bg-slate-900 border border-amber-500/30 rounded-3xl p-2 sm:p-2.5 max-w-lg w-full shadow-2xl z-10 overflow-hidden flex flex-col items-center max-h-[92vh]" 
                : "relative bg-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl text-right z-10 space-y-4 max-h-[92vh] overflow-y-auto"
              }
            >
              {siteConfig.promoBannerImage ? (
                /* Pure Promo Banner Image Popup (No buttons, full image visibility, X button on the left only) */
                <div className="relative w-full flex flex-col items-center">
                  {/* Close button X on the left only */}
                  <button
                    type="button"
                    onClick={handleCloseFeaturedProductModal}
                    className="absolute top-2.5 left-2.5 z-30 p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-700/60 shadow-xl transition-all cursor-pointer backdrop-blur-md"
                    title="إغلاق (X)"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {siteConfig.promoBannerLink ? (
                    <a
                      href={siteConfig.promoBannerLink}
                      target={siteConfig.promoBannerLink.startsWith("http") ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      onClick={() => {
                        handleAddActivity("CLICK_POPUP_BANNER", `نقر العميل على الإعلان المنبثق والتوجه إلى: ${siteConfig.promoBannerLink}`);
                        handleCloseFeaturedProductModal();
                      }}
                      className="relative block w-full rounded-2xl overflow-hidden cursor-pointer"
                      title="اضغط على الصورة للتوجه إلى الرابط"
                    >
                      <img
                        src={siteConfig.promoBannerImage}
                        alt="إعلان ترويجي وعرض خاص"
                        className="w-full max-h-[82vh] object-contain rounded-2xl block mx-auto select-none"
                      />
                      {/* اعلان ترويجي وعرض خاص من الاسفل بشكل لا يؤثر علي وضوح الصورة */}
                      <div className="absolute bottom-2.5 inset-x-0 flex justify-center pointer-events-none px-4">
                        <span className="px-3.5 py-1 rounded-full bg-slate-950/65 backdrop-blur-md border border-amber-500/30 text-[11px] sm:text-xs font-bold text-amber-300 shadow-md">
                          إعلان ترويجي وعرض خاص
                        </span>
                      </div>
                    </a>
                  ) : (
                    <div className="relative w-full rounded-2xl overflow-hidden">
                      <img
                        src={siteConfig.promoBannerImage}
                        alt="إعلان ترويجي وعرض خاص"
                        className="w-full max-h-[82vh] object-contain rounded-2xl block mx-auto select-none"
                      />
                      {/* اعلان ترويجي وعرض خاص من الاسفل بشكل لا يؤثر علي وضوح الصورة */}
                      <div className="absolute bottom-2.5 inset-x-0 flex justify-center pointer-events-none px-4">
                        <span className="px-3.5 py-1 rounded-full bg-slate-950/65 backdrop-blur-md border border-amber-500/30 text-[11px] sm:text-xs font-bold text-amber-300 shadow-md">
                          إعلان ترويجي وعرض خاص
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : activePopupProduct ? (
                /* Product Presentation */
                <>
                  {/* Header with Close X */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <button
                      type="button"
                      onClick={handleCloseFeaturedProductModal}
                      className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                      title="إغلاق (X)"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-amber-400 flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                        عرض خاص وحصري اليوم!
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="relative w-full h-52 sm:h-60 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner group">
                      <img
                        src={activePopupProduct.image_url}
                        alt={activePopupProduct.product_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {(activePopupProduct.discount_percentage || (activePopupProduct.compare_at_price && activePopupProduct.compare_at_price > activePopupProduct.price)) && (
                        <div className="absolute top-3 left-3 bg-red-600 text-white font-black text-xs sm:text-sm px-3 py-1 rounded-xl shadow-lg border border-red-400/40 animate-bounce">
                          %{activePopupProduct.discount_percentage || Math.round(((activePopupProduct.compare_at_price! - activePopupProduct.price) / activePopupProduct.compare_at_price!) * 100)}- خصم
                        </div>
                      )}
                      <span className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-sm text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-lg border border-amber-500/30">
                        {activePopupProduct.category_name}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                        {activePopupProduct.product_name}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {activePopupProduct.description}
                      </p>
                    </div>

                    {/* Pricing & Discount */}
                    <div className="flex items-center justify-between bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">السعر الحالي:</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-amber-400">
                            {activePopupProduct.price.toFixed(0)} <span className="text-xs font-normal text-slate-300">ج.م</span>
                          </span>
                          {activePopupProduct.compare_at_price && (
                            <span className="text-xs text-slate-500 line-through">
                              {activePopupProduct.compare_at_price.toFixed(0)} ج.م
                            </span>
                          )}
                        </div>
                      </div>

                      {(activePopupProduct.discount_percentage || (activePopupProduct.compare_at_price && activePopupProduct.compare_at_price > activePopupProduct.price)) && (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
                          وفر {((activePopupProduct.compare_at_price || activePopupProduct.price) - activePopupProduct.price).toFixed(0)} ج.م
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setCart(prev => {
                            const existing = prev.find(item => item.product.id === activePopupProduct.id);
                            if (existing) {
                              return prev.map(item => item.product.id === activePopupProduct.id ? { ...item, quantity: item.quantity + 1 } : item);
                            }
                            return [...prev, { product: activePopupProduct, quantity: 1, selectedSize: "M", selectedColor: "أسود" }];
                          });
                          setIsCartOpen(true);
                          handleCloseFeaturedProductModal();
                        }}
                        className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>أضف للسلة وتسوق الآن</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCloseFeaturedProductModal}
                        className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        إغلاق
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Follow-up Register & Sign-in Modal that appears after the featured product modal closes */}
      <AnimatePresence>
        {showFollowupRegisterModal && !currentUser && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setShowFollowupRegisterModal(false)}></div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl text-right z-10 space-y-4 max-h-[92vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <button
                  type="button"
                  onClick={() => setShowFollowupRegisterModal(false)}
                  className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="إغلاق (X)"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">سجل الآن أو قم بتسجيل الدخول</h3>
                  <div className="h-8 w-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Mode Tabs */}
              <div className="flex border-b border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setUserAuthMode("register");
                    setUserAuthError("");
                    setUserAuthSuccess("");
                  }}
                  className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-all ${
                    userAuthMode === "register"
                      ? "border-amber-500 text-amber-400"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  سجل الآن (حساب جديد)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserAuthMode("login");
                    setUserAuthError("");
                    setUserAuthSuccess("");
                  }}
                  className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-all ${
                    userAuthMode === "login"
                      ? "border-amber-500 text-amber-400"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  تسجيل الدخول
                </button>
              </div>

              {userAuthError && (
                <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-400 text-xs font-semibold">
                  {userAuthError}
                </div>
              )}

              {userAuthSuccess && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {userAuthSuccess}
                </div>
              )}

              {/* Form inside modal */}
              {userAuthMode === "register" ? (
                <form
                  onSubmit={async (e) => {
                    await handleUserRegister(e);
                    setTimeout(() => setShowFollowupRegisterModal(false), 1200);
                  }}
                  className="space-y-3 text-right"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      اسم المستخدم <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={authUsername}
                      onChange={e => setAuthUsername(e.target.value)}
                      placeholder="أدخل اسم المستخدم..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      كلمة المرور <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showAuthPassword ? "text" : "password"}
                        value={authPassword}
                        onChange={e => setAuthPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowAuthPassword(!showAuthPassword)}
                        className="absolute left-2.5 top-2.5 text-slate-400 hover:text-white"
                      >
                        {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">الاسم الكامل</label>
                    <input
                      type="text"
                      value={authFullName}
                      onChange={e => setAuthFullName(e.target.value)}
                      placeholder="الاسم ثلاثي أو ثنائي"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">رقم الهاتف</label>
                    <input
                      type="text"
                      value={authPhone}
                      onChange={e => setAuthPhone(e.target.value)}
                      placeholder="01014955160"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer mt-2"
                  >
                    سجل الآن وتفعيل الحساب فوراً
                  </button>
                </form>
              ) : (
                <form
                  onSubmit={async (e) => {
                    await handleUserLogin(e);
                    setTimeout(() => setShowFollowupRegisterModal(false), 1000);
                  }}
                  className="space-y-3 text-right"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">اسم المستخدم</label>
                    <input
                      type="text"
                      value={authUsername}
                      onChange={e => setAuthUsername(e.target.value)}
                      placeholder="اسم المستخدم المسجل"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">كلمة المرور</label>
                    <input
                      type="password"
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      placeholder="كلمة المرور"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer mt-2"
                  >
                    تسجيل الدخول الآن
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main App Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-8 px-6 text-center text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
            <div className="text-right">
              <span className="text-slate-500 text-[11px] block">الجهة الإشرافية:</span>
              <strong className="text-amber-400 text-sm font-bold">بإشراف المطور: Amir Lamay</strong>
            </div>
            <p className="text-xs text-slate-300 font-medium">منصة متكاملة لمتجر ملابس وإكسسوارات إلكتروني راقٍي</p>
          </div>
          <p className="font-medium text-slate-400 pt-1">
            جميع الحقوق محفوظة للمطور Amir Lamay –  © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
