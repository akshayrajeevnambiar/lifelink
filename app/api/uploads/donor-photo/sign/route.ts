import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting with Redis
    const ip = getClientIp(request.headers);
    const rateLimitResult = await rateLimit(`upload-sign:${ip}`, 5, 600); // 5 per 10 min

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Too many upload requests. Please try again later.",
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      );
    }

    // ... rest of signature generation stays the same ...

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error("Missing Cloudinary environment variables");
      return NextResponse.json(
        { ok: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const folder = body.folder || "lifelink/donors";

    const timestamp = Math.round(Date.now() / 1000);

    const uploadParams = {
      timestamp,
      folder,
    };

    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({
      ok: true,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      timestamp,
      signature,
      folder,
    });
  } catch (error) {
    console.error("Error generating Cloudinary signature:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
