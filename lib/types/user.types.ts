export type Role = "OWNER" | "ADMIN" | "INPUTER" | "KASIR";
export type UserRole = Role;

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  // status is not in the DB schema for users
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
}

export interface UserResponse {
  message: string;
  data: User;
}

export interface UsersListResponse {
  message: string;
  data: User[];
}
