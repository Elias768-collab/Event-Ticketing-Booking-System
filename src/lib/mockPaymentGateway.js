
export function createMockPaymentGateway() {
  return {
    async charge({ amountCents, outcome = "success" }) {
      if (!Number.isSafeInteger(amountCents) || amountCents <= 0) {
        throw new TypeError("A valid payment amount is required.");
      }

      if (!["success", "declined"].includes(outcome)) {
        throw new TypeError("Payment outcome must be success or declined.");
      }

      // Simulate an external payment provider response.
      if (outcome === "declined") {
        return {
          success: false,
          code: "PAYMENT_DECLINED",
          message: "The payment was declined.",
        };
      }

      return {
        success: true,
        transactionId: `mock-${crypto.randomUUID()}`,
        amountCents,
      };
    },
  };
}
