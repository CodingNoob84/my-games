import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

type Props = {
  markedNumbers: number[];
  limit: number;
  title?: string;
};

export const MarkedNumbersAccordion = ({
  markedNumbers,
  limit,
  title = "Marked Numbers",
}: Props) => {
  console.log("limit", limit);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View className="bg-gray-800 rounded-xl border border-gray-600 mt-2 mx-4">
      {/* Accordion Header */}
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row justify-between items-center p-3"
      >
        <View className="flex-row items-center">
          <Text className="text-white font-semibold text-base">{title}</Text>
          <View className="bg-blue-500 rounded-full px-2 py-1 ml-2">
            <Text className="text-white text-xs font-bold">
              {markedNumbers.length}
            </Text>
          </View>
        </View>

        {/* Chevron Icon */}
        <View className={`transform ${isExpanded ? "rotate-180" : "rotate-0"}`}>
          <Text className="text-white text-lg">⌄</Text>
        </View>
      </TouchableOpacity>

      {/* Accordion Content */}
      {isExpanded && (
        <View className="border-t border-gray-600">
          {markedNumbers.length > 0 ? (
            <View className="p-3">
              {/* Numbers Grid */}
              <ScrollView>
                <View className="flex-row flex-wrap">
                  {markedNumbers.map((number, index) => (
                    <View
                      key={index}
                      className="w-8 h-8 bg-red-500/40 border border-red-400 rounded-lg items-center justify-center m-1"
                    >
                      <Text className="text-white text-xs font-bold">
                        {number}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>

              {/* Summary */}
              <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-600">
                <Text className="text-gray-400 text-sm">
                  Total marked:{" "}
                  <Text className="text-white font-semibold">
                    {markedNumbers.length}
                  </Text>
                </Text>
                <Text className="text-gray-400 text-sm">
                  Remaining:{" "}
                  <Text className="text-white font-semibold">
                    {Number(limit) - Number(markedNumbers.length)}
                  </Text>
                </Text>
              </View>
            </View>
          ) : (
            <View className="p-4 items-center">
              <Text className="text-gray-400 text-sm">
                No numbers marked yet
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};
