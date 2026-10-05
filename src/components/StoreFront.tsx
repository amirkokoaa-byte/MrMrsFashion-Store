/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, 
  Search, 
  Star, 
  X, 
  Check, 
  Tag, 
  ChevronRight, 
  Trash2, 
  Plus, 
  Minus, 
  MapPin, 
  Truck, 
  CreditCard,
  FileText,
  Sparkles,
  Info,
  Edit2,
  Archive,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Eye,
  Copy,
  MessageCircle,
  Smartphone,
  Send,
  Receipt,
  UserCheck,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Product, Category, CartItem, Coupon, ActivityLog, Review, PurchaseCode, AppCustomer, PaymentSettings, CompletedOrder } from "../types";
import { SAMPLE_CATEGORIES, INITIAL_PRODUCT_REVIEWS, SAMPLE_PRODUCTS } from "../dbSchemaData";
import { subscribeToRealtimeNode, syncDataToCloud } from "../firebase";

interface StoreFrontProps {
  siteConfig: {
    siteName: string;
    developerCredit: string;
    heroTitle: string;
    heroSubtitle: string;
  };
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  coupons: Coupon[];
  purchaseCodes: PurchaseCode[];
  onConsumePurchaseCode: (code: string) => void;
  isAdmin: boolean;
  onAddActivity: (action: string, details: string) => void;
  onSimulateOrderCreation: (orderData: {
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
  }) => void;
  isAddProductOpen?: boolean;
  onCloseAddProduct?: () => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  isCartOpen: boolean;
  setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
  paymentSettings: PaymentSettings;
  currentUser: AppCustomer | null;
  onUserPurchase: (customerInfo: { username?: string; phone: string; name: string }) => void;
  onOpenRegisterModal: () => void;
}

