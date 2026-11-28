"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  Loader2,
  HelpCircle,
  Check,
} from "lucide-react";
import { doc, getDoc } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";

type StoreContactInfo = {
  storeName: string;
  companyName: string;
  storeTagline: string;
  storeDescription: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
};

const DEFAULT_STORE_INFO: StoreContactInfo = {
  storeName: "eMotionView",
  companyName: "eMotionView Ltd.",
  storeTagline: "The Biggest Smart Gadget & SmartPhone Collection in Bangladesh",
  storeDescription:
    "Motion View is the largest Eco Product importer and Distributor in Bangladesh, delivering official smartwatches, audio devices, lifestyle technology, and authorized warranties.",
  logo: "/api/r2/proxy?key=general%2F1780921429643-motion-logo.webp",
  address: "10/25 (9th Commercial Floor), Eastern Plaza, 70 Bir Uttam C.R Datta Road, Hatirpool, Dhaka-1205",
  phone: "09677460460",
  email: "motionview22@gmail.com.bd",
};

export default function ContactPage() {
  const { toast } = useToast();

  // Store information state
  const [storeInfo, setStoreInfo] = useState<StoreContactInfo>(DEFAULT_STORE_INFO);
  const [isLoadingStoreInfo, setIsLoadingStoreInfo] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Order Status & Tracking");
  const [customSubject, setCustomSubject] = useState("");
  const [message, setMessage] = useState("");

  // Math Captcha state (e.g. 5 + 4 = 9)
  const [captchaNum1, setCaptchaNum1] = useState(5);
  const [captchaNum2, setCaptchaNum2] = useState(4);
  const [captchaUserAnswer, setCaptchaUserAnswer] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Function to randomize math challenge
  const regenerateCaptcha = () => {
    // Generate two random single-digit numbers between 2 and 9
    const n1 = Math.floor(Math.random() * 8) + 2;
    const n2 = Math.floor(Math.random() * 8) + 1;
    setCaptchaNum1(n1);
    setCaptchaNum2(n2);
    setCaptchaUserAnswer("");
    setCaptchaError("");
  };

  // Load store settings on mount
  useEffect(() => {
    const fetchGeneralSettings = async () => {
      try {
        const docRef = doc({} as any, "settings", "general");
        const docSnap = await getDoc(docRef);
        if (docSnap && docSnap.exists()) {
          const data = docSnap.data();
          setStoreInfo({
            storeName: data.storeName || DEFAULT_STORE_INFO.storeName,
            companyName: data.companyName || DEFAULT_STORE_INFO.companyName,
            storeTagline: data.storeTagline || DEFAULT_STORE_INFO.storeTagline,
            storeDescription: data.storeDescription || DEFAULT_STORE_INFO.storeDescription,
            logo: data.logo || DEFAULT_STORE_INFO.logo,
            address: data.address || DEFAULT_STORE_INFO.address,
            phone: data.phone || DEFAULT_STORE_INFO.phone,
            email: data.contactNotificationEmail || data.email || DEFAULT_STORE_INFO.email,
          });
        }
      } catch (err) {
        console.error("Failed to load store settings for contact page:", err);
      } finally {
        setIsLoadingStoreInfo(false);
      }
    };

    fetchGeneralSettings();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setCaptchaError("");

    // Basic validation
    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please provide a valid email address.");
      return;
    }
    if (!message.trim() || message.trim().length < 5) {
      setErrorMessage("Please enter a message of at least 5 characters.");
      return;
    }

    // Verify Captcha
    const expectedAnswer = captchaNum1 + captchaNum2;
    const userAnswerNum = parseInt(captchaUserAnswer.trim(), 10);

    if (isNaN(userAnswerNum) || userAnswerNum !== expectedAnswer) {
      setCaptchaError(`Incorrect answer. What is ${captchaNum1} + ${captchaNum2}?`);
      return;
    }

    setIsSubmitting(true);

    try {
      const finalSubject = subject === "Other" && customSubject.trim() ? customSubject.trim() : subject;

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject: finalSubject,
          message: message.trim(),
          captchaAnswer: userAnswerNum,
          captchaExpected: expectedAnswer,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to send message. Please try again.");
      }

      setIsSubmittedSuccess(true);
      toast({
        title: "Message Sent Successfully",
        description: `We've forwarded your inquiry to our support desk. A confirmation will be sent to ${email}.`,
      });

      // Clear fields
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setCustomSubject("");
      regenerateCaptcha();
    } catch (err: any) {
      console.error("Contact form error:", err);
      setErrorMessage(err.message || "Failed to submit message. Please try again.");
      regenerateCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 py-8 lg:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb & Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Customer Care & Support</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground font-headline">
            Get In Touch With <span className="text-primary">{storeInfo.storeName}</span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Have questions about gadget specifications, an existing order, warranty services, or corporate bulk orders?
            Our support representatives are standing by to assist you.
          </p>
        </div>

        {/* 2-COLUMN MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: CONTACT FORM WITH SUBMISSIONS & CAPTCHA      */}
          {/* ========================================================= */}
          <div className="lg:col-span-7">
            <Card className="border border-border/70 shadow-md bg-card overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/50 pb-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Send us a Message</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                      Submissions are routed directly to the designated support mailbox ({storeInfo.email}).
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 sm:p-8">
                {isSubmittedSuccess ? (
                  <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-foreground">Thank You! Message Received</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Your inquiry has been logged and forwarded to our support administration. We usually respond within a few business hours.
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsSubmittedSuccess(false)}
                      variant="outline"
                      className="mt-4 gap-2 text-xs"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Send Another Inquiry
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Error Banner */}
                    {errorMessage && (
                      <div className="flex items-center gap-2 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Name & Email Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-name" className="text-xs font-semibold">
                          Your Full Name <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="contact-name"
                          placeholder="e.g. Tanvir Hossain"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="h-10 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="contact-email" className="text-xs font-semibold">
                          Email Address <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="contact-email"
                          type="email"
                          placeholder="e.g. tanvir@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-10 text-sm"
                        />
                      </div>
                    </div>

                    {/* Phone & Subject Category Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-phone" className="text-xs font-semibold">
                          Contact / Phone Number
                        </Label>
                        <Input
                          id="contact-phone"
                          type="tel"
                          placeholder="e.g. +880 1711-000000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="h-10 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="contact-subject" className="text-xs font-semibold">
                          Inquiry Topic <span className="text-rose-500">*</span>
                        </Label>
                        <Select value={subject} onValueChange={setSubject}>
                          <SelectTrigger id="contact-subject" className="h-10 text-sm">
                            <SelectValue placeholder="Select a topic" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Order Status & Tracking">Order Status & Tracking</SelectItem>
                            <SelectItem value="Product Specifications & Advice">Product Specifications & Advice</SelectItem>
                            <SelectItem value="Warranty Claim & Repair">Warranty Claim & Repair</SelectItem>
                            <SelectItem value="Return & Refund Request">Return & Refund Request</SelectItem>
                            <SelectItem value="Wholesale & Corporate Purchase">Wholesale & Corporate Purchase</SelectItem>
                            <SelectItem value="Other">Other Inquiry</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Custom Subject (if 'Other' is selected) */}
                    {subject === "Other" && (
                      <div className="space-y-1.5 animate-in fade-in duration-200">
                        <Label htmlFor="custom-subject" className="text-xs font-semibold">
                          Specific Subject <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="custom-subject"
                          placeholder="Brief topic of your inquiry"
                          value={customSubject}
                          onChange={(e) => setCustomSubject(e.target.value)}
                          required
                          className="h-10 text-sm"
                        />
                      </div>
                    )}

                    {/* Message Box */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="contact-message" className="text-xs font-semibold">
                          Your Message <span className="text-rose-500">*</span>
                        </Label>
                        <span className="text-[11px] text-muted-foreground">{message.length} chars</span>
                      </div>
                      <Textarea
                        id="contact-message"
                        rows={5}
                        placeholder="Please write your detailed inquiry, question, or order number here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        className="text-sm resize-y"
                      />
                    </div>

                    {/* ========================================================= */}
                    {/* MATH CAPTCHA SECURITY: 5 + 4 = [ ]                         */}
                    {/* ========================================================= */}
                    <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                          <Label htmlFor="captcha-answer" className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Security Verification
                          </Label>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={regenerateCaptcha}
                          className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1.5"
                          title="Generate a new math challenge"
                        >
                          <RefreshCw className="h-3 w-3" />
                          New Challenge
                        </Button>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-background border px-3 py-2 rounded-lg font-mono font-bold text-base shadow-xs select-none">
                          <span className="text-primary">{captchaNum1}</span>
                          <span className="text-muted-foreground">+</span>
                          <span className="text-primary">{captchaNum2}</span>
                          <span className="text-muted-foreground">=</span>
                        </div>

                        <div className="w-24">
                          <Input
                            id="captcha-answer"
                            type="number"
                            placeholder="[ ? ]"
                            value={captchaUserAnswer}
                            onChange={(e) => {
                              setCaptchaUserAnswer(e.target.value);
                              if (captchaError) setCaptchaError("");
                            }}
                            className={`h-10 text-center font-mono font-bold text-base ${
                              captchaError ? "border-rose-500 focus-visible:ring-rose-500" : ""
                            }`}
                            required
                          />
                        </div>

                        <span className="text-xs text-muted-foreground">
                          Solve this quick math problem to confirm you're human.
                        </span>
                      </div>

                      {captchaError && (
                        <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5 pt-1">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          {captchaError}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 text-sm font-semibold gap-2 shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Sending Inquiry to Support...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Send Message</span>
                        </>
                      )}
                    </Button>

                    <p className="text-[11px] text-center text-muted-foreground pt-1">
                      Your privacy is protected. Inquiries are stored securely and never shared with third parties.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: STORE NAME, LOGO, EMAIL, CONTACT NO, ETC.   */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-6">
            {/* Store Identity Card */}
            <Card className="border border-border/70 shadow-md bg-card overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary via-indigo-500 to-sky-500" />
              <CardContent className="p-6 space-y-5">
                {/* Logo & Store Name */}
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-xl border bg-muted/30 p-2 shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
                    {storeInfo.logo ? (
                      <Image
                        src={storeInfo.logo}
                        alt={storeInfo.storeName}
                        width={64}
                        height={64}
                        className="object-contain max-h-full max-w-full"
                        priority
                      />
                    ) : (
                      <Building2 className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-foreground truncate font-headline">
                        {storeInfo.storeName}
                      </h2>
                      <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 shrink-0">
                        Official Store
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{storeInfo.companyName}</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {storeInfo.storeTagline || storeInfo.storeDescription}
                </p>

                <div className="border-t border-border/60 pt-4 space-y-3.5">
                  {/* Phone / Hotline */}
                  <div className="flex items-start gap-3.5 group">
                    <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Hotline / Contact Number
                      </p>
                      <a
                        href={`tel:${storeInfo.phone}`}
                        className="text-sm font-bold text-foreground hover:text-primary transition-colors block mt-0.5"
                      >
                        {storeInfo.phone}
                      </a>
                      <span className="text-[11px] text-muted-foreground">Available Sat - Thu (10am - 8pm)</span>
                    </div>
                  </div>

                  {/* Designated Email */}
                  <div className="flex items-start gap-3.5 group">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Official Support Email
                      </p>
                      <a
                        href={`mailto:${storeInfo.email}`}
                        className="text-sm font-bold text-foreground hover:text-primary transition-colors block mt-0.5 break-all"
                      >
                        {storeInfo.email}
                      </a>
                      <span className="text-[11px] text-muted-foreground">Direct response from administration</span>
                    </div>
                  </div>

                  {/* Office & Showroom Address */}
                  <div className="flex items-start gap-3.5 group">
                    <div className="h-9 w-9 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Head Office & Showroom
                      </p>
                      <p className="text-xs text-foreground mt-0.5 leading-relaxed font-medium">
                        {storeInfo.address}
                      </p>
                    </div>
                  </div>

                  {/* Business Hours */}
                  <div className="flex items-start gap-3.5 group">
                    <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Working Hours
                      </p>
                      <div className="text-xs text-foreground mt-0.5 space-y-0.5">
                        <p className="flex justify-between font-medium">
                          <span>Saturday – Thursday:</span>
                          <span className="font-mono">10:00 AM – 8:00 PM</span>
                        </p>
                        <p className="flex justify-between text-muted-foreground">
                          <span>Friday:</span>
                          <span>Weekly Holiday</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Help Channels */}
                <div className="border-t border-border/60 pt-4">
                  <p className="text-xs font-semibold text-foreground mb-2.5">Instant Channels</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="text-xs font-medium justify-center h-9 border-border/80 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30"
                    >
                      <a
                        href={`https://wa.me/88${storeInfo.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        WhatsApp Chat
                        <ExternalLink className="h-3 w-3 ml-1.5 opacity-70" />
                      </a>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="text-xs font-medium justify-center h-9 border-border/80 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                    >
                      <Link href="/track-order">
                        Track Order
                        <ArrowRight className="h-3 w-3 ml-1.5 opacity-70" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Embedded Google Map / Location Card */}
            <Card className="border border-border/70 shadow-sm overflow-hidden bg-card">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Visit Our Showroom Location
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px]">Dhaka, BD</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="w-full h-44 rounded-lg overflow-hidden border border-border/60 relative bg-muted/40">
                  <iframe
                    title="eMotionView Eastern Plaza Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.285854897269!2d90.39086727599026!3d23.737190089299444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8eb8309bf87%3A0x600f90e5fa33f993!2sEastern%20Plaza%2C%20Hatirpool%2C%20Dhaka%201205!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                  />
                </div>
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Eastern Plaza (9th Floor), Hatirpool, Dhaka</span>
                  <a
                    href="https://maps.google.com/?q=Eastern+Plaza+Hatirpool+Dhaka"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    Open in Maps
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Quick Guarantees Card */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Official Warranty</p>
                  <p className="text-[11px] text-muted-foreground">Direct brand coverage</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">100% Genuine</p>
                  <p className="text-[11px] text-muted-foreground">Imported products</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
