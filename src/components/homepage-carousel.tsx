
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import type { HeroBanner } from '@/lib/placeholder-data';
import Autoplay from "embla-carousel-autoplay";
import { cn } from '@/lib/utils';

interface HomepageCarouselProps {
    banners: HeroBanner[];
}

export function HomepageCarousel({ banners }: HomepageCarouselProps) {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        if (!api) {
            return
        }

        setCurrent(api.selectedScrollSnap())

        const onSelect = () => {
            setCurrent(api.selectedScrollSnap())
        }
        
        api.on("select", onSelect)

        return () => {
            api.off("select", onSelect)
        }
    }, [api])

    const scrollTo = useCallback((index: number) => {
        api?.scrollTo(index);
    }, [api]);

    return (
        <div className="w-full relative">
            <Carousel
                setApi={setApi}
                opts={{ loop: true }}
                plugins={[
                    Autoplay({
                        delay: 5000,
                        stopOnInteraction: true,
                    }),
                ]}
                className="w-full rounded-lg overflow-hidden"
            >
                <CarouselContent>
                    {banners.map((banner, index) => (
                        <CarouselItem key={banner.id}>
                            <div className="relative w-full group">
                                <Image
                                    src={banner.image}
                                    alt={banner.headline || `Hero Banner ${index + 1}`}
                                    width={900}
                                    height={440}
                                    className="w-full h-auto object-cover"
                                    data-ai-hint="gadget festival sale"
                                    priority={banner.id === banners[0].id}
                                />
                                { (banner.headline || banner.subheadline || banner.buttonText) &&
                                <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-center items-start bg-black/20">
                                    {banner.headline && (
                                        <h1 className="font-headline text-3xl font-bold tracking-tight text-white sm:text-5xl max-w-md">
                                            {banner.headline}
                                        </h1>
                                    )}
                                    {banner.subheadline && (
                                        <p className="mt-4 text-lg leading-8 text-neutral-200 max-w-md hidden sm:block">
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
                                }
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => scrollTo(index)}
                        className={cn(
                            "h-2 w-2 rounded-full transition-all",
                            current === index ? "w-4 bg-primary" : "bg-muted-foreground/50 hover:bg-muted-foreground"
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
