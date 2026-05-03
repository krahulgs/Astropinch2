import re

def add_max_tokens(filepath, max_tok):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # We look for temperature=... and if it doesn't have max_tokens after it, we add it.
    # We can just replace temperature=X with temperature=X, max_tokens=Y
    # But wait, it might be temperature=X\n
    
    # Regex to match temperature=0.X\n
    content = re.sub(r'(temperature=0\.\d)(?!,\s*max_tokens)', r'\1, max_tokens=' + str(max_tok), content)
    
    with open(filepath, 'w') as f:
        f.write(content)

add_max_tokens('backend/services/ai_service.py', 500)
add_max_tokens('backend/services/horoscope_service.py', 800)
print("Optimization complete.")
