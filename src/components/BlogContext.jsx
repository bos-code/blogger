// src/context/BlogContext.jsx
import { useContext, createContext, useReducer, useEffect } from "react";
import { auth, db } from "../firebaseconfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const BlogContext = createContext();

const initialState = {
  displayStatus: "loading",
  role: null,
  logStatus: false,
  blogList: [],
  user: null,
  authError: null,
  questions: [],
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
        blogList: action.payload,
      };
    case "USER_SIGNUP_SUCCESS":
    case "USER_LOGIN_SUCCESS":
      return {
        ...state,
        logStatus: true,
        role: action.payload.role,
        user: action.payload.user,
        authError: null,
      };
    case "USER_SIGNOUT":
      return {
        ...state,
        logStatus: false,
        role: null,
        user: null,
      };
    case "USER_SIGNUP_ERROR":
    case "USER_LOGIN_ERROR":
      return {
        ...state,
        authError: action.payload,
      };
    default:
      throw new Error("Action unknown: " + action.type);
  }
}

function BlogProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { role, logStatus, blogList, authError, user } = state;

  // ✅ Fetch blog posts once
  useEffect(() => {
    async function fetchPosts() {
      try {
        const postSnapshot = await getDocs(collection(db, "posts"));
        const postList = postSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        dispatch({ type: "SET_BLOG_LIST", payload: postList });
        dispatch({
          type: "SET_DISPLAY_STATUS",
          payload: postList.length > 0 ? "ready" : "empty",
        });
      } catch (error) {
        console.error("Error fetching posts:", error);
        dispatch({ type: "SET_DISPLAY_STATUS", payload: "error" });
      }
    }

    fetchPosts();
  }, []);

  // ✅ Keep user logged in after refresh
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            dispatch({
              type: "USER_LOGIN_SUCCESS",
              payload: {
                user: {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  name: userData.name || firebaseUser.displayName,
                  photoURL: userData.photoURL || firebaseUser.photoURL,
                },
                role: userData.role || "user",
              },
            });
          }
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      } else {
        dispatch({ type: "USER_SIGNOUT" });
      }
    });

    return () => unsubscribe();
  }, []);

  console.log("🔑 Current user in context:", user);

  return (
    <BlogContext.Provider
      value={{ role, logStatus, blogList, authError, user, dispatch }}
    >
      {children}
    </BlogContext.Provider>
  );
}

function useBlog() {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error("useBlog must be used within a BlogProvider");
  }
  return context;
}

export { BlogProvider, useBlog };
