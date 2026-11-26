

import Link from "next/link";
import Image from "next/image";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Linkedin,
  Headset,
  CreditCard,
  ShieldCheck,
  Truck,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { doc, getDoc, docToJSON } from '@/lib/db';
import { defaultFooterSettings, type FooterSettings } from '@/lib/placeholder-data';


const infoItems = [
    { icon: Headset, title: '24/7 Support', text: 'Always here to help' },
    { icon: CreditCard, title: 'Online Payment', text: 'Secure checkout' },
    { icon: ShieldCheck, title: 'Authentic Product', text: '100% genuine' },
    { icon: Truck, title: 'Fast Delivery', text: 'Fast shipping' },
];

export async function Footer() {
  let footerSettings: FooterSettings;
  try {
    const docRef = doc({} as any, 'public_content', 'homepage');
    const docSnap = await getDoc(docRef);
    const data = docSnap.exists() ? docToJSON(docSnap) : null;
    if (data?.footer) {
        footerSettings = { ...defaultFooterSettings, ...data.footer };
    } else {
        footerSettings = defaultFooterSettings;
    }
  } catch (error) {
    console.warn("Could not load footer settings, falling back to default.", error);
    footerSettings = defaultFooterSettings;
  }

  return (
    <footer className="border-t">
      <div className="bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-3 md:py-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {infoItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2.5 sm:gap-3 rounded-lg border border-border/60 bg-secondary/20 px-2.5 py-2 sm:px-3.5 sm:py-2.5 transition-all duration-200 hover:border-primary/30 hover:bg-secondary/40 hover:shadow-sm"
              >
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <item.icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                </div>
                <div className="min-w-0 text-left">
                  <h3 className="font-semibold text-xs sm:text-sm leading-tight">{item.title}</h3>
                  <p className="text-[11px] sm:text-xs text-muted-foreground leading-tight mt-0.5">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#1e2128] text-gray-300">
        <div className="container mx-auto px-4 pt-12 md:pt-16 pb-24 md:pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12 mb-8">
            
            <div className="space-y-4 lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image src={footerSettings.logo || defaultFooterSettings.logo} alt="eMotionView Logo" width={40} height={40} className="bg-white rounded-md p-1" data-ai-hint="logo globe white"/>
                <span className="font-bold font-headline text-2xl text-white">eMotionView</span>
              </Link>
              <p className="text-sm max-w-md">
                {footerSettings.description}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href={footerSettings.appStore.link || '#'}>
                  <Image src={footerSettings.appStore.image || defaultFooterSettings.appStore.image} alt="Download on the App Store" width={135} height={40} data-ai-hint="app store badge" />
                </Link>
                <Link href={footerSettings.googlePlay.link || '#'}>
                  <Image src={footerSettings.googlePlay.image || defaultFooterSettings.googlePlay.image} alt="Get it on Google Play" width={135} height={40} data-ai-hint="google play badge" />
                </Link>
              </div>
              <div className="flex space-x-4 pt-4">
                {footerSettings.socialLinks.facebook && <Link href={footerSettings.socialLinks.facebook}><Facebook className="h-5 w-5 text-gray-400 hover:text-white" /></Link>}
                {footerSettings.socialLinks.twitter && <Link href={footerSettings.socialLinks.twitter}><Twitter className="h-5 w-5 text-gray-400 hover:text-white" /></Link>}
                {footerSettings.socialLinks.instagram && <Link href={footerSettings.socialLinks.instagram}><Instagram className="h-5 w-5 text-gray-400 hover:text-white" /></Link>}
                {footerSettings.socialLinks.linkedin && <Link href={footerSettings.socialLinks.linkedin}><Linkedin className="h-5 w-5 text-gray-400 hover:text-white" /></Link>}
                {footerSettings.socialLinks.youtube && <Link href={footerSettings.socialLinks.youtube}><Youtube className="h-5 w-5 text-gray-400 hover:text-white" /></Link>}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-headline font-semibold text-lg text-white">COMPANY</h4>
              <ul className="space-y-2 text-sm">
                {footerSettings.companyLinks.map(link => (
                    <li key={link.label}><Link href={link.href} className="text-gray-400 hover:text-white">{link.label}</Link></li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-headline font-semibold text-lg text-white">Address</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3">
                    <MapPin className="h-5 w-5 mt-1 shrink-0" />
                    <span>{footerSettings.contact.address}</span>
                </li>
                <li className="flex gap-3">
                    <Phone className="h-5 w-5 shrink-0" />
                    <span>{footerSettings.contact.phone}</span>
                </li>
                <li className="flex gap-3">
                    <Mail className="h-5 w-5 shrink-0" />
                    <span>{footerSettings.contact.email}</span>
                </li>
              </ul>
              <h4 className="font-headline font-semibold text-lg text-white pt-4">Member of:</h4>
              <div className="flex gap-4">
                {footerSettings.memberships?.filter(m => m.image).map(member => (
                    <Link key={member.id} href={member.link || '#'} target="_blank" rel="noopener noreferrer">
                        <Image src={member.image} alt={member.name} width={100} height={40} data-ai-hint="membership badge" />
                    </Link>
                ))}
              </div>
            </div>

          </div>

          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <span className="text-sm font-semibold shrink-0">Pay With</span>
                <div className="flex-1">
                  <Image 
                    src={footerSettings.paymentMethodsImage || defaultFooterSettings.paymentMethodsImage} 
                    alt="Payment Methods" 
                    width={1180} 
                    height={139} 
                    className="w-full h-auto"
                    data-ai-hint="payment methods" 
                  />
                </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center">
            <p className="text-sm text-gray-400">
              {footerSettings.copyrightText}
            </p>
            <div className="flex gap-4 items-center">
              {footerSettings.securityBadges?.filter(b => b.image).map(badge => (
                <Image key={badge.id} src={badge.image} alt={badge.name} width={121} height={24} data-ai-hint="security badge" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
