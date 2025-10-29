// components/ErrorBoundary.tsx
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type State = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  State
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, info);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <View className="flex-1 justify-center items-center bg-black px-6">
          <Text className="text-red-400 text-lg font-bold mb-3 text-center">
            Something went wrong
          </Text>
          <Text className="text-gray-300 text-sm mb-4 text-center">
            {this.state.error.message}
          </Text>
          <TouchableOpacity
            onPress={this.reset}
            className="bg-indigo-600 px-4 py-2 rounded-xl"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
