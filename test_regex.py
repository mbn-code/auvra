import re

html_vinted = '<meta property="product:price:amount" content="150.0"/>'
html_grailed = '<meta property="product:price:amount" content="200"/>'

def get_price(html):
    match = re.search(r'<meta property="[^"]*price:amount"\s+content="([0-9\.]+)"', html)
    if match:
        return float(match.group(1))
    return None

print("Vinted:", get_price(html_vinted))
print("Grailed:", get_price(html_grailed))
