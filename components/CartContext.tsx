// CartContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
    id: number;
    amount: number;
    category: string;
    categoryTitle: string;
    subCategory?: string;
    timestamp: string;
}

interface CartContextType {
    cart: CartItem[];
    setCart: (cart: CartItem[]) => void;
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);

    useEffect(() => {
        const storedCart = localStorage.getItem('donationCart');
        if (storedCart) {
            try {
                setCart(JSON.parse(storedCart));
            } catch {
                setCart([]);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('donationCart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item: CartItem) => setCart(prev => [...prev, item]);
    const removeFromCart = (id: number) => setCart(prev => prev.filter(i => i.id !== id));
    const clearCart = () => setCart([]);

    return (
        <CartContext.Provider value={{ cart, setCart, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}
