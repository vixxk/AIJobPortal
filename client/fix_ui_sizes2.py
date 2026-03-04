import re

with open('/home/vixx/Documents/JobPortal/JobPortal/client/src/pages/StudentProfile.jsx', 'r') as f:
    c = f.read()

# Change the outermost wrapper for all lists to take exactly the remaining height
# Find ALL min-h-screen occurrences and make sure they are constrained 
# instead of pushing content out of the view
c = c.replace('min-h-screen pb-20', 'h-full flex-1 pb-4')

# Reduce padding on these wrappers so they don't take up too much vertical space
c = c.replace('p-4 md:p-8', 'p-4 md:px-8 md:py-4')
c = c.replace('mb-8 pt-4', 'mb-2 pt-2')

# Form rendering wrappers
c = c.replace('<div className="flex-1 space-y-1 mt-6">', '<div className="flex-1 space-y-1 overflow-y-auto pr-1">')

# Main views list wrappers
c = c.replace('<div className="flex-1 space-y-4 mt-6">', '<div className="flex-1 space-y-2 overflow-y-auto min-h-0">')

# Resume upload area sizing
c = c.replace('p-10', 'p-6')
c = c.replace('w-16 h-16', 'w-12 h-12')
c = c.replace('w-8 h-8', 'w-6 h-6')
c = c.replace('mt-6 flex items-center', 'mt-4 flex items-center')

# Reduce margins for buttons to stick to bottom without overflowing
c = c.replace('mt-8', 'mt-4')
c = c.replace('mt-6 bg-blue', 'mt-4 bg-blue')

with open('/home/vixx/Documents/JobPortal/JobPortal/client/src/pages/StudentProfile.jsx', 'w') as f:
    f.write(c)
