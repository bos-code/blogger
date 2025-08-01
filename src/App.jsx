import { Routes, Route } from "react-router-dom";
import { Navbar } from "./Navbar";
import MouseOrb from "./components/mouseOrb";
import FooterComp from "./components/FooterComp";
import { lazy, Suspense } from "react";
import "./App.css";
import { useReducer } from "react";
import { useEffect } from "react";
import { db } from "./firebaseconfig";
import { collection, getDocs } from "firebase/firestore";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/login"));
const Signup = lazy(() => import("./pages/signup"));
const Blog = lazy(() => import("./pages/blogpage"));
const Admin = lazy(() => import("./pages/admin"));

const initialState = {
  displayStatus: "loading",
  role: null,
  logStatus: false,
  blogLIst: [],
  user: null,
  authError: null,


};

function reducer(state, action) {
  switch (action.type) {
    case "SET_QUESTIONS":
      return {
        ...state,
        questions: action.payload,
        status: "ready",
      };
    case "SET_DISPLAY_STATUS":
      return {
        ...state,
        displayStatus: action.payload,
      };
    case "SET_ROLE":
      return {
        ...state,
        role: action.payload,
      };
    case "SET_LOG_STATUS":
      return {
        ...state,
        logStatus: action.payload,
      };
    case "SET_BLOG_LIST":
      return {
        ...state,
        blogLIst: action.payload,
      };
   
case "USER_SIGNUP_SUCCESS":
  return {
    ...state,
    logStatus: true,
    role: action.payload.role,
    user: action.payload.user,
  };

case "USER_SIGNOUT":
  return {
    ...state,
    logStatus: false,
    role: null,
    user: null,
  };

case "USER_SIGNUP_ERROR":
  return {
    ...state,
    authError: action.payload,
  };
  case "USER_LOGIN_SUCCESS":
  return {
    ...state,
    logStatus: true,
    role: action.payload.role,
    user: action.payload.user,
    authError: null,
  };

case "USER_LOGIN_ERROR":
  return {
    ...state,
    authError: action.payload,
  };


    default:
      throw new Error("Action unknown");
  }
}
console.log("Initial state:", initialState);

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { displayStatus, role, logStatus, blogLIst, authError,user } = state;

  useEffect(() => {
    async function fetchPosts() {
      const postSnapshot = await getDocs(collection(db, "posts"));
      const postList = postSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      dispatch({ type: "SET_BLOG_LIST", payload: postList });
      if (postList.length > 0) {
        dispatch({ type: "SET_DISPLAY_STATUS", payload: "ready" });
      } else {
        dispatch({ type: "SET_DISPLAY_STATUS", payload: "empty" });
      }
      console.log("Posts fetched:", postList);
    }

    fetchPosts();
  }, []);

  return (
    <>
      <MouseOrb />
      <Navbar logStatus={logStatus} />

      {/* Suspense shows fallback while component loads */}
      <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login dispatch={dispatch} authError={authError} />} />
          <Route path="/signup" element={<Signup dispatch={dispatch} />} />
          <Route
            path="/blogpage"
            element={<Blog dispatch={dispatch} bloglist={blogLIst} />}
          />
          <Route path="/admin" element={<Admin dispatch={dispatch} user={user} role={role} />} />
        </Routes>
      </Suspense>

      <FooterComp />
    </>
  );
}

export default App;
