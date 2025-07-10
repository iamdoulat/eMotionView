
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import type { HeroBanner } from '@/lib/placeholder-data';
import Autoplay from "embla-carousel-autoplay";

interface HomepageCarouselProps {
    banners: HeroBanner[];
}

export function HomepageCarousel({ banners }: HomepageCarouselProps) {
    return (
        <Carousel
            opts={{ loop: true }}
            plugins={[
                Autoplay({
                    delay: 5000,
                    stopOnInteraction: true,
                }),
            ]}
            className="w-full relative"
        >
            <CarouselContent className="h-[440px]">
                {banners.map((banner, index) => (
                    <CarouselItem key={banner.id}>
                        <div className="relative h-full w-full rounded-lg overflow-hidden group">
                            <Image
                                src={banner.image}
                                alt={banner.headline || `Hero Banner ${index + 1}`}
                                fill
                                style={{ objectFit: 'cover' }}
                                className="transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint="gadget festival sale"
                                priority={banner.id === banners[0].id}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent p-8 md:p-16 flex flex-col justify-center items-start">
                                {banner.headline && (
                                    <h1 className="font-headline text-4xl font-bold tracking-tight text-white sm:text-6xl max-w-md">
                                        {banner.headline}
                                    </h1>
                                )}
                                {banner.subheadline && (
                                    <p className="mt-4 text-xl leading-8 text-neutral-200 max-w-md">
                                        {banner.subheadline}
                                    </p>
                                )}
                                {banner.buttonText && banner.link && (
                                    <div className="mt-6">
                                        <Button asChild size="lg">
                                            <Link href={banner.link}>{banner.buttonText}</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
        </Carousel>
    );
}
