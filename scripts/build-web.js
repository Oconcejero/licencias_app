const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Compilando web con Expo...');
execSync('npx expo export -p web', { stdio: 'inherit' });

const distDir = path.join(__dirname, '..', 'dist');
const oldExpoDir = path.join(distDir, '_expo');
const newExpoDir = path.join(distDir, 'expo-assets');
const htmlPath = path.join(distDir, 'index.html');
const noJekyllPath = path.join(distDir, '.nojekyll');

// 1. Crear .nojekyll
fs.writeFileSync(noJekyllPath, '');

// 2. Renombrar _expo a expo-assets para evitar bloqueos de Jekyll / GitHub
if (fs.existsSync(oldExpoDir)) {
  if (fs.existsSync(newExpoDir)) {
    fs.rmSync(newExpoDir, { recursive: true, force: true });
  }
  fs.renameSync(oldExpoDir, newExpoDir);
  console.log('✓ Renombrado _expo a expo-assets');
}

// 3. Actualizar index.html
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html.replace(/\/_expo\//g, '/expo-assets/');
  fs.writeFileSync(htmlPath, html);
  console.log('✓ Actualizado index.html con nuevas rutas');
}

console.log('🎉 Build para GitHub Pages preparado con éxito.');
