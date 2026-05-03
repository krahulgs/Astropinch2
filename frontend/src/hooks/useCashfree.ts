import { load } from "@cashfreepayments/cashfree-js";

export const useCashfree = () => {
    const initializePayment = async (paymentSessionId: string) => {
        try {
            const cashfree = await load({
                mode: "sandbox", // Change to "production" for live
            });

            const checkoutOptions = {
                paymentSessionId: paymentSessionId,
                redirectTarget: "_modal", // Opens in a modal
            };

            const result = await cashfree.checkout(checkoutOptions);
            
            if (result.error) {
                console.error("Payment Error:", result.error);
                return { success: false, error: result.error };
            }

            if (result.redirect) {
                console.log("Payment Redirected");
                return { success: true, redirected: true };
            }

            if (result.paymentDetails) {
                console.log("Payment Success:", result.paymentDetails);
                return { success: true, details: result.paymentDetails };
            }

            return { success: false, error: "Unknown status" };
        } catch (error) {
            console.error("Cashfree SDK initialization failed:", error);
            return { success: false, error };
        }
    };

    return { initializePayment };
};
