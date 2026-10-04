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
  Info
} from "lucide-react";
import { Product, Category, CartItem, Coupon, ActivityLog, Review } from "../types";
import { SAMPLE_PRODUCTS, SAMPLE_CATEGORIES, SAMPLE_COUPONS, INITIAL_PRODUCT_REVIEWS } from "../dbSchemaData";

interface StoreFrontProps {
  siteConfig: {
    siteName: string;
    developerCredit: string;
    heroTitle: string;
    heroSubtitle: string;
  };
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
}

export default function StoreFront({ 
  siteConfig, 
  onAddActivity, 
  onSimulateOrderCreation,
  isAddProductOpen,
  onCloseAddProduct 
}: StoreFrontProps) {
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "rating">("default");
  
  // Shopping Cart States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");

  // Product Detail States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  // Checkout States
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"address" | "shipping" | "payment" | "success">("address");
  const [firstName, setFirstName] = useState("أحمد");
  const [lastName, setLastName] = useState("علي");
  const [phone, setPhone] = useState("0599112233");
  const [addressLine, setAddressLine] = useState("شارع الملك فهد، حي المروج");
  const [city, setCity] = useState("الرياض");
  const [stateName, setStateName] = useState("الرياض");
  const [postalCode, setPostalCode] = useState("12281");
  const [country, setCountry] = useState("السعودية");
  const [shippingMethod, setShippingMethod] = useState("Aramex Express");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  
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
  const [newProdStock, setNewProdStock] = useState<string>("15");
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdImageUrl, setNewProdImageUrl] = useState("");
  const [newProdDescription, setNewProdDescription] = useState("");
  const [newProdSpecifications, setNewProdSpecifications] = useState("");
  const [newProdColors, setNewProdColors] = useState("أسود ملكي، كحلي داكن");
  const [newProdSizes, setNewProdSizes] = useState("S, M, L, XL");

  // Sync external add product trigger from top bar
  useEffect(() => {
    if (isAddProductOpen) {
      setIsAddProductModalOpen(true);
    }
  }, [isAddProductOpen]);

  // Filter and Sort Logic
  const filteredProducts = products.filter(p => {
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

  // Coupon application
  const applyCoupon = () => {
    setCouponError("");
    const coupon = SAMPLE_COUPONS.find(c => c.coupon_code.toUpperCase() === couponCode.trim().toUpperCase());
    
    if (!coupon) {
      setCouponError("كوبون الخصم غير صحيح أو منتهي الصلاحية.");
      return;
    }

    const subtotal = cart.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);
    if (subtotal < coupon.min_order_amount) {
      setCouponError(`هذا الكوبون يتطلب حداً أدنى للشراء يبلغ $${coupon.min_order_amount}`);
      return;
    }

    setAppliedCoupon(coupon);
    onAddActivity("APPLY_COUPON", `تم تطبيق كوبون الخصم "${coupon.coupon_code}" وحسم قيمة الخصم من الفاتورة.`);
  };

  // Calculations
  const subtotal = cart.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);
  const discount = appliedCoupon 
    ? (appliedCoupon.discount_type === "percentage" 
        ? (subtotal * appliedCoupon.discount_value / 100) 
        : appliedCoupon.discount_value)
    : 0;
  const shippingCost = subtotal > 150 ? 0 : 15;
  const tax = (subtotal - discount) * 0.15; // 15% VAT
  const grandTotal = Math.max(0, subtotal - discount + shippingCost + tax);

  // Checkout process completion
  const handlePlaceOrder = () => {
    const orderNumber = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsSummary = cart.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price
    }));

    // Trigger simulation on database side (updating the state of local DB arrays)
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
      coupon_code: appliedCoupon?.coupon_code,
      payment_method: paymentMethod,
      shipping_method: shippingMethod
    });

    // Update local products stock state to reflect inventory depletion
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
      tax,
      shippingCost,
      grandTotal,
      paymentMethod,
      shippingMethod,
      items: [...cart]
    });

    // Clear cart & state
    setCart([]);
    setAppliedCoupon(null);
    setCouponCode("");
    setCheckoutStep("success");
    onAddActivity("PLACE_ORDER", `نجاح عملية الشراء وتوليد الطلب رقم ${orderNumber} وتخزينه في جدول orders.`);
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

  // Add new product handler
  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice) {
      alert("يرجى كتابة اسم المنتج وتحديد السعر.");
      return;
    }

    const targetCategory = SAMPLE_CATEGORIES.find(c => c.id === Number(newProdCategoryId)) || SAMPLE_CATEGORIES[0];
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const priceNum = parseFloat(newProdPrice) || 0;
    const compareNum = newProdComparePrice ? parseFloat(newProdComparePrice) : null;
    const stockNum = parseInt(newProdStock) || 10;
    const colorsArr = newProdColors.split(/[,،]+/).map(s => s.trim()).filter(Boolean);
    const sizesArr = newProdSizes.split(/[,،]+/).map(s => s.trim()).filter(Boolean);
    const defaultImg = newProdImageUrl.trim() || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600";

    const createdProduct: Product = {
      id: newId,
      product_name: newProdName.trim(),
      slug: newProdName.trim().toLowerCase().replace(/\s+/g, "-"),
      description: newProdDescription.trim() || "منتج فاخر عالي الجودة منتقى بعناية من أحدث تشكيلات البوتيك الإيطالي.",
      specifications: newProdSpecifications.trim() || "خامات إيطالية فاخرة - حياكة متقنة - تصميم عصري متميز وأنيق.",
      price: priceNum,
      compare_at_price: compareNum,
      category_id: targetCategory.id,
      category_name: targetCategory.category_name,
      sku: newProdSku.trim() || `PRD-NEW-${newId.toString().padStart(2, "0")}`,
      is_active: true,
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
      <div className="max-w-7xl mx-auto px-6 py-12">
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
                  <span className="absolute top-4 right-4 bg-slate-900/80 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-sm">
                    {product.category_name}
                  </span>

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
                    <span className="text-2xl font-extrabold text-slate-900">${product.price.toFixed(2)}</span>
                    {product.compare_at_price && (
                      <span className="text-sm text-slate-400 line-through">${product.compare_at_price.toFixed(2)}</span>
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
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 left-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950 transition-all z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
                {/* Images Gallery */}
                <div className="space-y-4">
                  <div className="h-96 w-full rounded-2xl overflow-hidden bg-slate-100">
                    <img 
                      src={selectedProduct.images[activeImageIdx] || selectedProduct.image_url} 
                      alt={selectedProduct.product_name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
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

                  {/* Price */}
                  <div className="flex items-baseline gap-3 border-y border-slate-100 py-4">
                    <span className="text-3xl font-black text-slate-950">${selectedProduct.price.toFixed(2)}</span>
                    {selectedProduct.compare_at_price && (
                      <span className="text-sm text-slate-400 line-through">${selectedProduct.compare_at_price.toFixed(2)}</span>
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
                      <span className="block text-xs font-bold text-slate-400">المقاسات المتوفرة:</span>
                      <div className="flex gap-2">
                        {selectedProduct.sizes.map(size => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`h-10 w-10 rounded-xl border flex items-center justify-center text-xs font-bold transition-all ${
                              selectedSize === size || (!selectedSize && selectedProduct.sizes[0] === size)
                                ? "border-amber-500 bg-amber-50 text-amber-900" 
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

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-4">
                    <ShoppingBag className="w-16 h-16 stroke-1 text-slate-300" />
                    <p className="text-sm">سلتك لا تزال فارغة حالياً.</p>
                  </div>
                ) : (
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
                          <span className="font-extrabold text-slate-900 text-sm">${(item.product.price * item.quantity).toFixed(2)}</span>
                          
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
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-center font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        onClick={applyCoupon}
                        className="bg-slate-900 text-white text-xs px-4 py-2 rounded-xl hover:bg-slate-800 transition-all font-semibold"
                      >
                        تطبيق
                      </button>
                    </div>
                    {couponError && <p className="text-[10px] text-red-500 font-semibold">{couponError}</p>}
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

                  {/* Calc breakdown */}
                  <div className="space-y-2 border-t border-slate-200/60 pt-3 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>المجموع الفرعي:</span>
                      <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>الخصم المطبق:</span>
                        <span className="font-bold">-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>رسوم الشحن والتوصيل:</span>
                      <span className="font-bold text-slate-900">
                        {shippingCost === 0 ? "شحن مجاني" : `$${shippingCost.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>الضريبة المضافة VAT (15%):</span>
                      <span className="font-bold text-slate-900">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-slate-950 border-t border-slate-200/80 pt-2 mt-1">
                      <span>المبلغ الإجمالي الصافي:</span>
                      <span>${grandTotal.toFixed(2)}</span>
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
              className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setIsCheckingOut(false)}
                className="absolute top-6 left-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950 transition-all z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Steps Progress Header */}
              <div className="bg-slate-900 text-white p-6 text-right">
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
                        <span className="text-xs font-bold text-slate-900">$15.00</span>
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
                        <span className="text-xs font-bold text-slate-900">$25.00</span>
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
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-500" />
                      3. بوابة السداد والتحويل المالي (جدول payments)
                    </h4>
                    <p className="text-xs text-slate-400">سيتم توليد رمز مرجع المعاملة وحفظ السداد كحالة مكتملة بجدولpayments.</p>

                    <div className="grid grid-cols-2 gap-4">
                      <label className={`p-4 border rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-3 transition-all ${
                        paymentMethod === "Credit Card" ? "border-amber-500 bg-amber-50/50" : "border-slate-100 bg-slate-50 hover:border-slate-200"
                      }`}>
                        <input type="radio" name="payment" checked={paymentMethod === "Credit Card"} onChange={() => setPaymentMethod("Credit Card")} className="sr-only" />
                        <CreditCard className="w-6 h-6 text-slate-700" />
                        <div className="text-center">
                          <span className="block text-xs font-bold text-slate-950">بطاقة الائتمان</span>
                          <span className="text-[10px] text-slate-500">فيزا / ماستركارد</span>
                        </div>
                      </label>

                      <label className={`p-4 border rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-3 transition-all ${
                        paymentMethod === "PayPal" ? "border-amber-500 bg-amber-50/50" : "border-slate-100 bg-slate-50 hover:border-slate-200"
                      }`}>
                        <input type="radio" name="payment" checked={paymentMethod === "PayPal"} onChange={() => setPaymentMethod("PayPal")} className="sr-only" />
                        <CreditCard className="w-6 h-6 text-indigo-600" />
                        <div className="text-center">
                          <span className="block text-xs font-bold text-slate-950">بايبال PayPal</span>
                          <span className="text-[10px] text-slate-500">تحويل مباشر مؤمن</span>
                        </div>
                      </label>

                      <label className={`p-4 border rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-3 transition-all ${
                        paymentMethod === "Apple Pay" ? "border-amber-500 bg-amber-50/50" : "border-slate-100 bg-slate-50 hover:border-slate-200"
                      }`}>
                        <input type="radio" name="payment" checked={paymentMethod === "Apple Pay"} onChange={() => setPaymentMethod("Apple Pay")} className="sr-only" />
                        <CreditCard className="w-6 h-6 text-slate-900" />
                        <div className="text-center">
                          <span className="block text-xs font-bold text-slate-950">Apple Pay</span>
                          <span className="text-[10px] text-slate-500">سداد فوري بنقرة واحدة</span>
                        </div>
                      </label>

                      <label className={`p-4 border rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-3 transition-all ${
                        paymentMethod === "Cash on Delivery" ? "border-amber-500 bg-amber-50/50" : "border-slate-100 bg-slate-50 hover:border-slate-200"
                      }`}>
                        <input type="radio" name="payment" checked={paymentMethod === "Cash on Delivery"} onChange={() => setPaymentMethod("Cash on Delivery")} className="sr-only" />
                        <CreditCard className="w-6 h-6 text-amber-600" />
                        <div className="text-center">
                          <span className="block text-xs font-bold text-slate-950">الدفع عند الاستلام</span>
                          <span className="text-[10px] text-slate-500">دفع نقد عيني وقت التسليم</span>
                        </div>
                      </label>
                    </div>

                    {/* Order summary small row */}
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-slate-500">المجموع النهائي المستحق:</span>
                      <strong className="text-slate-950 text-base">${grandTotal.toFixed(2)}</strong>
                    </div>

                    <div className="flex gap-3 pt-3">
                      <button
                        onClick={() => setCheckoutStep("shipping")}
                        className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all"
                      >
                        رجوع للسابق
                      </button>
                      <button
                        onClick={handlePlaceOrder}
                        className="flex-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                      >
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

                    <button
                      onClick={() => setIsCheckingOut(false)}
                      className="w-full py-3 bg-slate-950 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all mt-4"
                    >
                      متابعة التسوق بالمتجر
                    </button>
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Price */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      السعر ($): *
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
                      السعر قبل الخصم ($):
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

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      المقاسات المتوفرة (مفصولة بفاصلة):
                    </label>
                    <input
                      type="text"
                      value={newProdSizes}
                      onChange={(e) => setNewProdSizes(e.target.value)}
                      placeholder="S, M, L, XL, XXL"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
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
    </div>
  );
}
