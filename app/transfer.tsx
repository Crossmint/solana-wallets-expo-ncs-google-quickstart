import { useCrossmint, useWallet } from "@crossmint/client-sdk-react-native-ui";
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function Transfer() {
  const { crossmint } = useCrossmint();
  const loggedInUserEmail = crossmint.experimental_customAuth?.email;
  const { wallet, sendEmailWithOtp, verifyOtp, needsAuth } = useWallet();
  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [selectedToken, setSelectedToken] = useState<"SOL" | "USDC">("SOL");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<
    "sending_otp" | "verifying_otp" | "transferring" | null
  >(null);
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
  const [otp, setOtp] = useState("");
  const [isInOtpFlow, setIsInOtpFlow] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);

  useEffect(() => {
    if (needsAuth && txHash == null) {
      setIsInOtpFlow(true);
    }
  }, [needsAuth, txHash]);

  const handleSendOtpEmail = async () => {
    if (typeof loggedInUserEmail !== "string" || sendEmailWithOtp == null) {
      Alert.alert("Error", "User email is not available.");
      return;
    }
    setIsInOtpFlow(true);

    try {
      setLoadingStatus("sending_otp");
      await sendEmailWithOtp();
      setIsOtpSent(true);
    } catch (e: any) {
      Alert.alert(
        "Error sending OTP",
        e.message || "An unexpected error occurred."
      );
    } finally {
      setLoadingStatus(null);
    }
  };

  const handleVerifyOtpInput = async () => {
    if (!otp || !verifyOtp) {
      Alert.alert(
        "Error",
        "Please enter the OTP and ensure email signer is available."
      );
      return;
    }
    try {
      setLoadingStatus("verifying_otp");
      await verifyOtp(otp);
      setOtp("");
      setLoadingStatus("transferring");
      setIsInOtpFlow(false);
    } catch (e: any) {
      setLoadingStatus(null);
      Alert.alert(
        "Error verifying OTP",
        e.message || "An unexpected error occurred."
      );
    }
  };

  const transferTokens = useCallback(async () => {
    if (wallet == null) {
      return;
    }

    try {
      setLoadingStatus("transferring");
      const hash = await wallet.send(recipientAddress, selectedToken, amount);
      if (hash) {
        setTxHash(hash);
        setAmount("");
        setRecipientAddress("");
      }
    } catch (error) {
      Alert.alert("Transfer Failed", `${error}`);
    } finally {
      setLoadingStatus(null);
    }
  }, [wallet, selectedToken, recipientAddress, amount]);

  return (
    <KeyboardAwareScrollView
      ref={scrollViewRef}
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      extraScrollHeight={20}
    >
      <Text style={styles.sectionTitle}>Transfer funds</Text>
      <Text style={styles.sectionSubtitle}>Send funds to another wallet</Text>

      {isInOtpFlow ? (
        <View style={styles.formSection}>
          {!isOtpSent ? (
            <>
              <Text style={[styles.sectionSubtitle, { color: "#b8860b" }]}>
                Authentication required to transfer
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={handleSendOtpEmail}
                disabled={loadingStatus === "sending_otp"}
              >
                {loadingStatus === "sending_otp" ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Send OTP to Email</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.sectionSubtitle}>
                Verification code sent to{" "}
                <Text style={{ fontWeight: "bold" }}>{loggedInUserEmail}</Text>
              </Text>
              <Text style={styles.formLabel}>Enter OTP</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
              />
              <TouchableOpacity
                style={[styles.button, !otp && styles.buttonDisabled]}
                onPress={handleVerifyOtpInput}
                disabled={!otp || loadingStatus === "verifying_otp"}
              >
                {loadingStatus === "verifying_otp" ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSendOtpEmail}>
                <Text style={styles.textButton}>Resend OTP</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : (
        <>
          {txHash && (
            <View style={styles.successMessage}>
              <Text style={styles.successText}>Transfer successful!</Text>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    `https://solscan.io/tx/${txHash}?cluster=devnet`
                  )
                }
              >
                <Text style={styles.signatureText}>View on Solscan</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setTxHash(null)}>
                <Text style={styles.dismissText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Token</Text>
            <View style={styles.tokenSelector}>
              <TouchableOpacity
                style={styles.tokenOption}
                onPress={() => setSelectedToken("USDC")}
              >
                <View style={styles.radioButton}>
                  {selectedToken === "USDC" && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text>USDC</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tokenOption}
                onPress={() => setSelectedToken("SOL")}
              >
                <View style={styles.radioButton}>
                  {selectedToken === "SOL" && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text>SOL</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.formLabel}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />

            <Text style={styles.formLabel}>Recipient wallet</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter wallet address"
              value={recipientAddress}
              onChangeText={setRecipientAddress}
            />

            <TouchableOpacity
              style={[
                styles.button,
                (!amount ||
                  !recipientAddress ||
                  loadingStatus === "transferring") &&
                  styles.buttonDisabled,
              ]}
              onPress={transferTokens}
              disabled={
                !amount || !recipientAddress || loadingStatus === "transferring"
              }
            >
              {loadingStatus === "transferring" ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Transfer</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textButton: {
    color: "#05b959",
    fontSize: 14,
    textDecorationLine: "underline",
    textAlign: "center",
    marginTop: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  formSection: {
    width: "100%",
  },
  formLabel: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  tokenSelector: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tokenOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#666",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#05b959",
  },
  successMessage: {
    backgroundColor: "#e6ffe6",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  successText: {
    color: "#008000",
    fontSize: 16,
    marginBottom: 8,
  },
  signatureText: {
    color: "#666",
    fontSize: 14,
    textDecorationLine: "underline",
    marginBottom: 8,
  },
  dismissText: {
    color: "#008000",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: "#05b959",
    borderRadius: 8,
    width: "100%",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
});
