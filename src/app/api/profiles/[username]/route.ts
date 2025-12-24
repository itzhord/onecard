import { NextResponse } from "next/server";
import { getProfileByUsername } from "@/lib/db";

export async function GET(_request: Request, context: any) {
  const params = context?.params instanceof Promise ? await context.params : context?.params ?? {};
  const rawUsername = params.username ?? "";

  if (!rawUsername || rawUsername.trim().length === 0) {
    return NextResponse.json(
      { error: "Username is required in the request path." },
      { status: 400 },
    );
  }

  const username = rawUsername.trim().toLowerCase();

  try {
    const { data: profile, error } = await getProfileByUsername(username);

    if (error) {
      console.error("Failed to look up profile:", error);
      return NextResponse.json(
        { error: "Failed to fetch profile." },
        { status: 500 },
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found." },
        { status: 404 },
      );
    }

    const publicProfile = sanitizeProfile(profile);

    return NextResponse.json({ profile: publicProfile });
  } catch (err) {
    console.error("Unexpected error while fetching profile:", err);
    return NextResponse.json(
      { error: "Failed to fetch profile." },
      { status: 500 },
    );
  }
}

type ProfileRecord = {
  username?: string | null;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  website?: string | null;
  location?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  [key: string]: unknown;
};

type PublicProfile = {
  username: string;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  website: string | null;
  location: string | null;
  company: string | null;
  jobTitle: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

function sanitizeProfile(profile: ProfileRecord): PublicProfile {
  return {
    username: safeString(profile.username),
    fullName: nullableString(profile.fullName),
    firstName: nullableString(profile.firstName),
    lastName: nullableString(profile.lastName),
    bio: nullableString(profile.bio),
    avatarUrl: nullableString(profile.avatarUrl),
    website: nullableString(profile.website),
    location: nullableString(profile.location),
    company: nullableString(profile.company),
    jobTitle: nullableString(profile.jobTitle),
    createdAt: normalizeDate(profile.createdAt),
    updatedAt: normalizeDate(profile.updatedAt),
  };
}

function safeString(value: unknown): string {
  const str = nullableString(value);
  return str ?? "";
}

function nullableString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}

function normalizeDate(value: unknown): string | null {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  return null;
}
