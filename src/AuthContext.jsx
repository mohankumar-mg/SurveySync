import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("auth state changed. I am from authContext!");
      setLoading(true);
      if (currentUser) {
        console.log("user is signed in!");
        // User is signed in
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          console.log("user doc exists!");
          const userData = userDoc.data();
          if (currentUser.emailVerified) {
            setUser({ uid: currentUser.uid, ...userData });
          }
        } else {
          // User document does not exist
          await firebaseSignOut(auth);
          // alert("User document not found. Please sign in again.");
          setUser(null);
        }
      } else {
        setUser(null); // No user signed in
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = () => {
    return firebaseSignOut(auth).then(() => setUser(null));
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
