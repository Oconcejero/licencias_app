const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Compilando web con Expo...');
execSync('npx expo export -p web', { stdio: 'inherit' });

const distDir = path.join(__dirname, '..', 'dist');
const assetsDir = path.join(__dirname, '..', 'assets');
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

// 3. Copiar iconos de alta resolución para PWA y Apple Touch Icon
const logoSource = path.join(assetsDir, 'logo.png');
if (fs.existsSync(logoSource)) {
  fs.copyFileSync(logoSource, path.join(distDir, 'apple-touch-icon.png'));
  fs.copyFileSync(logoSource, path.join(distDir, 'favicon.png'));
  console.log('✓ Iconos apple-touch-icon y favicon copiados a dist');
}

// 4. Actualizar index.html con PWA meta tags y apple-touch-icon
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html.replace(/\/_expo\//g, '/expo-assets/');

  const pwaMetaTags = `
    <link rel="apple-touch-icon" href="/licencias_app/apple-touch-icon.png" />
    <link rel="icon" type="image/png" href="/licencias_app/favicon.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Licencias" />
  </head>`;

  html = html.replace('</head>', pwaMetaTags);
  fs.writeFileSync(htmlPath, html);
  console.log('✓ Actualizado index.html con nuevas rutas y PWA tags');
}

console.log('🎉 Build para GitHub Pages preparado con éxito.');
