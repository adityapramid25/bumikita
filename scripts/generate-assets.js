const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const assetsDir = path.join(process.cwd(), 'public', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 1. logo.webp (480 x 120)
const logoSvg = `
<svg width="480" height="120" viewBox="0 0 480 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="480" height="120" rx="16" fill="#F5F2ED"/>
  <!-- Icon squircle -->
  <rect x="20" y="20" width="80" height="80" rx="22" fill="#1A4D3A"/>
  <rect x="23" y="23" width="74" height="74" rx="19" fill="#245E47"/>
  <!-- Leaf Path -->
  <path d="M60 38C60 38 78 40 78 58C78 72 64 78 50 78C50 78 42 66 44 54C46 42 60 38 60 38Z" fill="#6DB677"/>
  <path d="M52 76C52 76 56 62 68 50" stroke="#FAF8F5" stroke-width="3" stroke-linecap="round"/>
  <circle cx="70" cy="44" r="4" fill="#A3E6B1"/>

  <!-- Brand Typography -->
  <text x="120" y="68" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="42" font-weight="900" fill="#1A4D3A" letter-spacing="-1">Bumi<tspan fill="#357A59">Kita</tspan></text>
  <text x="122" y="94" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" fill="#357A59" letter-spacing="1.5">GREEN MARKET, UPCYCLE, &amp; SUSTAINABLE</text>
</svg>
`;

// 2. logo-icon.webp (512 x 512)
const logoIconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop stop-color="#1A4D3A"/>
      <stop offset="0.6" stop-color="#225D45"/>
      <stop offset="1" stop-color="#357A59"/>
    </linearGradient>
    <radialGradient id="glow" cx="256" cy="220" r="180" gradientUnits="userSpaceOnUse">
      <stop stop-color="#6DB677" stop-opacity="0.3"/>
      <stop offset="1" stop-color="#6DB677" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#bgGrad)"/>
  <circle cx="256" cy="220" r="180" fill="url(#glow)"/>
  
  <!-- Subtle inner squircle border -->
  <rect x="24" y="24" width="464" height="464" rx="104" stroke="#6DB677" stroke-width="4" stroke-opacity="0.3"/>

  <!-- Stylized Upcycle Leaf Icon -->
  <path d="M256 120C256 120 370 130 370 245C370 330 285 375 195 375C195 375 145 305 160 230C175 150 256 120 256 120Z" fill="#6DB677"/>
  <path d="M205 365C205 365 235 275 315 195" stroke="#FAF8F5" stroke-width="14" stroke-linecap="round"/>
  <circle cx="325" cy="165" r="16" fill="#FAF8F5"/>
  <circle cx="170" cy="330" r="10" fill="#357A59"/>

  <!-- Mini Pill / Dot -->
  <rect x="186" y="415" width="140" height="24" rx="12" fill="#FAF8F5" fill-opacity="0.15"/>
  <circle cx="216" cy="427" r="5" fill="#6DB677"/>
  <circle cx="256" cy="427" r="5" fill="#FAF8F5"/>
  <circle cx="296" cy="427" r="5" fill="#6DB677"/>
</svg>
`;

// 3. banner.webp (1600 x 600)
const bannerSvg = `
<svg width="1600" height="600" viewBox="0 0 1600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bannerBg" x1="0" y1="0" x2="1600" y2="600" gradientUnits="userSpaceOnUse">
      <stop stop-color="#143B2C"/>
      <stop offset="0.5" stop-color="#1D4E3B"/>
      <stop offset="1" stop-color="#28634B"/>
    </linearGradient>
    <radialGradient id="orbRight" cx="1300" cy="300" r="400" gradientUnits="userSpaceOnUse">
      <stop stop-color="#6DB677" stop-opacity="0.25"/>
      <stop offset="1" stop-color="#6DB677" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="600" fill="url(#bannerBg)"/>
  <circle cx="1300" cy="300" r="400" fill="url(#orbRight)"/>
  
  <!-- Subtle decorative rings -->
  <circle cx="1350" cy="300" r="240" stroke="#6DB677" stroke-width="2" stroke-opacity="0.2" stroke-dasharray="6 6"/>
  <circle cx="1350" cy="300" r="320" stroke="#FAF8F5" stroke-width="1.5" stroke-opacity="0.1"/>

  <!-- Left Content -->
  <rect x="100" y="110" width="320" height="40" rx="20" fill="#245E47" stroke="#6DB677" stroke-width="1.5"/>
  <circle cx="124" cy="130" r="6" fill="#6DB677"/>
  <text x="142" y="135" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#FAF8F5" letter-spacing="1">GREEN MARKET, UPCYCLE, &amp; SUSTAINABLE</text>

  <text x="100" y="230" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="900" fill="#FAF8F5" letter-spacing="-1">Ubah Sampah Jadi</text>
  <text x="100" y="305" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="900" fill="#6DB677" letter-spacing="-1">Cuan &amp; Karya Berkelanjutan.</text>
  
  <text x="100" y="375" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="500" fill="#D2E6DB" max-width="800">Scan sampah dengan AI Vision Scanner, hitung taksiran cuan, dan jual di Green Market Indonesia.</text>

  <!-- CTA mockup pills in banner -->
  <rect x="100" y="430" width="240" height="56" rx="28" fill="#6DB677"/>
  <text x="140" y="465" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="800" fill="#143B2C">Mulai Scan Sampah</text>

  <rect x="360" y="430" width="200" height="56" rx="28" fill="#FAF8F5" fill-opacity="0.15" stroke="#FAF8F5" stroke-width="1.5"/>
  <text x="400" y="465" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#FAF8F5">Jelajahi Market</text>

  <!-- Big Right Icon Motif -->
  <path d="M1350 160C1350 160 1480 170 1480 295C1480 390 1380 440 1280 440C1280 440 1230 360 1245 280C1260 190 1350 160 1350 160Z" fill="#6DB677" fill-opacity="0.85"/>
  <path d="M1295 430C1295 430 1330 330 1420 240" stroke="#FAF8F5" stroke-width="16" stroke-linecap="round"/>
</svg>
`;

// 4. og-image.webp (1200 x 630)
const ogImageSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ogBg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop stop-color="#103225"/>
      <stop offset="0.6" stop-color="#1A4D3A"/>
      <stop offset="1" stop-color="#265E47"/>
    </linearGradient>
    <radialGradient id="ogGlow" cx="950" cy="315" r="350" gradientUnits="userSpaceOnUse">
      <stop stop-color="#6DB677" stop-opacity="0.3"/>
      <stop offset="1" stop-color="#6DB677" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#ogBg)"/>
  <circle cx="950" cy="315" r="350" fill="url(#ogGlow)"/>

  <!-- Subtle outer border frame -->
  <rect x="30" y="30" width="1140" height="570" rx="32" stroke="#6DB677" stroke-width="2" stroke-opacity="0.25"/>

  <!-- Brand pill header -->
  <rect x="80" y="80" width="360" height="42" rx="21" fill="#245E47" stroke="#6DB677" stroke-width="1.5"/>
  <circle cx="106" cy="101" r="6" fill="#4ADE80"/>
  <text x="124" y="107" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#FAF8F5" letter-spacing="1">GREEN MARKET, UPCYCLE, &amp; SUSTAINABLE</text>

  <!-- Brand Title -->
  <text x="80" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="900" fill="#FAF8F5" letter-spacing="-1">Bumi<tspan fill="#6DB677">Kita</tspan></text>
  
  <text x="80" y="290" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="800" fill="#FAF8F5" letter-spacing="-0.5">Ubah Sampah Jadi Cuan &amp; Karya.</text>
  
  <text x="80" y="365" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="500" fill="#D2E6DB">Platform ekonomi sirkular berbasis AI untuk deteksi sampah, estimasi cuan,</text>
  <text x="80" y="400" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="500" fill="#D2E6DB">marketplace produk ramah lingkungan, dan aksi pelestarian bumi.</text>

  <!-- Badges footer -->
  <rect x="80" y="470" width="180" height="48" rx="16" fill="#FAF8F5" fill-opacity="0.12"/>
  <text x="110" y="500" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" fill="#FAF8F5">AI Vision Scanner</text>

  <rect x="280" y="470" width="170" height="48" rx="16" fill="#FAF8F5" fill-opacity="0.12"/>
  <text x="310" y="500" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" fill="#FAF8F5">Green Market</text>

  <rect x="470" y="470" width="170" height="48" rx="16" fill="#FAF8F5" fill-opacity="0.12"/>
  <text x="500" y="500" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" fill="#FAF8F5">Eco Rewards</text>

  <text x="80" y="565" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#6DB677">bumikita.web.id</text>

  <!-- Right Visual Logo Crest -->
  <rect x="850" y="175" width="260" height="260" rx="64" fill="#245E47" stroke="#6DB677" stroke-width="4"/>
  <path d="M980 230C980 230 1050 236 1050 305C1050 355 1000 380 945 380C945 380 915 340 925 295C935 245 980 230 980 230Z" fill="#6DB677"/>
  <path d="M950 375C950 375 970 320 1020 270" stroke="#FAF8F5" stroke-width="8" stroke-linecap="round"/>
</svg>
`;

// 5. product-placeholder.webp (600 x 600)
const productPlaceholderSvg = `
<svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="600" fill="#F5F2ED"/>
  <!-- Card background -->
  <rect x="40" y="40" width="520" height="520" rx="36" fill="#FAF8F5" stroke="#1A4D3A" stroke-width="2" stroke-opacity="0.1"/>
  
  <!-- Subtle pattern circle -->
  <circle cx="300" cy="260" r="130" fill="#EBF4EE"/>
  
  <!-- Package/Upcycle Icon -->
  <rect x="230" y="200" width="140" height="120" rx="20" fill="#357A59"/>
  <path d="M230 235L300 270L370 235" stroke="#FAF8F5" stroke-width="4" stroke-linecap="round"/>
  <path d="M300 270V320" stroke="#FAF8F5" stroke-width="4" stroke-linecap="round"/>
  <!-- Leaf accent on package -->
  <path d="M300 170C300 170 335 175 335 200C335 218 315 228 295 228C295 228 285 212 288 196C292 178 300 170 300 170Z" fill="#6DB677"/>
  
  <text x="300" y="420" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#1A4D3A">Produk Upcycle BumiKita</text>
  <text x="300" y="455" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#357A59">Green Market, Upcycle, &amp; Sustainable</text>
</svg>
`;

// 6. avatar-placeholder.webp (256 x 256)
const avatarPlaceholderSvg = `
<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="256" rx="128" fill="#E8F2ED"/>
  <circle cx="128" cy="128" r="126" stroke="#6DB677" stroke-width="4" stroke-opacity="0.4"/>
  
  <!-- Avatar head & body -->
  <circle cx="128" cy="95" r="42" fill="#1A4D3A"/>
  <path d="M60 215C60 175 90 155 128 155C166 155 196 175 196 215" fill="#1A4D3A"/>

  <!-- Leaf pin accent on avatar -->
  <path d="M165 70C165 70 185 73 185 86C185 96 174 102 162 102C162 102 156 94 158 84C160 74 165 70 165 70Z" fill="#6DB677"/>
  <circle cx="178" cy="78" r="3" fill="#FAF8F5"/>
</svg>
`;

async function buildAssets() {
  console.log('Generating WebP assets in public/assets/...');
  
  await sharp(Buffer.from(logoSvg))
    .webp({ quality: 90 })
    .toFile(path.join(assetsDir, 'logo.webp'));
  console.log('✔ Generated logo.webp');

  await sharp(Buffer.from(logoIconSvg))
    .webp({ quality: 90 })
    .toFile(path.join(assetsDir, 'logo-icon.webp'));
  console.log('✔ Generated logo-icon.webp');

  await sharp(Buffer.from(bannerSvg))
    .webp({ quality: 85 })
    .toFile(path.join(assetsDir, 'banner.webp'));
  console.log('✔ Generated banner.webp');

  await sharp(Buffer.from(ogImageSvg))
    .webp({ quality: 88 })
    .toFile(path.join(assetsDir, 'og-image.webp'));
  console.log('✔ Generated og-image.webp');

  await sharp(Buffer.from(productPlaceholderSvg))
    .webp({ quality: 85 })
    .toFile(path.join(assetsDir, 'product-placeholder.webp'));
  console.log('✔ Generated product-placeholder.webp');

  await sharp(Buffer.from(avatarPlaceholderSvg))
    .webp({ quality: 90 })
    .toFile(path.join(assetsDir, 'avatar-placeholder.webp'));
  console.log('✔ Generated avatar-placeholder.webp');

  console.log('All WebP assets generated successfully!');
}

buildAssets().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
