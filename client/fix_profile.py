import re

with open('/home/vixx/Documents/JobPortal/JobPortal/client/src/pages/StudentProfile.jsx', 'r') as f:
    content = f.read()

# Debug: check before doing anything
print("File length before:", len(content))

content = re.sub(
    r' *<div className="flex items-center justify-between(?: gap-4)? mb-[68] pt-4">\s*<button className="p-2(?: -ml-2)?" onClick=\{\(\) => setCurrentView\(\'MAIN\'\)\}.*?<ChevronLeft className="w-6 h-6" /></button>\s*<h2 className="text-xl font-bold">.*?</h2>\s*(?:<div className="w-10"></div>\s*)?</div>\n?',
    '', content, flags=re.DOTALL
)

print("File length after 1:", len(content))

content = re.sub(
    r' *<div className="flex items-center justify-between mb-8 pt-4">\s*<button className="p-2" onClick=\{\(\) => setCurrentView\(\'MAIN\'\)\}.*?<ChevronLeft className="w-6 h-6" /></button>\s*<h2 className="text-xl font-bold">\{title\}</h2>\s*<button className="p-2" onClick=\{\(\) => \{ setLocalItem\(\{\}\); setEditIndex\(list.length\); \}\}.*?<Plus.*?</button>\s*</div>\n?',
    '                    <div className="flex justify-end mb-4 pt-4">\n                        <button className="flex items-center gap-2 text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-xl" onClick={() => { setLocalItem({}); setEditIndex(list.length); }}><Plus className="w-5 h-5" /> Add New</button>\n                    </div>\n', content, flags=re.DOTALL
)

print("File length after 2:", len(content))

content = re.sub(
    r' *<div className="flex items-center justify-between mb-8 pt-4">\s*<button className="p-2" onClick=\{\(\) => setEditIndex\(-1\)\}.*?<ChevronLeft className="w-6 h-6" /></button>\s*<h2 className="text-xl font-bold">\{title\}</h2>\s*<button className="p-2 text-red-500" onClick=\{\(\) => deleteItemFromList\(listName\)\}.*?<Trash2.*?</button>\s*</div>\n?',
    '                <div className="flex justify-end mb-4 pt-4">\n                    <button className="flex items-center gap-2 text-red-500 font-bold bg-red-50 px-4 py-2 rounded-xl" onClick={() => deleteItemFromList(listName)}><Trash2 className="w-5 h-5" /> Delete Item</button>\n                </div>\n', content, flags=re.DOTALL
)

print("File length after 3:", len(content))

with open('/home/vixx/Documents/JobPortal/JobPortal/client/src/pages/StudentProfile.jsx', 'w') as f:
    f.write(content)
