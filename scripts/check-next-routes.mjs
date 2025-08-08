import fs from 'fs'
import path from 'path'

const APP_DIR = 'src/app'
const exts = ['.tsx','.ts','.jsx','.js']

function scan(dir, list=[]) {
  // Ignore non-existent directories, especially during initial setup
  if (!fs.existsSync(dir)) {
    return list;
  }
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) scan(p, list)
    else if (/(^|\/)(page|index)\.(t|j)sx?$/.test(p)) list.push(p)
  }
  return list
}

// Convert file path to route path by stripping route groups ( (xxx) ) and /page|index
function toRoute(p) {
  let rel = p.replace(/^src\/app\//,'')
  // remove file extension and /page or /index
  rel = rel.replace(/\/(page|index)\.(t|j)sx?$/, '')
  // remove route groups
  rel = rel.split('/').filter(seg => !/^\(.*\)$/.test(seg)).join('/')
  
  if (rel === '') rel = '/'
  else rel = '/' + rel
  return rel
}

const files = scan(APP_DIR)
const map = new Map()
for (const f of files) {
  const route = toRoute(f)
  if (!map.has(route)) map.set(route, [])
  map.get(route).push(f)
}

let dup = []
for (const [route, arr] of map.entries()) {
  if (arr.length > 1) dup.push({ route, files: arr })
}

if (dup.length) {
  console.error('❌ Duplicate routes detected:')
  for (const d of dup) {
    console.error(' -', d.route)
    d.files.forEach(f => console.error('    •', f))
  }
  process.exit(1)
} else {
  console.log('✅ No duplicate routes.')
}
