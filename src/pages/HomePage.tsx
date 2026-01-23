import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to English Test!</h1>
      {user ? (
        <div>
          <p>Hello, {user.name} {user.surname}!</p>
          <p>You are logged in as: {user.email}</p>
          <p>Role: {user.role}</p>
        </div>
      ) : (
        <p>Please log in to access your account.</p>
      )}
    </div>
  );
}