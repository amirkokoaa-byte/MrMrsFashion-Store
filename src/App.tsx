/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
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
  ShieldCheck
} from "lucide-react";
import StoreFront from "./components/StoreFront";
import DbDesigner from "./components/DbDesigner";
import { MockSqlEngine } from "./sqlEngine";
import { ActivityLog } from "./types";

export default function App() {
  const [activeView, setActiveView] = useState<"storefront" | "designer">("storefront");
  
  // Dynamic Site Configuration editable via Gear Settings
  const [siteConfig, setSiteConfig] = useState({
    siteName: "بوتيك الأناقة & MySQL Designer",
    developerCredit: "بإشراف المطور: كامل أبو سمرة – kamel3lom",
    heroTitle: "بوتيك الأناقة العصرية",
    heroSubtitle: "تصاميم إيطالية فاخرة منتقاة بعناية للبدلات الرسمية والفساتين الكلاسيكية والإكسسوارات المتميزة، صُممت لتمنحك إطلالة فريدة تعبر عن هويتك الراقية."
  });

  // Settings & Authentication States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isSettingsUnlocked, setIsSettingsUnlocked] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Temp form states for settings editing
  const [tempSiteName, setTempSiteName] = useState(siteConfig.siteName);
  const [tempDeveloperCredit, setTempDeveloperCredit] = useState(siteConfig.developerCredit);
  const [tempHeroTitle, setTempHeroTitle] = useState(siteConfig.heroTitle);
  const [tempHeroSubtitle, setTempHeroSubtitle] = useState(siteConfig.heroSubtitle);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

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

  const handleAddActivity = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: activityLogs.length + 1,
      user_id: 1,
      action,
      ip_address: "127.0.0.1",
      details,
      created_at: new Date().toISOString().replace("T", " ").substring(0, 19)
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Open Settings Gear handler
  const handleOpenSettings = () => {
    if (isSettingsUnlocked) {
      setTempSiteName(siteConfig.siteName);
      setTempDeveloperCredit(siteConfig.developerCredit);
      setTempHeroTitle(siteConfig.heroTitle);
      setTempHeroSubtitle(siteConfig.heroSubtitle);
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
      setTempHeroTitle(siteConfig.heroTitle);
      setTempHeroSubtitle(siteConfig.heroSubtitle);
      setShowSettingsModal(true);
      handleAddActivity("ADMIN_UNLOCK", "تم تسجيل دخول المسؤول إلى لوحة إعدادات البوتيك بنجاح.");
    } else {
      setAuthError("كلمة المرور غير صحيحة، يرجى إعادة المحاولة.");
    }
  };

  // Save Settings Changes
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSiteConfig({
      siteName: tempSiteName.trim() || siteConfig.siteName,
      developerCredit: tempDeveloperCredit.trim() || siteConfig.developerCredit,
      heroTitle: tempHeroTitle.trim() || siteConfig.heroTitle,
      heroSubtitle: tempHeroSubtitle.trim() || siteConfig.heroSubtitle
    });
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
    handleAddActivity("UPDATE_SITE_CONFIG", "تم تحديث نصوص وهوية الموقع واسم البوتيك من لوحة الإعدادات.");
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
      
      {/* Top Header Navigation */}
      <div className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Author (Customizable from Settings) */}
          <div className="flex items-center gap-3 text-right">
            <span className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black font-mono shadow-md">
              K
            </span>
            <div>
              <span className="block text-sm sm:text-base font-black text-white leading-tight">
                {siteConfig.siteName}
              </span>
              <span className="text-[11px] text-amber-400 font-bold block">
                {siteConfig.developerCredit}
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

            {/* Add Product Button */}
            <button
              onClick={() => {
                if (activeView !== "storefront") setActiveView("storefront");
                setIsAddProductTriggered(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-md"
              title="إضافة منتج جديد للمتجر"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">أضف منتج</span>
            </button>

            {/* Activity Logs Trigger */}
            <button
              onClick={() => setShowLogDrawer(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold hover:border-slate-700 transition-all"
              title="سجل العمليات"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">السجل</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded-full text-slate-400 font-mono">
                {activityLogs.length}
              </span>
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
                onAddActivity={handleAddActivity}
                onSimulateOrderCreation={handleSimulateOrderCreation}
                isAddProductOpen={isAddProductTriggered}
                onCloseAddProduct={() => setIsAddProductTriggered(false)}
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

      {/* Settings Modal (Gear Configuration) */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setShowSettingsModal(false)}></div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl text-right z-10 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <div>
                    <h3 className="font-bold text-white text-base">إعدادات وهوية المتجر</h3>
                    <p className="text-[11px] text-slate-400">تخصيص أسماء وعناوين الواجهة وفق طلبات الإدارة</p>
                  </div>
                  <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Settings className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {saveSuccessNotice && (
                <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  تم حفظ وتحديث نصوص وبيانات الموقع بنجاح!
                </div>
              )}

              {/* Settings Form */}
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
                    placeholder="بوتيك الأناقة & MySQL Designer"
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
                    placeholder="بإشراف المطور: كامل أبو سمرة – kamel3lom"
                  />
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
                    placeholder="تصاميم إيطالية فاخرة منتقاة بعناية..."
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md"
                  >
                    حفظ التعديلات
                  </button>
                </div>
              </form>

              {/* Extra Admin Options */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <span className="block text-xs font-bold text-slate-400">إجراءات الإدارة السريعة:</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setShowSettingsModal(false);
                      if (activeView !== "storefront") setActiveView("storefront");
                      setIsAddProductTriggered(true);
                    }}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-amber-400 text-xs font-bold transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة منتج جديد
                  </button>

                  <button
                    onClick={() => {
                      setShowSettingsModal(false);
                      setActiveView("designer");
                      handleAddActivity("OPEN_DESIGNER_ADMIN", "فتح لوحة مصمم ومفسر قواعد البيانات MySQL من خلال صلاحيات الإدارة.");
                    }}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-white text-xs font-semibold transition-all"
                  >
                    <Database className="w-4 h-4 text-amber-500" />
                    لوحة قواعد البيانات MySQL
                  </button>
                </div>

                <button
                  onClick={() => {
                    setIsSettingsUnlocked(false);
                    setShowSettingsModal(false);
                    handleAddActivity("ADMIN_LOCK", "تم قفل لوحة الإعدادات وتسجيل خروج المسؤول.");
                  }}
                  className="w-full py-2 text-center text-xs text-slate-500 hover:text-red-400 transition-all"
                >
                  قفل الإعدادات وتسجيل الخروج
                </button>
              </div>
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
                مبني لتسجيل عمليات الإدارة وفق متطلبات كامل أبو سمرة – kamel3lom
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main App Footer */}
      <footer className="bg-slate-950 border-t border-slate-850 py-8 px-6 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto space-y-3">
          <p className="font-medium text-slate-400">جميع الحقوق محفوظة للمطور كامل أبو سمرة – kamel3lom © 2026</p>
          <p className="text-[10px] leading-relaxed max-w-2xl mx-auto">
            منصة متكاملة لمتجر ملابس وإكسسوارات إلكتروني راقٍ مع نظام تتبع مخازن وسجلات نشاط. مبني كنموذج رائد ومميز للتطبيقات المعقدة.
          </p>
        </div>
      </footer>
    </div>
  );
}
