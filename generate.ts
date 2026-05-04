import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Standalone Storage Service for GitHub Actions
 */
const storageService = {
  async uploadFile(buffer: Buffer, fileName: string, contentType: string): Promise<string> {
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const endpoint = process.env.R2_ENDPOINT;
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL;

    if (!accessKeyId || !secretAccessKey || !endpoint || !bucketName) {
      throw new Error("R2 storage is not fully configured in environment.");
    }

    const s3 = new S3Client({
      region: "auto",
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
    });

    await s3.send(command);
    return `${publicUrl}/${fileName}`;
  }
};

async function generateAndUploadCover(title: string, subtext: string = 'Premium Liquor', bookId?: string) {
  const width = 600;
  const height = 900;

  // Truncate title
  const words = title.trim().split(/\s+/);
  const displayWords = words.slice(0, 6);
  
  // Chia 2 dòng
  const midAction = Math.ceil(displayWords.length / 2);
  const line1 = displayWords.slice(0, midAction).join(' ').toUpperCase();
  const line2 = displayWords.slice(midAction).join(' ').toUpperCase();

  // Adjust font size based on length
  const fontSize1 = line1.length > 10 ? 80 : (line1.length > 15 ? 60 : 100);
  const fontSize2 = line2.length > 10 ? 80 : (line2.length > 15 ? 60 : 100);

  // Palette màu "After-hours"
  const accents = [
    { primary: '#ff00ff', secondary: '#00ffff' }, // Cyber
    { primary: '#00ccff', secondary: '#ff0055' }, // Neon
    { primary: '#ff3300', secondary: '#ffd700' }, // Anarchy
    { primary: '#9d00ff', secondary: '#00ffa2' }, // Vibe
  ];
  const theme = accents[Math.floor(Math.random() * accents.length)];

  const slogans = [
    "MIDNIGHT EDITION",
    "PRIVATE RESERVE",
    "NOIR SERIES",
    "AFTER HOURS ONLY",
    "VELVET CLUB EXCLUSIVE"
  ];
  const slogan = slogans[Math.floor(Math.random() * slogans.length)];

  // 1. Brick wall fake
  const brickPattern = Array.from({length: 40}).map((_, i) => `
    <rect x="${(i % 10) * 60}" y="${Math.floor(i / 10) * 80}" width="60" height="80"
      fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="2"/>
    <rect x="${(i % 10) * 60 - 30}" y="${Math.floor(i / 10) * 80 + 40}" width="60" height="80"
      fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="2"/>
  `).join('');

  // 2. Hard Slice Glitches
  const glitchSlices = Array.from({length: 12}).map(() => {
    const y = Math.random() * height;
    const h = 2 + Math.random() * 5;
    const c = Math.random() > 0.5 ? theme.primary : theme.secondary;
    const offset = (Math.random() * 20) - 10;
    return `<rect x="0" y="${y}" width="${width}" height="${h}" fill="${c}" opacity="0.25" transform="translate(${offset},0)" />`;
  }).join('');

  // 3. Neon Outline Icons
  const neonIcons = `
    <g stroke-width="2" fill="none" opacity="0.5" filter="url(#iconGlow)">
      <!-- Champagne Bottle -->
      <g stroke="${theme.primary}" transform="translate(420, 80) rotate(15) scale(0.6)">
        <path d="M 60 0 L 80 0 L 80 60 L 120 120 L 120 280 L 20 280 L 20 120 L 60 60 Z"/>
        <line x1="20" y1="160" x2="120" y2="160" />
        <line x1="20" y1="240" x2="120" y2="240" />
      </g>
      
      <!-- Cocktail / Martini Glass -->
      <g stroke="${theme.secondary}" transform="translate(50, 580) rotate(-10) scale(0.7)">
        <path d="M 0 0 L 140 0 L 70 80 Z" />
        <line x1="70" y1="80" x2="70" y2="180" />
        <line x1="30" y1="180" x2="110" y2="180" />
        <circle cx="70" cy="40" r="10" />
      </g>

      <!-- Club / Spade / Card Symbol -->
      <g stroke="${theme.primary}" transform="translate(400, 650) rotate(20) scale(0.5)">
         <path d="M 50 0 C 100 0 100 50 50 100 C 0 50 0 0 50 0 Z" />
      </g>
    </g>
  `;

  const svgTemplate = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#141414" stop-opacity="1" />
          <stop offset="100%" stop-color="#050505" stop-opacity="1" />
        </radialGradient>
        
        <radialGradient id="spotlight" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="white" stop-opacity="0.1"/>
          <stop offset="100%" stop-opacity="0"/>
        </radialGradient>

        <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
          <stop offset="50%" stop-opacity="0"/>
          <stop offset="100%" stop-color="black" stop-opacity="0.8"/>
        </radialGradient>

        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur1"/>
          <feGaussianBlur stdDeviation="16" result="blur2"/>
          <feMerge>
            <feMergeNode in="blur2"/>
            <feMergeNode in="blur1"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <filter id="iconGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur1"/>
          <feGaussianBlur stdDeviation="10" result="blur2"/>
          <feMerge>
            <feMergeNode in="blur2"/>
            <feMergeNode in="blur1"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <filter id="glitchDisplacement" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="1" result="turb"/>
          <feDisplacementMap in="SourceGraphic" in2="turb" scale="10" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>

      <!-- Base Background -->
      <rect width="100%" height="100%" fill="url(#bgGrad)" />

      <!-- Brick Pattern -->
      <g opacity="0.35">
         ${brickPattern}
      </g>

      <!-- Ambient Light Bleeding -->
      <rect width="100%" height="100%" fill="${theme.primary}" opacity="0.04" />
      <rect width="100%" height="100%" fill="${theme.secondary}" opacity="0.03" />

      <!-- Neon Background Icons -->
      ${neonIcons}

      <!-- Glitch Slices -->
      <g opacity="0.8">
         ${glitchSlices}
      </g>
      
      <!-- Spotlight -->
      <rect width="100%" height="100%" fill="url(#spotlight)" />

      <!-- Identity Slogan -->
      <text x="290" y="70" text-anchor="middle" font-family="monospace" font-size="12" font-weight="900" fill="${theme.primary}" letter-spacing="10" opacity="0.9" transform="rotate(-2 290 70)">
        ${slogan}
      </text>

      <!-- THE MAIN TITLE -->
      <g filter="url(#neonGlow)" transform="skewX(-6)">
        <!-- Line 1: Chromatic layers + Displaced Core -->
        <text x="296" y="440" text-anchor="middle" font-family="sans-serif" font-size="${fontSize1}" font-weight="900" fill="${theme.primary}" opacity="0.75" letter-spacing="-3">
          ${line1}
        </text>
        <text x="304" y="440" text-anchor="middle" font-family="sans-serif" font-size="${fontSize1}" font-weight="900" fill="${theme.secondary}" opacity="0.75" letter-spacing="-3">
          ${line1}
        </text>
        <text x="298" y="440" text-anchor="middle" font-family="sans-serif" font-size="${fontSize1}" font-weight="900" fill="white" stroke="${theme.primary}" stroke-width="1" letter-spacing="-3" filter="url(#glitchDisplacement)">
          ${line1}
        </text>

        <!-- Line 2: Chromatic layers + Displaced Core -->
        <text x="296" y="550" text-anchor="middle" font-family="sans-serif" font-size="${fontSize2}" font-weight="900" fill="${theme.secondary}" opacity="0.75" letter-spacing="-3">
          ${line2}
        </text>
        <text x="304" y="550" text-anchor="middle" font-family="sans-serif" font-size="${fontSize2}" font-weight="900" fill="${theme.primary}" opacity="0.75" letter-spacing="-3">
          ${line2}
        </text>
        <text x="302" y="550" text-anchor="middle" font-family="sans-serif" font-size="${fontSize2}" font-weight="900" fill="white" stroke="${theme.secondary}" stroke-width="1" letter-spacing="-3" filter="url(#glitchDisplacement)">
          ${line2}
        </text>
      </g>

      <!-- DJ Date Strip -->
      <text x="40" y="850" font-family="monospace" font-size="10" font-weight="bold" fill="white" opacity="0.5" letter-spacing="2" transform="rotate(-90 40 850)">
        DJ VOID • 02:00 AM • UNDERGROUND
      </text>

      <!-- Signature Frame / VIP Area -->
      <g transform="rotate(-8 90 720)">
        <rect x="30" y="690" width="180" height="35" fill="none" stroke="${theme.primary}" stroke-width="2" opacity="0.8" />
        <rect x="34" y="694" width="172" height="27" fill="${theme.primary}" opacity="0.2" />
        <text x="120" y="713" text-anchor="middle" font-family="monospace" font-size="14" fill="white" font-weight="bold" letter-spacing="1">VIP ACCESS ONLY</text>
      </g>

      <!-- Bottom Subtext Box -->
      <g transform="translate(300, 810)">
         <rect x="-140" y="-25" width="280" height="50" fill="black" opacity="0.9" />
         <rect x="-140" y="-25" width="280" height="50" fill="none" stroke="${theme.secondary}" stroke-width="2" opacity="0.5" />
         <text text-anchor="middle" font-family="monospace" font-size="16" font-weight="bold" fill="white" letter-spacing="4" dy="6">
           ${subtext.toUpperCase()}
         </text>
      </g>

      <!-- Footer mature text -->
      <text x="298" y="875" text-anchor="middle" font-family="sans-serif" font-size="9" fill="white" opacity="0.4" font-weight="bold" letter-spacing="3">
        FOR MATURE AUDIENCES ONLY • PRIVATE SELECTION
      </text>

      <!-- Vignette Depth Fake -->
      <rect width="100%" height="100%" fill="url(#vignette)" pointer-events="none" />
    </svg>
  `;

  const noiseSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" opacity="0.3"/>
    </svg>
  `);

  const scratchesSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.15">
        ${Array.from({length: 40}).map(() => `
          <line x1="${Math.random()*width}" y1="${Math.random()*height}" 
                x2="${Math.random()*width}" y2="${Math.random()*height}" 
                stroke="white" stroke-width="0.5" />
        `).join('')}
      </g>
    </svg>
  `);

  const baseImage = await sharp(Buffer.from(svgTemplate)).toBuffer();
  const imageBuffer = await sharp(baseImage)
    .composite([
      { input: noiseSvg, blend: 'overlay' },
      { input: scratchesSvg, blend: 'screen' }
    ])
    .webp({ quality: 90, force: true })
    .toBuffer();

if (!bookId) {
  throw new Error("bookId is required for GitHub cover generation.");
}

const safeBookId = String(bookId).trim().replace(/[^a-zA-Z0-9_-]/g, "");

if (!safeBookId) {
  throw new Error("Invalid bookId.");
}

  const fileName = `covers/generated_${safeBookId}.webp`;  const url = await storageService.uploadFile(imageBuffer, fileName, 'image/webp');
  console.log(`::set-output name=cover_url::${url}`);
  return url;
}

// Run script
const title = process.argv[2] || "Untitled";
const subtext = process.argv[3] || "Personal Reserve";
const bookId = process.argv[4];

generateAndUploadCover(title, subtext, bookId)
  .then((url) => {
    console.log(url);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error generating cover:", err);
    process.exit(1);
  });
