"use client";

import { useEffect, useState } from "react";
import {
  useCrossmint,
  useWallet as useCrossmintWallet,
} from "@crossmint/client-sdk-react-native-ui";
import {
  GoogleSignin,
  isSuccessResponse,
  User,
} from "@react-native-google-signin/google-signin";

if (
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID == null ||
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID == null
) {
  throw new Error(
    "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID or EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is not set. You can get these from the Google Cloud Console."
  );
}

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "",
});

export const useGoogle = () => {
  const {
    getOrCreateWallet,
    status: crossmintWalletStatus,
    error: crossmintWalletError,
    wallet: crossmintWallet,
  } = useCrossmintWallet();

  const { crossmint, experimental_setCustomAuth } = useCrossmint();
  const [isLoading, setIsLoading] = useState(true);
  const [googleUserInfo, setGoogleUserInfo] = useState<User | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const currentUser = GoogleSignin.getCurrentUser();
      if (currentUser != null && currentUser.idToken) {
        setGoogleUserInfo(currentUser);
        experimental_setCustomAuth({
          email: currentUser.user.email,
          jwt: currentUser.idToken,
        });
      }
      setIsLoading(false);
    };
    getCurrentUser();
  }, []);

  const getOrCreateCrossmintWallet = async () => {
    if (
      googleUserInfo == null ||
      crossmint.jwt == null ||
      googleUserInfo.user.email == null
    ) {
      return;
    }

    try {
      await getOrCreateWallet({
        chain: "solana",
        signer: { type: "email", email: googleUserInfo.user.email },
      });
    } catch (error) {
      console.error("Failed to create Crossmint wallet:", error);
    }
  };

  const login = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        setGoogleUserInfo(response.data);
        if (
          response.data &&
          response.data.idToken &&
          response.data.user.email
        ) {
          experimental_setCustomAuth({
            email: response.data.user.email,
            jwt: response.data.idToken,
          });
        }
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  const logout = async () => {
    try {
      await GoogleSignin.signOut();
      setGoogleUserInfo(null);
      experimental_setCustomAuth(undefined);
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  return {
    googleUserInfo,
    crossmintWallet,
    crossmintWalletStatus,
    crossmintWalletError,
    isLoading: crossmintWalletStatus === "in-progress" || isLoading,
    isAuthenticated: crossmint.jwt != null && googleUserInfo != null,
    getOrCreateCrossmintWallet,
    login,
    logout,
  };
};
