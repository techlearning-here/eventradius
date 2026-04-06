from namecheap.client import Namecheap
from namecheap.errors import NamecheapError

# --- CONFIGURE THESE (lowercase keys) ---
API_USER = "your_api_user"
API_KEY = "your_api_key"
USERNAME = "your_namecheap_username"
CLIENT_IP = "your_public_ip"
# --- END CONFIG ---

def check_domain_availability(domains):
    try:
        # Use lowercase parameters
        client = Namecheap(
            api_user=API_USER,
            api_key=API_KEY,
            username=USERNAME,
            client_ip=CLIENT_IP,
        )

        result = client.domains.check(domains)
        results = result.get("DomainCheckResult", [])

        for item in results:
            domain = item["Domain"]
            available = item["Available"]
            is_premium = item.get("IsPremiumName", False)
            if is_premium:
                price = item.get("PremiumRegistrationPrice", "N/A")
                status = f"AVAILABLE (Premium, {price})"
            else:
                status = "AVAILABLE" if available else "NOT AVAILABLE"
            print(f"{domain:<30} : {status}")

    except NamecheapError as e:
        print(f"Namecheap API error: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")


if __name__ == "__main__":
    domains = [
        "eventpulse.com",
        "eventbeacon.com",
        "eventradar.com",
    ]
    check_domain_availability(domains)
