export type GenerateRateQuoteApiBody =
  | { sentAmount: string; receivedAmount?: never }
  | { sentAmount?: never; receivedAmount: string };

export type GenerateRateQuoteApiPayload = {
  sentAmount: string;
  receivedAmount: string;
  rate: string;
  expiresAt: string;
};
