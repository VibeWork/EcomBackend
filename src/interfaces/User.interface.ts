export interface IUser {
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string;
  landmark?: string;
  pincode?: string;
  city?: string;
  state?: string;
  country?: string;
  profilePicture?: string;
  role: "admin" | "user";
  createdAt?: Date;
  updatedAt?: Date;
}
