export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet' | 'emi' | 'corporate_card';
export type PaymentStatus = 'authorized' | 'captured' | 'refunded' | 'failed';
export type SettlementStatus = 'created' | 'processed' | 'failed' | 'reversed';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export interface CanonicalPayment {
  payment_id: string;
  order_id: string;
  settlement_id: string | null;
  amount_paise: number;
  fee_paise: number;
  tax_paise: number;
  settled_amount_paise: number;
  method: PaymentMethod;
  currency: 'INR';
  status: PaymentStatus;
  captured_at: string;
  refund_ids: string[];
}

export interface CanonicalSettlement {
  settlement_id: string;
  utr: string;
  amount_paise: number;
  fees_paise: number;
  tax_paise: number;
  status: SettlementStatus;
  created_at: string;
  settled_at: string;
}

export interface CanonicalBankTxn {
  row_index: number;
  date: string;
  narration: string;
  extracted_utr: string | null;
  deposit_paise: number | null;
  withdrawal_paise: number | null;
  closing_balance_paise: number;
  is_credit: boolean;
}

export interface CanonicalOrder {
  name: string;
  order_ref_id: string;
  financial_status: string;
  currency: 'INR';
  total_paise: number;
  refunded_amount_paise: number;
  payment_reference: string | null;
  created_at: string;
}
