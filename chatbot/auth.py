from fastapi import Request, HTTPException, Depends
from jose import jwt, jwk
import requests
import os
from dotenv import load_dotenv
load_dotenv()

CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL")
if not CLERK_JWKS_URL:
    raise ValueError("CLERK_JWKS_URL must be set")
CLERK_AUDIENCE = os.getenv("CLERK_AUDIENCE")
if not CLERK_JWKS_URL or not CLERK_AUDIENCE:
    raise ValueError("CLERK_JWKS_URL and CLERK_AUDIENCE must be set")

jwks = requests.get(CLERK_JWKS_URL).json()["keys"]


def get_public_key(kid: str):
    for key in jwks:
        if key["kid"] == kid:
            # Construct the public key using RS256 algorithm.
            public_key_obj = jwk.construct(key, algorithm="RS256")
            return public_key_obj.to_pem()
    raise HTTPException(status_code=401, detail="Invalid Key ID")


async def verify_clerk_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = auth_header.split(" ")[1]
    try:
        unverified_header = jwt.get_unverified_header(token)
        pem_public_key = get_public_key(unverified_header["kid"])

        payload = jwt.decode(
            token,
            pem_public_key,
            algorithms=["RS256"],
            audience=CLERK_AUDIENCE
        )

        return payload
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=401, detail="Token verification failed")
