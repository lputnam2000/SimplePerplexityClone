import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log("OpenAI API Key:", process.env.OPENAI_API_KEY ? "Loaded" : "Missing");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, context } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }
    
    console.log("Query:", query);
    console.log("Context:", context);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a helpful assistant. Use the provided context to answer questions accurately." 
        },
        {
          role: "user",
          content: `Context: ${context || 'No context provided.'}\n\nQuestion: ${query}`
        }
      ]
    });

    console.log("Completion:", completion);

    return NextResponse.json({
      response: completion.choices[0].message.content,
      model: completion.model,
      usage: completion.usage,
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    console.log("Error:", errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
