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
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import maabLogo from "@/assets/maab_logo.png"
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Region = { id: number; name: string }
type District = { id: number; name: string; region_id: number }

export function SignupForm(props: React.ComponentProps<typeof Card>) {
  const [regions, setRegions] = useState<Region[]>([])
  const [districts, setDistricts] = useState<District[]>([])

  const [name, setName] = useState<string>("");
  const [surname, setSurname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null)

  const { signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/src/assets/regions.json")
      .then((res) => res.json())
      .then((data) => {
        setRegions(data.regions)
        setDistricts(data.districts)
      })
  }, [])

  const filteredDistricts = selectedRegion
    ? districts.filter((d) => d.region_id === selectedRegion.id)
    : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const userData = {
        name,
        surname,
        email,
        phoneNumber: phone,
        password,
        dateOfBirth,
        region,
        district,
      };

      const [success, response] = await signup(userData);

      if (success) {
        navigate("/"); // Redirect to home after successful signup
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
        <form onSubmit={handleSubmit}>
          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                placeholder="John"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="surname">Surname</FieldLabel>
              <Input
                id="surname"
                placeholder="Doe"
                required
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
              />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
              <Input
                id="phone"
                type="tel"
                placeholder="+998901234567"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel>Date of Birth</FieldLabel>
              <Input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel>Region</FieldLabel>
              <Select
                value={region}
                onValueChange={(value: string | null) => {
                  if (value !== null) {
                    setRegion(value);
                    setDistrict("");
                    setSelectedRegion(regions.find(r => r.id === Number(value)) ?? null)
                    setSelectedDistrict(null)
                  }
                }}
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
                value={district}
                onValueChange={(value: string | null) => {
                  if (value !== null) {
                    setDistrict(value);
                    setSelectedDistrict(districts.find(d => d.id === Number(value)) ?? null)
                  }
                }}
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
