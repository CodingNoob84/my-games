import { db } from "@/lib/db";
import { useCallback, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendCode = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await db.auth.sendMagicCode({ email });
      setSent(true);
    } catch (err: any) {
      setError(
        (err && typeof err === "object" && err.body && err.body.message) ||
          (err && typeof err === "object" && "message" in err
            ? err.message
            : "Failed to send code")
      );
    } finally {
      setLoading(false);
    }
  }, [email]);

  const signIn = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await db.auth.signInWithMagicCode({ email, code });
    } catch (err: any) {
      setError(
        (err && typeof err === "object" && err.body && err.body.message) ||
          (err && typeof err === "object" && "message" in err
            ? err.message
            : "Failed to sign in")
      );
    } finally {
      setLoading(false);
    }
  }, [email, code]);

  const handleBack = useCallback(() => {
    setSent(false);
    setCode("");
    setError("");
  }, []);

  return (
    <>
      <View className="flex-1 justify-center items-center bg-[#0b0b41]">
        <KeyboardAvoidingView behavior="padding">
          <View className="w-[340px] bg-white rounded-2xl p-6 shadow-lg items-stretch">
            {!sent ? (
              <>
                <Text className="text-2xl font-bold mb-2 text-center">
                  Sign in to Chat
                </Text>
                <Text className="text-[15px] text-[#666] mb-4 text-center">
                  Enter your email to receive a magic sign-in code.
                </Text>
                <TextInput
                  className="h-12 border border-[#ddd] rounded-xl px-4 mb-4 bg-[#f7f7fa] text-base"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                  textContentType="emailAddress"
                />
                {/* Btn Container*/}
                <View className="flex-row justify-center items-center mt-1 mb-1">
                  <TouchableOpacity
                    onPress={sendCode}
                    disabled={!email || loading}
                    className={`rounded-full px-5 py-2 items-center justify-center ${!email || loading ? "bg-gray-200 opacity-60" : "bg-[#f4511e]"}`}
                    activeOpacity={0.8}
                    accessibilityLabel="Send code"
                  >
                    <Text
                      className={`font-bold text-[16px] tracking-wide ${!email || loading ? "text-gray-400" : "text-white"}`}
                    >
                      {loading ? "Sending..." : "Send Code"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text className="text-2xl font-bold mb-2 text-center">
                  Enter the code sent to
                </Text>
                <Text className="text-base text-[#333] font-semibold mb-3 text-center">
                  {email}
                </Text>
                <TextInput
                  className="h-12 border border-[#ddd] rounded-xl px-4 mb-4 bg-[#f7f7fa] text-base"
                  value={code}
                  onChangeText={setCode}
                  placeholder="123456"
                  keyboardType="number-pad"
                  editable={!loading}
                  textContentType="oneTimeCode"
                  maxLength={8}
                />
                <View className="flex-row justify-center items-center mt-1 mb-1">
                  <TouchableOpacity
                    onPress={signIn}
                    disabled={!code || loading}
                    className={`rounded-full px-5 py-2 items-center justify-center ${!code || loading ? "bg-gray-200 opacity-60" : "bg-[#f4511e]"}`}
                    activeOpacity={0.8}
                    accessibilityLabel="Sign in"
                  >
                    <Text
                      className={`font-bold text-[16px] tracking-wide ${!code || loading ? "text-gray-400" : "text-white"}`}
                    >
                      {loading ? "Signing in..." : "Sign In"}
                    </Text>
                  </TouchableOpacity>
                  <View className="w-3" />
                  <TouchableOpacity
                    onPress={handleBack}
                    disabled={loading}
                    className={`rounded-full px-5 py-2 items-center justify-center ${loading ? "bg-gray-200 opacity-60" : "bg-[#888]"}`}
                    activeOpacity={0.8}
                    accessibilityLabel="Back"
                  >
                    <Text
                      className={`font-bold text-[16px] tracking-wide ${loading ? "text-gray-400" : "text-white"}`}
                    >
                      Back
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            {!!error && (
              <Text className="text-red-600 mt-3 text-center text-[15px]">
                {error}
              </Text>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </>
  );
};

export default LoginScreen;
