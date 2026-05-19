export type Category = {
  id: number;
  name: string;
  icon: string;
  shelf_days: number;
};

export type ProductStatus = "active" | "consumed" | "wasted";

export type Product = {
  id: number;
  name: string;
  category_id: number | null;
  quantity: number;
  unit: string;
  price: number;
  purchase_date: string;
  expiry_date: string;
  status: ProductStatus;
  consumed_at: string | null;
  note: string | null;
  created_at: string;
};

export type ProductWithCategory = Product & {
  categories: Pick<Category, "id" | "name" | "icon"> | null;
};
