import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const myProducts = await AsyncStorage.getItem('@goMarketPlace:product');

      if (myProducts) setProducts(JSON.parse(myProducts));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExists = products.find(pro => pro.id === product.id);

      if (productExists) {
        const addedProducts = products.map(pro =>
          pro.id === product.id
            ? { ...product, quantity: pro.quantity + 1 }
            : pro,
        );

        setProducts(addedProducts);
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }
      await AsyncStorage.setItem(
        '@goMarketPlace:product',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const addedProducts = products.map(pro =>
        pro.id === id ? { ...pro, quantity: pro.quantity + 1 } : pro,
      );

      setProducts(addedProducts);

      await AsyncStorage.setItem(
        '@goMarketPlace:product',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const myProductCart = products.find(pro => pro.id === id);

      const restProductsCart = products.filter(pro => pro.id !== id);

      if (myProductCart && myProductCart.quantity > 1) {
        const MyProducts = products.map(pro =>
          pro.id === id ? { ...pro, quantity: pro.quantity - 1 } : pro,
        );

        setProducts(MyProducts);
      } else {
        setProducts(restProductsCart);
      }

      await AsyncStorage.setItem(
        '@goMarketPlace:product',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
