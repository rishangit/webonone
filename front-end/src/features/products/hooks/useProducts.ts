import { useAppSelector } from "@/store/hooks";

export const useProducts = () => {
  return useAppSelector((state) => state.products);
};
