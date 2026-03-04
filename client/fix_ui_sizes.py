import re

with open('/home/vixx/Documents/JobPortal/JobPortal/client/src/pages/StudentProfile.jsx', 'r') as f:
    c = f.read()

# Make inputs smaller and reduce margins to fit on one screen
c = c.replace('mb-5', 'mb-3')
c = c.replace('py-3.5 px-4', 'py-2 px-3')
c = c.replace('py-4 px-4', 'py-2 px-3')
c = c.replace('text-[14px]', 'text-[13px]')
c = c.replace('mb-1.5', 'mb-1')

# Fix outer containers so they don't force min-h-screen and scroll 
# 128px = 64px topbar + 64px bottom nav roughly
c = c.replace('<div className="p-4 md:p-8 h-full flex flex-col bg-slate-50/50 min-h-screen pb-20 md:max-w-2xl md:mx-auto w-full">',
              '<div className="p-4 md:p-8 h-[calc(100dvh-140px)] flex flex-col bg-slate-50/50 md:max-w-2xl md:mx-auto w-full">')

# change mt-12 to mt-auto for buttons to stay at bottom without pushing boundaries
c = c.replace('mt-12', 'mt-auto')

# also for list/form views
c = c.replace('<div className="flex-1 mt-4 overflow-y-auto hide-scrollbar space-y-2">', 
              '<div className="flex-1 mt-2 overflow-y-auto hide-scrollbar space-y-2">')

with open('/home/vixx/Documents/JobPortal/JobPortal/client/src/pages/StudentProfile.jsx', 'w') as f:
    f.write(c)

