export interface User {
    id: number;
    email: string;
    password: string;
    name: string;
    surname: string;
    phoneNumber: string;
    region: string;
    city: string;
    role: string;
    dateOfBirth?: string;
    district?: string;
}

export interface JwtPayload {
    userId: number;
    email: string;
    exp: number;
}

export interface AuthResponse {
    message?: string;
    authToken?: string;
    user?: Omit<User, 'password'>;
}

export interface LoginResponse {
    authToken: string;
    user: Omit<User, 'password'>;
}

export interface SignupResponse {
    authToken: string;
    user: Omit<User, 'password'>;
}

export interface UserResponse {
    user: Omit<User, 'password'>;
}
