// Static users for authentication (no backend/database needed)
export interface User {
  username: string;
  password: string;
  name?: string;
  role?: string;
}

export const STATIC_USERS: User[] = [
  { 
    username: "doctor1", 
    password: "pass123",
    name: "Dr. John Smith",
    role: "Radiologist" 
  },
  { 
    username: "admin", 
    password: "admin123",
    name: "Admin User",
    role: "Administrator"
  }
];