export default function StoreFront({ 
  siteConfig, 
  products,
  setProducts,
  coupons,
  purchaseCodes,
  onConsumePurchaseCode,
  isAdmin,
  onAddActivity, 
  onSimulateOrderCreation,
  isAddProductOpen,
  onCloseAddProduct,
  cart,
  setCart,
  isCartOpen,
  setIsCartOpen,
  paymentSettings,
  currentUser,
  onUserPurchase,
  onOpenRegisterModal
}: StoreFrontProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "rating">("default");
  
  // Shopping Cart & Discount States
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [appliedPurchaseCode, setAppliedPurchaseCode] = useState<PurchaseCode | null>(null);
  const [couponError, setCouponError] = useState("");
  const [cartToast, setCartToast] = useState<{ visible: boolean; name: string } | null>(null);

  // Product Detail States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  // Available standard selectable sizes
  const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL"];

  // Admin Editing Product States
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<number>(1);
  const [editPrice, setEditPrice] = useState("");
  const [editComparePrice, setEditComparePrice] = useState("");
  const [editDiscount, setEditDiscount] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editSku, setEditSku] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSpecifications, setEditSpecifications] = useState("");
  const [editColors, setEditColors] = useState("");
  const [editSizes, setEditSizes] = useState("");
  const [editSizesList, setEditSizesList] = useState<string[]>(["S", "M", "L", "XL"]);
  const [editSuccessNotice, setEditSuccessNotice] = useState(false);

  // Toggle size in edit modal
  const toggleEditSize = (sz: string) => {
    setEditSizesList(prev => 
      prev.includes(sz) ? prev.filter(s => s !== sz) : [...prev, sz]
    );
  };

  // Checkout States
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"address" | "shipping" | "payment" | "success">("address");
  const [firstName, setFirstName] = useState("أحمد");
  const [lastName, setLastName] = useState("كامل");
  const [phone, setPhone] = useState("01014955160");
  const [addressLine, setAddressLine] = useState("شارع الثورة، مصر الجديدة");
  const [city, setCity] = useState("القاهرة");
  const [stateName, setStateName] = useState("القاهرة");
  const [postalCode, setPostalCode] = useState("11341");
  const [country, setCountry] = useState("مصر");
  const [shippingMethod, setShippingMethod] = useState("Aramex Express");
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "instapay" | "fawry" | "cod">("wallet");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Purchase Code input in Payment Step (100% Discount direct purchase)
  const [paymentPurchaseCodeInput, setPaymentPurchaseCodeInput] = useState("");
  const [paymentPurchaseCodeMsg, setPaymentPurchaseCodeMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Order History in Cart state (Past Purchases)
  const [orderHistory, setOrderHistory] = useState<CompletedOrder[]>(() => {
    const now = new Date();
    const arabicDays = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    return [
      {
        id: "ord-sample-1",
        orderNumber: "ORD-2026-9184",
        items: [
          {
            id: 101,
            product: SAMPLE_PRODUCTS[0],
            quantity: 1,
            selectedSize: "L",
            selectedColor: "كحلي داكن"
          }
        ],
        subtotal: SAMPLE_PRODUCTS[0].price,
        discount: 0,
        grandTotal: SAMPLE_PRODUCTS[0].price,
        paymentMethod: "instapay",
        paymentMethodDisplay: "إنستاباي InstaPay (تحويل فوري)",
        shippingMethod: "Aramex Express",
        dayName: arabicDays[(now.getDay() + 6) % 7],
        time: "03:45 مساءً",
        date: new Date(Date.now() - 86400000).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" }),
        timestamp: Date.now() - 86400000
      }
    ];
  });
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>("ord-sample-1");

  // Firebase Realtime Subscription for Reviews & Order History
  useEffect(() => {
    const unsubOrders = subscribeToRealtimeNode<CompletedOrder[]>("orderHistory", (cloudOrders) => {
      if (Array.isArray(cloudOrders) && cloudOrders.length > 0) {
        setOrderHistory(cloudOrders);
      }
    });

    const unsubReviews = subscribeToRealtimeNode<Review[]>("reviews", (cloudReviews) => {
      if (Array.isArray(cloudReviews)) {
        setReviews(cloudReviews);
      }
    });

    return () => {
      unsubOrders();
      unsubReviews();
    };
  }, []);

  // Autofill name and phone if customer is logged in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.full_name) {
        const parts = currentUser.full_name.trim().split(" ");
        setFirstName(parts[0] || "أحمد");
        setLastName(parts.slice(1).join(" ") || "كامل");
      }
      if (currentUser.phone) {
        setPhone(currentUser.phone);
      }
    }
  }, [currentUser]);

  // Copy helper
  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2500);
  };
  
  // Generated Order Summary State
  const [lastOrderDetails, setLastOrderDetails] = useState<any>(null);

  // Review Form & Reviews Database States
  const [reviews, setReviews] = useState<Review[]>(INITIAL_PRODUCT_REVIEWS);
  const [reviewerName, setReviewerName] = useState("أحمد علي");
  const [isReviewAdmin, setIsReviewAdmin] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Add Product Modal & Form State
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategoryId, setNewProdCategoryId] = useState<number>(1);
  const [newProdPrice, setNewProdPrice] = useState<string>("");
  const [newProdComparePrice, setNewProdComparePrice] = useState<string>("");
  const [newProdDiscount, setNewProdDiscount] = useState<string>("");
  const [newProdStock, setNewProdStock] = useState<string>("15");
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdImageUrl, setNewProdImageUrl] = useState("");
  const [newProdDescription, setNewProdDescription] = useState("");
  const [newProdSpecifications, setNewProdSpecifications] = useState("");
  const [newProdColors, setNewProdColors] = useState("أسود ملكي، كحلي داكن");
  const [newProdSizes, setNewProdSizes] = useState("S, M, L, XL");
  const [newProdSizesList, setNewProdSizesList] = useState<string[]>(["S", "M", "L", "XL"]);

  // Toggle size in add product modal
  const toggleNewProdSize = (sz: string) => {
    setNewProdSizesList(prev => 
      prev.includes(sz) ? prev.filter(s => s !== sz) : [...prev, sz]
    );
  };

  // Sync external add product trigger from top bar
  useEffect(() => {
    if (isAddProductOpen) {
      setIsAddProductModalOpen(true);
    }
  }, [isAddProductOpen]);

  // Filter and Sort Logic (Hiding archived products)
  const filteredProducts = products.filter(p => {
    if (p.is_archived) return false;
    const matchesCategory = selectedCategory === null || p.category_id === selectedCategory;
    const matchesSearch = p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0; // Default ID sort
  });

  // Featured Marquee products
  const marqueeProducts = products.filter(p => !p.is_archived && p.is_featured_marquee);

  // Cart operations
  const handleAddToCart = (product: Product, size?: string, color?: string) => {
    const defaultSize = size || product.sizes[0] || "Standard";
    const defaultColor = color || product.colors[0] || "Default";

    const existingIdx = cart.findIndex(item => 
      item.product.id === product.id && 
      item.selectedSize === defaultSize && 
      item.selectedColor === defaultColor
    );

    if (existingIdx > -1) {
      const updatedCart = [...cart];
      if (updatedCart[existingIdx].quantity < product.stock) {
        updatedCart[existingIdx].quantity += 1;
        setCart(updatedCart);
        onAddActivity("UPDATE_CART", `تم زيادة كمية المنتج "${product.product_name}" في السلة.`);
      } else {
        alert("عذراً، لقد تجاوزت الكمية المتاحة في المخزون حالياً لهذا المنتج.");
        return;
      }
    } else {
      setCart([...cart, {
        id: Date.now(),
        product,
        quantity: 1,
        selectedSize: defaultSize,
        selectedColor: defaultColor
      }]);
      onAddActivity("ADD_TO_CART", `تم إضافة المنتج "${product.product_name}" إلى السلة.`);
    }

    // Trigger visual toast confirmation
    setCartToast({ visible: true, name: product.product_name });
    setTimeout(() => {
      setCartToast(null);
    }, 3200);
  };

  const updateCartQty = (id: number, delta: number) => {
    const updated = cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty <= item.product.stock && newQty > 0) {
          return { ...item, quantity: newQty };
        }
      }
      return item;
    });
    setCart(updated);
  };

  const handleRemoveFromCart = (id: number, prodName: string) => {
    setCart(cart.filter(item => item.id !== id));
    onAddActivity("REMOVE_FROM_CART", `تم إزالة المنتج "${prodName}" من السلة.`);
  };

  // Coupon and 100% Purchase code application
  const applyCoupon = () => {
    setCouponError("");
    const cleanedCode = couponCode.trim().toUpperCase();
    if (!cleanedCode) return;

    // 1. Check if it matches a 100% single-use purchase code
    const foundPurchaseCode = purchaseCodes.find(pc => pc.code.toUpperCase() === cleanedCode && !pc.is_used);
    if (foundPurchaseCode) {
      setAppliedPurchaseCode(foundPurchaseCode);
      setAppliedCoupon(null);
      onAddActivity("APPLY_PURCHASE_CODE", `تم تطبيق كود الشراء المجاني 100%: ${foundPurchaseCode.code}`);
      return;
    }

    // 2. Check standard coupon
    const coupon = coupons.find(c => c.coupon_code.toUpperCase() === cleanedCode);
    
    if (!coupon) {
      setCouponError("كود الخصم أو كود الشراء غير صحيح أو تم استخدامه مسبقاً.");
      return;
    }

    if (!coupon.is_active) {
      setCouponError("عذراً، هذا الكوبون معطل حالياً من قبل الإدارة.");
      return;
    }

    const currentSubtotal = cart.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);
    if (currentSubtotal < coupon.min_order_amount) {
      setCouponError(`هذا الكوبون يتطلب حداً أدنى للشراء يبلغ ${coupon.min_order_amount} ج.م`);
      return;
    }

    setAppliedCoupon(coupon);
    setAppliedPurchaseCode(null);
    onAddActivity("APPLY_COUPON", `تم تطبيق كوبون الخصم "${coupon.coupon_code}".`);
  };

  // Calculations with Maximum Discount Limit Cap & 100% Purchase code
  const subtotal = cart.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);
  let discount = 0;
  let discountNotice = "";

  if (appliedPurchaseCode) {
    // 100% single-use discount
    discount = subtotal;
    discountNotice = "كود خصم 100% للعميل (مجاناً بالكامل)";
  } else if (appliedCoupon) {
    const rawDiscount = (subtotal * appliedCoupon.discount_value) / 100;
    if (appliedCoupon.max_discount_amount && rawDiscount > appliedCoupon.max_discount_amount) {
      discount = appliedCoupon.max_discount_amount;
      discountNotice = `خصم ${appliedCoupon.discount_value}% (تطبيق الحد الأقصى ${appliedCoupon.max_discount_amount} ج.م)`;
    } else {
      discount = rawDiscount;
      discountNotice = `خصم ${appliedCoupon.discount_value}%`;
    }
  }

  const shippingCost = (subtotal > 150 || appliedPurchaseCode) ? 0 : 15;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * 0.15; // 15% VAT
  const grandTotal = Math.max(0, taxableAmount + (appliedPurchaseCode ? 0 : shippingCost) + (appliedPurchaseCode ? 0 : tax));

  // Get readable payment method description
  const getPaymentMethodDisplay = () => {
    switch (paymentMethod) {
      case "instapay":
        return `إنستاباي InstaPay (المستلم: ${paymentSettings.instapay_recipient_name || "أحمد كامل"})`;
      case "wallet":
        return `محفظة إلكترونية كاش (المستلم: ${paymentSettings.wallet_recipient_name || "أحمد كامل"})`;
      case "fawry":
        return `ماي فوري MyFawry (المستلم: ${paymentSettings.fawry_recipient_name || "أحمد كامل"})`;
      default:
        return "الدفع عند الاستلام";
    }
  };

  // WhatsApp order link generator with pre-filled message
  const getWhatsAppUrl = () => {
    const itemsList = cart.map((item, idx) => `• [${idx + 1}] ${item.product.product_name} (${item.quantity}×) ${item.selectedSize ? `مقاس ${item.selectedSize}` : ''} - بسعر: ${(item.product.price * item.quantity).toFixed(2)} ج.م`).join("\n");
    
    const msg = `مرحباً بوتيك الأناقة 👋
أرغب في إتمام وتأكيد طلبي:
${itemsList}

💰 المبلغ الإجمالي الصافي: ${grandTotal.toFixed(2)} ج.م
💳 طريقة التحويل المحددة: ${getPaymentMethodDisplay()}
👤 اسم العميل: ${firstName} ${lastName}
📱 رقم الهاتف: ${phone}
📍 العنوان: ${addressLine}، ${city}، ${country}
${appliedPurchaseCode ? `✨ كود الشراء المجاني: ${appliedPurchaseCode.code} (خصم 100%)` : ''}
${appliedCoupon ? `🏷️ كود الخصم: ${appliedCoupon.coupon_code} (خصم ${appliedCoupon.discount_value}%)` : ''}

تم تحويل المبلغ / جاري التجهيز، يرجى تأكيد استلام الطلب وشحنه!`;

    const rawNumber = (paymentSettings.whatsapp_number || "01014955160").replace(/[^0-9]/g, "");
    const formatted = rawNumber.startsWith("20") ? rawNumber : (rawNumber.startsWith("0") ? `20${rawNumber.substring(1)}` : `20${rawNumber}`);
    return `https://wa.me/${formatted}?text=${encodeURIComponent(msg)}`;
  };

  // Direct purchase code application in Payment Step
  const handleApplyPaymentPurchaseCode = () => {
    const cleaned = paymentPurchaseCodeInput.trim().toUpperCase();
    if (!cleaned) {
      setPaymentPurchaseCodeMsg({ type: "error", text: "يرجى إدخال كود الشراء أولاً." });
      return;
    }

    const found = purchaseCodes.find(pc => pc.code.toUpperCase() === cleaned && !pc.is_used);
    if (!found) {
      setPaymentPurchaseCodeMsg({ type: "error", text: "كود الشراء غير صحيح أو تم استخدامه مسبقاً." });
      return;
    }

    // Success message for 100% discount purchase
    setPaymentPurchaseCodeMsg({ 
      type: "success", 
      text: "تم الشراء بنجاح! تم استخدام كود الشراء (خصم 100%) وتأكيد طلبك مجاناً بالكامل!" 
    });

    const now = new Date();
    const arabicDays = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const orderNumber = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrderRecord: CompletedOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      items: [...cart],
      subtotal,
      discount: subtotal,
      grandTotal: 0,
      paymentMethod: "purchase_code",
      paymentMethodDisplay: `كود الشراء المجاني (${found.code}) - خصم 100%`,
      shippingMethod,
      dayName: arabicDays[now.getDay()],
      time: now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", hour12: true }),
      date: now.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" }),
      timestamp: Date.now(),
      usedPurchaseCode: found.code
    };

    // Prepend to order history in cart & sync to Firebase Cloud
    setOrderHistory(prev => {
      const next = [newOrderRecord, ...prev];
      syncDataToCloud("orderHistory", next);
      return next;
    });
    setExpandedOrderId(newOrderRecord.id);

    // Consume purchase code
    onConsumePurchaseCode(found.code);

    onSimulateOrderCreation({
      customerName: `${firstName} ${lastName}`,
      phone,
      address: `${addressLine}, ${city}, ${country}`,
      city,
      country,
      items: cart.map(item => ({ product_id: item.product.id, quantity: item.quantity, price: item.product.price })),
      total: subtotal,
      discount: subtotal,
      net: 0,
      coupon_code: found.code,
      payment_method: "كود الشراء (خصم 100%)",
      shipping_method: shippingMethod
    });

    onUserPurchase({
      username: currentUser?.username,
      phone,
      name: `${firstName} ${lastName}`
    });

    onAddActivity("APPLY_PURCHASE_CODE_PAYMENT", `تم الشراء بنجاح عبر كود الشراء 100% (${found.code}) للطلب ${orderNumber}.`);

    // Deduct stock
    const updatedProducts = products.map(p => {
      const cartItemsForProduct = cart.filter(item => item.product.id === p.id);
      if (cartItemsForProduct.length > 0) {
        const totalQtySubtracted = cartItemsForProduct.reduce((acc, curr) => acc + curr.quantity, 0);
        return { ...p, stock: Math.max(0, p.stock - totalQtySubtracted) };
      }
      return p;
    });
    setProducts(updatedProducts);

    setLastOrderDetails({
      orderNumber,
      customerName: `${firstName} ${lastName}`,
      phone,
      address: `${addressLine}, ${city}, ${stateName}, ${country}`,
      subtotal,
      discount: subtotal,
      tax: 0,
      shippingCost: 0,
      grandTotal: 0,
      paymentMethod: `كود الشراء (خصم 100% مجاناً)`,
      shippingMethod,
      items: [...cart],
      usedPurchaseCode: found.code
    });

    // Clear cart so previous and new orders appear in cart history!
    setCart([]);
    setAppliedCoupon(null);
    setAppliedPurchaseCode(null);
    setCouponCode("");
    setCheckoutStep("success");
  };

  // Checkout process completion
  const handlePlaceOrder = () => {
    const orderNumber = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsSummary = cart.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price
    }));

    // Trigger simulation on database side
    onSimulateOrderCreation({
      customerName: `${firstName} ${lastName}`,
      phone,
      address: `${addressLine}, ${city}, ${country}`,
      city,
      country,
      items: itemsSummary,
      total: subtotal,
      discount,
      net: grandTotal,
      coupon_code: appliedPurchaseCode?.code || appliedCoupon?.coupon_code,
      payment_method: paymentMethod,
      shipping_method: shippingMethod
    });

    // Auto VIP update for the customer on purchase
    onUserPurchase({
      username: currentUser?.username,
      phone,
      name: `${firstName} ${lastName}`
    });

    // If 100% purchase code was used, consume it and generate next code automatically
    if (appliedPurchaseCode) {
      onConsumePurchaseCode(appliedPurchaseCode.code);
    }

    // Record to order history
    const now = new Date();
    const arabicDays = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const newOrderRecord: CompletedOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      items: [...cart],
      subtotal,
      discount,
      grandTotal,
      paymentMethod,
      paymentMethodDisplay: getPaymentMethodDisplay(),
      shippingMethod,
      dayName: arabicDays[now.getDay()],
      time: now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", hour12: true }),
      date: now.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" }),
      timestamp: Date.now(),
      usedPurchaseCode: appliedPurchaseCode?.code,
      usedCouponCode: appliedCoupon?.coupon_code
    };
    setOrderHistory(prev => {
      const next = [newOrderRecord, ...prev];
      syncDataToCloud("orderHistory", next);
      return next;
    });
    setExpandedOrderId(newOrderRecord.id);

    // Update local products stock state
    const updatedProducts = products.map(p => {
      const cartItemsForProduct = cart.filter(item => item.product.id === p.id);
      if (cartItemsForProduct.length > 0) {
        const totalQtySubtracted = cartItemsForProduct.reduce((acc, curr) => acc + curr.quantity, 0);
        return { ...p, stock: Math.max(0, p.stock - totalQtySubtracted) };
      }
      return p;
    });
    setProducts(updatedProducts);

    setLastOrderDetails({
      orderNumber,
      customerName: `${firstName} ${lastName}`,
      phone,
      address: `${addressLine}, ${city}, ${stateName}, ${country}`,
      subtotal,
      discount,
      tax: appliedPurchaseCode ? 0 : tax,
      shippingCost: appliedPurchaseCode ? 0 : shippingCost,
      grandTotal,
      paymentMethod: getPaymentMethodDisplay(),
      shippingMethod,
      items: [...cart],
      usedPurchaseCode: appliedPurchaseCode?.code
    });

    // Clear cart & state
    setCart([]);
    setAppliedCoupon(null);
    setAppliedPurchaseCode(null);
    setCouponCode("");
    setCheckoutStep("success");
    onAddActivity("PLACE_ORDER", `نجاح عملية الشراء وتوليد الطلب رقم ${orderNumber} وتخزينه في جدول orders.`);
  };

  // Admin Product Actions (Edit, Archive, Delete)
  const handleOpenEditProduct = (prod: Product) => {
    setEditName(prod.product_name);
    setEditCategoryId(prod.category_id);
    setEditPrice(prod.price.toString());
    setEditComparePrice(prod.compare_at_price ? prod.compare_at_price.toString() : "");
    setEditDiscount(prod.discount_percentage ? prod.discount_percentage.toString() : "");
    setEditStock(prod.stock.toString());
    setEditSku(prod.sku);
    setEditImageUrl(prod.image_url);
    setEditDescription(prod.description);
    setEditSpecifications(prod.specifications || "");
    setEditColors(prod.colors.join("، "));
    setEditSizes(prod.sizes.join("، "));
    setEditSizesList(prod.sizes && prod.sizes.length > 0 ? prod.sizes : ["S", "M", "L", "XL"]);
    setIsEditingProduct(true);
  };

  const handleSaveEditedProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const priceNum = parseFloat(editPrice) || selectedProduct.price;
    const stockNum = parseInt(editStock) || selectedProduct.stock;
    const discountVal = editDiscount ? parseFloat(editDiscount) : undefined;
    let compareNum: number | null = editComparePrice ? parseFloat(editComparePrice) : null;
    if (!compareNum && discountVal && discountVal > 0) {
      compareNum = Math.round(priceNum / (1 - discountVal / 100));
    }

    const cat = SAMPLE_CATEGORIES.find(c => c.id === editCategoryId) || SAMPLE_CATEGORIES[0];
    const colorsArr = editColors.split(/[،,]+/).map(s => s.trim()).filter(Boolean);
    const sizesArr = editSizesList.length > 0 ? editSizesList : (editSizes.split(/[،,]+/).map(s => s.trim()).filter(Boolean));

    const updated: Product = {
      ...selectedProduct,
      product_name: editName.trim() || selectedProduct.product_name,
      category_id: cat.id,
      category_name: cat.category_name,
      price: priceNum,
      compare_at_price: compareNum,
      discount_percentage: discountVal,
      stock: stockNum,
      sku: editSku.trim() || selectedProduct.sku,
      image_url: editImageUrl.trim() || selectedProduct.image_url,
      images: [editImageUrl.trim() || selectedProduct.image_url, ...selectedProduct.images.slice(1)],
      description: editDescription.trim() || selectedProduct.description,
      specifications: editSpecifications.trim() || selectedProduct.specifications,
      colors: colorsArr.length > 0 ? colorsArr : selectedProduct.colors,
      sizes: sizesArr.length > 0 ? sizesArr : selectedProduct.sizes,
    };

    setProducts(products.map(p => p.id === updated.id ? updated : p));
    setSelectedProduct(updated);
    setIsEditingProduct(false);
    setEditSuccessNotice(true);
    setTimeout(() => setEditSuccessNotice(false), 2500);
    onAddActivity("EDIT_PRODUCT", `تم تعديل وتحديث بيانات وصور ومواصفات المنتج "${updated.product_name}" من قبل المشرف.`);
  };

  const handleArchiveProduct = (prodId: number) => {
    setProducts(products.map(p => p.id === prodId ? { ...p, is_archived: true } : p));
    onAddActivity("ARCHIVE_PRODUCT", `تم أرشفة المنتج رقم ${prodId} ونقله لقائمة المنتجات المؤرشفة بالإعدادات.`);
    setSelectedProduct(null);
    setIsEditingProduct(false);
  };

  const handleDeleteProduct = (prodId: number) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً من المتجر؟")) {
      setProducts(products.filter(p => p.id !== prodId));
      onAddActivity("DELETE_PRODUCT", `تم حذف المنتج رقم ${prodId} نهائياً.`);
      setSelectedProduct(null);
      setIsEditingProduct(false);
    }
  };

  // Custom user and admin reviews handler
  const handleAddReview = (prodId: number) => {
    if (!reviewComment.trim()) return;

    const newReviewItem: Review = {
      id: Date.now(),
      customer_id: isReviewAdmin ? undefined : 1,
      user_name: reviewerName.trim() || (isReviewAdmin ? "كامل أبو سمرة (إدارة البوتيك)" : "أحمد علي"),
      is_admin: isReviewAdmin,
      product_id: prodId,
      rating: reviewRating,
      comment: reviewComment.trim(),
      created_at: new Date().toISOString().replace("T", " ").substring(0, 16)
    };

    const nextReviews = [newReviewItem, ...reviews];
    setReviews(nextReviews);
    syncDataToCloud("reviews", nextReviews);

    // Increment review count and update average rating in state
    const productReviewsForThis = nextReviews.filter(r => r.product_id === prodId);
    const newRating = Number((productReviewsForThis.reduce((acc, r) => acc + r.rating, 0) / productReviewsForThis.length).toFixed(1));

    const updatedProducts = products.map(p => {
      if (p.id === prodId) {
        return { ...p, reviews_count: productReviewsForThis.length, rating: newRating };
      }
      return p;
    });

    setProducts(updatedProducts);
    if (selectedProduct && selectedProduct.id === prodId) {
      setSelectedProduct({
        ...selectedProduct,
        reviews_count: productReviewsForThis.length,
        rating: newRating
      });
    }

    setReviewSuccess(true);
    setTimeout(() => {
      setReviewSuccess(false);
      setReviewComment("");
    }, 3000);

    const author = isReviewAdmin ? "مدير المتجر (كامل أبو سمرة)" : (reviewerName || "العميل");
    onAddActivity("ADD_REVIEW", `قام ${author} بكتابة مراجعة جديدة (${reviewRating} نجوم) للمنتج رقم ${prodId}.`);
  };

  // Add new product handler with discount percentage
  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice) {
      alert("يرجى كتابة اسم المنتج وتحديد السعر.");
      return;
    }

    const targetCategory = SAMPLE_CATEGORIES.find(c => c.id === Number(newProdCategoryId)) || SAMPLE_CATEGORIES[0];
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const priceNum = parseFloat(newProdPrice) || 0;
    const discountVal = newProdDiscount ? parseFloat(newProdDiscount) : undefined;
    let compareNum = newProdComparePrice ? parseFloat(newProdComparePrice) : null;
    
    // Auto-calculate compare price from discount percentage if not provided
    if (!compareNum && discountVal && discountVal > 0 && discountVal < 100) {
      compareNum = Math.round(priceNum / (1 - discountVal / 100));
    }

    const stockNum = parseInt(newProdStock) || 10;
    const colorsArr = newProdColors.split(/[,،]+/).map(s => s.trim()).filter(Boolean);
    const sizesArr = newProdSizesList.length > 0 ? newProdSizesList : ["S", "M", "L", "XL"];
    const defaultImg = newProdImageUrl.trim() || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600";

    const createdProduct: Product = {
      id: newId,
      product_name: newProdName.trim(),
      slug: newProdName.trim().toLowerCase().replace(/\s+/g, "-"),
      description: newProdDescription.trim() || "منتج فاخر عالي الجودة منتقى بعناية من أحدث تشكيلات البوتيك الإيطالي.",
      specifications: newProdSpecifications.trim() || "خامات إيطالية فاخرة - حياكة متقنة - تصميم عصري متميز وأنيق.",
      price: priceNum,
      compare_at_price: compareNum,
      discount_percentage: discountVal,
      category_id: targetCategory.id,
      category_name: targetCategory.category_name,
      sku: newProdSku.trim() || `PRD-NEW-${newId.toString().padStart(2, "0")}`,
      is_active: true,
      is_archived: false,
      is_featured_marquee: true,
      image_url: defaultImg,
      images: [defaultImg],
      sizes: sizesArr.length > 0 ? sizesArr : ["S", "M", "L", "XL"],
      colors: colorsArr.length > 0 ? colorsArr : ["أسود", "كحلي"],
      rating: 5.0,
      reviews_count: 0,
      stock: stockNum
    };

    setProducts([createdProduct, ...products]);
    setIsAddProductModalOpen(false);
    if (onCloseAddProduct) onCloseAddProduct();

    // Reset Form fields
    setNewProdName("");
    setNewProdPrice("");
    setNewProdComparePrice("");
    setNewProdDiscount("");
    setNewProdDescription("");
    setNewProdSpecifications("");
    setNewProdImageUrl("");

    onAddActivity("ADD_PRODUCT", `تم إضافة منتج جديد "${createdProduct.product_name}" بتصنيف "${createdProduct.category_name}" ومخزون ${createdProduct.stock} قطعة.`);
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen text-slate-800 font-sans" dir="rtl">
      {/* 1. Header Hero section */}
      <div className="relative overflow-hidden bg-slate-900 text-white border-b border-amber-500/30">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-12 lg:py-20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-right space-y-4 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              متجر الملابس والإكسسوارات الفاخرة
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
              {siteConfig.heroTitle}
            </h1>
            <p className="text-slate-300 text-base lg:text-lg leading-relaxed">
              {siteConfig.heroSubtitle}
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 bg-slate-800/60 px-3.5 py-1.5 rounded-lg border border-slate-700/50">
                <span>الجهة الإشرافية:</span>
                <strong className="text-white">{siteConfig.developerCredit}</strong>
              </div>
            </div>
          </div>

          {/* Boutique VIP Highlights & Cart Quick Action */}
          <div className="bg-slate-900/90 border border-slate-700/60 p-6 rounded-2xl w-full max-w-sm backdrop-blur-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-amber-400 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                مزايا البوتيك الحصرية
              </h3>
              <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-500/30">
                إصدار مميز
              </span>
            </div>
            
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2.5 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/30">
                <span className="h-6 w-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">✓</span>
                <span>تصاميم إيطالية أصلية 100% وأقمشة فاخرة منتقاة</span>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/30">
                <span className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">✓</span>
                <span>شحن وتوصيل فوري لكافة الوجهات بأمان تام</span>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/30">
                <span className="h-6 w-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">✓</span>
                <span>ضمان الجودة والاستبدال وتتبع حالة الطلبات</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setIsCartOpen(true);
                onAddActivity("VIEW_CART", "استعراض عربة التسوق الحالية.");
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-all shadow-lg text-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              عرض حقيبة التسوق ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            </button>
          </div>
        </div>
      </div>

      {/* 2. Products Catalog Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        {/* Featured Products Slow Marquee Ticker */}
        {marqueeProducts.length > 0 && (
          <div className="mb-6 sm:mb-8 bg-slate-950 border border-amber-500/30 rounded-3xl p-3.5 sm:p-4 shadow-xl overflow-hidden group">
            <div className="flex items-center justify-between mb-2.5 px-2">
              <span className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                شريط المنتجات المختارة والعروض الحصرية:
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-400">
                (يتحرك ببطء • يقف عند المرور • اضغط للدخول على المنتج)
              </span>
            </div>

            <div className="relative w-full overflow-hidden select-none py-1">
              <div className="animate-marquee gap-4 flex w-max">
                {[...marqueeProducts, ...marqueeProducts].map((item, idx) => {
                  const hasDiscount = item.discount_percentage || (item.compare_at_price && item.compare_at_price > item.price);
                  const discountVal = item.discount_percentage || (item.compare_at_price ? Math.round(((item.compare_at_price - item.price) / item.compare_at_price) * 100) : 0);

                  return (
                    <div
                      key={`marquee-${item.id}-${idx}`}
                      onClick={() => {
                        setSelectedProduct(item);
                        setActiveImageIdx(0);
                        onAddActivity("VIEW_MARQUEE_PRODUCT", `الدخول المباشر على المنتج المختارة "${item.product_name}" من الشريط المتحرك.`);
                      }}
                      className="flex items-center gap-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/60 p-2.5 rounded-2xl cursor-pointer transition-all shadow-md shrink-0 min-w-[230px] sm:min-w-[260px] max-w-[280px]"
                    >
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 bg-slate-800">
                        <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                        {hasDiscount ? (
                          <span className="absolute top-0 left-0 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-br-md">
                            %{discountVal}-
                          </span>
                        ) : null}
                      </div>

                      <div className="flex-1 text-right overflow-hidden">
                        <h4 className="text-xs font-bold text-white truncate max-w-[150px] sm:max-w-[170px]">
                          {item.product_name}
                        </h4>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {item.category_name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-black text-amber-400">
                            {item.price.toFixed(2)} ج.م
                          </span>
                          {item.compare_at_price && (
                            <span className="text-[10px] text-slate-500 line-through">
                              {item.compare_at_price.toFixed(2)} ج.م
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-200">
          {/* Categories Tab */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedCategory(null);
                onAddActivity("FILTER_CATEGORY", "عرض كافة فئات المنتجات.");
              }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                selectedCategory === null 
                  ? "bg-slate-900 text-white shadow-md" 
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              الكل
            </button>
            {SAMPLE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  onAddActivity("FILTER_CATEGORY", `فلترة المنتجات حسب تصنيف "${cat.category_name}".`);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  selectedCategory === cat.id 
                    ? "bg-slate-900 text-white shadow-md" 
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat.category_name}
              </button>
            ))}
          </div>

          {/* Search, Sort and Add Product controls */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Add Product Button */}
            <button
              onClick={() => setIsAddProductModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-sm transition-all shrink-0"
              title="إضافة منتج جديد للمتجر"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>أضف منتج</span>
            </button>

            <div className="relative flex-1 md:flex-initial min-w-[200px]">
              <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن الملابس، الأحجام، SKU..."
                className="w-full pl-4 pr-10 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="default">الترتيب الافتراضي</option>
              <option value="price-asc">السعر: من الأقل للأعلى</option>
              <option value="price-desc">السعر: من الأعلى للأقل</option>
              <option value="rating">التقييم: الأعلى أولاً</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => {
            const isLowStock = product.stock <= 3;
            const isOutOfStock = product.stock === 0;
            const hasDiscount = product.discount_percentage || (product.compare_at_price && product.compare_at_price > product.price);
            const discountPercent = product.discount_percentage || (product.compare_at_price ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100) : 0);

            return (
              <motion.div
                layout
                key={product.id}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-500/30 transition-all flex flex-col group"
              >
                {/* Product image container */}
                <div 
                  className="relative h-72 w-full overflow-hidden bg-slate-100 cursor-pointer"
                  onClick={() => {
                    setSelectedProduct(product);
                    setActiveImageIdx(0);
                    onAddActivity("VIEW_PRODUCT_DETAILS", `عرض تفاصيل المنتج ومواصفات الداتا للمنتج "${product.product_name}".`);
                  }}
                >
                  <img
                    src={product.image_url}
                    alt={product.product_name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Category tag */}
                  <span className="absolute top-4 right-4 bg-slate-900/80 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-sm z-10">
                    {product.category_name}
                  </span>

                  {/* Red Discount Ribbon on top-left aligned horizontally with category */}
                  {hasDiscount ? (
                    <span className="absolute top-4 left-4 z-10 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
                      <span>خصم {discountPercent}%-</span>
                    </span>
                  ) : null}

                  {/* Stock label */}
                  {isOutOfStock ? (
                    <span className="absolute bottom-4 left-4 bg-red-600 text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                      نفذت الكمية
                    </span>
                  ) : isLowStock ? (
                    <span className="absolute bottom-4 left-4 bg-amber-500 text-slate-950 text-xs font-bold px-2.5 py-1 rounded-lg animate-pulse">
                      كمية محدودة! (بقي {product.stock})
                    </span>
                  ) : (
                    <span className="absolute bottom-4 left-4 bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                      متوفر في المخزون ({product.stock})
                    </span>
                  )}
                </div>

                {/* Product details */}
                <div className="p-6 flex flex-col flex-1 space-y-3">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                    <span>SKU: {product.sku}</span>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-semibold text-slate-700">{product.rating}</span>
                      <span>({product.reviews_count})</span>
                    </div>
                  </div>

                  <h3 
                    onClick={() => {
                      setSelectedProduct(product);
                      setActiveImageIdx(0);
                    }}
                    className="font-bold text-lg text-slate-950 group-hover:text-amber-600 transition-colors cursor-pointer line-clamp-1"
                  >
                    {product.product_name}
                  </h3>
                  
                  <p className="text-slate-500 text-sm line-clamp-2 flex-1">
                    {product.description}
                  </p>

                  <div className="flex items-baseline gap-2 pt-2">
                    <span className="text-2xl font-extrabold text-slate-900">{product.price.toFixed(2)} ج.م</span>
                    {product.compare_at_price && (
                      <span className="text-sm text-slate-400 line-through">{product.compare_at_price.toFixed(2)} ج.م</span>
                    )}
                  </div>

                  {/* Add to Cart CTA */}
                  <div className="pt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setActiveImageIdx(0);
                        onAddActivity("VIEW_PRODUCT_DETAILS", `عرض تفاصيل المنتج ومواصفات الداتا للمنتج "${product.product_name}".`);
                      }}
                      className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all"
                    >
                      مواصفات
                    </button>
                    <button
                      disabled={isOutOfStock}
                      onClick={() => handleAddToCart(product)}
                      className={`flex-2 py-2 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                        isOutOfStock 
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                          : "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md hover:shadow-lg"
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      إضافة للسلة
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 3. Product Details Immersive Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              {/* Product Modal Top Actions: Delete Product & Close Button */}
              <div className="absolute top-4 left-4 flex items-center gap-2 z-30">
                <button 
                  type="button"
                  onClick={() => handleDeleteProduct(selectedProduct.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
                  title="حذف هذا المنتج نهائياً من المتجر"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف المنتج</span>
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setSelectedProduct(null);
                    setIsEditingProduct(false);
                  }}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 transition-all cursor-pointer shadow-xs"
                  title="إغلاق النافذة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Admin Top Actions Bar if logged in with 0000 */}
              {isAdmin && (
                <div className="bg-slate-950 border-b border-amber-500/30 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>لوحة تحكم المشرف (Admin Mode):</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditProduct(selectedProduct)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm ${
                        isEditingProduct 
                          ? "bg-amber-400 text-slate-950" 
                          : "bg-amber-500 hover:bg-amber-600 text-slate-950"
                      }`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      {isEditingProduct ? "إلغاء التعديل" : "تعديل المنتج"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleArchiveProduct(selectedProduct.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 transition-all font-semibold"
                      title="إخفاء المنتج من واجهة المتجر ونقله للأرشيف"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      أرشفة
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(selectedProduct.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 transition-all font-semibold"
                      title="حذف المنتج نهائياً من المتجر"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      حذف
                    </button>
                  </div>
                </div>
              )}

              {/* Edit Product Form View for Admin */}
              {isEditingProduct ? (
                <form onSubmit={handleSaveEditedProduct} className="p-6 md:p-8 space-y-4 text-right">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-amber-500" />
                      تعديل بيانات وتفاصيل وصور المنتج
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">SKU: {selectedProduct.sku}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">اسم المنتج: *</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">القسم / التصنيف: *</label>
                      <select
                        value={editCategoryId}
                        onChange={(e) => setEditCategoryId(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      >
                        {SAMPLE_CATEGORIES.map(c => (
                          <option key={c.id} value={c.id}>{c.category_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">السعر (ج.م): *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">قبل الخصم (ج.م):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editComparePrice}
                        onChange={(e) => setEditComparePrice(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-red-600">نسبة الخصم (%):</label>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={editDiscount}
                        onChange={(e) => setEditDiscount(e.target.value)}
                        placeholder="20"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-red-200 bg-red-50/30 text-xs font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">المخزون: *</label>
                      <input
                        type="number"
                        required
                        value={editStock}
                        onChange={(e) => setEditStock(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">رمز المنتج (SKU):</label>
                      <input
                        type="text"
                        value={editSku}
                        onChange={(e) => setEditSku(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">رابط صورة المنتج (URL):</label>
                      <input
                        type="url"
                        value={editImageUrl}
                        onChange={(e) => setEditImageUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">تفاصيل ووصف المنتج:</label>
                    <textarea
                      rows={2}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">مواصفات وخامة التصنيع:</label>
                    <textarea
                      rows={2}
                      value={editSpecifications}
                      onChange={(e) => setEditSpecifications(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">الألوان (مفصولة بفاصلة):</label>
                      <input
                        type="text"
                        value={editColors}
                        onChange={(e) => setEditColors(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    {/* Sizes Selection Boxes (XS, S, M, L, XL) */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        المقاسات المتوفرة (حدد الخانات المطلوبة): *
                      </label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {AVAILABLE_SIZES.map(size => {
                          const isSelected = editSizesList.includes(size);
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => toggleEditSize(size)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                                isSelected
                                  ? "border-amber-500 bg-amber-50 text-amber-950 shadow-xs"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                              }`}
                            >
                              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] border ${
                                isSelected ? "bg-amber-500 text-slate-950 border-amber-500 font-black" : "border-slate-300 bg-white"
                              }`}>
                                {isSelected && "✓"}
                              </div>
                              <span>{size}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsEditingProduct(false)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      حفظ وتحديث بيانات المنتج
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
                  {/* Images Gallery */}
                  <div className="space-y-4">
                    <div className="h-96 w-full rounded-2xl overflow-hidden bg-slate-100 relative">
                      <img 
                        src={selectedProduct.images[activeImageIdx] || selectedProduct.image_url} 
                        alt={selectedProduct.product_name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {(selectedProduct.discount_percentage || (selectedProduct.compare_at_price && selectedProduct.compare_at_price > selectedProduct.price)) && (
                        <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-lg shadow-lg">
                          خصم {selectedProduct.discount_percentage || Math.round(((selectedProduct.compare_at_price! - selectedProduct.price) / selectedProduct.compare_at_price!) * 100)}%-
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {selectedProduct.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIdx(idx)}
                          className={`h-20 w-20 rounded-xl overflow-hidden border-2 bg-slate-50 flex-shrink-0 transition-all ${
                            activeImageIdx === idx ? "border-amber-500 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img src={img} alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Product Meta & Actions */}
                  <div className="space-y-6 text-right">
                    <div>
                      <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">SKU: {selectedProduct.sku}</span>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-slate-950 mt-2">{selectedProduct.product_name}</h2>
                      <p className="text-amber-600 text-sm font-semibold mt-1">{selectedProduct.category_name}</p>
                    </div>

                    {/* Reviews rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-4 h-4 ${star <= Math.round(selectedProduct.rating) ? "fill-current" : "opacity-30"}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{selectedProduct.rating} من 5 نجوم</span>
                      <span className="text-slate-400 text-xs">({selectedProduct.reviews_count} تقييم مسجل)</span>
                    </div>

                    {/* Price in Egyptian Pound */}
                    <div className="flex items-baseline gap-3 border-y border-slate-100 py-4 flex-wrap">
                      <span className="text-3xl font-black text-slate-950">{selectedProduct.price.toFixed(2)} ج.م</span>
                      {selectedProduct.compare_at_price && (
                        <span className="text-sm text-slate-400 line-through">{selectedProduct.compare_at_price.toFixed(2)} ج.م</span>
                      )}
                      {(selectedProduct.discount_percentage || (selectedProduct.compare_at_price && selectedProduct.compare_at_price > selectedProduct.price)) && (
                        <span className="bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-lg">
                          خصم {selectedProduct.discount_percentage || Math.round(((selectedProduct.compare_at_price! - selectedProduct.price) / selectedProduct.compare_at_price!) * 100)}%-
                        </span>
                      )}
                    </div>

                  <p className="text-slate-600 text-sm leading-relaxed">{selectedProduct.description}</p>

                  {/* Specifications Box */}
                  {selectedProduct.specifications && (
                    <div className="bg-amber-50/50 border border-amber-500/25 rounded-2xl p-4 text-right space-y-1.5">
                      <h4 className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-amber-600" />
                        مواصفات وخامة التصنيع:
                      </h4>
                      <p className="text-amber-950/80 text-xs leading-relaxed font-sans">
                        {selectedProduct.specifications}
                      </p>
                    </div>
                  )}

                  {/* Color Selection */}
                  {selectedProduct.colors.length > 0 && (
                    <div className="space-y-2">
                      <span className="block text-xs font-bold text-slate-400">الألوان المتوفرة:</span>
                      <div className="flex gap-2">
                        {selectedProduct.colors.map(color => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                              selectedColor === color || (!selectedColor && selectedProduct.colors[0] === color)
                                ? "border-amber-500 bg-amber-50 text-amber-900" 
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size Selection */}
                  {selectedProduct.sizes.length > 0 && selectedProduct.sizes[0] !== "One Size" && selectedProduct.sizes[0] !== "Standard" && (
                    <div className="space-y-2">
                      <span className="block text-xs font-bold text-slate-700">المقاسات المتوفرة (اختر مقاسك):</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.sizes.map(size => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={`h-10 min-w-10 px-3.5 rounded-xl border flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                              selectedSize === size || (!selectedSize && selectedProduct.sizes[0] === size)
                                ? "border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-500/40 font-black shadow-xs" 
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Buy Actions */}
                  <div className="pt-2 space-y-3">
                    <button
                      disabled={selectedProduct.stock === 0}
                      onClick={() => {
                        handleAddToCart(
                          selectedProduct, 
                          selectedSize || selectedProduct.sizes[0], 
                          selectedColor || selectedProduct.colors[0]
                        );
                        setSelectedProduct(null);
                      }}
                      className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      إضافة إلى سلة الشراء
                    </button>
                  </div>

                  {/* Reviews List inside Product Specifications / Details Area */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3 text-right">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        آراء وتقييمات العملاء والإدارة ({reviews.filter(r => r.product_id === selectedProduct.id).length}):
                      </h4>
                      <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        مراجعات معتمدة
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {reviews.filter(r => r.product_id === selectedProduct.id).length === 0 ? (
                        <p className="text-xs text-slate-400 py-2">لا توجد مراجعات مكتوبة بعد. شاركنا رأيك الأول بالمنتج أدناه!</p>
                      ) : (
                        reviews.filter(r => r.product_id === selectedProduct.id).map(rev => (
                          <div key={rev.id} className="bg-white border border-slate-200/70 p-3 rounded-xl shadow-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900">{rev.user_name}</span>
                                {rev.is_admin && (
                                  <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded shadow-xs">
                                    إدارة المتجر
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-amber-500">
                                {[1, 2, 3, 4, 5].map(s => (
                                  <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? "fill-amber-500" : "opacity-30"}`} />
                                ))}
                                <span className="text-[10px] text-slate-400 mr-2">{rev.created_at}</span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Write a review section - Updated heading to 'شاركنا رأيك بالمنتج' */}
                  <div className="border-t border-slate-100 pt-5 space-y-3">
                    <h3 className="font-bold text-slate-900 text-sm">شاركنا رأيك بالمنتج</h3>
                    {reviewSuccess ? (
                      <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-xl border border-emerald-200 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        تم تسجيل رأيك بنجاح ويظهر الآن ضمن تقييمات المنتج للمستخدمين وللإدارة!
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-500 ml-2">تقييمك:</span>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setReviewRating(star)}
                                type="button"
                                className="text-amber-500 hover:scale-110 transition-all"
                              >
                                <Star className={`w-5 h-5 ${star <= reviewRating ? "fill-current" : "opacity-30"}`} />
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                            <button
                              type="button"
                              onClick={() => setIsReviewAdmin(false)}
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                                !isReviewAdmin ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                              }`}
                            >
                              صفة العميل
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsReviewAdmin(true)}
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                                isReviewAdmin ? "bg-amber-500 text-slate-950 font-bold shadow-xs" : "text-slate-500"
                              }`}
                            >
                              صفة الإدارة / Admin
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={reviewerName}
                            onChange={(e) => setReviewerName(e.target.value)}
                            placeholder={isReviewAdmin ? "اسم المشرف (مثال: كامل أبو سمرة)" : "اسمك الكريم..."}
                            className="w-full sm:w-1/3 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <input
                            type="text"
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="اكتب مراجعتك وانطباعك عن جودة الملابس هنا..."
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <button
                            onClick={() => handleAddReview(selectedProduct.id)}
                            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shrink-0"
                          >
                            أرسل التقييم
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>

      {/* 4. Sliding Shopping Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex justify-end">
            {/* Overlay background close */}
            <div className="absolute inset-0" onClick={() => setIsCartOpen(false)}></div>
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-white w-full max-w-md h-full flex flex-col shadow-2xl z-10 text-right"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-950 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-500" />
                  حقيبة المشتريات ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                </h3>
              </div>

              {/* Items List or Past Purchases */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {cart.length === 0 ? (
                  orderHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-4">
                      <ShoppingBag className="w-16 h-16 stroke-1 text-slate-300" />
                      <p className="text-sm font-semibold">سلتك لا تزال فارغة حالياً.</p>
                      <p className="text-xs text-slate-400">تصفح تشكيلة البوتيك وأضف منتجاتك المفضلة!</p>
                    </div>
                  ) : (
                    /* Previous Orders / Past Purchases History in Cart */
                    <div className="space-y-4 text-right">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-amber-500" />
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            سجل الطلبات والمشتريات السابقة ({orderHistory.length})
                          </h4>
                        </div>
                        <span className="text-[10px] bg-amber-500/20 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                          الطلبات المحفوظة
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        اضغط على أي طلب سابق لعرض تفاصيل الطلب، طريقة الدفع، واليوم والساعة والتاريخ:
                      </p>

                      <div className="space-y-3">
                        {orderHistory.map((order) => {
                          const isExpanded = expandedOrderId === order.id;
                          return (
                            <div 
                              key={order.id}
                              className={`border rounded-2xl transition-all overflow-hidden ${
                                isExpanded 
                                  ? "border-amber-500 bg-amber-50/20 ring-1 ring-amber-500/40 shadow-xs" 
                                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                              }`}
                            >
                              {/* Order Card Summary / Click Header */}
                              <button
                                type="button"
                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                className="w-full p-3.5 flex items-center justify-between text-right cursor-pointer"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-black text-amber-600">
                                      {order.orderNumber}
                                    </span>
                                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                                      {order.dayName}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                    <span>{order.date}</span>
                                    <span>•</span>
                                    <span>{order.time}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="text-left">
                                    <span className="block font-black text-xs sm:text-sm text-slate-950">
                                      {order.grandTotal === 0 ? "مجاني (100%)" : `${order.grandTotal.toFixed(2)} ج.م`}
                                    </span>
                                    <span className="text-[10px] text-emerald-600 font-bold">مكتمل ✓</span>
                                  </div>
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-amber-600 shrink-0" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                                  )}
                                </div>
                              </button>

                              {/* Expanded Order Details */}
                              {isExpanded && (
                                <div className="p-3.5 pt-0 border-t border-slate-200/60 space-y-3 mt-1 text-xs">
                                  {/* 1. Purchased Items (الطلب) */}
                                  <div className="space-y-2 pt-2">
                                    <span className="block text-[11px] font-bold text-slate-700">
                                      محتويات الطلب:
                                    </span>
                                    <div className="space-y-1.5">
                                      {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200/80">
                                          <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                              <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="text-right">
                                              <span className="block font-bold text-slate-900 text-xs line-clamp-1">{item.product.product_name}</span>
                                              <span className="text-[10px] text-slate-500">
                                                الكمية: {item.quantity} {item.selectedSize ? `• مقاس: ${item.selectedSize}` : ""}
                                              </span>
                                            </div>
                                          </div>
                                          <span className="font-bold text-slate-900 text-xs font-mono">
                                            {(item.product.price * item.quantity).toFixed(2)} ج.م
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* 2. Order Metadata: Payment, Day, Time, Date */}
                                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 space-y-1.5 text-[11px]">
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-500 font-semibold">طريقة الدفع:</span>
                                      <strong className="text-slate-900 font-bold">{order.paymentMethodDisplay}</strong>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                        اليوم:
                                      </span>
                                      <strong className="text-slate-900 font-bold">{order.dayName}</strong>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                                        الساعة:
                                      </span>
                                      <strong className="text-slate-900 font-bold font-mono">{order.time}</strong>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                                      <span className="text-slate-500 font-semibold">تاريخ الشراء:</span>
                                      <strong className="text-slate-900 font-bold">{order.date}</strong>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                ) : (
                  /* Active Cart Items: Notice that when cart.length > 0, the past orders list is hidden temporarily */
                  cart.map(item => (
                    <div 
                      key={item.id} 
                      className="flex gap-4 p-3 bg-slate-50 border border-slate-100 rounded-2xl relative group"
                    >
                      <button
                        onClick={() => handleRemoveFromCart(item.id, item.product.product_name)}
                        className="absolute top-2 left-2 p-1 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="h-20 w-20 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-slate-200">
                        <img src={item.product.image_url} alt={item.product.product_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>

                      <div className="flex-1 pr-1 space-y-1">
                        <h4 className="font-bold text-slate-950 text-sm line-clamp-1">{item.product.product_name}</h4>
                        <div className="flex gap-2 text-[10px] text-slate-500">
                          <span>المقاس: {item.selectedSize}</span>
                          <span>اللون: {item.selectedColor}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="font-extrabold text-slate-900 text-sm">{(item.product.price * item.quantity).toFixed(2)} ج.م</span>
                          
                          {/* Quantity control */}
                          <div className="flex items-center border border-slate-200 bg-white rounded-lg px-1.5 py-0.5">
                            <button 
                              onClick={() => updateCartQty(item.id, 1)}
                              className="p-1 text-slate-600 hover:text-amber-500 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 text-xs font-bold font-mono text-slate-800">{item.quantity}</span>
                            <button 
                              onClick={() => updateCartQty(item.id, -1)}
                              className="p-1 text-slate-600 hover:text-amber-500 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Order Calculations Summary */}
              {cart.length > 0 && (
                <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
                  {/* Coupon Application Box */}
                  <div className="space-y-1.5">
                    <span className="block text-xs font-semibold text-slate-500">كوبون الخصم:</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="أدخل الكود (مثال: KAMEL10)"
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-center font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
                      />
                      <button
                        onClick={applyCoupon}
                        className="bg-slate-900 text-white text-xs px-4 py-2 rounded-xl hover:bg-slate-800 transition-all font-semibold"
                      >
                        تطبيق
                      </button>
                    </div>
                    {couponError && <p className="text-[10px] text-red-500 font-semibold">{couponError}</p>}
                    {appliedPurchaseCode && (
                      <div className="flex items-center justify-between bg-amber-500/20 text-amber-900 px-3 py-1.5 rounded-lg border border-amber-500/40 text-xs">
                        <span className="flex items-center gap-1 font-bold">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          تم تفعيل كود الشراء المجاني 100% ({appliedPurchaseCode.code})
                        </span>
                        <button 
                          onClick={() => setAppliedPurchaseCode(null)}
                          className="text-amber-900 font-extrabold hover:underline text-[10px]"
                        >
                          إلغاء
                        </button>
                      </div>
                    )}
                    {appliedCoupon && (
                      <div className="flex items-center justify-between bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs">
                        <span className="flex items-center gap-1 font-bold">
                          <Tag className="w-3.5 h-3.5" />
                          تم تفعيل الكوبون ({appliedCoupon.coupon_code})
                        </span>
                        <button 
                          onClick={() => setAppliedCoupon(null)}
                          className="text-emerald-900 font-extrabold hover:underline text-[10px]"
                        >
                          إلغاء
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Calc breakdown in Egyptian Pound */}
                  <div className="space-y-2 border-t border-slate-200/60 pt-3 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>المجموع الفرعي:</span>
                      <span className="font-bold text-slate-900">{subtotal.toFixed(2)} ج.م</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span className="flex items-center gap-1">
                          <span>الخصم المطبق:</span>
                          {discountNotice && (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                              {discountNotice}
                            </span>
                          )}
                        </span>
                        <span className="font-bold">-{discount.toFixed(2)} ج.م</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>رسوم الشحن والتوصيل:</span>
                      <span className="font-bold text-slate-900">
                        {shippingCost === 0 ? "شحن مجاني" : `${shippingCost.toFixed(2)} ج.م`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>الضريبة المضافة VAT (15%):</span>
                      <span className="font-bold text-slate-900">{tax.toFixed(2)} ج.م</span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-slate-950 border-t border-slate-200/80 pt-2 mt-1">
                      <span>المبلغ الإجمالي الصافي:</span>
                      <span>{grandTotal.toFixed(2)} ج.م</span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckingOut(true);
                      setCheckoutStep("address");
                      onAddActivity("START_CHECKOUT", "بدء تعبئة معلومات الشحن والدفع لإتمام الطلب.");
                    }}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm transition-all shadow-lg text-center flex items-center justify-center gap-2"
                  >
                    الانتقال لتأكيد الدفع والطلب
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Checkout Flow Modal */}
      <AnimatePresence>
        {isCheckingOut && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative scrollbar-thin scrollbar-thumb-amber-500 scrollbar-track-slate-100"
            >
              {/* Close Button X */}
              <button 
                type="button"
                onClick={() => setIsCheckingOut(false)}
                className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 transition-all z-30 cursor-pointer shadow-sm"
                title="إغلاق الشاشة (X)"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Steps Progress Header */}
              <div className="bg-slate-900 text-white p-6 text-right relative">
                <h3 className="font-bold text-lg text-amber-400">إتمام الشراء ومحاكاة المعاملات</h3>
                <p className="text-slate-400 text-xs mt-1">يرجى تأكيد بيانات الشحن والدفع لتحديث جداول MySQL.</p>
                
                {/* Visual steps */}
                <div className="flex items-center gap-3 mt-4 text-xs">
                  <div className={`flex-1 h-1.5 rounded-full ${checkoutStep === "address" ? "bg-amber-500" : "bg-slate-700"}`}></div>
                  <div className={`flex-1 h-1.5 rounded-full ${checkoutStep === "shipping" ? "bg-amber-500" : "bg-slate-700"}`}></div>
                  <div className={`flex-1 h-1.5 rounded-full ${checkoutStep === "payment" ? "bg-amber-500" : "bg-slate-700"}`}></div>
                  <div className={`flex-1 h-1.5 rounded-full ${checkoutStep === "success" ? "bg-emerald-500" : "bg-slate-700"}`}></div>
                </div>
              </div>

              {/* Checkout Content Form */}
              <div className="p-6 md:p-8 space-y-6 text-right">
                
                {/* Step 1: Addresses */}
                {checkoutStep === "address" && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      1. عنوان شحن العميل (جدول addresses)
                    </h4>
                    <p className="text-xs text-slate-400">سيتم حفظ هذا العنوان وربطه بالعميل المسجل بجدول العملاء.</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">الاسم الأول</label>
                        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">اسم العائلة</label>
                        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">رقم الهاتف (جوال التواصل)</label>
                      <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">تفاصيل العنوان والشارع</label>
                      <input type="text" value={addressLine} onChange={e => setAddressLine(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">المدينة</label>
                        <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">المحافظة/المنطقة</label>
                        <input type="text" value={stateName} onChange={e => setStateName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">الدولة</label>
                        <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs" />
                      </div>
                    </div>

                    <button
                      onClick={() => setCheckoutStep("shipping")}
                      className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                    >
                      متابعة إلى خيارات الشحن
                    </button>
                  </div>
                )}

                {/* Step 2: Shipping Courier */}
                {checkoutStep === "shipping" && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Truck className="w-4 h-4 text-amber-500" />
                      2. شركة النقل وطريقة التوصيل (جدول shipping)
                    </h4>
                    <p className="text-xs text-slate-400">سيتم توليد سجل شحن جديد مع رقم تتبع تلقائي وربطه بالطلب.</p>

                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 bg-slate-50 border rounded-xl cursor-pointer hover:border-amber-500 transition-all">
                        <input 
                          type="radio" 
                          name="shipping" 
                          checked={shippingMethod === "Aramex Express"} 
                          onChange={() => setShippingMethod("Aramex Express")}
                          className="text-amber-500 focus:ring-amber-500" 
                        />
                        <div className="flex-1 text-right">
                          <span className="block text-xs font-bold text-slate-900">أرامكس السريع Aramex Express</span>
                          <span className="text-[10px] text-slate-500">توصيل سريع خلال 2-3 أيام عمل لعنوان العميل مباشرة</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900">15.00 ج.م</span>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-slate-50 border rounded-xl cursor-pointer hover:border-amber-500 transition-all">
                        <input 
                          type="radio" 
                          name="shipping" 
                          checked={shippingMethod === "DHL Premium"} 
                          onChange={() => setShippingMethod("DHL Premium")}
                          className="text-amber-500 focus:ring-amber-500" 
                        />
                        <div className="flex-1 text-right">
                          <span className="block text-xs font-bold text-slate-900">دي إتش إل بريميوم DHL Premium</span>
                          <span className="text-[10px] text-slate-500">شحن جوي مؤمن وفائق السرعة خلال 24-48 ساعة</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900">25.00 ج.م</span>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-slate-50 border rounded-xl cursor-pointer hover:border-amber-500 transition-all">
                        <input 
                          type="radio" 
                          name="shipping" 
                          checked={shippingMethod === "Standard Delivery"} 
                          onChange={() => setShippingMethod("Standard Delivery")}
                          className="text-amber-500 focus:ring-amber-500" 
                        />
                        <div className="flex-1 text-right">
                          <span className="block text-xs font-bold text-slate-900">الشحن العادي Standard Delivery</span>
                          <span className="text-[10px] text-slate-500">توصيل اقتصادي مريح خلال 5-7 أيام عمل</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600">مـجاني</span>
                      </label>
                    </div>

                    <div className="flex gap-3 pt-3">
                      <button
                        onClick={() => setCheckoutStep("address")}
                        className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all"
                      >
                        رجوع للسابق
                      </button>
                      <button
                        onClick={() => setCheckoutStep("payment")}
                        className="flex-2 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                      >
                        متابعة إلى الدفع الإلكتروني
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment method */}
                {checkoutStep === "payment" && (
                  <div className="space-y-4">
                    {/* Payment Alert Notice */}
                    <div className="bg-amber-500/10 border-2 border-amber-500/40 p-3.5 sm:p-4 rounded-2xl flex items-start gap-3 text-right">
                      <div className="h-8 sm:h-9 w-8 sm:w-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 shadow-sm font-bold">
                        <AlertCircle className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-xs sm:text-sm font-black text-amber-950">تنبيه هام للعميل لإتمام الدفع وتأكيد الشحن:</h5>
                        <p className="text-[11px] sm:text-xs text-amber-900 leading-relaxed font-semibold">
                          يرجى تحويل قيمة الطلب عبر إحدى الطرق التالية (محفظة إلكترونية، إنستاباي، أو ماي فوري)، واستخدام <strong className="text-amber-950 font-black">زر النسخ</strong>، ثم الضغط على زر <strong className="text-emerald-700 font-black underline">"التوجه إلى واتساب لإرسال رسالة الدفع"</strong> لإرسال بيانات طلبك وإشعار التحويل وتأكيد الشحن فوراً!
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-amber-500" />
                        طريقة السداد والتحويل المالي:
                      </h4>
                      <span className="text-[11px] text-slate-500">اختر وسيلة الدفع المناسبة</span>
                    </div>

                    {/* Dedicated Purchase Code Box (100% Discount) */}
                    <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/15 border-2 border-amber-500/50 p-4 rounded-2xl space-y-3 text-right shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                          <h5 className="text-xs sm:text-sm font-black text-slate-950">
                            خانة كود الشراء (خصم 100% مجاناً):
                          </h5>
                        </div>
                        <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black">
                          كود خصم 100%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                        عند إعطاء كود الشراء للعميل، أدخله هنا واضغط على الزر لإتمام وتأكيد الشراء فوراً وظهور رسالة تم الشراء!
                      </p>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={paymentPurchaseCodeInput}
                          onChange={(e) => {
                            setPaymentPurchaseCodeInput(e.target.value);
                            setPaymentPurchaseCodeMsg(null);
                          }}
                          placeholder="أدخل كود الشراء (مثال: VIP-100-FREE)"
                          className="flex-1 px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center uppercase"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPaymentPurchaseCode}
                          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>تطبيق كود الشراء</span>
                        </button>
                      </div>

                      {paymentPurchaseCodeMsg && (
                        <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                          paymentPurchaseCodeMsg.type === "success" 
                            ? "bg-emerald-100 text-emerald-950 border border-emerald-300"
                            : "bg-red-100 text-red-950 border border-red-300"
                        }`}>
                          {paymentPurchaseCodeMsg.type === "success" ? (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                          )}
                          <span>{paymentPurchaseCodeMsg.text}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {/* Option 1: Electronic Wallet */}
                      <div 
                        onClick={() => setPaymentMethod("wallet")}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          paymentMethod === "wallet" 
                            ? "border-amber-500 bg-amber-50/40 ring-1 ring-amber-500/50 shadow-sm" 
                            : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <input 
                              type="radio" 
                              name="payment" 
                              checked={paymentMethod === "wallet"} 
                              onChange={() => setPaymentMethod("wallet")} 
                              className="w-4 h-4 accent-amber-500" 
                            />
                            <div className="h-8 w-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
                              <Smartphone className="w-4 h-4" />
                            </div>
                            <div className="text-right">
                              <span className="block text-xs font-bold text-slate-950">
                                محفظة إلكترونية (فودافون كاش / أورنج / اتصالات / وي)
                              </span>
                              <span className="text-[11px] text-slate-600 font-mono font-semibold">
                                رقم المحفظة: {paymentSettings.wallet_phone || "01014955160"}
                              </span>
                            </div>
                          </div>

                          {/* Copy Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(paymentSettings.wallet_phone || "01014955160", "wallet");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-500 text-slate-700 hover:text-slate-950 text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 shrink-0"
                            title="نسخ رقم المحفظة"
                          >
                            {copiedField === "wallet" ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">تم النسخ ✓</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>نسخ</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Recipient Name in small font */}
                        <div className="mt-2 pt-2 border-t border-slate-200/60 text-right pr-7">
                          <span className="text-[11px] text-slate-500">
                            الاسم الذي سوف يظهر وقت التحويل: <strong className="text-slate-800 font-semibold">{paymentSettings.wallet_recipient_name || "بوتيك الأناقة"}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Option 2: InstaPay */}
                      <div 
                        onClick={() => setPaymentMethod("instapay")}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          paymentMethod === "instapay" 
                            ? "border-amber-500 bg-amber-50/40 ring-1 ring-amber-500/50 shadow-sm" 
                            : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <input 
                              type="radio" 
                              name="payment" 
                              checked={paymentMethod === "instapay"} 
                              onChange={() => setPaymentMethod("instapay")} 
                              className="w-4 h-4 accent-amber-500" 
                            />
                            <div className="h-8 w-8 rounded-xl bg-purple-500/20 text-purple-600 flex items-center justify-center font-bold">
                              <Send className="w-4 h-4" />
                            </div>
                            <div className="text-right">
                              <span className="block text-xs font-bold text-slate-950">
                                إنستاباي InstaPay (تحويل بنكي ولحظي)
                              </span>
                              <span className="text-[11px] text-slate-600 font-mono font-semibold">
                                المعرف / الرقم: {paymentSettings.instapay_address || paymentSettings.instapay_phone || "boutique@instapay"}
                              </span>
                            </div>
                          </div>

                          {/* Copy Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(paymentSettings.instapay_address || paymentSettings.instapay_phone || "boutique@instapay", "instapay");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-500 text-slate-700 hover:text-slate-950 text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 shrink-0"
                            title="نسخ عنوان إنستاباي"
                          >
                            {copiedField === "instapay" ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">تم النسخ ✓</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>نسخ</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Recipient Name in small font */}
                        <div className="mt-2 pt-2 border-t border-slate-200/60 text-right pr-7">
                          <span className="text-[11px] text-slate-500">
                            الاسم الذي سوف يظهر وقت التحويل: <strong className="text-slate-800 font-semibold">{paymentSettings.instapay_recipient_name || "بوتيك الأناقة"}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Option 3: MyFawry */}
                      <div 
                        onClick={() => setPaymentMethod("fawry")}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          paymentMethod === "fawry" 
                            ? "border-amber-500 bg-amber-50/40 ring-1 ring-amber-500/50 shadow-sm" 
                            : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <input 
                              type="radio" 
                              name="payment" 
                              checked={paymentMethod === "fawry"} 
                              onChange={() => setPaymentMethod("fawry")} 
                              className="w-4 h-4 accent-amber-500" 
                            />
                            <div className="h-8 w-8 rounded-xl bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold">
                              <Receipt className="w-4 h-4" />
                            </div>
                            <div className="text-right">
                              <span className="block text-xs font-bold text-slate-950">
                                ماي فوري MyFawry (التحويل برقم هاتف أو كود)
                              </span>
                              <span className="text-[11px] text-slate-600 font-mono font-semibold">
                                رقم الهاتف: {paymentSettings.fawry_phone || "01014955160"} {paymentSettings.fawry_code ? `(كود: ${paymentSettings.fawry_code})` : ""}
                              </span>
                            </div>
                          </div>

                          {/* Copy Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(paymentSettings.fawry_phone || "01014955160", "fawry");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-500 text-slate-700 hover:text-slate-950 text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 shrink-0"
                            title="نسخ رقم فوري"
                          >
                            {copiedField === "fawry" ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">تم النسخ ✓</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>نسخ</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Recipient Name in small font */}
                        <div className="mt-2 pt-2 border-t border-slate-200/60 text-right pr-7">
                          <span className="text-[11px] text-slate-500">
                            الاسم الذي سوف يظهر وقت التحويل: <strong className="text-slate-800 font-semibold">{paymentSettings.fawry_recipient_name || "بوتيك الأناقة"}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Option 4: Cash on Delivery */}
                      <label className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                        paymentMethod === "cod" 
                          ? "border-amber-500 bg-amber-50/40 ring-1 ring-amber-500/50" 
                          : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                      }`}>
                        <input 
                          type="radio" 
                          name="payment" 
                          checked={paymentMethod === "cod"} 
                          onChange={() => setPaymentMethod("cod")} 
                          className="w-4 h-4 accent-amber-500" 
                        />
                        <div className="text-right flex-1">
                          <span className="block text-xs font-bold text-slate-950">الدفع عند الاستلام (نقداً)</span>
                          <span className="text-[10px] text-slate-500">سداد يدوي لمندوب الشحن عند استلام الطرد</span>
                        </div>
                      </label>
                    </div>

                    {/* Order summary row */}
                    <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-semibold">المجموع النهائي المستحق:</span>
                      <strong className="text-slate-950 text-base font-black">{grandTotal.toFixed(2)} ج.م</strong>
                    </div>

                    {/* WhatsApp Direct Action Button */}
                    <a
                      href={getWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-black transition-all shadow-lg flex items-center justify-center gap-2 group text-center"
                    >
                      <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform text-white shrink-0" />
                      <span>التوجه إلى واتساب لإرسال رسالة الدفع وتأكيد البيع ({paymentSettings.whatsapp_number || "01014955160"})</span>
                    </a>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setCheckoutStep("shipping")}
                        className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all"
                      >
                        رجوع للسابق
                      </button>
                      <button
                        onClick={handlePlaceOrder}
                        className="flex-2 py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        تأكيد وإتمام الشراء الفعلي
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Success confirmation and database triggers log */}
                {checkoutStep === "success" && lastOrderDetails && (
                  <div className="space-y-4 text-center">
                    <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                      <Check className="w-8 h-8 stroke-[3]" />
                    </div>
                    
                    <h3 className="text-2xl font-black text-slate-950">شكراً لك! تم تسجيل الطلب بنجاح</h3>
                    <p className="text-slate-500 text-xs">رقم تتبع طلبك بجدول orders هو: <strong className="text-amber-600 font-mono text-sm">{lastOrderDetails.orderNumber}</strong></p>

                    {/* Real SQL Logs display to prove full transactional execution */}
                    <div className="bg-slate-950 text-slate-100 text-right p-5 rounded-2xl font-mono text-xs border border-slate-800 space-y-2 mt-4 max-h-[220px] overflow-y-auto">
                      <p className="text-amber-400 font-bold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        سجل العمليات الحسابية والمعاملات المطبقة على MySQL:
                      </p>
                      <p className="text-slate-400">[1] INSERT INTO <strong className="text-emerald-400">orders</strong> VALUES (customer_id: 1, net_amount: {lastOrderDetails.grandTotal.toFixed(2)}, status: 'Pending');</p>
                      <p className="text-slate-400">[2] INSERT INTO <strong className="text-emerald-400">order_items</strong> (order_id, product_id, quantity) VALUES (...);</p>
                      <p className="text-slate-400">[3] UPDATE <strong className="text-amber-300">inventory</strong> SET quantity = quantity - [Qty] WHERE product_id IN ({lastOrderDetails.items.map((it: any) => it.product.id).join(", ")});</p>
                      <p className="text-slate-400">[4] INSERT INTO <strong className="text-emerald-400">payments</strong> (amount, status) VALUES ({lastOrderDetails.grandTotal.toFixed(2)}, 'Completed');</p>
                      <p className="text-slate-400">[5] INSERT INTO <strong className="text-emerald-400">shipping</strong> (method, status) VALUES ('{lastOrderDetails.shippingMethod}', 'Pending');</p>
                      <p className="text-slate-400">[6] INSERT INTO <strong className="text-emerald-400">activity_logs</strong> (action, details) VALUES ('CHECKOUT', 'إتمام الطلب بنجاح...');</p>
                      <p className="text-emerald-400 font-bold mt-2">✓ تم التزام سلامة وتكامل البيانات والقيود بنجاح (COMMIT Transaction)!</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCheckingOut(false);
                          setIsCartOpen(true);
                        }}
                        className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Receipt className="w-4 h-4" />
                        <span>فتح السلة وعرض سجل الطلبات السابقة</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCheckingOut(false)}
                        className="flex-1 py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>إغلاق الشاشة ومتابعة التسوق</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Add Product Modal */}
      <AnimatePresence>
        {isAddProductModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0" 
              onClick={() => {
                setIsAddProductModalOpen(false);
                if (onCloseAddProduct) onCloseAddProduct();
              }}
            ></div>
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl text-right z-10 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <button
                  onClick={() => {
                    setIsAddProductModalOpen(false);
                    if (onCloseAddProduct) onCloseAddProduct();
                  }}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">إضافة منتج جديد للبوتيك</h3>
                    <p className="text-xs text-slate-400">إدراج قطعة جديدة بكتالوج المتجر مع المواصفات والأقسام</p>
                  </div>
                  <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                    <Plus className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveNewProduct} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      اختيار القسم / التصنيف: *
                    </label>
                    <select
                      value={newProdCategoryId}
                      onChange={(e) => setNewProdCategoryId(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      {SAMPLE_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.category_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Product Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      اسم المنتج: *
                    </label>
                    <input
                      type="text"
                      required
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      placeholder="مثال: بليزر إيطالي كحلي فاخر"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {/* Price */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      السعر (ج.م): *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      placeholder="180.00"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Compare Price */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      السعر قبل الخصم (ج.م):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProdComparePrice}
                      onChange={(e) => setNewProdComparePrice(e.target.value)}
                      placeholder="240.00"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Discount percentage */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-red-600">
                      نسبة الخصم (%):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={newProdDiscount}
                      onChange={(e) => setNewProdDiscount(e.target.value)}
                      placeholder="20"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-red-200 bg-red-50/40 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  {/* Stock */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      الكمية بالمخزون: *
                    </label>
                    <input
                      type="number"
                      required
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(e.target.value)}
                      placeholder="15"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* SKU and Image URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      رمز المنتج (SKU):
                    </label>
                    <input
                      type="text"
                      value={newProdSku}
                      onChange={(e) => setNewProdSku(e.target.value)}
                      placeholder="مثال: PRD-BLZ-09"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      رابط صورة المنتج (URL):
                    </label>
                    <input
                      type="url"
                      value={newProdImageUrl}
                      onChange={(e) => setNewProdImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Quick Preset Images Helper */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5">
                  <span className="block text-[11px] font-bold text-slate-500">صور سريعة مقترحة للبوتيك:</span>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setNewProdImageUrl("https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600")}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-500 text-slate-700 font-medium cursor-pointer"
                    >
                      بدلة رسمية رمادية
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewProdImageUrl("https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600")}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-500 text-slate-700 font-medium cursor-pointer"
                    >
                      معطف شتوي كلاسيكي
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewProdImageUrl("https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600")}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-500 text-slate-700 font-medium cursor-pointer"
                    >
                      حقيبة جلدية هافان
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewProdImageUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600")}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-500 text-slate-700 font-medium cursor-pointer"
                    >
                      ساعة يد أنيقة
                    </button>
                  </div>
                </div>

                {/* Colors and Sizes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      الألوان المتوفرة (مفصولة بفاصلة):
                    </label>
                    <input
                      type="text"
                      value={newProdColors}
                      onChange={(e) => setNewProdColors(e.target.value)}
                      placeholder="أسود، كحلي، رمادي"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Sizes Selection Boxes (XS, S, M, L, XL) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      المقاسات المتوفرة (حدد الخانات المطلوبة): *
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {AVAILABLE_SIZES.map(size => {
                        const isSelected = newProdSizesList.includes(size);
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => toggleNewProdSize(size)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                              isSelected
                                ? "border-amber-500 bg-amber-50 text-amber-950 shadow-xs"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] border ${
                              isSelected ? "bg-amber-500 text-slate-950 border-amber-500 font-black" : "border-slate-300 bg-white"
                            }`}>
                              {isSelected && "✓"}
                            </div>
                            <span>{size}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    تفاصيل ووصف المنتج: *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={newProdDescription}
                    onChange={(e) => setNewProdDescription(e.target.value)}
                    placeholder="شرح مميزات وتصميم واستخدامات هذا المنتج الفاخر..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Specifications */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    مواصفات وخامة التصنيع (المواصفات):
                  </label>
                  <textarea
                    rows={2}
                    value={newProdSpecifications}
                    onChange={(e) => setNewProdSpecifications(e.target.value)}
                    placeholder="الخامة: 100% صوف إيطالي | البطانة: حرير | بلد الصنع: إيطاليا | العناية: تنظيف جاف..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Actions */}
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddProductModalOpen(false);
                      if (onCloseAddProduct) onCloseAddProduct();
                    }}
                    className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-2 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                  >
                    إضافة المنتج للمتجر الآن
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Toast Notification when adding product to cart */}
      <AnimatePresence>
        {cartToast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-950/95 text-white border border-amber-500/50 shadow-2xl rounded-2xl px-5 py-3.5 flex items-center gap-3 backdrop-blur-md max-w-md w-auto"
          >
            <div className="h-8 w-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-white">تمت إضافة المنتج إلى حقيبة التسوق بنجاح!</p>
              <p className="text-[11px] text-amber-400 font-medium truncate max-w-[200px]">{cartToast.name}</p>
            </div>
            <button
              onClick={() => {
                setCartToast(null);
                setIsCartOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all mr-2 whitespace-nowrap cursor-pointer"
            >
              عرض السلة
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
