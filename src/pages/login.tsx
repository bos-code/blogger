import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLogin, useGoogleSignIn } from "../hooks/useAuth";
import { useAuthStore } from "../stores/authStore";
import { useNotificationStore } from "../stores/notificationStore";

export default function Login(): JSX.Element {
  const authError = useAuthStore((state) => state.authError);
  const clearAuthError = useAuthStore((state) => state.clearAuthError);
  const showNotification = useNotificationStore((state) => state.showNotification);
  const loginMutation = useLogin();
  const googleSignInMutation = useGoogleSignIn();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    clearAuthError();
    try {
      await loginMutation.mutateAsync({ email, password });
      showNotification({
        type: "success",
        title: "Login Successful",
        message: "Welcome back! You have been logged in successfully.",
        autoClose: false,
      });
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      // Error handled in mutation
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    clearAuthError();
    try {
      await googleSignInMutation.mutateAsync();
      showNotification({
        type: "success",
        title: "Login Successful",
        message: "Welcome back! You have been logged in successfully.",
        autoClose: false,
      });
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      // Error handled in mutation
    }
  };

  return (
    <div className="flex items-center justify-center h-full ">
      <form
        className="card w-96 bg-base-100 shadow-xl p-8 space-y-4"
        onSubmit={handleLogin}
      >
        <h2 className="text-xl font-bold text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="input input-bordered w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="input input-bordered w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Logging in..." : "Login"}
        </button>

        {/* Google Sign In */}
        <div className="divider">OR</div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="btn btn-outline w-full"
          disabled={googleSignInMutation.isPending}
        >
          {googleSignInMutation.isPending
            ? "Signing in..."
            : "Sign in with Google"}
        </button>

        {authError && (
          <p className="text-red-500 text-sm text-center pt-2">{authError}</p>
        )}

        <p className="text-center text-sm pt-4">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-500 underline hover:text-blue-700"
          >
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}








