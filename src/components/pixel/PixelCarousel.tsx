import React, { useRef, useState, useEffect } from 'react';
import { PixelButton } from './PixelButton';
import { PixelArrowLeftIcon, PixelArrowRightIcon } from './PixelIcons';

interface PixelCarouselProps {
  children: React.ReactNode[];
  itemWidth?: string; // e.g. 'w-[280px]' or 'w-full max-w-[320px]'
  showControls?: boolean;
  showIndicators?: boolean;
  className?: string;
  id?: string;
}

/**
 * 32-Bit Horizontal Pixel Carousel
 * Responsive horizontal scroller with tactile pixel arrow buttons,
 * step indicators, touch swipe support, and gamepad navigation.
 */
export const PixelCarousel: React.FC<PixelCarouselProps> = ({
  children,
  itemWidth = 'w-[280px] sm:w-[320px]',
  showControls = true,
  showIndicators = true,
  className = '',
  id,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScroll = () => {
    if (!scrollerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Approximate active child index
    const childWidth = scrollerRef.current.firstElementChild?.clientWidth || 280;
    const idx = Math.round(scrollLeft / (childWidth + 16));
    setActiveIndex(Math.max(0, Math.min(children.length - 1, idx)));
  };

  useEffect(() => {
    checkScroll();
    const scroller = scrollerRef.current;
    if (scroller) {
      scroller.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      return () => {
        scroller.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [children.length]);

  const scrollByAmount = (direction: 'left' | 'right') => {
    if (!scrollerRef.current) return;
    const childWidth = scrollerRef.current.firstElementChild?.clientWidth || 300;
    const scrollAmount = direction === 'left' ? -childWidth : childWidth;
    scrollerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const scrollToIndex = (index: number) => {
    if (!scrollerRef.current) return;
    const childWidth = scrollerRef.current.firstElementChild?.clientWidth || 300;
    scrollerRef.current.scrollTo({
      left: index * (childWidth + 16),
      behavior: 'smooth',
    });
  };

  return (
    <div id={id} className={`w-full flex flex-col gap-3 select-none ${className}`}>
      {/* Controls Bar */}
      {showControls && (
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1.5">
            {showIndicators &&
              children.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToIndex(idx)}
                  className={`w-3 h-3 border border-black transition-all ${
                    idx === activeIndex
                      ? 'bg-cyan-400 pixel-bevel-cyan shadow-[0_1px_0_0_#000]'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
          </div>

          <div className="flex items-center gap-2">
            <PixelButton
              size="sm"
              variant="secondary"
              disabled={!canScrollLeft}
              onClick={() => scrollByAmount('left')}
              icon={<PixelArrowLeftIcon size={14} />}
              aria-label="Previous items"
            />
            <PixelButton
              size="sm"
              variant="secondary"
              disabled={!canScrollRight}
              onClick={() => scrollByAmount('right')}
              icon={<PixelArrowRightIcon size={14} />}
              aria-label="Next items"
            />
          </div>
        </div>
      )}

      {/* Horizontal Scroller */}
      <div
        ref={scrollerRef}
        tabIndex={0}
        className="w-full flex items-stretch gap-3 sm:gap-4 overflow-x-auto smooth-scroll py-2 px-1 outline-none snap-x snap-mandatory"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#334155 #0f172a',
        }}
      >
        {children.map((child, idx) => (
          <div
            key={idx}
            className={`shrink-0 ${itemWidth} snap-start flex flex-col`}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};
