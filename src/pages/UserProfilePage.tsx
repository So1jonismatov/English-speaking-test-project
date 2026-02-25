import { useState } from "react";
import useAuthStore from "../stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function UserProfilePage() {
  const { user, loading, updateUserProfile } = useAuthStore();

  if (loading) {
    return (
      <AuroraBackground>
        <div className="z-10 w-full h-full flex justify-center items-center pt-20 text-white">
          Loading...
        </div>
      </AuroraBackground>
    );
  }

  if (!user) {
    return (
      <AuroraBackground>
        <div className="z-10 w-full h-full flex justify-center items-center pt-20 text-white">
          Please log in to view your profile.
        </div>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground>
      <div className="z-10 w-full h-full flex justify-center items-center pt-20">
        <div className="p-8 max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">User Profile</h1>
          <UserProfileForm
            key={user.id}
            user={user}
            updateUserProfile={updateUserProfile}
          />
        </div>
      </div>
    </AuroraBackground>
  );
}

interface UserProfileFormProps {
  user: {
    id: number;
    name: string;
    surname: string;
    email: string;
    phoneNumber: string;
    region: string;
    city: string;
  };
  updateUserProfile: (data: any) => Promise<boolean>;
}

function UserProfileForm({ user, updateUserProfile }: UserProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    surname: user.surname || "",
    email: user.email || "",
    phoneNumber: user.phoneNumber || "",
    region: user.region || "",
    city: user.city || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;

    setError("");
    setSuccess("");

    try {
      const result = await updateUserProfile(formData);
      if (result) {
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
      } else {
        setError("Failed to update profile. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while updating profile. Please try again.");
      console.error(err);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name || "",
      surname: user.surname || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      region: user.region || "",
      city: user.city || "",
    });
    setError("");
    setSuccess("");
  };

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card className="shadow-gray-500 shadow-xl/30">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <Label htmlFor="surname">Surname</Label>
                <Input
                  id="surname"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your surname"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your region"
                />
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your city"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              {!isEditing ? (
                <Button
                  type="button"
                  variant="default"
                  onClick={handleEditClick}
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button type="submit">Save Changes</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
