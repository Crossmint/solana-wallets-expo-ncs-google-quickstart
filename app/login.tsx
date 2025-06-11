import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { useGoogle } from "../hooks/useGoogle";
import { Redirect } from "expo-router";

export default function Login() {
  const {
    login,
    isAuthenticated,
    getOrCreateCrossmintWallet,
    isLoading,
    crossmintWallet,
  } = useGoogle();

  if (isAuthenticated && crossmintWallet != null) {
    return <Redirect href="/" />;
  }

  return (
    <View style={styles.content}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/crossmint-logo.png")}
          style={styles.logo}
        />
      </View>
      <Text style={styles.title}>Solana Wallets Quickstart</Text>
      <Text style={styles.subtitle}>The easiest way to build onchain</Text>

      {isAuthenticated ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={getOrCreateCrossmintWallet}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Get or Create Wallet</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <GoogleSigninButton
          style={{ width: 212, height: 48 }}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={login}
        />
      )}

      <View style={styles.poweredByContainer}>
        <Image
          source={require("../assets/images/secured-by-crossmint.png")}
          style={styles.poweredByIcon}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  content: {
    backgroundColor: "#fff",
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: "100%",
  },
  logoContainer: {
    marginBottom: 12,
  },
  logo: {
    width: 180,
    height: 40,
    resizeMode: "contain",
  },
  title: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: 8,
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  poweredByIcon: {
    width: 400,
    height: 20,
    resizeMode: "contain",
  },
  poweredByContainer: {
    position: "absolute",
    bottom: 40,
    alignItems: "center",
  },
});
