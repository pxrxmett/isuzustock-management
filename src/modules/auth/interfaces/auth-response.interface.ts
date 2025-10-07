export interface AuthResponse {
  token: string;
  user: {
    id: string; // แก้จาก number เป็น string เนื่องจาก Staff.id เป็น UUID (string)
    staffCode: string;
    firstName: string;
    lastName: string;
    position: string;
    department: string;
    role: string;
    lineProfile?: {
      userId: string;
      displayName: string;
      pictureUrl: string;
    };
  };
}
