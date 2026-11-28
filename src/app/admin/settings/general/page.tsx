"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from "@/lib/utils";
import {
  Loader2,
  Store,
  Search,
  Link2,
  ShieldCheck,
  KeyRound,
  Upload,
  Globe,
  ExternalLink,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  FileCode,
  Image as ImageIcon,
  Cloud,
  Sparkles,
  Bot,
  Zap,
  CheckCircle2,
  Cpu,
  RefreshCw
} from "lucide-react";
import { doc, getDoc, setDoc } from '@/lib/db';
import { uploadFile, getFileUrl } from '@/lib/r2';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';

const generalSettingsSchema = z.object({
  // Store Identity
  storeName: z.string().min(1, 'Store Name is required'),
  companyName: z.string().min(1, 'Legal Company Name is required'),
  storeTagline: z.string().optional().default(''),
  storeDescription: z.string().optional().default(''),
  logo: z.string().optional().default(''),
  favicon: z.string().optional().default(''),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('A valid email is required'),
  contactNotificationEmail: z.string().email('Must be a valid email').or(z.literal('')).optional().default(''),

  // SEO & Browser Titles
  browserTitle: z.string().min(1, 'Browser Title is required'),
  titleSeparator: z.string().default('|'),
  seoDescription: z.string().optional().default(''),
  seoKeywords: z.string().optional().default(''),
  canonicalUrl: z.string().url('Must be a valid URL (e.g. https://yourdomain.com)').or(z.literal('')).optional().default(''),
  robotsIndex: z.boolean().default(true),
  ogImage: z.string().optional().default(''),
  sitemapEnabled: z.boolean().default(true),
  sitemapUrl: z.string().default('/sitemap.xml'),

  // Permalinks
  permalinkProductStructure: z.string().default('/products/[slug]'),
  permalinkCategoryStructure: z.string().default('/category/[slug]'),
  trailingSlash: z.boolean().default(false),

  // Security & Captcha
  captchaEnabled: z.boolean().default(false),
  captchaProvider: z.enum(['turnstile', 'recaptcha-v2', 'recaptcha-v3']).default('turnstile'),
  captchaSiteKey: z.string().optional().default(''),
  captchaSecretKey: z.string().optional().default(''),
  captchaOnLogin: z.boolean().default(true),
  captchaOnRegister: z.boolean().default(true),
  captchaOnCheckout: z.boolean().default(false),

  // Social Login Configuration
  googleLoginEnabled: z.boolean().default(true),
  googleClientId: z.string().optional().default(''),
  googleClientSecret: z.string().optional().default(''),
  facebookLoginEnabled: z.boolean().default(false),
  facebookAppId: z.string().optional().default(''),
  facebookAppSecret: z.string().optional().default(''),

  // Custom AI Provider Configuration
  aiEnabled: z.boolean().default(true),
  aiProviderName: z.string().min(1, 'Provider name is required').default('OpenAI'),
  aiBaseUrl: z.string().min(1, 'Base URL is required').default('https://api.openai.com/v1'),
  aiApiKey: z.string().optional().default(''),
  aiDefaultModel: z.string().min(1, 'Default model name is required').default('gpt-4o-mini'),
});

type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;

const defaultSettings: GeneralSettingsFormData = {
  storeName: 'eMotionView',
  companyName: 'eMotionView Ltd.',
  storeTagline: 'Biggest Smart Gadget & SmartPhone Collection',
  storeDescription: 'Your premier destination for authentic smartwatches, audio gear, phones, and modern smart lifestyle gadgets in Bangladesh.',
  logo: '/api/r2/proxy?key=general%2F1780921429643-motion-logo.webp',
  favicon: '/api/r2/proxy?key=general%2Ffavicon-1795715649669.ico',
  address: '10/25 Eastern Plaza, Hatirpool, Dhaka-1205',
  phone: '09677460460',
  email: 'motionview22@gmail.com.bd',
  contactNotificationEmail: 'motionview22@gmail.com.bd',

  browserTitle: 'eMotionView | Smart Gadgets & Lifestyle Store',
  titleSeparator: '|',
  seoDescription: 'Discover the latest smartwatches, premium audio, earbuds, chargers, and mobile accessories with official warranty at eMotionView.',
  seoKeywords: 'smartwatch, earbuds, motion view, gadget, smartphone, bangladesh, wireless audio, lifestyle technology',
  canonicalUrl: 'https://emotionview.com.bd',
  robotsIndex: true,
  ogImage: '',
  sitemapEnabled: true,
  sitemapUrl: '/sitemap.xml',

  permalinkProductStructure: '/products/[slug]',
  permalinkCategoryStructure: '/category/[slug]',
  trailingSlash: false,

  captchaEnabled: false,
  captchaProvider: 'turnstile',
  captchaSiteKey: '',
  captchaSecretKey: '',
  captchaOnLogin: true,
  captchaOnRegister: true,
  captchaOnCheckout: false,

  googleLoginEnabled: true,
  googleClientId: '',
  googleClientSecret: '',
  facebookLoginEnabled: false,
  facebookAppId: '',
  facebookAppSecret: '',

  aiEnabled: true,
  aiProviderName: 'OpenAI',
  aiBaseUrl: 'https://api.openai.com/v1',
  aiApiKey: '',
  aiDefaultModel: 'gpt-4o-mini',
};

