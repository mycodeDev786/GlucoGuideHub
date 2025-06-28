// app/components/AuthSync.jsx
"use client";

import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useDispatch } from "react-redux";
import { setUser } from "../store/authSlice";
import { app } from "../lib/firebaseConfig";

export default function AuthSync() {
  const dispatch = useDispatch();

  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(
          setUser({
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: user.displayName,
            photoURL: user.photoURL,
            metadata: {
              creationTime: user.metadata.creationTime,
              lastSignInTime: user.metadata.lastSignInTime,
            },
          })
        );
      } else {
        dispatch(setUser(null));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return null;
}
