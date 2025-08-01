import { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebaseconfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ dispatch, authError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      dispatch({
        type: "USER_LOGIN_SUCCESS",
        payload: {
          user: {
            uid: user.uid,
            email: user.email,
            name: user.displayName,
          },
          role: userData?.role || "user",
        },
      });

      navigate("/");
    } catch (err) {
      dispatch({
        type: "USER_LOGIN_ERROR",
        payload: err.message,
      });
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document exists, create if not
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: user.email,
          name: user.displayName,
          role: "user",
        });
      }

      dispatch({
        type: "USER_LOGIN_SUCCESS",
        payload: {
          user: {
            uid: user.uid,
            email: user.email,
            name: user.displayName,
          },
          role: "user",
        },
      });

      navigate("/");
    } catch (error) {
      dispatch({
        type: "USER_LOGIN_ERROR",
        payload: error.message,
      });
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
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
        <button className="btn btn-primary w-full">Login</button>

        {/* Google Sign In */}
        <div className="divider">OR</div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="btn btn-outline w-full"
        >
          Sign in with Google
        </button>

        {authError && (
          <p className="text-red-500 text-sm text-center pt-2">{authError}</p>
        )}

        <p className="text-center text-sm pt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 underline hover:text-blue-700">
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
