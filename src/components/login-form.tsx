// src/components/LoginForm.jsx
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link } from "react-router";
import maabLogo from "@/assets/maab_logo.png";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthForm } from "@/hooks/useAuthForm";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    loginFormData,
    setLoginFormData,
    error,
    handleLogin,
    isLoading
  } = useAuthForm();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginFormData({ ...loginFormData, email: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginFormData({ ...loginFormData, password: e.target.value });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="items-center">
          <img
            src={maabLogo}
            alt="Maab Logo"
            className="w-24 h-auto object-contain mx-auto mb-4"
          />
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <FieldGroup>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={loginFormData.email}
                  onChange={handleEmailChange}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  required
                  value={loginFormData.password}
                  onChange={handlePasswordChange}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                <div className="text-center mt-2">
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-blue-500 hover:underline"
                  >
                    Sign up
                  </Link>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}