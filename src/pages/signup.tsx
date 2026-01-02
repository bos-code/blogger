import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignup, useGoogleSignIn } from "../hooks/useAuth";
import { useAuthStore } from "../stores/authStore";
import { useNotificationStore } from "../stores/notificationStore";
import { CompactSpinner } from "../components/PremiumSpinner";

export default function Signup(): JSX.Element {
  const authError = useAuthStore((state) => state.authError);
  const clearAuthError = useAuthStore((state) => state.clearAuthError);
  const showNotification = useNotificationStore((state) => state.showNotification);
  const signupMutation = useSignup();
  const googleSignInMutation = useGoogleSignIn();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const navigate = useNavigate();

  const handleSignup = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    clearAuthError();
    try {
      await signupMutation.mutateAsync({ email, password, name });
      showNotification({
        type: "success",
        title: "Account Created",
        message: "Your account has been created successfully! Welcome aboard!",
        autoClose: false,
      });
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      // Error handled in mutation
    }
  };

  const handleGoogleSignup = async (): Promise<void> => {
    clearAuthError();
    try {
      await googleSignInMutation.mutateAsync();
      showNotification({
        type: "success",
        title: "Account Created",
        message: "Your account has been created successfully! Welcome aboard!",
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
    <div className="flex items-center justify-center h-screen">
      <form
        className="card w-96 bg-base-100 shadow-xl p-8 space-y-4"
        onSubmit={handleSignup}
      >
        <h2 className="text-xl font-bold text-center">Sign Up</h2>

        <input
          type="text"
          placeholder="Name"
          className="input input-bordered w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
          disabled={signupMutation.isPending}
        >
          {signupMutation.isPending ? (
            <>
              <CompactSpinner size="sm" variant="primary" />
              <span>Creating...</span>
            </>
          ) : (
            "Create Account"
          )}
        </button>

        <div className="divider">OR</div>
        <button
          type="button"
          onClick={handleGoogleSignup}
          className="btn btn-outline w-full"
          disabled={googleSignInMutation.isPending}
        >
          {googleSignInMutation.isPending ? (
            <>
              <CompactSpinner size="sm" variant="primary" />
              <span>Signing up...</span>
            </>
          ) : (
            "Sign up with Google"
          )}
        </button>

        {authError && (
          <p className="text-red-500 text-sm text-center pt-2">{authError}</p>
        )}

        <p className="text-center text-sm pt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-500 underline hover:text-blue-700"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}














