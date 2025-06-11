import {
  CrossmintProvider,
  CrossmintWalletProvider,
} from "@crossmint/client-sdk-react-native-ui";

type ProvidersProps = {
  children: React.ReactNode;
};

const apiKey = process.env.EXPO_PUBLIC_CLIENT_CROSSMINT_API_KEY as string;
if (apiKey == null || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID == null) {
  throw new Error(
    "EXPO_PUBLIC_CLIENT_CROSSMINT_API_KEY or EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is not set"
  );
}

export default function CrossmintProviders({ children }: ProvidersProps) {
  return (
    <CrossmintProvider apiKey={apiKey}>
      <CrossmintWalletProvider>{children}</CrossmintWalletProvider>
    </CrossmintProvider>
  );
}
