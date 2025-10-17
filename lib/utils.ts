export const getNameFromEmail = (email: string): string => {
  if (!email || !email.includes("@")) return "User";

  const username = email.split("@")[0]; // part before @
  const parts = username.split(/[._-]/).filter(Boolean);

  if (parts.length === 0) return "User";

  // Capitalize each part
  const name = parts
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return name;
};
