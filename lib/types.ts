export interface Transaction {
  date: Date;
  merchant: string;
  amount: number;
  category?: string;
  raw: string;
}

export type Frequency = "monthly" | "quarterly" | "annual" | "unknown";

export interface RecurringCharge {
  merchant: string;
  normalizedName: string;
  averageAmount: number;
  frequency: Frequency;
  occurrences: Transaction[];
  confidence: number;
}

export interface SavingsOption {
  method: string;
  new_price: number;
  savings_monthly: number;
  savings_annual: number;
  effort: "easy" | "medium" | "hard";
  link: string | null;
  affiliate: boolean;
  affiliate_id?: string;
  instructions?: string;
  negotiation_script?: string;
  note?: string;
}

export interface SubscriptionItem {
  name: string;
  aliases: string[];
  typical_price: number;
  tier: string;
  savings_options: SavingsOption[];
}

export interface SubscriptionCategory {
  label: string;
  icon: string;
  items: SubscriptionItem[];
}

export interface SubscriptionsDatabase {
  meta: {
    lastUpdated: string;
    version: string;
    totalServices: number;
    categories: string[];
  };
  categories: Record<string, SubscriptionCategory>;
}

export interface MatchedService {
  recurring: RecurringCharge;
  subscription?: SubscriptionItem;
  category?: SubscriptionCategory;
  matchConfidence: number;
}

export interface SavingsReportItem {
  service: string;
  category: string;
  currentCostMonthly: number;
  annualSavings: number;
  bestOption?: SavingsOption;
  options: SavingsOption[];
}

export interface SavingsReport {
  totalCurrentAnnual: number;
  totalPotentialSavings: number;
  items: SavingsReportItem[];
}
