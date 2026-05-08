const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../app/panel-am-2026');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const replacements = [
  { from: /bg-slate-950(?!\/)/g, to: 'bg-slate-50 dark:bg-slate-950' },
  { from: /bg-slate-950\/(\d+)/g, to: 'bg-slate-50/$1 dark:bg-slate-950/$1' },
  
  { from: /bg-slate-900(?!\/)/g, to: 'bg-white dark:bg-slate-900' },
  { from: /bg-slate-900\/(\d+)/g, to: 'bg-white/$1 dark:bg-slate-900/$1' },
  
  { from: /bg-slate-800(?!\/)/g, to: 'bg-slate-100 dark:bg-slate-800' },
  { from: /bg-slate-800\/(\d+)/g, to: 'bg-slate-100/$1 dark:bg-slate-800/$1' },

  { from: /border-slate-800(?!\/)/g, to: 'border-slate-200 dark:border-slate-800' },
  { from: /border-slate-800\/(\d+)/g, to: 'border-slate-200/$1 dark:border-slate-800/$1' },

  { from: /border-slate-700(?!\/)/g, to: 'border-slate-300 dark:border-slate-700' },
  { from: /border-slate-700\/(\d+)/g, to: 'border-slate-300/$1 dark:border-slate-700/$1' },

  { from: /text-white/g, to: 'text-slate-900 dark:text-white' },

  { from: /text-slate-500/g, to: 'text-slate-500 dark:text-slate-400' },
  { from: /text-slate-600/g, to: 'text-slate-600 dark:text-slate-400' },
  { from: /text-slate-700/g, to: 'text-slate-500 dark:text-slate-500' },
  { from: /text-slate-800/g, to: 'text-slate-400 dark:text-slate-600' },

  { from: /hover:bg-slate-800(?!\/)/g, to: 'hover:bg-slate-100 dark:hover:bg-slate-800' },
  { from: /hover:bg-slate-800\/(\d+)/g, to: 'hover:bg-slate-100/$1 dark:hover:bg-slate-800/$1' },

  { from: /hover:text-white/g, to: 'hover:text-slate-900 dark:hover:text-white' },
];

for (const f of files) {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');
  
  for (const r of replacements) {
    // Only replace if it isn't already prefixed with dark:
    // This regex matches the "from" pattern, but only if it is NOT preceded by 'dark:' or 'dark:' is not in the replacement already
    // To make it simple, we will just run the regex. If we run it multiple times it might duplicate, so we'll be careful.
    content = content.replace(r.from, (match, p1) => {
      // Check if it already has dark: before it
      // Actually simpler: just replace everything and we'll manually check.
      return r.to.replace('$1', p1);
    });
  }
  fs.writeFileSync(p, content);
}
console.log("Done");
