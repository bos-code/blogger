import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../firebaseconfig";
import { useNavigate, Link } from "react-router-dom";
import { setDoc, doc, getDoc } from "firebase/firestore";

export default function Signup({ dispatch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;
      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name,
        role: "user",
      });

      dispatch({
        type: "USER_SIGNUP_SUCCESS",
        payload: {
          user: {
            uid: user.uid,
            email: user.email,
            name,
          },
          role: "user",
        },
      });

      navigate("/");
    } catch (err) {
      dispatch({
        type: "USER_SIGNUP_ERROR",
        payload: err.message,
      });
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create user document if it doesn't exist
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
        type: "USER_SIGNUP_SUCCESS",
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
        type: "USER_SIGNUP_ERROR",
        payload: error.message,
      });
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
        <button className="btn btn-primary w-full">Create Account</button>

        <div className="divider">OR</div>
        <button
          type="button"
          onClick={handleGoogleSignup}
          className="btn btn-outline w-full"
        >
          Sign up with Google
        </button>

        <p className="text-center text-sm pt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 underline hover:text-blue-700">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
