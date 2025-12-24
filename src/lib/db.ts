/**
 * Database Helper Functions
 * Uses Prisma ORM for all database operations
 */

import { Prisma, type Profile } from "@prisma/client";
import { prisma } from "./prisma";

// ============= PROFILE FUNCTIONS =============

export async function createProfile(profileData: {
  userId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  website?: string;
  location?: string;
  company?: string;
  jobTitle?: string;
}) {
  try {
    const result = await prisma.profile.create({
      data: {
        ...profileData,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateProfile(
  userId: string,
  profileData: Partial<{
    username: string;
    firstName: string;
    lastName: string;
    fullName: string;
    bio: string;
    avatarUrl: string;
    phoneNumber: string;
    website: string;
    location: string;
    company: string;
    jobTitle: string;
  }>
) {
  try {
    const result = await prisma.profile.update({
      where: { userId },
      data: {
        ...profileData,
        updatedAt: new Date().toISOString(),
      },
    });
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getProfile(userId: string) {
  try {
    const result = await prisma.profile.findUnique({
      where: { userId },
    });
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getProfileByUsername(username: string) {
  try {
    const result = await prisma.profile.findUnique({
      where: { username },
    });
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function activateProfile(userId: string) {
  try {
    const result = await prisma.profile.update({
      where: { userId },
      data: { isActive: true },
    });
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deactivateProfile(userId: string) {
  try {
    const result = await prisma.profile.update({
      where: { userId },
      data: { isActive: false },
    });
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// ============= CARD FUNCTIONS =============

export async function createCard(cardData: {
  userId: string;
  cardId: string;
  cardName: string;
  cardType?: string;
  templateId?: number;
  formData?: Record<string, unknown>;
}) {
  try {
    const timestamp = new Date().toISOString();
    const result = await prisma.card.create({
      data: {
        cardId: cardData.cardId,
        cardName: cardData.cardName,
        cardType: cardData.cardType || "standard",
        templateId: cardData.templateId,
        formData: toJsonValue(cardData.formData),
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
        user: { connect: { id: cardData.userId } },
      },
    });
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateCard(
  cardId: string,
  updateData: Partial<{
    cardName: string;
    templateId: number;
    formData: Record<string, unknown>;
  }>
) {
  try {
    const normalized: Prisma.CardUpdateInput = {};
    
    if (updateData.cardName !== undefined) {
      normalized.cardName = updateData.cardName;
    }
    if (updateData.templateId !== undefined) {
      normalized.templateId = updateData.templateId;
    }
    if (updateData.formData !== undefined) {
      normalized.formData = toJsonValue(updateData.formData);
    }
    
    normalized.updatedAt = new Date().toISOString();

    const result = await prisma.card.update({
      where: { cardId },
      data: normalized,
    });
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteCard(cardId: string) {
  try {
    const result = await prisma.card.delete({
      where: { cardId },
    });
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function activateCard(cardId: string) {
  try {
    const timestamp = new Date().toISOString();
    const result = await prisma.card.update({
      where: { cardId },
      data: {
        isActive: true,
        activatedAt: timestamp,
        updatedAt: timestamp,
      },
    });
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getCardByCardId(cardId: string) {
  try {
    const result = await prisma.card.findUnique({
      where: { cardId },
    });
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getUserCards(userId: string) {
  try {
    const result = await prisma.card.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getActiveCards() {
  try {
    const result = await prisma.card.findMany({
      where: { isActive: true },
      orderBy: { activatedAt: 'desc' },
    });
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// ============= PAYMENT FUNCTIONS =============

export async function createPaymentRecord(paymentData: {
  userId: string;
  reference: string;
  amount: string;
  currency?: string;
  paymentType: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const timestamp = new Date().toISOString();
    const result = await prisma.payment.create({
      data: {
        reference: paymentData.reference,
        amount: paymentData.amount,
        currency: paymentData.currency || "NGN",
        status: "pending",
        paymentType: paymentData.paymentType,
        metadata: toJsonValue(paymentData.metadata),
        createdAt: timestamp,
        updatedAt: timestamp,
        user: { connect: { id: paymentData.userId } },
      },
    });
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updatePaymentStatus(
  reference: string,
  status: string,
  paidAt?: Date
) {
  try {
    const result = await prisma.payment.update({
      where: { reference },
      data: {
        status,
        paidAt: paidAt ? paidAt.toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      },
    });
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getPaymentByReference(reference: string) {
  try {
    const result = await prisma.payment.findUnique({
      where: { reference },
    });
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getUserPayments(userId: string) {
  try {
    const result = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getSuccessfulPayments() {
  try {
    const result = await prisma.payment.findMany({
      where: { status: "success" },
      orderBy: { paidAt: 'desc' },
    });
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// ============= SUBSCRIPTION FUNCTIONS =============

export async function getUserSubscription(userId: string) {
  try {
    const result = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (result && result.status === 'active' && result.expiryDate) {
      const now = new Date();
      const expiry = new Date(result.expiryDate);
      
      if (expiry < now) {
        // Subscription has expired, update status
        const updated = await prisma.subscription.update({
          where: { id: result.id },
          data: { status: 'expired' },
        });
        return { data: updated, error: null };
      }
    }

    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createOrUpdateSubscription(data: {
  userId: string;
  planId: string;
  planName: string;
  status: string;
  reference: string;
  amount: number;
  currency: string;
}) {
  try {
    // 1. Create payment record
    const timestamp = new Date().toISOString();
    await prisma.payment.create({
      data: {
        reference: data.reference,
        amount: String(data.amount),
        currency: data.currency,
        status: 'success',
        paymentType: 'subscription',
        paymentMethod: 'paystack',
        createdAt: timestamp,
        updatedAt: timestamp,
        user: { connect: { id: data.userId } },
      },
    });

    // 2. Upsert subscription
    const result = await prisma.subscription.upsert({
      where: { userId: data.userId },
      create: {
        user: { connect: { id: data.userId } },
        planId: data.planId,
        planName: data.planName,
        status: data.status,
        startDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        planId: data.planId,
        planName: data.planName,
        status: data.status,
        updatedAt: new Date(),
      },
    });

    return { data: result, error: null };
  } catch (error) {
    console.error('Error creating/updating subscription:', error);
    return { data: null, error };
  }
}

function toJsonValue(value?: Record<string, unknown> | null): Prisma.JsonValue | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  return value as Prisma.JsonValue;
}
