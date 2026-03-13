export interface OrderItemInput {
  id: string;
  quantity: number;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function normalizeOrderItems(input: unknown): OrderItemInput[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const totals = new Map<string, number>();

  for (const item of input) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const id = typeof (item as { id?: unknown }).id === "string"
      ? (item as { id: string }).id.trim()
      : "";
    const rawQuantity = Number((item as { quantity?: unknown }).quantity);
    const quantity = Number.isFinite(rawQuantity) && rawQuantity > 0
      ? Math.floor(rawQuantity)
      : 1;

    if (!id) {
      continue;
    }

    totals.set(id, (totals.get(id) ?? 0) + quantity);
  }

  return [...totals.entries()].map(([id, quantity]) => ({ id, quantity }));
}

export function parseOrderItemsFromMetadata(
  metadata: Record<string, string | null | undefined> | null | undefined
): OrderItemInput[] {
  const payload = metadata?.itemsPayload;

  if (payload) {
    try {
      const parsed = JSON.parse(payload);
      const items = normalizeOrderItems(parsed);
      if (items.length > 0) {
        return items;
      }
    } catch {
      // Fall back to the legacy comma-separated metadata format.
    }
  }

  const ids = (metadata?.productIds || metadata?.productId || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return normalizeOrderItems(ids.map((id) => ({ id, quantity: 1 })));
}

export function sanitizeSameOriginUrl(rawUrl: string | null | undefined, origin: string): string {
  if (!rawUrl) {
    return `${origin}/stylist`;
  }

  try {
    const parsed = new URL(rawUrl, origin);
    if (parsed.origin !== origin) {
      return `${origin}/stylist`;
    }

    return parsed.toString();
  } catch {
    return `${origin}/stylist`;
  }
}
