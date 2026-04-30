import os
from cashfree_pg.api_client import Cashfree
from cashfree_pg.models.create_order_request import CreateOrderRequest
from cashfree_pg.models.customer_details import CustomerDetails
from cashfree_pg.models.order_meta import OrderMeta
from dotenv import load_dotenv

load_dotenv()

class PaymentService:
    def __init__(self):
        client_id = os.getenv("CASHFREE_CLIENT_ID")
        client_secret = os.getenv("CASHFREE_CLIENT_SECRET")
        environment = os.getenv("CASHFREE_ENVIRONMENT", "SANDBOX")
        
        self.cashfree = Cashfree(
            XClientId=client_id,
            XClientSecret=client_secret,
            XEnvironment=Cashfree.SANDBOX if environment == "SANDBOX" else Cashfree.PRODUCTION
        )

    async def create_subscription_order(self, order_id: str, amount: float, customer_id: str, customer_phone: str, customer_email: str):
        """
        Creates a payment order in Cashfree.
        """
        customer_details = CustomerDetails(
            customer_id=customer_id,
            customer_phone=customer_phone,
            customer_email=customer_email
        )
        
        order_meta = OrderMeta(
            return_url=os.getenv("FRONTEND_URL", "http://localhost:3000") + "/payment/status?order_id={order_id}"
        )

        create_order_request = CreateOrderRequest(
            order_id=order_id,
            order_amount=amount,
            order_currency="INR",
            customer_details=customer_details,
            order_meta=order_meta
        )

        try:
            response = self.cashfree.PGCreateOrder(
                x_api_version="2023-08-01",
                create_order_request=create_order_request
            )
            return response.data
        except Exception as e:
            print(f"Error creating Cashfree order: {e}")
            raise e

    async def verify_payment(self, order_id: str):
        """
        Verifies the payment status for a given order_id.
        """
        try:
            response = self.cashfree.PGFetchOrder(
                x_api_version="2023-08-01",
                order_id=order_id
            )
            return response.data
        except Exception as e:
            print(f"Error fetching Cashfree order: {e}")
            raise e
