import re

with open('frontend/src/app/[locale]/page.tsx', 'r') as f:
    content = f.read()

# Hero Section
content = content.replace(
    'text-6xl md:text-8xl font-medium',
    'text-4xl sm:text-5xl md:text-8xl font-medium'
)
content = content.replace(
    'text-lg md:text-xl text-text-secondary max-w-3xl mx-auto font-light leading-relaxed',
    'text-base md:text-xl text-text-secondary max-w-3xl mx-auto font-light leading-relaxed px-4 md:px-0'
)
content = content.replace(
    '<div className="pt-8 flex flex-wrap justify-center gap-6">',
    '<div className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 w-full max-w-xs sm:max-w-none mx-auto">'
)
content = content.replace(
    'className="px-10 py-5 bg-primary text-white rounded-full font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-2xl shadow-primary/20 flex items-center gap-3"',
    'className="w-full sm:w-auto justify-center px-10 py-5 bg-primary text-white rounded-full font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-2xl shadow-primary/20 flex items-center gap-3"'
)
content = content.replace(
    'className="px-10 py-5 bg-foreground text-background rounded-full font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-2xl shadow-foreground/10 flex items-center gap-3"',
    'className="w-full sm:w-auto justify-center px-10 py-5 bg-foreground text-background rounded-full font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-2xl shadow-foreground/10 flex items-center gap-3"'
)

# Feature grid cards
content = content.replace(
    'className="p-10 rounded-[3rem] bg-surface',
    'className="p-6 md:p-10 rounded-3xl md:rounded-[3rem] bg-surface'
)

# Product section gaps
content = content.replace(
    'gap-12 group',
    'gap-8 md:gap-12 group'
)

# Product section headings
content = content.replace(
    'text-4xl md:text-5xl',
    'text-3xl md:text-5xl'
)

# Love Match container
content = content.replace(
    'relative rounded-[4rem] bg-gradient-to-br from-pink-500/10 via-surface to-pink-500/5',
    'relative rounded-3xl md:rounded-[4rem] bg-gradient-to-br from-pink-500/10 via-surface to-pink-500/5'
)
content = content.replace(
    'flex-1 relative z-10 p-10 md:p-16 flex flex-col justify-center',
    'flex-1 relative z-10 p-6 sm:p-8 md:p-16 flex flex-col justify-center'
)

# Community trust
content = content.replace(
    'text-5xl md:text-6xl font-serif',
    'text-4xl md:text-6xl font-serif'
)
content = content.replace(
    'rounded-[2rem] p-8 space-y-6',
    'rounded-3xl md:rounded-[2rem] p-6 md:p-8 space-y-6'
)

with open('frontend/src/app/[locale]/page.tsx', 'w') as f:
    f.write(content)
print("Updated successfully.")
