export interface AuthResponse {
  token: string;
  user: {
    id: number; // Staff.id is now number (auto-increment INT)
    employeeCode: string; // Changed from staffCode
    fullName: string; // Changed from firstName/lastName
    fullNameEn?: string | null;
    brandId: number; // New field for multi-brand support
    brandCode?: string; // Optional brand code
    email: string;
    phone: string;
    role: string; // 'admin', 'manager', 'sales'
    status: string; // 'active', 'inactive', 'on_leave'
    lineProfile?: {
      userId: string;
      displayName: string;
      pictureUrl: string;
    };
  };
  // Optional fields for special cases (e.g., LINE login without staff link)
  error?: string;
  message?: string;
  lineUser?: {
    userId: string;
    displayName: string;
    pictureUrl: string;
  };
}
