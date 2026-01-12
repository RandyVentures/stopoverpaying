import database from "@/data/subscriptions.json";
import type { SubscriptionsDatabase } from "@/lib/types";

export function getSubscriptionsDatabase() {
  return database as SubscriptionsDatabase;
}

export function findSubscriptionByName(name: string) {
  const db = getSubscriptionsDatabase();
  const target = name.trim().toLowerCase();
  for (const category of Object.values(db.categories)) {
    for (const item of category.items) {
      if (item.name.toLowerCase() === target) {
        return { item, category };
      }
    }
  }
  return null;
}
