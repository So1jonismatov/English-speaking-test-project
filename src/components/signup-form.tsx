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
import { Link } from "react-router"
import maabLogo from "@/assets/maab_logo.png"
import { DatePicker } from "./ui/date-picker"

type Region = { id: number; name: string }
type District = { id: number; name: string; region_id: number }
type Quarter = { id: number; name: string; district_id: number }

export function SignupForm(props: React.ComponentProps<typeof Card>) {
  const [regions, setRegions] = useState<Region[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [quarters, setQuarters] = useState<Quarter[]>([])

  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null)
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter | null>(null)

  useEffect(() => {
    fetch("/src/assets/regions.json")
      .then((res) => res.json())
      .then((data) => {
        setRegions(data.regions)
        setDistricts(data.districts)
        setQuarters(data.quarters)
      })
  }, [])

  const filteredDistricts = selectedRegion
    ? districts.filter((d) => d.region_id === selectedRegion.id)
    : []

  const filteredQuarters = selectedDistrict
    ? quarters.filter((q) => q.district_id === selectedDistrict.id)
    : []

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
        <form>
          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input id="name" placeholder="John" required />
            </Field>

            <Field>
              <FieldLabel htmlFor="surname">Surname</FieldLabel>
              <Input id="surname" placeholder="Doe" required />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </Field>

            <Field>
              <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
              <Input id="phone" type="tel" placeholder="+998901234567" required />
            </Field>

            <Field>
              <FieldLabel>Date of Birth</FieldLabel>
              <DatePicker />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" type="password" required />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel>Region</FieldLabel>
              <Select
                onValueChange={(value) => {
                  setSelectedRegion(regions.find(r => r.id === Number(value)) ?? null)
                  setSelectedDistrict(null)
                  setSelectedQuarter(null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a region">
                    {selectedRegion?.name}
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
                onValueChange={(value) => {
                  setSelectedDistrict(districts.find(d => d.id === Number(value)) ?? null)
                  setSelectedQuarter(null)
                }}
                disabled={!selectedRegion}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a district">
                    {selectedDistrict?.name}
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

            <Field className="md:col-span-2">
              <FieldLabel>Quarter</FieldLabel>
              <Select
                onValueChange={(value) =>
                  setSelectedQuarter(quarters.find(q => q.id === Number(value)) ?? null)
                }
                disabled={!selectedDistrict}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a quarter">
                    {selectedQuarter?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {filteredQuarters.map((q) => (
                    <SelectItem key={q.id} value={q.id.toString()}>
                      {q.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <FieldGroup className="md:col-span-2">
              <Field>
                <Button type="submit" className="w-full">
                  Create Account
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
