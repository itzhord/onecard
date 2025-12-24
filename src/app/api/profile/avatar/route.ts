import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/server/auth";
import { getProfile, updateProfile } from "@/lib/db";

type AvatarPayload = {
  avatarData?: string | null;
};

const MAX_DATA_URI_LENGTH = 2_000_000;
const DATA_URI_PREFIX =
  /^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,/i;

export async function POST(request: Request) {
  const session = await resolveSession();
  if (!session) {
    return unauthorized();
  }

  let payload: AvatarPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  const avatarData = (payload.avatarData ?? "").trim();

  if (!avatarData) {
    return NextResponse.json(
      { error: "avatarData is required" },
      { status: 400 },
    );
  }

  if (avatarData.length > MAX_DATA_URI_LENGTH) {
    return NextResponse.json(
      { error: "Avatar data is too large" },
      { status: 413 },
    );
  }

  if (!DATA_URI_PREFIX.test(avatarData)) {
    return NextResponse.json(
      { error: "avatarData must be a valid image data URI" },
      { status: 400 },
    );
  }

  const { error: updateError } = await updateProfile(session.user.id, {
    avatarUrl: avatarData,
  });

  if (updateError) {
    console.error("Avatar update failed:", updateError);
    return NextResponse.json(
      { error: "Failed to update avatar" },
      { status: 500 },
    );
  }

  const { data: profile, error: fetchError } = await getProfile(
    session.user.id,
  );

  if (fetchError) {
    console.error("Avatar fetch failed:", fetchError);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 },
    );
  }

  return NextResponse.json({ profile });
}

export async function DELETE() {
  const session = await resolveSession();
  if (!session) {
    return unauthorized();
  }

  const { error: updateError } = await updateProfile(session.user.id, {
    avatarUrl: null,
  });

  if (updateError) {
    console.error("Avatar delete failed:", updateError);
    return NextResponse.json(
      { error: "Failed to delete avatar" },
      { status: 500 },
    );
  }

  const { data: profile, error: fetchError } = await getProfile(
    session.user.id,
  );

  if (fetchError) {
    console.error("Avatar fetch failed:", fetchError);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 },
    );
  }

  return NextResponse.json({ profile });
}

async function resolveSession() {
  try {
    const headerList = await headers();
    return await auth.api.getSession({ headers: headerList });
  } catch (error) {
    console.error("Avatar route: unable to resolve session", error);
    return null;
  }
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
