import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  items: string[];
  autoPlay?: boolean;
  interval?: number;
  showArrows?: boolean;
  showIndicators?: boolean;
  loop?: boolean;
  onSlideChange?: (index: number) => void;
  className?: string;
}

export default function ImageCarousel({
  items = [],
  autoPlay = true,
  interval = 3000,
  showArrows = true,
  showIndicators = true,
  loop = true,
  onSlideChange,
  className = "w-full max-w-3xl overflow-hidden rounded-lg shadow",
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    const isLast = currentIndex === items.length - 1;
    const newIndex = isLast ? (loop ? 0 : currentIndex) : currentIndex + 1;
    setCurrentIndex(newIndex);
    onSlideChange?.(newIndex);
  };

  const prevSlide = () => {
    const isFirst = currentIndex === 0;
    const newIndex = isFirst ? (loop ? items.length - 1 : 0) : currentIndex - 1;
    setCurrentIndex(newIndex);
    onSlideChange?.(newIndex);
  };

  useEffect(() => {
    if (autoPlay) {
      const timer = setInterval(nextSlide, interval);
      return () => clearInterval(timer);
    }
  }, [currentIndex, autoPlay, interval]);

  return (
    <div className={className}>
      <div className="relative w-full h-64 flex items-center justify-center">
        {showArrows && (
          <button
            onClick={prevSlide}
            className="absolute left-4 z-10 bg-white p-1 rounded-full shadow"
          >
            <ChevronLeft />
          </button>
        )}

        <img
          src={items[currentIndex]}
          alt={`Slide ${currentIndex}`}
          className="w-full h-full object-cover rounded-lg"
        />

        {showArrows && (
          <button
            onClick={nextSlide}
            className="absolute right-4 z-10 bg-white p-1 rounded-full shadow"
          >
            <ChevronRight />
          </button>
        )}
      </div>

      {showIndicators && (
        <div className="flex justify-center mt-2 space-x-2">
          {items.map((_, idx) => (
            <span
              key={idx}
              className={`h-2 w-2 rounded-full ${
                idx === currentIndex ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
