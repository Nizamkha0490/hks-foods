import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { useEffect, useState } from 'react'

const images = [
    { src: '/assets/raw_chicken_8_cut_1766096875108.png', alt: 'Premium Poultry Cuts' },
    { src: '/assets/fakir_donner_meat_1766096947697.png', alt: 'Quality Donner Meat' },
    { src: '/assets/seekh_kabab_frozen_stack_1766097021267.png', alt: 'Authentic Kebabs' },
]

export function HeroCarousel() {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 60 }, [Autoplay({ delay: 5000, stopOnInteraction: false })])
    const [selectedIndex, setSelectedIndex] = useState(0)

    useEffect(() => {
        if (!emblaApi) return

        emblaApi.on('select', () => {
            setSelectedIndex(emblaApi.selectedScrollSnap())
        })
    }, [emblaApi])

    return (
        <div className="absolute inset-0 z-0 bg-gray-900">
            <div className="overflow-hidden h-full" ref={emblaRef}>
                <div className="flex h-full">
                    {images.map((image, index) => (
                        <div className="flex-[0_0_100%] min-w-0 relative h-full" key={index}>
                            <img
                                src={image.src}
                                alt={image.alt}
                                className="block h-full w-full object-cover animate-fade-in"
                            />
                            {/* Overlay for better text readability */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Carousel Indicators */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                {images.map((_, index) => (
                    <button
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${index === selectedIndex ? 'w-8 bg-blue-500' : 'w-2 bg-white/50 hover:bg-white/80'
                            }`}
                        onClick={() => emblaApi?.scrollTo(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}
