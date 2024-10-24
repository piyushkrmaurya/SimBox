import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './Carousel.module.css';

interface CarouselProps {
    images: string[];
    interval?: number;
    altPrefix?: string;
    height?: number | string;
    width?: number | string;
    multiple?: boolean;
}

const Carousel: React.FC<CarouselProps> = ({ images, interval = 4000, altPrefix = 'carousel', height = 300, width = '100%', multiple = false }) => {
    const [current, setCurrent] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [slidesToShow, setSlidesToShow] = useState(1);
    const [transitioning, setTransitioning] = useState(false);
    const [trackTransition, setTrackTransition] = useState('none');
    const [scrollDirection, setScrollDirection] = useState<'left' | 'right'>('right');

    // Helper to get visible images for current slide
    function getVisibleImages(start: number, count: number) {
        const imgs = [];
        for (let i = 0; i < count; i++) {
            imgs.push(images[(start + i) % images.length]);
        }
        return imgs;
    }

    function getTrackImages() {
        // Always show slidesToShow + 1 images for smooth transition
        const imgs = [];
        for (let i = 0; i < slidesToShow + 1; i++) {
            imgs.push(images[(current + i) % images.length]);
        }
        return imgs;
    }

    useEffect(() => {
        if (!multiple) {
            setSlidesToShow(1);
            return;
        }
        const handleResize = () => {
            const w = window.innerWidth;
            if (w > 1200) setSlidesToShow(3);
            else if (w > 900) setSlidesToShow(2);
            else setSlidesToShow(1);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [multiple]);

    useEffect(() => {
        if (isHovered) return;
        const timer = setInterval(() => {
            if (multiple) {
                setTrackTransition('transform 0.4s cubic-bezier(.4, 0, .2, 1)');
                setTransitioning(true);
                setTimeout(() => {
                    setTransitioning(false);
                    setTrackTransition('none');
                    setCurrent((prev) => (prev + 1) % images.length);
                }, 400);
            } else {
                setCurrent((prev) => (prev + 1) % images.length);
            }
        }, interval);
        return () => clearInterval(timer);
    }, [images.length, interval, isHovered, multiple, slidesToShow]);

    const next = () => {
        if (multiple) {
            setScrollDirection('right');
            setTrackTransition('transform 0.4s cubic-bezier(.4, 0, .2, 1)');
            setTransitioning(true);
            setTimeout(() => {
                setTransitioning(false);
                setTrackTransition('none');
                setCurrent((prev) => (prev + 1) % images.length);
            }, 400);
        } else {
            setCurrent((prev) => (prev + 1) % images.length);
        }
    };
    const prev = () => {
        if (multiple) {
            setScrollDirection('left');
            setTrackTransition('transform 0.4s cubic-bezier(.4, 0, .2, 1)');
            setTransitioning(true);
            setTimeout(() => {
                setTransitioning(false);
                setTrackTransition('none');
                setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
            }, 400);
        } else {
            setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        }
    };

    // Convert height/width to style values
    const resolvedHeight = typeof height === 'number' ? `${height}px` : height;
    const resolvedWidth = typeof width === 'number' ? `${width}px` : width;

    return (
        <div className={styles.carouselOuter} style={{ width: resolvedWidth }}>
            <div
                className={styles.carouselImageWrapper}
                style={{
                    height: resolvedHeight,
                    width: '100%',
                    display: multiple ? 'flex' : undefined,
                    gap: multiple ? '16px' : undefined,
                    position: 'relative'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {!multiple && (
                    <Image
                        src={images[current]}
                        alt={`${altPrefix}-${current}`}
                        fill
                        style={{
                            objectFit: 'cover',
                            objectPosition: images.length > 1 ? 'center' : 'top'
                        }}
                        className={styles.carouselImage}
                    />
                )}
                {multiple && (
                    <div
                        className={styles.carouselTrack}
                        style={{
                            display: 'flex',
                            gap: '16px',
                            width: `calc(${slidesToShow * 100}% + ${(slidesToShow - 1) * 16}px)`,
                            transition: trackTransition,
                            transform: transitioning
                                ? scrollDirection === 'left'
                                    ? `translateX(calc(${100 / slidesToShow}% - ${16 / slidesToShow}px))`
                                    : `translateX(calc(-${100 / slidesToShow}% + ${16 / slidesToShow}px))`
                                : 'translateX(0)',
                            position: 'relative'
                        }}
                    >
                        {getVisibleImages(current, slidesToShow).map((img, idx) => (
                            <div
                                key={`${current}-${idx}`}
                                style={{
                                    position: 'relative',
                                    flex: `0 0 calc(${100 / slidesToShow}% - ${16 / slidesToShow}px)`,
                                    height: resolvedHeight
                                }}
                            >
                                <Image
                                    src={img}
                                    alt={`${altPrefix}-${(current + idx) % images.length}`}
                                    fill
                                    style={{
                                        objectFit: 'cover',
                                        objectPosition: images.length > 1 ? 'center' : 'top'
                                    }}
                                    className={styles.carouselImage}
                                />
                                <div className={styles.carouselOverlay} />
                            </div>
                        ))}
                    </div>
                )}
                <button onClick={prev} className={styles.carouselNavButton + ' ' + styles.carouselNavButtonLeft} aria-label="Previous image">❮</button>
                <button onClick={next} className={styles.carouselNavButton + ' ' + styles.carouselNavButtonRight} aria-label="Next image">❯</button>
                <div className={styles.carouselDots}>
                    {images.map((_, idx) => (
                        <span
                            key={idx}
                            className={idx === current ? styles.carouselDotActive : styles.carouselDot}
                            onClick={() => setCurrent(idx)}
                        />
                    ))}
                </div>
            </div>
            {/* Hidden prefetch div for all images */}
            <div style={{ display: 'none', position: 'relative' }} aria-hidden="true">
                {images.map((img, idx) => (
                    <Image
                        key={idx}
                        src={img}
                        alt="prefetch"
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                ))}
            </div>
        </div>
    );
};

export default Carousel;
