import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json({ error: 'Server configuration error: Missing API key' }, { status: 500 });
    }

    const body = await request.json();
    const { message } = body;
    if (!message) {
      console.error('No message provided in request body:', body);
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    console.log('Received message:', message);

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
      max_tokens: 150,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      console.error('No response from OpenAI:', completion);
      return NextResponse.json({ error: 'No response from assistant' }, { status: 500 });
    }

    console.log('OpenAI response:', response);
    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Error in assistant API:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status,
    });

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'OpenAI quota exceeded. Please check your plan and billing details.' },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: `Failed to process request: ${error.message}` }, { status: 500 });
  }
}