import { useState } from "react";
import { useNavigate } from "react-router";
import useAuthStore from "@/stores/authStore";

type Region = { id: number; name: string };
type District = { id: number; name: string; region_id: number };

interface LoginFormData {
  email: string;
  password: string;
}

interface SignupFormData {
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  region: string;
  district: string;
}

interface UseAuthFormReturn {
  // Common fields
  error: string;
  setError: (error: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Login fields
  loginFormData: LoginFormData;
  setLoginFormData: (data: LoginFormData) => void;
  
  // Signup fields
  signupFormData: SignupFormData;
  setSignupFormData: (data: SignupFormData) => void;
  
  // Regions/Districts for signup
  regions: Region[];
  districts: District[];
  filteredDistricts: District[];
  selectedRegion: Region | null;
  selectedDistrict: District | null;
  setSelectedRegion: (region: Region | null) => void;
  setSelectedDistrict: (district: District | null) => void;
  
  // Handlers
  handleLogin: (e: React.FormEvent) => Promise<void>;
  handleSignup: (e: React.FormEvent) => Promise<void>;
  loadLocationData: () => Promise<void>;
}

export const useAuthForm = (): UseAuthFormReturn => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Login form data
  const [loginFormData, setLoginFormData] = useState<LoginFormData>({
    email: "",
    password: ""
  });
  
  // Signup form data
  const [signupFormData, setSignupFormData] = useState<SignupFormData>({
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    region: "",
    district: ""
  });
  
  // Location data for signup
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);

  const navigate = useNavigate();
  const { login, signup } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous error
    setIsLoading(true);
    
    try {
      const [success, response] = await login(loginFormData.email, loginFormData.password);
      if (success) {
        navigate("/"); // Redirect to home or dashboard after login
      } else {
        setError(response.message || "Invalid email or password"); // From mock or backend error
      }
    } catch (err) {
      setError("An unexpected error occurred during login");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validate passwords match
    if (signupFormData.password !== signupFormData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const userData = {
        name: signupFormData.name,
        surname: signupFormData.surname,
        email: signupFormData.email,
        phoneNumber: signupFormData.phoneNumber,
        password: signupFormData.password,
        dateOfBirth: signupFormData.dateOfBirth,
        region: signupFormData.region,
        district: signupFormData.district,
      };

      const [success, response] = await signup(userData);

      if (success) {
        navigate("/");
      } else {
        setError(response.message || "An error occurred during signup");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocationData = async () => {
    try {
      const response = await fetch("/src/assets/regions.json");
      const data = await response.json();
      setRegions(data.regions);
      setDistricts(data.districts);
    } catch (err) {
      console.error("Error loading location data:", err);
      setError("Failed to load location data");
    }
  };

  const filteredDistricts = selectedRegion
    ? districts.filter((d) => d.region_id === selectedRegion.id)
    : [];

  return {
    // Common fields
    error,
    setError,
    isLoading,
    setIsLoading,
    
    // Login fields
    loginFormData,
    setLoginFormData,
    
    // Signup fields
    signupFormData,
    setSignupFormData,
    
    // Regions/Districts for signup
    regions,
    districts,
    filteredDistricts,
    selectedRegion,
    selectedDistrict,
    setSelectedRegion,
    setSelectedDistrict,
    
    // Handlers
    handleLogin,
    handleSignup,
    loadLocationData
  };
};