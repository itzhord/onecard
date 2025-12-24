import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/server/auth";
import { getProfile, updateProfile } from "@/lib/db";

const ALLOWED_PROFILE_FIELDS = [
  "username",
  "firstName",
  "lastName",
  "fullName",
  "bio",
  "avatarUrl",
  "phoneNumber",
  "website",
  "location",
  "company",
  "jobTitle",
] as const;

type AllowedProfileField = (typeof ALLOWED_PROFILE_FIELDS)[number];
type ProfileUpdates = Partial<Record<AllowedProfileField, string | null>>;

const REQUIRED_NON_EMPTY_FIELDS = new Set<AllowedProfileField>(["username"]);
const USERNAME_PATTERN = /^[a-z0-9._-]{3,}$/;

export async function GET() {
  const headerList = await headers();
  const session = await auth.api.getSession({ headers: headerList });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error } = await getProfile(session.user.id);

  if (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const headerList = await headers();
  const session = await auth.api.getSession({ headers: headerList });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let updates: ProfileUpdates;

  try {
    const payload = await request.json();
    updates = buildUpdates(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request body";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const { data, error } = await updateProfile(session.user.id, updates as Record<string, string | null>);

    if (error) {
      if ((error as Record<string, unknown>)?.["code"] === "23505" && updates.username) {
        return NextResponse.json({ error: "Username already in use" }, { status: 409 });
      }

      console.error("Failed to update profile:", error);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    const profile =
      data ??
      (await getProfile(session.user.id)).data;

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Unexpected error while updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

function buildUpdates(payload: unknown): ProfileUpdates {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Invalid request payload.");
  }

  const updates: ProfileUpdates = {};

  for (const field of ALLOWED_PROFILE_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(payload, field)) {
      continue;
    }

    const value = (payload as Record<string, unknown>)[field];

    if (value === undefined) {
      continue;
    }

    updates[field] = normalizeField(field, value);
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No valid profile fields provided.");
  }

  return updates;
}

function normalizeField(field: AllowedProfileField, value: unknown): string | null {
  if (value === null) {
    if (REQUIRED_NON_EMPTY_FIELDS.has(field)) {
      throw new Error(`Field "${field}" cannot be empty.`);
    }
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(`Field "${field}" must be a string or null.`);
  }

  const trimmed = value.trim();

  if (trimmed === "") {
    if (REQUIRED_NON_EMPTY_FIELDS.has(field)) {
      throw new Error(`Field "${field}" cannot be empty.`);
    }
    return null;
  }

  if (field === "username") {
    const normalized = trimmed.toLowerCase();

    if (!USERNAME_PATTERN.test(normalized)) {
      throw new Error(
        'Username must be at least 3 characters and contain only letters, numbers, ".", "-", or "_".'
      );
    }

    return normalized;
  }

  return trimmed;
}
