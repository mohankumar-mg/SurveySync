import { auth, db } from "./firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut as firebaseSignOut
} from "firebase/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";

// Sign Up Function
export const signUp = async (username, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Send email verification
    await sendEmailVerification(user);
    console.log("Verification email sent!");

    // Store additional user information (username and isNewUser flag) in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      username: username,
      organizationsCreated: [],
      organizationsJoined: [],
    });

    console.log("user doc setted!")

    return user;
  } catch (error) {
    console.error("Error signing up:", error);
    return null;
  }
};


export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch additional user data from Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = { uid: user.uid, ...userDoc.data() };

      // Check if email is verified
      if (!user.emailVerified) {
        await firebaseSignOut(auth); // Sign out if email is not verified
        return "verify-email"; 
      }

      return userData; // Return user data for immediate update
    } else {
      console.error("user document not found");
      return null;
    }
  } catch (error) {
    console.error("Sign-In Error: ", error);
    return null;
  }
};
