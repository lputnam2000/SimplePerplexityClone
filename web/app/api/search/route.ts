import { NextRequest, NextResponse } from 'next/server';
import { getJson } from 'serpapi';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  const apiKey = process.env.SERP_API_KEY;
  
  try {
    // Convert callback-based API to Promise
    const results = await new Promise((resolve, reject) => {
      getJson({
        engine: "google",
        api_key: apiKey,
        q: query,
        location: "United States" // You can make this configurable if needed
      }, (json: any) => {
        if (json.error) {
          reject(new Error(json.error));
        } else {
          resolve(json);
        }
      });
    });

    return NextResponse.json({
      organic_results: results.organic_results,
      knowledge_graph: results.knowledge_graph,
      related_searches: results.related_searches
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}