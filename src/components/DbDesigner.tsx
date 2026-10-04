/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Database, 
  Terminal, 
  BookOpen, 
  Code, 
  Play, 
  Copy, 
  Sparkles, 
  HelpCircle, 
  RefreshCw,
  Search,
  Check,
  ChevronLeft,
  Settings,
  Shield,
  Layers,
  ArrowUpRight,
  UserCheck
} from "lucide-react";
import { DbTableSchema, QueryResult, PresetQuery, ActivityLog } from "../types";
import { DB_SCHEMAS, FULL_MYSQL_SCRIPT, PRESET_QUERIES } from "../dbSchemaData";
import { MockSqlEngine } from "../sqlEngine";

interface DbDesignerProps {
  sqlEngine: MockSqlEngine;
  activityLogs: ActivityLog[];
  onAddActivity: (action: string, details: string) => void;
}

export default function DbDesigner({ sqlEngine, activityLogs, onAddActivity }: DbDesignerProps) {
  const [activeTab, setActiveTab] = useState<"visualizer" | "sandbox" | "sql-code" | "docs">("visualizer");
  const [selectedSchema, setSelectedSchema] = useState<DbTableSchema>(DB_SCHEMAS[1]); // Default select "users" table
  const [dbState, setDbState] = useState<Record<string, any[]>>(sqlEngine.getDatabaseState());

  // SQL Sandbox States
  const [selectedPresetQuery, setSelectedPresetQuery] = useState<string>("q1");
  const [consoleQuery, setConsoleQuery] = useState<string>(PRESET_QUERIES[0].sql);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Gemini Assistant States
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<{ sql?: string; explanation?: string } | null>(null);

  // Copy success indicator
  const [copiedScript, setCopiedScript] = useState(false);

  useEffect(() => {
    // Run initial query on tab enter
    handleRunQuery(PRESET_QUERIES[0].sql);
  }, []);

  const handleSelectPreset = (id: string) => {
    setSelectedPresetQuery(id);
    const q = PRESET_QUERIES.find(p => p.id === id);
    if (q) {
      setConsoleQuery(q.sql);
      handleRunQuery(q.sql);
      onAddActivity("PRESET_QUERY_SELECT", `اختيار الاستعلام الجاهز: "${q.title}".`);
    }
  };

  const handleRunQuery = (sql: string) => {
    setIsExecuting(true);
    // Simulate minor network delay for realism
    setTimeout(() => {
      const res = sqlEngine.executeQuery(sql);
      setQueryResult(res);
      setDbState({ ...sqlEngine.getDatabaseState() }); // Update local DB states in case data was updated
      setIsExecuting(false);
      onAddActivity("RUN_QUERY", `تنفيذ استعلام SQL في المختبر التفاعلي.`);
    }, 150);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(FULL_MYSQL_SCRIPT);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
    onAddActivity("COPY_SQL_SCRIPT", "نسخ كود SQL الكامل لإنشاء الجداول في الحافظة.");
  };

  // Call server-side Gemini API route to convert natural language Arabic query to SQL
  const handleAskGemini = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);

    try {
      const response = await fetch("/api/generate-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt })
      });

      if (!response.ok) {
        throw new Error("فشل توليد الاستعلام من الذكاء الاصطناعي. يرجى تكرار المحاولة.");
      }

      const data = await response.json();
      setAiResponse(data);
      onAddActivity("ASK_GEMINI_SQL", `الاستعانة بمساعد الذكاء الاصطناعي لتوليد استعلام SQL: "${aiPrompt}"`);
    } catch (e: any) {
      setAiResponse({
        explanation: `عذراً، حدث خطأ أثناء الاتصال بمساعد الذكاء الاصطناعي. يرجى التحقق من توفر مفتاح GEMINI_API_KEY في إعدادات التطبيق. الخطأ: ${e.message}`
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleResetSandboxDb = () => {
    sqlEngine.resetDatabase();
    setDbState({ ...sqlEngine.getDatabaseState() });
    handleRunQuery(consoleQuery);
    onAddActivity("RESET_DATABASE", "إعادة ضبط قاعدة بيانات المختبر إلى حالتها الأولية.");
  };

  // Group schemas for easier visual mapping
  const usersGroup = DB_SCHEMAS.filter(s => s.group === "users");
  const productsGroup = DB_SCHEMAS.filter(s => s.group === "products");
  const cartsGroup = DB_SCHEMAS.filter(s => s.group === "carts");
  const ordersGroup = DB_SCHEMAS.filter(s => s.group === "orders");
  const servicesGroup = DB_SCHEMAS.filter(s => s.group === "services");

  return (
    <div className="w-full bg-slate-900 text-slate-100 min-h-screen font-sans flex flex-col" dir="rtl">
      
      {/* 1. Database Header Controls */}
      <div className="bg-slate-950 border-b border-slate-800 p-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Database className="w-6 h-6" />
            </div>
            <div className="text-right">
              <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                مصمم قواعد البيانات التفاعلي MySQL
                <span className="text-xs bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-bold">إصدار 8.0+</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                المهندس المعماري المعتمد: <strong className="text-amber-400">كامل أبو سمرة – kamel3lom</strong>
              </p>
            </div>
          </div>

          {/* Quick Tabs Menu */}
          <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex gap-1.5 w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab("visualizer")}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "visualizer" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4" />
              مخطط الجداول
            </button>
            <button
              onClick={() => setActiveTab("sandbox")}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "sandbox" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <Terminal className="w-4 h-4" />
              مختبر الاستعلامات Sandbox
            </button>
            <button
              onClick={() => setActiveTab("sql-code")}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "sql-code" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <Code className="w-4 h-4" />
              كود SQL للتطبيق
            </button>
            <button
              onClick={() => setActiveTab("docs")}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "docs" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              التوثيق والتحسينات
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Tab Contents */}
      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        
        {/* TAB 1: Schema Visualizer and ER diagram simulator */}
        {activeTab === "visualizer" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Visual ER Map */}
            <div className="lg:col-span-2 space-y-8 bg-slate-950/60 border border-slate-800 p-6 rounded-3xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-500" />
                  مخطط هيكل قاعدة البيانات (ER Diagram)
                </h2>
                <span className="text-xs text-slate-400">انقر على أي جدول لاستعراض حقوله ونوعه القياسي</span>
              </div>

              {/* Grouped Tables Canvas Layout */}
              <div className="space-y-6">
                
                {/* Section: Users */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-500 tracking-wider block">1. قطاع المستخدمين والصلاحيات (User Operations)</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {usersGroup.map(schema => (
                      <button
                        key={schema.tableName}
                        onClick={() => setSelectedSchema(schema)}
                        className={`p-3 rounded-xl border text-right transition-all flex flex-col gap-1.5 ${
                          selectedSchema.tableName === schema.tableName
                            ? "border-amber-500 bg-amber-500/10 text-white"
                            : "border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                      >
                        <span className="font-mono text-xs font-bold text-amber-400">{schema.tableName}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{schema.arabicDescription}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section: Products */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-500 tracking-wider block">2. قطاع المنتجات والمستودعات (Product Catalog)</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {productsGroup.map(schema => (
                      <button
                        key={schema.tableName}
                        onClick={() => setSelectedSchema(schema)}
                        className={`p-3 rounded-xl border text-right transition-all flex flex-col gap-1.5 ${
                          selectedSchema.tableName === schema.tableName
                            ? "border-amber-500 bg-amber-500/10 text-white"
                            : "border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                      >
                        <span className="font-mono text-xs font-bold text-amber-400">{schema.tableName}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{schema.arabicDescription}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section: Carts */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-500 tracking-wider block">3. قطاع عربات التسوق (Shopping Sessions)</span>
                  <div className="grid grid-cols-2 gap-3 max-w-md">
                    {cartsGroup.map(schema => (
                      <button
                        key={schema.tableName}
                        onClick={() => setSelectedSchema(schema)}
                        className={`p-3 rounded-xl border text-right transition-all flex flex-col gap-1.5 ${
                          selectedSchema.tableName === schema.tableName
                            ? "border-amber-500 bg-amber-500/10 text-white"
                            : "border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                      >
                        <span className="font-mono text-xs font-bold text-amber-400">{schema.tableName}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{schema.arabicDescription}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section: Orders */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-500 tracking-wider block">4. المبيعات، الطلبات، الشحن والدفع (Order Lifecycle)</span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {ordersGroup.map(schema => (
                      <button
                        key={schema.tableName}
                        onClick={() => setSelectedSchema(schema)}
                        className={`p-3 rounded-xl border text-right transition-all flex flex-col gap-1.5 ${
                          selectedSchema.tableName === schema.tableName
                            ? "border-amber-500 bg-amber-500/10 text-white"
                            : "border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                      >
                        <span className="font-mono text-xs font-bold text-amber-400">{schema.tableName}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{schema.arabicDescription}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section: Services */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-500 tracking-wider block">5. التسويق والتدقيق والخدمات (Services & Auditing)</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {servicesGroup.map(schema => (
                      <button
                        key={schema.tableName}
                        onClick={() => setSelectedSchema(schema)}
                        className={`p-3 rounded-xl border text-right transition-all flex flex-col gap-1.5 ${
                          selectedSchema.tableName === schema.tableName
                            ? "border-amber-500 bg-amber-500/10 text-white"
                            : "border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                      >
                        <span className="font-mono text-xs font-bold text-amber-400">{schema.tableName}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{schema.arabicDescription}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Relationship explanation legend cards */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-right space-y-1">
                  <span className="text-xs font-bold text-amber-400 block">علاقة (One to One)</span>
                  <p className="text-[10px] text-slate-400 leading-relaxed">يرتبط صف واحد بصف واحد فقط. مثل ربط المستخدم ببروفايل العميل <code className="text-slate-300 font-mono">users.id ➔ customers.user_id</code>.</p>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-xs font-bold text-amber-400 block">علاقة (One to Many)</span>
                  <p className="text-[10px] text-slate-400 leading-relaxed">يرتبط صف بصفوف متعددة. مثل تصنيف المنتجات بالمنتجات داخل القسم <code className="text-slate-300 font-mono">categories.id ➔ products.category_id</code>.</p>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-xs font-bold text-amber-400 block">علاقة (Many to Many)</span>
                  <p className="text-[10px] text-slate-400 leading-relaxed">يتم كسرها بجدول وسيط. مثل ربط السلة بالمنتجات عبر جدول وسيط يسمى <code className="text-amber-300 font-mono">cart_items</code>.</p>
                </div>
              </div>
            </div>

            {/* Selected Table Fields Sidebar Details */}
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sticky top-8">
                <div className="border-b border-slate-800 pb-4 space-y-2">
                  <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/20">
                    <Database className="w-3 h-3" />
                    تفاصيل حقول MySQL
                  </span>
                  <h3 className="text-2xl font-black text-white font-mono">{selectedSchema.tableName}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedSchema.arabicDescription}</p>
                </div>

                {/* Columns breakdown */}
                <div className="py-4 space-y-3 max-h-[380px] overflow-y-auto">
                  {selectedSchema.columns.map(col => (
                    <div key={col.name} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-right gap-4 hover:border-slate-700 transition-colors">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-white">{col.name}</span>
                          {col.isPk && <span className="bg-amber-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded">PK</span>}
                          {col.isFk && <span className="bg-slate-700 text-slate-200 text-[8px] font-bold px-1.5 py-0.5 rounded">FK</span>}
                        </div>
                        <p className="text-[10px] text-slate-400">{col.description}</p>
                        {col.isFk && col.fkRef && (
                          <p className="text-[9px] text-amber-500 font-mono">مرجع: ➔ {col.fkRef}</p>
                        )}
                      </div>
                      <div className="text-left font-mono text-[10px] text-amber-300/90 font-semibold shrink-0">
                        {col.type}
                        {!col.nullable && <span className="text-red-400 ml-1 font-sans">*</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Meta details footer */}
                <div className="border-t border-slate-800 pt-4 text-xs text-slate-400 space-y-2">
                  <div className="flex justify-between">
                    <span>محرك البيانات المادي:</span>
                    <strong className="text-white">InnoDB (MySQL 8)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>ترميز الرموز:</span>
                    <strong className="text-white">utf8mb4_unicode_ci</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>دعم الحذف الناعم (Soft Delete):</span>
                    <strong className={selectedSchema.columns.some(c => c.name === "deleted_at") ? "text-emerald-400" : "text-slate-500"}>
                      {selectedSchema.columns.some(c => c.name === "deleted_at") ? "نشط ومفعل" : "غير مدعوم"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: SQL Sandbox console */}
        {activeTab === "sandbox" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left side: Preset Queries & Console */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Presets Grid Selector */}
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-amber-500" />
                    استعلامات تشغيلية مهمة (10 استعلامات مطلوبة)
                  </h3>
                  <button 
                    onClick={handleResetSandboxDb}
                    className="flex items-center gap-1 text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white transition-all"
                  >
                    <RefreshCw className="w-3 h-3" />
                    إعادة تصفير قاعدة البيانات
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[180px] overflow-y-auto">
                  {PRESET_QUERIES.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => handleSelectPreset(q.id)}
                      className={`p-3 rounded-xl border text-right transition-all flex gap-3 items-start ${
                        selectedPresetQuery === q.id 
                          ? "border-amber-500 bg-amber-500/10 text-white shadow-md" 
                          : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      <span className="h-5 w-5 bg-slate-800 rounded-lg flex items-center justify-center font-bold font-mono text-[10px] text-amber-400 shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="space-y-0.5">
                        <span className="block text-xs font-bold text-slate-200">{q.title}</span>
                        <p className="text-[9px] text-slate-500 line-clamp-1">{q.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced SQL Console input */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden flex flex-col">
                <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-amber-500" />
                    لوحة كونسول استعلامات SQL
                  </span>
                  <span className="text-[10px] text-slate-500">مفسر MySQL فوري متكامل مع البيانات التجريبية</span>
                </div>

                <div className="p-4 bg-slate-950">
                  <textarea
                    value={consoleQuery}
                    onChange={(e) => setConsoleQuery(e.target.value)}
                    dir="ltr"
                    className="w-full h-32 bg-slate-950 text-emerald-400 font-mono text-sm focus:outline-none p-3 rounded-xl border border-slate-800/80 resize-none leading-relaxed"
                    placeholder="SELECT * FROM products;"
                  />
                </div>

                <div className="px-6 py-3 bg-slate-900 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">المحرك يدعم تتبع قيود المفاتيح الأجنبية وتحديث المخزون.</span>
                  <button
                    onClick={() => handleRunQuery(consoleQuery)}
                    disabled={isExecuting}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/30 text-slate-950 font-extrabold px-5 py-2 rounded-xl text-xs transition-all shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    تشغيل الاستعلام (RUN)
                  </button>
                </div>
              </div>

              {/* Execution Results View */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden">
                <div className="bg-slate-900 px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
                  <h4 className="font-bold text-xs text-white">نتائج الاستعلام المعادة (Query Output)</h4>
                  {queryResult && (
                    <div className="flex gap-4 text-[10px] text-slate-400 font-mono">
                      <span>وقت الاستجابة: <strong className="text-emerald-400">{queryResult.executionTimeMs}ms</strong></span>
                      {queryResult.affectedRows !== undefined && (
                        <span>الصفوف المتأثرة: <strong className="text-amber-400">{queryResult.affectedRows}</strong></span>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-6 overflow-x-auto">
                  {isExecuting ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                      <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                      <p className="text-xs text-slate-500">جاري تصفية وتجميع جداول MySQL...</p>
                    </div>
                  ) : queryResult ? (
                    queryResult.error ? (
                      <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-4 rounded-xl text-xs space-y-1 text-right leading-relaxed font-mono">
                        <strong className="block text-sm font-bold">⚠️ فشل التحقق في المفسر:</strong>
                        <p>{queryResult.error}</p>
                      </div>
                    ) : (
                      <table className="w-full text-right text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/30">
                            {queryResult.columns.map(col => (
                              <th key={col} className="p-3 font-mono font-bold text-slate-300">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {queryResult.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="border-b border-slate-800/40 hover:bg-slate-800/20">
                              {row.map((val: any, cIdx: number) => (
                                <td key={cIdx} className="p-3 text-slate-300 font-medium font-mono">
                                  {val === null || val === undefined ? "NULL" : String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )
                  ) : (
                    <p className="text-center text-xs text-slate-500 py-12">اضغط على زر تشغيل الاستعلامات لعرض البيانات المستخرجة من MySQL.</p>
                  )}
                </div>
              </div>

            </div>

            {/* Right side: AI Database Consultant */}
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sticky top-8 space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/20 mb-2">
                    <Sparkles className="w-3 h-3" />
                    مستشار الذكاء الاصطناعي
                  </span>
                  <h3 className="text-xl font-black text-white">مساعد MySQL الذكي</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    اكتب سؤالك باللغة العربية البسيطة وسيقوم المساعد بتحويله إلى كود استعلام MySQL 8.0 متكامل ومتوافق مع جدول متجر الملابس والإكسسوارات.
                  </p>
                </div>

                {/* AI Input */}
                <div className="space-y-3">
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="مثال: كيف أحسب إجمالي كميات المخزون في مستودع أ؟"
                    className="w-full h-24 bg-slate-900 text-white rounded-xl text-xs p-3 focus:outline-none border border-slate-800 focus:border-amber-500"
                  />
                  <button
                    onClick={handleAskGemini}
                    disabled={isAiLoading || !aiPrompt.trim()}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow"
                  >
                    {isAiLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        جاري كتابة الكود عبر Gemini...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-600 fill-current" />
                        توليد استعلام SQL آلياً
                      </>
                    )}
                  </button>
                </div>

                {/* AI Response output area */}
                {aiResponse && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
                    {aiResponse.sql && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-amber-400 block">كود SQL المقترح:</span>
                        <pre className="bg-slate-950 p-3 rounded-xl font-mono text-[10px] text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                          {aiResponse.sql}
                        </pre>
                        <button
                          onClick={() => {
                            if (aiResponse.sql) {
                              setConsoleQuery(aiResponse.sql);
                              handleRunQuery(aiResponse.sql);
                            }
                          }}
                          className="text-[10px] bg-amber-500 text-slate-950 font-extrabold px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-all flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          تشغيل في المختبر فورا
                        </button>
                      </div>
                    )}
                    
                    {aiResponse.explanation && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 block">شرح وتوضيح المستشار:</span>
                        <p className="text-xs text-slate-300 leading-relaxed text-right">{aiResponse.explanation}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Help tip card */}
                <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                  <span className="font-bold text-slate-300 block">أمثلة مقترحة للاستشارة:</span>
                  <ul className="list-disc list-inside space-y-1 pr-2">
                    <li className="cursor-pointer hover:text-amber-400 text-right text-[10px]" onClick={() => setAiPrompt("أريد العملاء الذين يملكون أكثر من 200 نقطة ولاء")}>أريد العملاء الذين يملكون أكثر من 200 نقطة ولاء</li>
                    <li className="cursor-pointer hover:text-amber-400 text-right text-[10px]" onClick={() => setAiPrompt("كيف يمكنني عرض المنتجات التي لا تملك صوراً")}>كيف يمكنني عرض المنتجات التي لا تملك صوراً</li>
                  </ul>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 3: Copy Full MySQL DDL & DML Scripts */}
        {activeTab === "sql-code" && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="text-right space-y-1">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-amber-500" />
                    كود إنشاء وتأسيس قاعدة البيانات كاملاً (DDL & DML)
                  </h2>
                  <p className="text-xs text-slate-400">ملف SQL جاهز ومثالي ومبني على محرك InnoDB وحزمة utf8mb4_unicode_ci، يمكنك تشغيله مباشرة في phpMyAdmin أو MySQL Workbench.</p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      تم نسخ الكود!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      نسخ الكود بالكامل
                    </>
                  )}
                </button>
              </div>

              {/* Code display terminal */}
              <div className="relative">
                <pre className="bg-slate-950 text-slate-300 font-mono text-xs md:text-sm p-6 rounded-2xl overflow-x-auto max-h-[500px] leading-relaxed border border-slate-800 text-left">
                  {FULL_MYSQL_SCRIPT}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Comprehensive Technical Documentation System */}
        {activeTab === "docs" && (
          <div className="space-y-8 bg-slate-950/40 border border-slate-800 p-8 rounded-3xl">
            
            <div className="border-b border-slate-800 pb-4 text-right">
              <h2 className="text-2xl font-black text-white">وثيقة التصميم الفني والمعماري لقاعدة البيانات</h2>
              <p className="text-sm text-slate-400 mt-1">
                التقرير الفني الشامل والمعد خصيصاً لـ: <strong className="text-amber-400">كامل أبو سمرة – kamel3lom</strong>
              </p>
            </div>

            {/* Accordion / Tab panels of sections */}
            <div className="space-y-6">
              
              {/* Section 1 */}
              <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-3">
                <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <span className="h-6 w-6 bg-amber-500/10 rounded-lg flex items-center justify-center text-xs text-amber-400">1</span>
                  تحليل الكيانات والوظائف (Entity Analysis)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed text-right">
                  قاعدة البيانات المقترحة تتكون من 18 جدولاً أساسياً لإدارة المتجر بشكل احترافي، موزعة كالتالي:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-bold text-white mb-1">إدارة المستخدمين والعناوين:</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      تشمل جداول <code className="text-amber-400 font-mono">roles</code> (الصلاحيات)، <code className="text-amber-400 font-mono">users</code> (بيانات الدخول والتشفير)، <code className="text-amber-400 font-mono">customers</code> (الاسم وجوائز الولاء)، و<code className="text-amber-400 font-mono">addresses</code> لعناوين الشحن المتعددة.
                    </p>
                  </div>
                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-bold text-white mb-1">الكتالوج والمخزون:</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      تشمل <code className="text-amber-400 font-mono">categories</code> (الفئات الهرمية)، <code className="text-amber-400 font-mono">products</code> (تفاصيل الملابس)، <code className="text-amber-400 font-mono">product_images</code> (معرض الصور)، و<code className="text-amber-400 font-mono">inventory</code> (الكميات والإنذارات والمواقع المادية).
                    </p>
                  </div>
                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-bold text-white mb-1">دورة الطلب والفوترة:</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      تشمل <code className="text-amber-400 font-mono">orders</code> لطلب المبيعات، <code className="text-amber-400 font-mono">order_items</code> للمنتجات والأسعار التاريخية، <code className="text-amber-400 font-mono">payments</code> لتتبع عمليات الدفع وبوابات السداد، و<code className="text-amber-400 font-mono">shipping</code> للشحن.
                    </p>
                  </div>
                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-bold text-white mb-1">سجل التتبع والعمليات الحساسة:</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      تشمل <code className="text-amber-400 font-mono">activity_logs</code> لمراقبة عمليات المشرفين، و <code className="text-amber-400 font-mono">order_status_history</code> لمسار انتقال الطلب وحالته.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-3">
                <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <span className="h-6 w-6 bg-amber-500/10 rounded-lg flex items-center justify-center text-xs text-amber-400">2</span>
                  العلاقات بين الجداول وتكامل القيود (Table Relationships)
                </h3>
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed text-right">
                  <div className="flex gap-2 items-start">
                    <span className="text-amber-500 font-bold shrink-0">●</span>
                    <p><strong>علاقة العميل بالطلبات (One to Many):</strong> يرتبط كل عميل بجدول <code className="text-slate-300 font-mono">orders</code> كـ <code className="text-amber-300 font-mono">customer_id</code>. يمكن للعميل الواحد إجراء عدد غير محدود من الطلبات.</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="text-amber-500 font-bold shrink-0">●</span>
                    <p><strong>علاقة الطلب بـ تفاصيل الطلب (One to Many):</strong> يرتبط الطلب الواحد بسلسلة عناصر في <code className="text-slate-300 font-mono">order_items</code>. يحتوي السجل على السعر وقت البيع لحفظه تاريخياً عند تغير سعر المنتج الأصلي.</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="text-amber-500 font-bold shrink-0">●</span>
                    <p><strong>علاقة المنتج بالتصنيف (One to Many):</strong> كل منتج ينتمي إلى تصنيف واحد رئيسي <code className="text-slate-300 font-mono">category_id</code> بجدول <code className="text-slate-300 font-mono">categories</code>، والتصنيف يمكن أن يحوي منتجات متعددة.</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="text-amber-500 font-bold shrink-0">●</span>
                    <p><strong>علاقة المنتج بالمخزون (One to One):</strong> كل منتج يرتبط بصف مخزن فريد بجدول <code className="text-slate-300 font-mono">inventory</code> لتحديث كميته وموقعه المادي بشكل فوري ودقيق.</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="text-amber-500 font-bold shrink-0">●</span>
                    <p><strong>علاقة الطلب بالدفع والشحن (One to One):</strong> كل طلب يصدر له معاملة دفع واحدة في جدول <code className="text-slate-300 font-mono">payments</code> وسجل شحن واحد في جدول <code className="text-slate-300 font-mono">shipping</code> لضمان ترابط البيانات والتحصيل.</p>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-3">
                <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <span className="h-6 w-6 bg-amber-500/10 rounded-lg flex items-center justify-center text-xs text-amber-400">3</span>
                  الفهارس وتحسين الاستعلامات (Performance & Indexing)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed text-right">
                  لضمان سرعة فائقة في معالجة آلاف الزوار والطلبات وتجنب بطء قواعد البيانات، قمنا بتصميم الفهارس (Indexes) التالية:
                </p>
                <div className="space-y-2 pt-2">
                  <div className="bg-slate-900/60 p-3 rounded-xl text-xs flex justify-between items-center">
                    <span className="text-slate-400">تحسين جلب وإثبات هوية تسجيل دخول المستخدمين</span>
                    <code className="text-emerald-400 font-mono bg-slate-950 px-2 py-1 rounded">idx_users_email (email)</code>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl text-xs flex justify-between items-center">
                    <span className="text-slate-400">تسريع جلب مواصفات الملابس في المتجر وكود التتبع</span>
                    <code className="text-emerald-400 font-mono bg-slate-950 px-2 py-1 rounded">idx_products_sku (sku) & idx_products_slug</code>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl text-xs flex justify-between items-center">
                    <span className="text-slate-400">جلب فوري لطلبات عميل معين وعرض تاريخ مشترياته</span>
                    <code className="text-emerald-400 font-mono bg-slate-950 px-2 py-1 rounded">idx_orders_customer_id (customer_id)</code>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl text-xs flex justify-between items-center">
                    <span className="text-slate-400">تسهيل وتصفية تقارير حالات الطلبات (معلق، قيد المعالجة)</span>
                    <code className="text-emerald-400 font-mono bg-slate-950 px-2 py-1 rounded">idx_orders_order_status (order_status)</code>
                  </div>
                </div>
              </div>

              {/* Section 4 */}
              <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-3">
                <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <span className="h-6 w-6 bg-amber-500/10 rounded-lg flex items-center justify-center text-xs text-amber-400">4</span>
                  تأمين وحماية قاعدة البيانات وسلامتها (Security Rules)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1.5">
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      تكامل المفاتيح والتحديث
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      استخدام قيود <code className="text-slate-200">ON UPDATE CASCADE</code> و <code className="text-slate-200">ON DELETE CASCADE/SET NULL</code> يمنع وجود "سجلات يتيمة" تالفة بالمتجر.
                    </p>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1.5">
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <Settings className="w-4 h-4 text-emerald-500" />
                      منع الحذف المدمر
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      تطبيق الحذف الناعم (Soft Delete) عبر حقل <code className="text-slate-200">deleted_at</code> يتيح إخفاء المنتجات مع الحفاظ على الفواتير والإحصائيات سليمة وتاريخية.
                    </p>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1.5">
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-500" />
                      التحكم بالصلاحيات والتسجيل
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      تأمين كلمات المرور (تشفير بجافا سكربت قبل الإرسال) وتسجيل كافة العمليات الإدارية الحساسة بجدول <code className="text-slate-200">activity_logs</code> للتدقيق الأمني.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 5 */}
              <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-3">
                <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <span className="h-6 w-6 bg-amber-500/10 rounded-lg flex items-center justify-center text-xs text-amber-400">5</span>
                  رؤية التوسع المستقبلي (Future Scalability)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed text-right">
                  قاعدة البيانات هذه مهيأة ومصممة لتقبل تطوير وتدشين ميزات متقدمة لاحقاً دون الحاجة لإعادة هيكلة الجداول الأساسية:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="space-y-1">
                    <strong className="text-white text-xs block">تعدد البائعين (Multi-Vendor):</strong>
                    <p className="text-[11px] text-slate-400 leading-relaxed">عبر ربط جدول المنتجات بجدول <code className="text-slate-300">vendors</code> يخص البائعين، لتقسيم الأرباح والمبيعات آلياً.</p>
                  </div>
                  <div className="space-y-1">
                    <strong className="text-white text-xs block">تعدد العملات واللغات:</strong>
                    <p className="text-[11px] text-slate-400 leading-relaxed">تجهيز جداول ترجمة ومعدلات تحويل أسعار صرف تربط الفواتير بعملات بديلة مثل الريال والدرهم.</p>
                  </div>
                  <div className="space-y-1">
                    <strong className="text-white text-xs block">تعدد المستودعات (Warehouses):</strong>
                    <p className="text-[11px] text-slate-400 leading-relaxed">تحويل علاقة المخزون بجدول وسيط يربط المنتجات بمستودعات مادية متعددة وموزعة جغرافياً لتسهيل سلاسل الإمداد.</p>
                  </div>
                  <div className="space-y-1">
                    <strong className="text-white text-xs block">بوابات دفع خارجية وشركات الشحن:</strong>
                    <p className="text-[11px] text-slate-400 leading-relaxed">تصميم حقول السداد وحالات التوصيل بمرونة فائقة لتسهيل التكامل المباشر مع واجهات برمجة التطبيقات (APIs) لشركات الشحن.</p>
                  </div>
                </div>
              </div>

              {/* Section 6: Executive Summary */}
              <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-3">
                <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <span className="h-6 w-6 bg-amber-500/10 rounded-lg flex items-center justify-center text-xs text-amber-400">6</span>
                  التلخيص التنفيذي والختام (Executive Summary)
                </h3>
                <div className="bg-slate-900/40 p-4 rounded-xl text-xs text-slate-300 leading-relaxed space-y-2 text-right">
                  <p>تعتبر هذه المنصة وتصميم قاعدة البيانات MySQL الخاص بها عملاً فنياً وتقنياً متكاملاً، يعتمد على أعلى معايير التطبيع (Database Normalization) لضمان اتساق البيانات وعدم تكرارها.</p>
                  <p className="font-bold text-white">النقاط التنفيذية الهامة في التقرير:</p>
                  <ul className="list-disc list-inside space-y-1.5 pr-3 text-slate-400 text-[11px]">
                    <li>عدد جداول قاعدة البيانات الكلية: <strong className="text-white">18 جدولاً</strong>.</li>
                    <li>المحرك المادي: <strong className="text-white">InnoDB</strong> لضمان المعاملات المالية الآمنة والـ ACID Properties.</li>
                    <li>التوافقية اللغوية: <strong className="text-white">utf8mb4_unicode_ci</strong> لتمكين إدخال اللغتين العربية والإنجليزية بشكل مثالي.</li>
                    <li>التحسينات المضافة: تم تأسيس فهارس (Indexes) على الحقول الأكثر بحثاً وتسجيل كافة التحركات الحساسة أمنياً.</li>
                  </ul>
                  <p className="text-amber-400 font-bold text-xs pt-2">✓ تم تسليم التقرير وبناء المحاكي والكتالوج بنجاح كامل لـ كامل أبو سمرة – kamel3lom.</p>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
