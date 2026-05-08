import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Product, CreateProductData, UpdateProductData } from "@/features/products/types/product.types";

interface ProductsState {
  products: Product[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

const initialState: ProductsState = {
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
  lastFetch: null,
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    fetchProductsRequest: (state, action: PayloadAction<{ isActive?: boolean; categoryId?: number; subcategoryId?: number } | undefined>) => {
      state.loading = true;
      state.error = null;
    },
    fetchProductsSuccess: (state, action: PayloadAction<Product[]>) => {
      state.loading = false;
      state.products = action.payload;
      state.error = null;
      state.lastFetch = Date.now();
    },
    fetchProductsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchProductRequest: (state, action: PayloadAction<number>) => {
      state.loading = true;
      state.error = null;
    },
    fetchProductSuccess: (state, action: PayloadAction<Product>) => {
      state.loading = false;
      state.currentProduct = action.payload;
      state.error = null;
    },
    fetchProductFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    createProductRequest: (state, action: PayloadAction<CreateProductData>) => {
      state.loading = true;
      state.error = null;
    },
    createProductSuccess: (state, action: PayloadAction<Product>) => {
      state.loading = false;
      state.products.push(action.payload);
      state.error = null;
    },
    createProductFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateProductRequest: (state, action: PayloadAction<{ id: number; data: UpdateProductData }>) => {
      state.loading = true;
      state.error = null;
    },
    updateProductSuccess: (state, action: PayloadAction<Product>) => {
      state.loading = false;
      const index = state.products.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
      if (state.currentProduct?.id === action.payload.id) {
        state.currentProduct = action.payload;
      }
      state.error = null;
    },
    updateProductFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    deleteProductRequest: (state, action: PayloadAction<number>) => {
      state.loading = true;
      state.error = null;
    },
    deleteProductSuccess: (state, action: PayloadAction<number>) => {
      state.loading = false;
      state.products = state.products.filter((p) => p.id !== action.payload);
      if (state.currentProduct?.id === action.payload) {
        state.currentProduct = null;
      }
      state.error = null;
    },
    deleteProductFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetProducts: () => {
      return initialState;
    },
  },
});

export const {
  fetchProductsRequest,
  fetchProductsSuccess,
  fetchProductsFailure,
  fetchProductRequest,
  fetchProductSuccess,
  fetchProductFailure,
  createProductRequest,
  createProductSuccess,
  createProductFailure,
  updateProductRequest,
  updateProductSuccess,
  updateProductFailure,
  deleteProductRequest,
  deleteProductSuccess,
  deleteProductFailure,
  clearCurrentProduct,
  clearError,
  resetProducts,
} = productsSlice.actions;

export const productReducer = productsSlice.reducer;
export default productsSlice.reducer;
