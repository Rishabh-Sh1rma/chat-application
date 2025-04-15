import { currentUser, redirectToSignIn } from "@clerk/nextjs";
import { db } from "./db";

export const initialProfile = async () => {
  const user = await currentUser();

  // Handle unauthenticated users
  if (!user) {
    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://chat-application-6g1x.onrender.com";

    return redirectToSignIn({
      returnBackUrl: `${baseUrl}/setup`, // 👈 Make sure this matches your setup page route
    });
  }

  // Check for existing profile
  const existingProfile = await db.profile.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (existingProfile) {
    return existingProfile;
  }

  // Create a new profile if one doesn't exist
  const newProfile = await db.profile.create({
    data: {
      userId: user.id,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0]?.emailAddress || "",
    },
  });

  return newProfile;
};
