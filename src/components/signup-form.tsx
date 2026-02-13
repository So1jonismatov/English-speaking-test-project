import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect } from "react"
import { Link } from "react-router"
import maabLogo from "@/assets/maab_logo.png"
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthForm } from "@/hooks/useAuthForm";

export function SignupForm(props: React.ComponentProps<typeof Card>) {
  const {
    signupFormData,
    setSignupFormData,
    error,
    handleSignup,
    isLoading,
    regions,
    districts,
    filteredDistricts,
    selectedRegion,
    selectedDistrict,
    setSelectedRegion,
    setSelectedDistrict,
    loadLocationData
  } = useAuthForm();

  useEffect(() => {
    loadLocationData();
  }, []);

  // Handlers for form inputs
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupFormData({ ...signupFormData, name: e.target.value });
  };

  const handleSurnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupFormData({ ...signupFormData, surname: e.target.value });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupFormData({ ...signupFormData, email: e.target.value });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupFormData({ ...signupFormData, phoneNumber: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupFormData({ ...signupFormData, password: e.target.value });
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupFormData({ ...signupFormData, confirmPassword: e.target.value });
  };

  const handleDateOfBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupFormData({ ...signupFormData, dateOfBirth: e.target.value });
  };

  const handleRegionChange = (value: string | null) => {
    if (value !== null) {
      setSignupFormData({ 
        ...signupFormData, 
        region: value,
        district: "" // Reset district when region changes
      });
      const regionObj = regions.find(r => r.id === Number(value)) ?? null;
      setSelectedRegion(regionObj);
      setSelectedDistrict(null);
    }
  };

  const handleDistrictChange = (value: string | null) => {
    if (value !== null) {
      setSignupFormData({ ...signupFormData, district: value });
      const districtObj = districts.find(d => d.id === Number(value)) ?? null;
      setSelectedDistrict(districtObj);
    }
  };

  return (
    <Card {...props}>
      <CardHeader className="items-center">
        <img
          src={maabLogo}
          alt="Maab Logo"
          className="w-24 h-auto object-contain mx-auto mb-4"
        />
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSignup}>
          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                placeholder="John"
                required
                value={signupFormData.name}
                onChange={handleNameChange}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="surname">Surname</FieldLabel>
              <Input
                id="surname"
                placeholder="Doe"
                required
                value={signupFormData.surname}
                onChange={handleSurnameChange}
              />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={signupFormData.email}
                onChange={handleEmailChange}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
              <Input
                id="phone"
                type="tel"
                placeholder="+998901234567"
                required
                value={signupFormData.phoneNumber}
                onChange={handlePhoneChange}
              />
            </Field>

            <Field>
              <FieldLabel>Date of Birth</FieldLabel>
              <Input
                type="date"
                value={signupFormData.dateOfBirth}
                onChange={handleDateOfBirthChange}
              />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                required
                value={signupFormData.password}
                onChange={handlePasswordChange}
              />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={signupFormData.confirmPassword}
                onChange={handleConfirmPasswordChange}
              />
            </Field>

            <Field>
              <FieldLabel>Region</FieldLabel>
              <Select
                value={signupFormData.region}
                onValueChange={handleRegionChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a region">
                    {selectedRegion?.name || "Select a region"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {regions.map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>District</FieldLabel>
              <Select
                value={signupFormData.district}
                onValueChange={handleDistrictChange}
                disabled={!selectedRegion}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a district">
                    {selectedDistrict?.name || "Select a district"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {filteredDistricts.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <FieldGroup className="md:col-span-2">
              <Field>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-blue-500 hover:underline"
                  >
                    Sign in
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
