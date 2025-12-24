/**
 * Lightweight HTTP client utilities for interacting with the OneCard API routes.
 * These helpers replace the legacy Supabase client previously used on the client.
 */

const JSON_CONTENT_TYPE = "application/json";

/**
 * Custom error type for API requests.
 */
export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status ?? 500;
    this.data = data;
  }
}

/**
 * Detect if a value is an ApiError.
 */
export function isApiError(error) {
  return error instanceof ApiError;
}

/**
 * Generic fetch wrapper that automatically includes credentials, parses JSON
 * responses, and raises ApiError when the response is not OK.
 */
async function apiFetch(path, { method = "GET", body, headers } = {}) {
  if (!path) {
    throw new Error("apiFetch requires a request path");
  }

  const hasBody = body !== undefined && body !== null;
  const requestInit = {
    method,
    credentials: "include",
    headers: {
      ...(hasBody ? { "Content-Type": JSON_CONTENT_TYPE } : {}),
      ...(headers ?? {}),
    },
    body: hasBody
      ? typeof body === "string" || body instanceof FormData
        ? body
        : JSON.stringify(body)
      : undefined,
  };

  const response = await fetch(path, requestInit);

  const contentType = response.headers.get("content-type") || "";
  const parseAsJson = contentType.includes("application/json");

  let responsePayload = null;

  try {
    responsePayload = parseAsJson
      ? await response.json()
      : await response.text();
  } catch (error) {
    // Ignore JSON parse errors for empty bodies
    if (parseAsJson) {
      console.warn("Failed to parse response body as JSON", error);
    }
  }

  if (!response.ok) {
    const message =
      (responsePayload && responsePayload.error) ||
      response.statusText ||
      "Request failed";
    throw new ApiError(message, {
      status: response.status,
      data: responsePayload,
    });
  }

  return responsePayload;
}

/**
 * Fetch the authenticated user's profile.
 */
export async function getProfile() {
  return apiFetch("/api/profile");
}

/**
 * Update the authenticated user's profile.
 */
export async function updateProfile(updates) {
  if (!updates || typeof updates !== "object") {
    throw new Error("updateProfile expects an object with profile updates");
  }

  return apiFetch("/api/profile", {
    method: "PATCH",
    body: updates,
  });
}

/**
 * Fetch a public profile by username.
 */
export async function getProfileByUsername(username) {
  if (!username) {
    throw new Error("getProfileByUsername requires a username");
  }

  return apiFetch(`/api/profiles/${encodeURIComponent(username)}`);
}

/**
 * Convenience helper that returns the authenticated user metadata along with profile information.
 */
export async function getCurrentUser() {
  try {
    const { profile } = await getProfile();
    if (!profile) {
      return null;
    }

    return {
      id: profile.userId ?? profile.user_id ?? null,
      email: profile.email ?? null,
      profile,
    };
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      return null;
    }
    throw error;
  }
}

/**
 * Request a card activation for the authenticated user.
 */
export async function activateCard(cardId) {
  if (!cardId) {
    throw new Error("activateCard requires a cardId");
  }

  return apiFetch("/api/cards/activate", {
    method: "POST",
    body: { cardId },
  });
}

/**
 * Fetch card details. If the card belongs to another user, the request will be rejected.
 */
export async function getCardByCardId(cardId) {
  if (!cardId) {
    throw new Error("getCardByCardId requires a cardId");
  }

  return apiFetch(`/api/cards/${encodeURIComponent(cardId)}`);
}

/**
 * Create a payment record for the authenticated user.
 */
export async function createPaymentRecord({
  reference,
  amount,
  currency,
  paymentType,
  metadata,
}) {
  if (!reference || !amount || !paymentType) {
    throw new Error(
      "createPaymentRecord requires reference, amount, and paymentType fields",
    );
  }

  return apiFetch("/api/payments", {
    method: "POST",
    body: {
      reference,
      amount,
      currency,
      paymentType,
      metadata,
    },
  });
}

/**
 * Verify a payment with Paystack via the backend.
 */
export async function verifyPayment(reference) {
  if (!reference) {
    throw new Error("verifyPayment requires a payment reference");
  }

  return apiFetch("/api/payments/verify", {
    method: "POST",
    body: { reference },
  });
}

/**
 * Upload or replace the user's avatar using a base64 data URL.
 */
export async function uploadAvatar(avatarData) {
  if (!avatarData) {
    throw new Error("uploadAvatar requires avatar data");
  }

  return apiFetch("/api/profile/avatar", {
    method: "POST",
    body: { avatarData },
  });
}

/**
 * Remove the user's avatar.
 */
export async function removeAvatar() {
  return apiFetch("/api/profile/avatar", {
    method: "DELETE",
  });
}

/**
 * Client-side username generator used during sign-up flows.
 */
export function generateUsername(firstName = "", lastName = "") {
  const baseName = `${firstName} ${lastName}`.trim() || "user";
  const sanitized = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);

  const timestampSuffix = Date.now().toString().slice(-5);
  return `${sanitized || "user"}${timestampSuffix}`;
}

/**
 * Aggregate export to make migrating from the old Supabase helpers easier.
 */
export const api = {
  getProfile,
  updateProfile,
  getProfileByUsername,
  getCurrentUser,
  activateCard,
  getCardByCardId,
  createPaymentRecord,
  verifyPayment,
  uploadAvatar,
  removeAvatar,
  generateUsername,
};

export const supabase = api;

export default api;
