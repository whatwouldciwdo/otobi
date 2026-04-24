"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type CartItem = {
    id: string;
    title: string;
    price: string;
    image: string;
    weight: number;
    quantity: number;
};

export type User = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    areaId?: string;
    areaName?: string;
    role?: "USER" | "ADMIN";
} | null;

interface ShopContextType {
    cart: CartItem[];
    addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, newQuantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;

    wishlist: string[]; 
    toggleWishlist: (id: string) => void;

    user: User;
    login: (name: string, email: string, id?: string, phone?: string, role?: "USER" | "ADMIN", address?: string, areaId?: string, areaName?: string) => void;
    logout: () => void;

    
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
    isWishlistOpen: boolean;
    setIsWishlistOpen: (isOpen: boolean) => void;
    isInitialized: boolean;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [user, setUser] = useState<User>(null);

    
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem("otobi_cart");
            if (savedCart) setCart(JSON.parse(savedCart));

            const savedWishlist = localStorage.getItem("otobi_wishlist");
            if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

            const savedUser = localStorage.getItem("otobi_user");
            if (savedUser) setUser(JSON.parse(savedUser));
        } catch (e) {
            console.error("Failed to load state from local storage", e);
        } finally {
            setIsInitialized(true);
        }
    }, []);

    
    useEffect(() => {
        localStorage.setItem("otobi_cart", JSON.stringify(cart));
    }, [cart]);

    
    useEffect(() => {
        localStorage.setItem("otobi_wishlist", JSON.stringify(wishlist));
    }, [wishlist]);

    
    useEffect(() => {
        localStorage.setItem("otobi_user", JSON.stringify(user));
    }, [user]);

    
    useEffect(() => {
        if (!user?.id || user.id.startsWith("guest_")) return;
        const timer = setTimeout(() => {
            fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, cart }),
            }).catch(() => { });
        }, 1000);
        return () => clearTimeout(timer);
    }, [cart, user]);

    
    useEffect(() => {
        if (!user?.id || user.id.startsWith("guest_")) return;
        const timer = setTimeout(() => {
            fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, wishlist }),
            }).catch(() => { });
        }, 1000);
        return () => clearTimeout(timer);
    }, [wishlist, user]);

    
    const loadUserData = useCallback(async (userId: string) => {
        try {
            const [cartRes, wishlistRes] = await Promise.all([
                fetch(`/api/cart?userId=${userId}`),
                fetch(`/api/wishlist?userId=${userId}`),
            ]);
            const cartData = await cartRes.json();
            const wishlistData = await wishlistRes.json();

            if (cartData.cart && cartData.cart.length > 0) setCart(cartData.cart);
            if (wishlistData.wishlist && wishlistData.wishlist.length > 0) setWishlist(wishlistData.wishlist);
        } catch {
            
        }
    }, []);

    const addToCart = (product: Omit<CartItem, "quantity">, quantity: number = 1) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === product.id);
            if (existingItem) {
                return prevCart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prevCart, { ...product, quantity }];
        });
    };

    const removeFromCart = (id: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const toggleWishlist = (id: string) => {
        setWishlist((prevWishlist) => {
            if (prevWishlist.includes(id)) {
                return prevWishlist.filter((itemId) => itemId !== id);
            } else {
                return [...prevWishlist, id];
            }
        });
    };

    const login = (name: string, email: string, id?: string, phone?: string, role?: "USER" | "ADMIN", address?: string, areaId?: string, areaName?: string) => {
        const userId = id ?? `guest_${Date.now()}`;
        const newUser = { id: userId, name, email, phone: phone ?? "", role: role ?? "USER", address: address ?? "", areaId: areaId ?? "", areaName: areaName ?? "" };
        setUser(newUser);
        
        if (id) {
            loadUserData(id);
        }
    };

    const logout = () => {
        setUser(null);
        
        setCart([]);
        setWishlist([]);
    };

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    const cartTotal = cart.reduce((total, item) => {
        const priceNumber = parseInt(item.price.replace(/[^\d]/g, ""), 10) || 0;
        return total + priceNumber * item.quantity;
    }, 0);

    return (
        <ShopContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal,
                wishlist,
                toggleWishlist,
                user,
                login,
                logout,
                isCartOpen,
                setIsCartOpen,
                isWishlistOpen,
                setIsWishlistOpen,
                isInitialized,
            }}
        >
            {children}
        </ShopContext.Provider>
    );
}

export function useShop() {
    const context = useContext(ShopContext);
    if (context === undefined) {
        throw new Error("useShop must be used within a ShopProvider");
    }
    return context;
}

