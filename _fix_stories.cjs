const fs = require('fs');
let c = fs.readFileSync('src/data/landmarks.ts', 'utf8');

// Fix stories that have actual newlines instead of \n
// For lm111-lm115, the story strings span multiple lines which is invalid JS
const ids = ['lm111','lm112','lm113','lm114','lm115'];

ids.forEach(id => {
  const marker = "id: '" + id + "'";
  const idx = c.indexOf(marker);
  if (idx === -1) { console.log(id + ' NOT FOUND'); return; }
  
  // Find story: ' 
  const storyStart = c.indexOf("story: '", idx) + 8;
  
  // Find the closing quote - it's the next ' that is followed by proper structure
  // Since the story has real newlines, we need to find where it ends
  // The pattern is: story ends with ' then \n  },\n
  // We need to find the closing single quote
  let pos = storyStart;
  let depth = 0;
  while (pos < c.length) {
    // Look for the pattern: '\n  },\n which marks end of story
    if (c[pos] === "'" && c[pos+1] === '\n' && c.substring(pos+1, pos+6).match(/^\n  \},/)) {
      break;
    }
    pos++;
  }
  
  const storyContent = c.substring(storyStart, pos);
  // Replace actual newlines with \n
  const fixedContent = storyContent.replace(/\n/g, '\\n');
  
  c = c.substring(0, storyStart) + fixedContent + c.substring(pos);
  console.log(id + ' fixed: ' + storyContent.length + ' -> ' + fixedContent.length);
});

fs.writeFileSync('src/data/landmarks.ts', c);
console.log('Done');
