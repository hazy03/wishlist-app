from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, HttpUrl
import httpx
from bs4 import BeautifulSoup
import re
from decimal import Decimal

router = APIRouter()


class AutofillRequest(BaseModel):
    url: str


class AutofillResponse(BaseModel):
    title: str | None = None
    image_url: str | None = None
    price: Decimal | None = None


@router.post("", response_model=AutofillResponse)
async def autofill_product(request: AutofillRequest):
    """Extract product information from a URL."""
    url = request.url
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            response = await client.get(url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            })
            response.raise_for_status()
            html = response.text
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            detail="Request timeout. Please try again."
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to fetch URL: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid URL or unable to process: {str(e)}"
        )
    
    soup = BeautifulSoup(html, "lxml")
    
    # Extract title
    title = None
    og_title = soup.find("meta", property="og:title")
    if og_title and og_title.get("content"):
        title = og_title["content"].strip()
    else:
        title_tag = soup.find("title")
        if title_tag:
            title = title_tag.get_text().strip()
    
    # Extract image
    image_url = None
    og_image = soup.find("meta", property="og:image")
    if og_image and og_image.get("content"):
        image_url = og_image["content"].strip()
        # Make absolute URL if relative
        if image_url.startswith("//"):
            image_url = "https:" + image_url
        elif image_url.startswith("/"):
            from urllib.parse import urljoin
            image_url = urljoin(url, image_url)
    
    # Extract price - try multiple methods
    price = None
    
    # Method 1: Open Graph price
    og_price = soup.find("meta", property="og:price:amount")
    if og_price and og_price.get("content"):
        try:
            price = Decimal(og_price["content"].strip())
        except:
            pass
    
    # Method 2: Product schema JSON-LD
    if price is None:
        json_ld_scripts = soup.find_all("script", type="application/ld+json")
        for script in json_ld_scripts:
            try:
                import json
                data = json.loads(script.string)
                if isinstance(data, dict):
                    if data.get("@type") == "Product" and "offers" in data:
                        offers = data["offers"]
                        if isinstance(offers, dict) and "price" in offers:
                            price_str = str(offers["price"])
                            price = Decimal(re.sub(r'[^\d.]', '', price_str))
                            break
                        elif isinstance(offers, list) and len(offers) > 0:
                            price_str = str(offers[0].get("price", ""))
                            price = Decimal(re.sub(r'[^\d.]', '', price_str))
                            break
            except:
                continue
    
    # Method 3: Meta tags
    if price is None:
        price_meta = soup.find("meta", property="product:price:amount")
        if price_meta and price_meta.get("content"):
            try:
                price = Decimal(price_meta["content"].strip())
            except:
                pass
    
    # Method 4: Regex search in text (look for price patterns)
    if price is None:
        text = soup.get_text()
        # Look for patterns like "1,234.56 ₽" or "1234.56" or "1 234 ₽"
        price_patterns = [
            r'(\d{1,3}(?:\s?\d{3})*(?:[.,]\d{2})?)\s*[₽$€£]',
            r'[₽$€£]\s*(\d{1,3}(?:\s?\d{3})*(?:[.,]\d{2})?)',
            r'price["\']?\s*[:=]\s*["\']?(\d{1,3}(?:\s?\d{3})*(?:[.,]\d{2})?)',
        ]
        for pattern in price_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                try:
                    price_str = matches[0].replace(" ", "").replace(",", ".")
                    price = Decimal(price_str)
                    break
                except:
                    continue
    
    return AutofillResponse(
        title=title,
        image_url=image_url,
        price=price
    )

