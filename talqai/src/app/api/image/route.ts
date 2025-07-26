import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error('REPLICATE_API_TOKEN is not set');
      return NextResponse.json({ error: 'Server configuration error: Missing API token' }, { status: 500 });
    }

    const formData = await request.formData();
    const image = formData.get('image');
    if (!image) {
      console.error('No image provided in form data');
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const imageSize = (image as File).size;
    console.log('Received image:', {
      name: (image as File).name,
      size: imageSize,
      type: (image as File).type,
    });

    if (imageSize > 1_000_000) {
      console.error('Image size exceeds 1MB:', imageSize);
      return NextResponse.json({ error: 'Image too large. Please upload an image under 1MB.' }, { status: 400 });
    }

    // Convert image to base64 for Replicate
    const buffer = Buffer.from(await (image as Blob).arrayBuffer());
    const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;

    // Use Replicate's BLIP model for image captioning
    const output = await replicate.run(
      'salesforce/blip:2e1dddc8621f736563f7d0710b3a4f53', // Verify this version ID
      {
        input: {
          image: base64Image,
          task: 'image_captioning',
        },
      }
    );

    const description = output || 'No description generated';
    console.log('Replicate output:', description);
    return NextResponse.json({ description });
  } catch (error: any) {
    console.error('Error in image API:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status,
    });

    if (error.status === 422) {
      return NextResponse.json(
        { error: 'Invalid or inaccessible Replicate model version. Please check the model ID or permissions.' },
        { status: 422 }
      );
    }
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Replicate quota exceeded. Please check your account limits.' },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: `Failed to process image: ${error.message}` }, { status: 500 });
  }
}