import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file = data.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure the uploads directory exists
    await mkdir(uploadsDir, { recursive: true });

    // Sanitize filename and add timestamp to avoid collisions
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filename = `${Date.now()}-${safeName}`;
    const filepath = path.join(uploadsDir, filename);

    // Save the file to public/uploads
    await writeFile(filepath, buffer);
    
    // Return the public URL
    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