export default function GeneralSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [isUploadingOg, setIsUploadingOg] = useState(false);
  const [activeTab, setActiveTab] = useState('store');
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{
    success: boolean;
    message: string;
    latency?: number;
    model?: string;
  } | null>(null);
  const [lastTestedAt, setLastTestedAt] = useState<Date | null>(null);

  const form = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: defaultSettings,
  });

  const { reset, handleSubmit, watch, setValue, getValues, formState: { isSubmitting, isDirty } } = form;

  const aiPresets = [
    {
      name: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini',
      badge: 'Cloud'
    },
    {
      name: 'DeepSeek',
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      badge: 'High Value'
    },
    {
      name: 'Groq',
      baseUrl: 'https://api.groq.com/openai/v1',
      model: 'llama-3.3-70b-versatile',
      badge: 'Ultra Fast'
    },
    {
      name: 'OpenRouter',
      baseUrl: 'https://openrouter.ai/api/v1',
      model: 'google/gemini-2.0-flash-001',
      badge: 'Multi-Model'
    },
    {
      name: 'Ollama (Local)',
      baseUrl: 'http://localhost:11434/v1',
      model: 'llama3.2',
      badge: 'Self-Hosted'
    },
  ];

  const handleTestAi = async (silent = false) => {
    const providerName = getValues('aiProviderName') || 'OpenAI';
    const baseUrl = getValues('aiBaseUrl') || 'https://api.openai.com/v1';
    const apiKey = getValues('aiApiKey') || '';
    const defaultModel = getValues('aiDefaultModel') || 'gpt-4o-mini';
    const isAiEnabled = getValues('aiEnabled');

    if (!isAiEnabled) {
      setAiTestResult({ success: false, message: 'Custom AI is disabled in settings.' });
      setLastTestedAt(new Date());
      return;
    }

    setIsTestingAi(true);
    try {
      const res = await fetch('/api/admin/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerName,
          baseUrl,
          apiKey,
          defaultModel,
        }),
      });
      const data = await res.json();
      setAiTestResult(data);
      setLastTestedAt(new Date());

      if (!silent) {
        if (data.success) {
          toast({
            title: 'AI Connection Successful',
            description: `Connected to ${providerName} (${defaultModel}) in ${data.latency}ms.`,
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'AI Connection Failed',
            description: data.message || 'Unable to connect to AI provider.',
          });
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Network error while testing connection';
      setAiTestResult({ success: false, message: msg });
      setLastTestedAt(new Date());
      if (!silent) {
        toast({
          variant: 'destructive',
          title: 'Connection Error',
          description: msg,
        });
      }
    } finally {
      setIsTestingAi(false);
    }
  };

  const currentLogo = watch('logo');
  const currentFavicon = watch('favicon');
  const currentOgImage = watch('ogImage');
  const currentStoreName = watch('storeName') || 'eMotionView';
  const currentBrowserTitle = watch('browserTitle') || 'eMotionView | Smart Gadgets & Lifestyle Store';
  const currentSeoDescription = watch('seoDescription') || '';
  const currentCanonicalUrl = watch('canonicalUrl') || 'https://emotionview.com.bd';

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const docRef = doc({} as any, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const merged: GeneralSettingsFormData = {
            ...defaultSettings,
            ...data,
            storeName: data.storeName || data.companyName || defaultSettings.storeName,
            companyName: data.companyName || defaultSettings.companyName,
          };
          reset(merged);
        } else {
          reset(defaultSettings);
        }
      } catch (error) {
        console.error("Failed to fetch general settings:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load general settings.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [reset, toast]);

  // Periodic AI connectivity test every 10 minutes (and on initial mount)
  useEffect(() => {
    if (isLoading) return;

    // Initial check right after settings finish loading
    handleTestAi(true);

    // Re-check connectivity every 10 minutes (600,000 ms)
    const intervalId = setInterval(() => {
      handleTestAi(true);
    }, 10 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isLoading]);

  const handleFileUpload = async (
    file: File,
    type: 'logo' | 'favicon' | 'ogImage',
    setUploading: (v: boolean) => void
  ) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const path = `general/${type}-${Date.now()}.${ext}`;
      const uploadedUrl = await uploadFile(path, file, file.type);
      const finalUrl = uploadedUrl || await getFileUrl(path);
      setValue(type, finalUrl, { shouldDirty: true });
      toast({
        title: 'Uploaded Successfully',
        description: `${type.toUpperCase()} file has been uploaded and updated.`,
      });
    } catch (err: any) {
      console.error(`Upload error for ${type}:`, err);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: err.message || 'Could not upload file to storage.',
      });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit: SubmitHandler<GeneralSettingsFormData> = async (data) => {
    try {
      const docRef = doc({} as any, 'settings', 'general');
      await setDoc(docRef, data, { merge: true });
      reset(data);
      toast({
        title: 'Settings Saved',
        description: 'All store, SEO, permalink, captcha, and social authentication settings have been updated.',
      });
    } catch (error) {
      console.error("Error saving general settings:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save general settings.' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header with White Background */}
        <div className="bg-white dark:bg-card border border-border/80 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">General & SEO Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure store identity, browser titles, SEO criteria, permalinks, captcha, and social authentication.
            </p>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[140px] shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3 bg-transparent p-0 h-auto">
            <TabsTrigger
              value="store"
              className="py-2.5 px-3 sm:px-4 rounded-lg font-medium transition-all duration-200 border-2 border-blue-600 bg-white text-foreground hover:bg-blue-50/80 hover:text-blue-700 dark:bg-card dark:border-blue-500 dark:text-foreground dark:hover:bg-blue-950/40 data-[state=active]:!bg-blue-600 data-[state=active]:!text-white data-[state=active]:!border-blue-600 data-[state=active]:shadow-md cursor-pointer text-xs sm:text-sm"
            >
              <Store className="h-4 w-4 mr-2 shrink-0" /> Store Identity
            </TabsTrigger>
            <TabsTrigger
              value="seo"
              className="py-2.5 px-3 sm:px-4 rounded-lg font-medium transition-all duration-200 border-2 border-blue-600 bg-white text-foreground hover:bg-blue-50/80 hover:text-blue-700 dark:bg-card dark:border-blue-500 dark:text-foreground dark:hover:bg-blue-950/40 data-[state=active]:!bg-blue-600 data-[state=active]:!text-white data-[state=active]:!border-blue-600 data-[state=active]:shadow-md cursor-pointer text-xs sm:text-sm"
            >
              <Search className="h-4 w-4 mr-2 shrink-0" /> SEO & Titles
            </TabsTrigger>
            <TabsTrigger
              value="permalinks"
              className="py-2.5 px-3 sm:px-4 rounded-lg font-medium transition-all duration-200 border-2 border-blue-600 bg-white text-foreground hover:bg-blue-50/80 hover:text-blue-700 dark:bg-card dark:border-blue-500 dark:text-foreground dark:hover:bg-blue-950/40 data-[state=active]:!bg-blue-600 data-[state=active]:!text-white data-[state=active]:!border-blue-600 data-[state=active]:shadow-md cursor-pointer text-xs sm:text-sm"
            >
              <Link2 className="h-4 w-4 mr-2 shrink-0" /> Permalinks
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="py-2.5 px-3 sm:px-4 rounded-lg font-medium transition-all duration-200 border-2 border-blue-600 bg-white text-foreground hover:bg-blue-50/80 hover:text-blue-700 dark:bg-card dark:border-blue-500 dark:text-foreground dark:hover:bg-blue-950/40 data-[state=active]:!bg-blue-600 data-[state=active]:!text-white data-[state=active]:!border-blue-600 data-[state=active]:shadow-md cursor-pointer text-xs sm:text-sm"
            >
              <ShieldCheck className="h-4 w-4 mr-2 shrink-0" /> Captcha
            </TabsTrigger>
            <TabsTrigger
              value="social"
              className="py-2.5 px-3 sm:px-4 rounded-lg font-medium transition-all duration-200 border-2 border-blue-600 bg-white text-foreground hover:bg-blue-50/80 hover:text-blue-700 dark:bg-card dark:border-blue-500 dark:text-foreground dark:hover:bg-blue-950/40 data-[state=active]:!bg-blue-600 data-[state=active]:!text-white data-[state=active]:!border-blue-600 data-[state=active]:shadow-md cursor-pointer text-xs sm:text-sm"
            >
              <KeyRound className="h-4 w-4 mr-2 shrink-0" /> Social Login
            </TabsTrigger>
            {/* Custom AI Tab: Green if Connected, Red otherwise */}
            <TabsTrigger
              value="ai"
              className={cn(
                "py-2.5 px-3 sm:px-4 rounded-lg font-medium transition-all duration-200 border-2 cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-1.5",
                aiTestResult?.success
                  ? "border-emerald-600 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-900/50 data-[state=active]:!bg-emerald-600 data-[state=active]:!text-white data-[state=active]:!border-emerald-600 shadow-xs"
                  : "border-red-600 bg-red-50/70 text-red-800 hover:bg-red-100 hover:text-red-900 dark:bg-red-950/40 dark:border-red-500 dark:text-red-300 dark:hover:bg-red-900/50 data-[state=active]:!bg-red-600 data-[state=active]:!text-white data-[state=active]:!border-red-600 shadow-xs"
              )}
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>Custom AI</span>
              <span
                className={cn(
                  "h-2 w-2 rounded-full shrink-0 ml-0.5",
                  aiTestResult?.success
                    ? "bg-emerald-500 ring-2 ring-emerald-300 dark:ring-emerald-700 animate-pulse"
                    : "bg-red-500 ring-2 ring-red-300 dark:ring-red-700"
                )}
                title={aiTestResult?.success ? "Connected (Auto-tested every 10 min)" : "Disconnected / Offline"}
              />
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Store Identity & Branding */}
          <TabsContent value="store" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" /> Store Information & Branding
                </CardTitle>
                <CardDescription>
                  Manage store name, logo, favicon, tagline, and customer contact details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="storeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Name</FormLabel>
                        <FormControl>
                          <Input placeholder="eMotionView" {...field} />
                        </FormControl>
                        <FormDescription>Displayed across headers, order invoices, and notifications.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company / Legal Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="eMotionView Ltd." {...field} />
                        </FormControl>
                        <FormDescription>Used for legal terms, warranty documents, and footer copyright.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="storeTagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Tagline / Slogan</FormLabel>
                      <FormControl>
                        <Input placeholder="The Biggest Smart Gadget & Smartphone Collection" {...field} />
                      </FormControl>
                      <FormDescription>Displayed in topbar notification strips and subheaders.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="storeDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Description</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Your premier destination for authentic smartwatches, audio gear, and lifestyle gadgets..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Default description for social sharing and search engines.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {/* Logos and Favicon */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Header Logo */}
                  <div className="space-y-4 p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Header Logo</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">Recommended format: Transparent PNG or WebP (max 350x90px)</p>
                      </div>
                      <Badge variant="secondary">Header</Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-md bg-secondary/30">
                      <div className="relative h-16 w-44 rounded-md border bg-background flex items-center justify-center overflow-hidden p-2">
                        {currentLogo ? (
                          <Image
                            src={currentLogo}
                            alt="Store Logo"
                            width={160}
                            height={50}
                            className="max-h-full max-w-full object-contain"
                            unoptimized
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">No Logo</span>
                        )}
                      </div>
                      <div className="flex-1 w-full space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer">
                            <Button type="button" variant="outline" size="sm" disabled={isUploadingLogo} asChild>
                              <span>
                                {isUploadingLogo ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                                Upload New Logo
                              </span>
                            </Button>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, 'logo', setIsUploadingLogo);
                              }}
                            />
                          </label>
                        </div>
                        <Input
                          placeholder="Or paste direct image URL"
                          value={currentLogo || ''}
                          onChange={(e) => setValue('logo', e.target.value, { shouldDirty: true })}
                          className="text-xs h-8"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Browser Favicon */}
                  <div className="space-y-4 p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Browser Favicon</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">Recommended format: 32x32 or 64x64 PNG or ICO</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {currentFavicon && (currentFavicon.includes('/api/r2/') || currentFavicon.includes('r2.')) && (
                          <Badge variant="outline" className="border-blue-600/40 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 text-[10px] flex items-center">
                            <Cloud className="h-3 w-3 mr-1" /> R2 Storage
                          </Badge>
                        )}
                        <Badge variant="secondary">Browser Tab</Badge>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-md bg-secondary/30">
                      {/* Browser tab mockup preview */}
                      <div className="w-48 rounded-t-lg border bg-background px-3 py-2 shadow-xs flex items-center gap-2">
                        <div className="relative h-4 w-4 shrink-0 flex items-center justify-center">
                          {currentFavicon ? (
                            <Image
                              src={currentFavicon}
                              alt="Favicon"
                              width={16}
                              height={16}
                              className="h-4 w-4 object-contain"
                              unoptimized
                            />
                          ) : (
                            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </div>
                        <span className="text-[11px] truncate font-medium text-foreground">
                          {currentStoreName}
                        </span>
                      </div>

                      <div className="flex-1 w-full space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer">
                            <Button type="button" variant="outline" size="sm" disabled={isUploadingFavicon} asChild className="border-blue-600/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40">
                              <span>
                                {isUploadingFavicon ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                                Upload Favicon to R2
                              </span>
                            </Button>
                            <input
                              type="file"
                              accept="image/x-icon,image/png,image/svg+xml,image/vnd.microsoft.icon"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, 'favicon', setIsUploadingFavicon);
                              }}
                            />
                          </label>
                        </div>
                        <Input
                          placeholder="Favicon URL stored on Cloudflare R2 (/api/r2/proxy?key=...)"
                          value={currentFavicon || ''}
                          onChange={(e) => setValue('favicon', e.target.value, { shouldDirty: true })}
                          className="text-xs h-8"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold">Store Contact & Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Support Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="support@emotionview.com.bd" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hotline / Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="09677460460" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactNotificationEmail"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Designated Contact Form Notification Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="admin@emotionview.com.bd (Leave empty to use Customer Support Email)" {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Inquiries submitted via the customer-facing /contact page are automatically forwarded to this address.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Official Physical Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="10/25 Eastern Plaza, Hatirpool, Dhaka-1205" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: SEO & Browser Titles */}
          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" /> Search Engine Optimization & Browser Titles
                </CardTitle>
                <CardDescription>
                  Configure browser titles, meta descriptions, search engine indexing, and social share previews.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Live Google Preview Card */}
                <div className="p-4 rounded-lg border bg-secondary/30 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" /> Google Search Preview
                    </span>
                    <span>Live Simulation</span>
                  </div>
                  <div className="space-y-1 bg-background p-3.5 rounded-md border shadow-xs">
                    <div className="text-xs text-emerald-700 dark:text-emerald-400 truncate">
                      {currentCanonicalUrl}
                    </div>
                    <div className="text-lg text-blue-700 dark:text-blue-400 hover:underline font-medium cursor-pointer truncate">
                      {currentBrowserTitle}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {currentSeoDescription || 'Discover the latest smartwatches, premium audio, earbuds, chargers, and mobile accessories with official warranty at eMotionView.'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="browserTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Browser Title (SEO Title)</FormLabel>
                          <FormControl>
                            <Input placeholder="eMotionView | Smart Gadgets & Lifestyle Store" {...field} />
                          </FormControl>
                          <FormDescription>Primary browser title displayed in browser tabs and search engines.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="titleSeparator"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title Separator</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select separator" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="|">| (Pipe)</SelectItem>
                            <SelectItem value="-">- (Hyphen)</SelectItem>
                            <SelectItem value="—">— (Em Dash)</SelectItem>
                            <SelectItem value="•">• (Bullet)</SelectItem>
                            <SelectItem value="~">~ (Tilde)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Separates page name and store name.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="seoDescription"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel>SEO Meta Description</FormLabel>
                        <span className="text-xs text-muted-foreground">
                          {field.value?.length || 0} / 160 characters (recommended: 150-160)
                        </span>
                      </div>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Discover the latest smartwatches, premium audio, earbuds, chargers, and mobile accessories..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Appears underneath your website title in search engine result pages.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seoKeywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SEO Meta Keywords</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="smartwatch, earbuds, wireless audio, smartphone accessories, bangladesh"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Comma-separated target search keywords for indexing.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="canonicalUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Canonical Site URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://emotionview.com.bd" {...field} />
                        </FormControl>
                        <FormDescription>Used for canonical links, sitemaps, and social share cards.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Social Share OG Image */}
                  <div className="space-y-2">
                    <FormLabel>Social Share Image (OpenGraph / Twitter)</FormLabel>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Image URL or upload below (1200x630)"
                        value={currentOgImage || ''}
                        onChange={(e) => setValue('ogImage', e.target.value, { shouldDirty: true })}
                      />
                      <label className="cursor-pointer shrink-0">
                        <Button type="button" variant="outline" size="icon" disabled={isUploadingOg} asChild>
                          <span>
                            {isUploadingOg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          </span>
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'ogImage', setIsUploadingOg);
                          }}
                        />
                      </label>
                    </div>
                    <FormDescription>Image preview shown when link is shared on Facebook, WhatsApp, or Twitter.</FormDescription>
                  </div>
                </div>

                <Separator />

                {/* Sitemaps and Crawling */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" /> Crawling & XML Sitemaps
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="robotsIndex"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-4 border rounded-lg bg-card">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Search Engine Visibility</FormLabel>
                            <FormDescription>
                              Allow Google, Bing, and other bots to index this store.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sitemapEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-4 border rounded-lg bg-card">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <FormLabel className="text-base">XML Sitemap</FormLabel>
                              <Link
                                href="/sitemap.xml"
                                target="_blank"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                View <ExternalLink className="h-3 w-3" />
                              </Link>
                            </div>
                            <FormDescription>
                              Automatically generate `/sitemap.xml` for all products & categories.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Permalinks */}
          <TabsContent value="permalinks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-primary" /> Permalink & URL Routing Settings
                </CardTitle>
                <CardDescription>
                  Define URL structures for products, categories, and custom rewrite rules.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="permalinkProductStructure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product URL Structure</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product URL pattern" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="/products/[slug]">
                            /products/[slug] (Recommended - e.g. /products/haylou-solar-plus-rt3-smartwatch)
                          </SelectItem>
                          <SelectItem value="/products/[id]">
                            /products/[id] (ID Based - e.g. /products/64f8a123)
                          </SelectItem>
                          <SelectItem value="/p/[slug]">
                            /p/[slug] (Short URL - e.g. /p/haylou-solar-plus-rt3)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Customizes product landing page URLs for search engine friendliness and user readability.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="permalinkCategoryStructure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category URL Structure</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category URL pattern" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="/category/[slug]">
                            /category/[slug] (Standard - e.g. /category/wearables)
                          </SelectItem>
                          <SelectItem value="/c/[slug]">
                            /c/[slug] (Short - e.g. /c/wearables)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Customizes how catalog category pages are formatted.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trailingSlash"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg bg-card">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Trailing Slash Strict Enforcement</FormLabel>
                        <FormDescription>
                          Appends a trailing slash to URLs (e.g. `/products/smartwatch/` instead of `/products/smartwatch`).
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: Security & Captcha */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" /> Anti-Spam & Captcha Protection
                </CardTitle>
                <CardDescription>
                  Configure Cloudflare Turnstile or Google reCAPTCHA to prevent spam and credential stuffing attacks.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="captchaEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg bg-card">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-semibold">Enable Captcha Protection</FormLabel>
                        <FormDescription>
                          Enable verification challenges on authentication, registration, and checkout.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {watch('captchaEnabled') && (
                  <div className="space-y-6 pt-2">
                    <FormField
                      control={form.control}
                      name="captchaProvider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Captcha Provider</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Provider" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="turnstile">
                                Cloudflare Turnstile (Recommended - Fast & Invisible)
                              </SelectItem>
                              <SelectItem value="recaptcha-v3">
                                Google reCAPTCHA v3 (Invisible Score-based)
                              </SelectItem>
                              <SelectItem value="recaptcha-v2">
                                Google reCAPTCHA v2 ("I'm not a robot" Checkbox)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="captchaSiteKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Public Site Key</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 0x4AAAAAA..." {...field} />
                            </FormControl>
                            <FormDescription>Client-side public key embedded in browser.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="captchaSecretKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secret Server Key</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="e.g. 0x4AAAAAA..." {...field} />
                            </FormControl>
                            <FormDescription>Kept strictly confidential for backend verification.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-3 pt-2">
                      <Label className="text-sm font-semibold">Protected Action Areas</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="captchaOnLogin"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-3 border rounded-md">
                              <FormLabel className="text-sm font-normal">Customer Login</FormLabel>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="captchaOnRegister"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-3 border rounded-md">
                              <FormLabel className="text-sm font-normal">Sign Up / Registration</FormLabel>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="captchaOnCheckout"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-3 border rounded-md">
                              <FormLabel className="text-sm font-normal">Order Checkout</FormLabel>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: Social Logins */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-primary" /> Social OAuth Login Configurations
                </CardTitle>
                <CardDescription>
                  Manage Google and Facebook 1-click customer login credentials and provider settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Google Configuration */}
                <div className="space-y-4 p-5 rounded-lg border bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full border bg-background flex items-center justify-center shadow-xs">
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-base">Google Authentication</h4>
                        <p className="text-xs text-muted-foreground">Sign in with Google via Firebase Auth OAuth provider.</p>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="googleLoginEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {watch('googleLoginEnabled') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <FormField
                        control={form.control}
                        name="googleClientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Google Web Client ID</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 123456789-abc.apps.googleusercontent.com" {...field} />
                            </FormControl>
                            <FormDescription>Configured in Google Cloud Console / Firebase Auth Providers.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="googleClientSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Google Client Secret (Optional)</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••••••••••" {...field} />
                            </FormControl>
                            <FormDescription>Encrypted server token for custom OAuth server flows.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Facebook Configuration */}
                <div className="space-y-4 p-5 rounded-lg border bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full border bg-background flex items-center justify-center shadow-xs">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-base">Facebook Login</h4>
                        <p className="text-xs text-muted-foreground">Log in with Facebook for customer convenience.</p>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="facebookLoginEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {watch('facebookLoginEnabled') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <FormField
                        control={form.control}
                        name="facebookAppId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook App ID</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 123456789012345" {...field} />
                            </FormControl>
                            <FormDescription>Available from your Meta for Developers App Dashboard.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="facebookAppSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook App Secret</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••••••••••" {...field} />
                            </FormControl>
                            <FormDescription>App secret used to exchange Facebook access tokens.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 6: Custom AI Provider */}
          <TabsContent value="ai" className="space-y-6">
            <Card className="border shadow-xs">
              <CardHeader className="bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-transparent dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-transparent border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Custom AI Provider Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure an OpenAI-compatible LLM provider to power application-wide AI features, such as instant product data extraction from external URLs.
                    </CardDescription>
                  </div>
                  <FormField
                    control={form.control}
                    name="aiEnabled"
                    render={({ field }) => (
                      <div className="flex items-center gap-3 bg-background px-3 py-1.5 rounded-lg border shadow-2xs shrink-0">
                        <Label htmlFor="ai-enabled-toggle" className="text-sm font-medium cursor-pointer">
                          {field.value ? 'AI Active' : 'AI Disabled'}
                        </Label>
                        <FormControl>
                          <Switch
                            id="ai-enabled-toggle"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                    )}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* AI Provider Tabs (e.g. OpenAI, DeepSeek, Groq, OpenRouter, Ollama) */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5" /> AI Provider Tabs
                    </Label>
                    <div className="flex items-center gap-2 text-xs">
                      {aiTestResult?.success ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          {watch('aiProviderName') || 'OpenAI'} Tab: Connected (Green)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold">
                          <span className="h-2 w-2 rounded-full bg-red-500" />
                          {watch('aiProviderName') || 'OpenAI'} Tab: Disconnected (Red)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Provider Tabs Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                    {aiPresets.map((preset) => {
                      const isSelected = (watch('aiProviderName') || 'OpenAI').toLowerCase() === preset.name.toLowerCase();
                      const isConnected = isSelected && aiTestResult?.success === true;
                      const isDisconnected = isSelected && (!aiTestResult || !aiTestResult.success);

                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setValue('aiProviderName', preset.name, { shouldDirty: true });
                            setValue('aiBaseUrl', preset.baseUrl, { shouldDirty: true });
                            setValue('aiDefaultModel', preset.model, { shouldDirty: true });
                            toast({
                              title: `${preset.name} Tab Selected`,
                              description: `Base URL and default model updated for ${preset.name}.`,
                            });
                            // Re-run connectivity test for newly selected provider tab
                            setTimeout(() => handleTestAi(true), 50);
                          }}
                          className={cn(
                            "p-3 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 shadow-2xs",
                            isSelected
                              ? isConnected
                                ? "border-emerald-600 bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300 dark:ring-emerald-700"
                                : "border-red-600 bg-red-600 text-white shadow-md ring-2 ring-red-300 dark:ring-red-700"
                              : "border-border bg-card hover:border-primary/50 hover:bg-muted/30 text-foreground"
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                              <Zap className="h-3.5 w-3.5 shrink-0" />
                              {preset.name}
                            </span>
                            {isSelected ? (
                              isConnected ? (
                                <CheckCircle2 className="h-4 w-4 text-white shrink-0" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-white shrink-0" />
                              )
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                                {preset.badge}
                              </span>
                            )}
                          </div>
                          <div className={cn("text-[11px] truncate font-mono", isSelected ? "text-white/90" : "text-muted-foreground")}>
                            {preset.model}
                          </div>
                          <div className={cn(
                            "flex items-center justify-between pt-1 border-t text-[10px]",
                            isSelected ? "border-white/20 text-white/90" : "border-border text-muted-foreground"
                          )}>
                            <span>{preset.badge}</span>
                            {isSelected && (
                              <span className="font-bold uppercase tracking-wider">
                                {isConnected ? "Connected" : "Offline"}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select a Provider Tab (e.g. OpenAI). The active provider tab displays <strong>green</strong> when successfully connected and <strong>red</strong> if disconnected or failing.
                  </p>
                </div>

                <Separator />

                {/* Main Settings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Provider Name */}
                  <FormField
                    control={form.control}
                    name="aiProviderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Bot className="h-4 w-4 text-primary" />
                          Provider Name
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. OpenAI, DeepSeek, Groq, Ollama" {...field} />
                        </FormControl>
                        <FormDescription>
                          A friendly label for this AI provider.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Default Model */}
                  <FormField
                    control={form.control}
                    name="aiDefaultModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Cpu className="h-4 w-4 text-primary" />
                          Default Model
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. gpt-4o-mini, deepseek-chat, llama-3.3-70b-versatile" {...field} />
                        </FormControl>
                        <FormDescription>
                          Model name used for product data extraction and content generation.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Base URL */}
                  <FormField
                    control={form.control}
                    name="aiBaseUrl"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center gap-1.5">
                          <Globe className="h-4 w-4 text-primary" />
                          Base URL
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://api.openai.com/v1" {...field} />
                        </FormControl>
                        <FormDescription>
                          OpenAI-compatible base API endpoint. Must accept <code>/chat/completions</code> requests.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* API Key */}
                  <FormField
                    control={form.control}
                    name="aiApiKey"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center gap-1.5">
                          <KeyRound className="h-4 w-4 text-primary" />
                          API Key
                        </FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showApiKey ? "text" : "password"}
                              placeholder="sk-••••••••••••••••••••••••••••••••"
                              {...field}
                              className="pr-10"
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                          >
                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span className="sr-only">{showApiKey ? "Hide API key" : "Show API key"}</span>
                          </Button>
                        </div>
                        <FormDescription>
                          Secret API key for authentication. Leave empty if using local Ollama without auth.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Connection Test Section */}
                <div className="bg-muted/40 rounded-xl p-4 border space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Test Provider Connection
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Connectivity is automatically tested every 10 minutes in the background.
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Button
                        type="button"
                        variant={aiTestResult?.success ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTestAi(false)}
                        disabled={isTestingAi}
                        className={cn(
                          "gap-2 shrink-0 transition-all font-semibold cursor-pointer",
                          aiTestResult?.success
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs"
                            : "border-red-500/60 text-red-600 hover:bg-red-50/80 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-950/40"
                        )}
                      >
                        {isTestingAi ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Testing Connection...</span>
                          </>
                        ) : aiTestResult?.success ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-white" />
                            <span>Connected</span>
                            {aiTestResult.latency !== undefined && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-normal">
                                {aiTestResult.latency}ms
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <Zap className="h-3.5 w-3.5" />
                            <span>Test AI Connection</span>
                          </>
                        )}
                      </Button>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <RefreshCw className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span>Auto-tested every 10m</span>
                        {lastTestedAt && (
                          <span>• {lastTestedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {aiTestResult && (
                    <div className={cn(
                      "p-3 rounded-lg text-xs flex items-start gap-2.5 border transition-all",
                      aiTestResult.success
                        ? "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    )}>
                      {aiTestResult.success ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-0.5 flex-1">
                        <div className="font-semibold flex items-center gap-2">
                          <span>{aiTestResult.success ? 'Connection Verified' : 'Connection Failed'}</span>
                          {aiTestResult.latency !== undefined && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 bg-background">
                              {aiTestResult.latency}ms
                            </Badge>
                          )}
                        </div>
                        <p className="opacity-90">{aiTestResult.message}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Feature Showcase Banner */}
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50/30 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/40 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    How eMotionView Uses Your Custom AI Provider
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                    <li><strong className="text-foreground">Fetch from External URL:</strong> In the Add Product and Edit Product modals, click <em>&ldquo;Fetch from external url&rdquo;</em> to scrape any web page and automatically fill all product details (title, pricing, specs, features, SKU, and gallery images).</li>
                    <li><strong className="text-foreground">Universal Compatibility:</strong> Works with standard OpenAI, DeepSeek, Groq, OpenRouter, Mistral, or self-hosted Ollama via the OpenAI Chat Completions API standard.</li>
                    <li><strong className="text-foreground">No Code Modifications:</strong> Changes to provider and model take effect immediately across all admin operations upon saving.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between p-4 bg-card border rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isDirty && (
              <Badge variant="outline" className="text-amber-600 border-amber-300 dark:text-amber-400">
                Unsaved changes
              </Badge>
            )}
            <span>Changes will apply across the store and storefront immediately upon saving.</span>
          </div>
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
