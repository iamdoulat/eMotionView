"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import AutoScroll from "embla-carousel-auto-scroll";

export interface ExploreCategoryItem {
  id: string;
  name: string;
  image: string;
  permalink: string;
}

interface ExploreCategoriesCarouselProps {
  categories: ExploreCategoryItem[];
}

export function ExploreCategoriesCarousel({ categories }: ExploreCategoriesCarouselProps) {
  // If we have fewer than 12 categories, duplicate the list so the infinite marquee loops seamlessly
  const displayCategories = React.useMemo(() => {
    if (!categories || categories.length === 0) return [];
    if (categories.length < 12) {
      return [...categories, ...categories, ...categories];
    }
    return [...categories, ...categories];
  }, [categories]);

  const plugin = useRef(
    AutoScroll({
      speed: 1.2, // Normal, smooth, steady scroll speed
      stopOnInteraction: false,
      stopOnMouseEnter: true, // Pauses gently when user hovers to click
    })
  );

  if (!categories || categories.length === 0) return null;

  return (
    <Carousel
      opts={{
        loop: true,
        align: "start",
        dragFree: true,
      }}
      plugins={[plugin.current]}
      className="w-full select-none"
    >
      <CarouselContent className="-ml-3 md:-ml-4">
        {displayCategories.map((category, index) => (
          <CarouselItem
            key={`${category.id}-${index}`}
            className="basis-1/3 sm:basis-1/4 md:basis-1/6 lg:basis-[140px] pl-3 md:pl-4"
          >
            <Link
              href={`/category/${category.permalink}`}
              className="group text-center block w-full py-1"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mx-auto rounded-full bg-secondary/40 flex items-center justify-center overflow-hidden border-2 border-border/80 group-hover:border-primary transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={112}
                  height={112}
                  unoptimized
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  data-ai-hint="category icon"
                />
              </div>
              <h3 className="mt-2.5 md:mt-3 font-semibold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors truncate px-1">
                {category.name}
              </h3>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
