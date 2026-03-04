import re

with open('/home/vixx/Documents/JobPortal/JobPortal/client/src/index.css', 'r') as f:
    css = f.read()

if 'hide-scrollbar' not in css:
    hide_css = """
@layer utilities {
  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
}
"""
    css += hide_css
    with open('/home/vixx/Documents/JobPortal/JobPortal/client/src/index.css', 'w') as f:
        f.write(css)

with open('/home/vixx/Documents/JobPortal/JobPortal/client/src/pages/StudentProfile.jsx', 'r') as f:
    c = f.read()

# All instances of overflow-y-auto should also have hide-scrollbar
c = c.replace('overflow-y-auto', 'overflow-y-auto hide-scrollbar')

# The main container height should just be "h-full" instead of hardcoded vh to prevent double scrollbars on desktop
c = c.replace('lg:min-h-[calc(100vh-80px)]', 'lg:h-full')
c = c.replace('h-[calc(100vh-80px)]', 'h-full shrink-0 min-h-0')

with open('/home/vixx/Documents/JobPortal/JobPortal/client/src/pages/StudentProfile.jsx', 'w') as f:
    f.write(c)

