import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * HEADLESS MIXOLOGIST MODULE
 * 
 * Đây là module độc lập có thể chạy trên GitHub Actions hoặc bất kỳ Worker nào.
 * Nhiệm vụ: Nhận input -> Tạo ảnh -> Upload R2 -> Callback về Server chính.
 */

async function generateCover(title: string, subtext: string): Promise<Buffer> {
  const width = 600;
  const height = 900;
  
  // Logic tạo SVG (tương tự như trong mixologistService nhưng tách biệt)
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#050505" />
      <text x="300" y="450" text-anchor="middle" font-family="sans-serif" font-size="60" fill="white" font-weight="900">${title.toUpperCase()}</text>
      <text x="300" y="520" text-anchor="middle" font-family="monospace" font-size="20" fill="#ff00ff">${subtext.toUpperCase()}</text>
    </svg>
  `;

  return await sharp(Buffer.from(svg))
    .webp({ quality: 90 })
    .toBuffer();
}

async function run() {
  // Lấy dữ liệu từ Payload (khi chạy trên GitHub Actions, các biến này sẽ truyền qua env hoặc args)
  const ORDER_ID = process.env.ORDER_ID;
  const TITLE = process.env.TITLE || "Untitled";
  const SUBTEXT = process.env.SUBTEXT || "Mixologist Special";
  const CALLBACK_URL = process.env.CALLBACK_URL;
  const SECRET = process.env.CRON_SECRET;

  if (!ORDER_ID) {
    console.error("Missing ORDER_ID. Exiting.");
    process.exit(1);
  }

  console.log(`[Worker] Mixing order: ${ORDER_ID}...`);

  // 1. Tạo ảnh
  const imageBuffer = await generateCover(TITLE, SUBTEXT);

  // 2. Upload R2
  const fileName = `covers/headless_${ORDER_ID}.webp`;
  const s3 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    }
  });

  await s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    Body: imageBuffer,
    ContentType: 'image/webp'
  }));

  const resultUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
  console.log(`[Worker] Mix ready: ${resultUrl}`);

  // 3. Callback về Server chính
  if (CALLBACK_URL) {
    console.log(`[Worker] Delivering to bar: ${CALLBACK_URL}...`);
    await fetch(CALLBACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: ORDER_ID,
        resultUrl,
        secret: SECRET
      })
    });
  }

  console.log("[Worker] Done.");
}

run().catch(console.error);
