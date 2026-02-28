"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

const CartContext = createContext({
    cartItems: [],
    addToCart: () => {},
    addControllerToProduct: () => {},
    removeControllerFromProduct: () => {},
    getControllerForProduct: () => null,
    removeFromCart: () => {},
    updateQuantity: () => {},
    clearCart: () => {},
    getTotalItems: () => 0,
    getMainProduct: () => null,
    getAlternativeProduct: () => null,
    canAddToCart: () => true,
    swapProducts: () => {},
});

// Maximum items allowed in cart
const MAX_CART_ITEMS = 2;

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                // Ensure items have itemType and additionalController
                const itemsWithType = parsed.map((item, index) => ({
                    ...item,
                    itemType: item.itemType || (index === 0 ? "main" : "alternative"),
                    additionalController: item.additionalController || null,
                }));
                setCartItems(itemsWithType);
            } catch (error) {
                console.error("Error loading cart from localStorage:", error);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cartItems));
    }, [cartItems]);

    // Check if can add more items to cart
    const canAddToCart = () => {
        return cartItems.length < MAX_CART_ITEMS;
    };

    const addToCart = (product) => {
        setCartItems((prevItems) => {
            // Check if product already exists in cart
            const existingItem = prevItems.find((item) => item.id === product.id);
            
            if (existingItem) {
                // If product already exists, just increase quantity
                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            
            // Check if cart is full (max 2 items)
            if (prevItems.length >= MAX_CART_ITEMS) {
                toast.error("Cart can only contain 2 products: Main Product and Alternative Product");
                return prevItems;
            }

            // Determine item type based on position
            const itemType = prevItems.length === 0 ? "main" : "alternative";
            
            // Add new product with quantity 1, item type, no additional controller yet
            return [...prevItems, { ...product, quantity: 1, itemType, additionalController: null }];
        });
    };

    const removeFromCart = (productId) => {
        setCartItems((prevItems) => {
            const filteredItems = prevItems.filter((item) => item.id !== productId);
            
            // Re-assign item types after removal
            // First item should always be "main", second should be "alternative"
            return filteredItems.map((item, index) => ({
                ...item,
                itemType: index === 0 ? "main" : "alternative",
            }));
        });
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem("cart");
    };

    const getTotalItems = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    // Get the main product (first item)
    const getMainProduct = () => {
        return cartItems.find((item) => item.itemType === "main") || cartItems[0] || null;
    };

    // Get the alternative product (second item)
    const getAlternativeProduct = () => {
        return cartItems.find((item) => item.itemType === "alternative") || cartItems[1] || null;
    };

    // Add controller as additional product to a specific LED (max 1 per LED)
    const addControllerToProduct = (controller, productId) => {
        setCartItems((prevItems) => {
            return prevItems.map((item) => {
                if (item.id === productId) {
                    return { ...item, additionalController: controller };
                }
                return item;
            });
        });
    };

    // Remove controller from a product
    const removeControllerFromProduct = (productId) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === productId ? { ...item, additionalController: null } : item
            )
        );
    };

    // Get controller attached to a product
    const getControllerForProduct = (productId) => {
        const item = cartItems.find((i) => i.id === productId);
        return item?.additionalController || null;
    };

    // Swap main and alternative products
    const swapProducts = () => {
        if (cartItems.length !== 2) return;
        
        setCartItems((prevItems) => {
            const swapped = [...prevItems].reverse();
            return swapped.map((item, index) => ({
                ...item,
                itemType: index === 0 ? "main" : "alternative",
            }));
        });
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                addControllerToProduct,
                removeControllerFromProduct,
                getControllerForProduct,
                removeFromCart,
                updateQuantity,
                clearCart,
                getTotalItems,
                getMainProduct,
                getAlternativeProduct,
                canAddToCart,
                swapProducts,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
