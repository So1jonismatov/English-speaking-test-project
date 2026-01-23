import { useAuth } from "../contexts/AuthContext";

export default function UserProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">User Profile</h1>
      <div className="space-y-4">
        <div><strong>Name:</strong> {user.name} {user.surname}</div>
        <div><strong>Email:</strong> {user.email}</div>
        <div><strong>Phone:</strong> {user.phoneNumber}</div>
        <div><strong>Region:</strong> {user.region}</div>
        <div><strong>City:</strong> {user.city}</div>
        <div><strong>Role:</strong> {user.role}</div>
      </div>
    </div>
  );
}