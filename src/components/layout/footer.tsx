

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
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { defaultFooterSettings, type FooterSettings } from '@/lib/placeholder-data';


const infoItems = [
    { icon: Headset, title: 'SUPPORT 24/7', text: 'We Support Online 24 Hours' },
    { icon: CreditCard, title: 'Online Payment', text: 'Make payments hands free very easily' },
    { icon: ShieldCheck, title: 'Authentic Product', text: 'Guaranteed 100% authentic product' },
    { icon: Truck, title: 'Fast Delivery', text: 'Fast Delivery is our first moto' },
];

export async function Footer() {
  let footerSettings: FooterSettings;
  try {
    const docRef = doc(db, 'public_content', 'homepage');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data()?.footer) {
        footerSettings = { ...defaultFooterSettings, ...docSnap.data().footer };
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
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {infoItems.map((item, index) => (
              <div key={index} className="flex flex-col items-center p-6 rounded-lg transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl cursor-pointer">
                <item.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#1e2128] text-gray-300">
        <div className="container mx-auto px-4 pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12 mb-8">
            
            <div className="space-y-4 lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image src={footerSettings.logo} alt="eMotionView Logo" width={40} height={40} className="bg-white rounded-md p-1" data-ai-hint="logo globe white"/>
                <span className="font-bold font-headline text-2xl text-white">eMotionView</span>
              </Link>
              <p className="text-sm max-w-md">
                {footerSettings.description}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href={footerSettings.appStore.link}>
                  <Image src={footerSettings.appStore.image} alt="Download on the App Store" width={135} height={40} data-ai-hint="app store badge" />
                </Link>
                <Link href={footerSettings.googlePlay.link}>
                  <Image src={footerSettings.googlePlay.image} alt="Get it on Google Play" width={135} height={40} data-ai-hint="google play badge" />
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
                {footerSettings.memberships?.map(member => (
                    <Link key={member.id} href={member.link} target="_blank" rel="noopener noreferrer">
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
                    src={footerSettings.paymentMethodsImage} 
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
              {footerSettings.securityBadges.map(badge => (
                <Image key={badge.id} src={badge.image} alt={badge.name} width={121} height={24} data-ai-hint="security badge" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
