import { db } from "@/lib/db";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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
    <View className="flex-1 justify-center items-center bg-[#0a0a1a]">
      <KeyboardAvoidingView behavior="padding">
        <View className="w-[340px] bg-[#141432] rounded-2xl p-6 border border-[#2a2a5a] shadow-2xl shadow-blue-900/30">
          <View className="items-center mb-5">
            <Ionicons name="game-controller" size={48} color="#4f46e5" />
            <Text className="text-2xl font-bold text-white mt-3">
              Kames Login
            </Text>
          </View>

          {!sent ? (
            <>
              <Text className="text-[15px] text-gray-300 mb-4 text-center">
                Enter your email to receive a magic sign-in code.
              </Text>

              <View className="flex-row items-center bg-[#1e1e3f] rounded-xl px-3 mb-5 border border-[#33335a]">
                <MaterialIcons name="email" size={22} color="#888" />
                <TextInput
                  className="flex-1 h-12 px-3 text-white text-base focus:outline-none"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#777"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                  textContentType="emailAddress"
                />
              </View>

              <TouchableOpacity
                onPress={sendCode}
                disabled={!email || loading}
                activeOpacity={0.8}
                className={`rounded-xl py-3 mt-2 ${
                  !email || loading ? "bg-[#2a2a5a] opacity-60" : "bg-[#4f46e5]"
                }`}
              >
                <Text className="text-white text-center font-semibold text-[16px]">
                  {loading ? "Sending..." : "Send Code"}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text className="text-[15px] text-gray-300 text-center mb-3">
                Enter the 6-digit code sent to
              </Text>
              <Text className="text-base text-indigo-400 font-semibold mb-5 text-center">
                {email}
              </Text>

              <View className="flex-row items-center bg-[#1e1e3f] rounded-xl px-3 mb-5 border border-[#33335a]">
                <MaterialIcons name="lock" size={22} color="#888" />
                <TextInput
                  className="flex-1 h-12 px-3 text-white text-base tracking-widest text-center focus:outline-none"
                  value={code}
                  onChangeText={setCode}
                  placeholder="123456"
                  placeholderTextColor="#777"
                  keyboardType="number-pad"
                  editable={!loading}
                  textContentType="oneTimeCode"
                  maxLength={8}
                />
              </View>

              <View className="flex-row justify-between">
                <TouchableOpacity
                  onPress={signIn}
                  disabled={!code || loading}
                  activeOpacity={0.8}
                  className={`flex-1 rounded-xl py-3 ${
                    !code || loading
                      ? "bg-[#2a2a5a] opacity-60"
                      : "bg-[#4f46e5]"
                  }`}
                >
                  <Text className="text-white text-center font-semibold text-[16px]">
                    {loading ? "Signing in..." : "Sign In"}
                  </Text>
                </TouchableOpacity>

                <View className="w-4" />

                <TouchableOpacity
                  onPress={handleBack}
                  disabled={loading}
                  activeOpacity={0.8}
                  className="flex-1 bg-[#33335a] rounded-xl py-3"
                >
                  <Text className="text-white text-center font-semibold text-[16px]">
                    Back
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {!!error && (
            <Text className="text-red-400 mt-4 text-center text-[14px]">
              {error}
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;
