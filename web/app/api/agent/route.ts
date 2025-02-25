import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
  organic_results: Array<{
    title: string;
    link: string;
    snippet: string;
  }>;
  knowledge_graph?: {
    title?: string;
    description?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Step 1: Search the web using our search endpoint
    const searchResponse = await fetch(
      `${request.nextUrl.origin}/api/search?q=${encodeURIComponent(query)}`
    );
    const searchData = await searchResponse.json() as SearchResult;

    // Step 2: Format the search results into a context string
    let context = '';

    if (searchData.knowledge_graph?.description) {
      context += `Knowledge Graph:\n${searchData.knowledge_graph.description}\n\n`;
    }

    context += 'Search Results:\n';
    searchData.organic_results?.slice(0, 3).forEach((result, index) => {
      context += `[Source ${index + 1}] ${result.title}\n`;
      context += `${result.snippet}\n`;
      context += `URL: ${result.link}\n\n`;
    });

    // Step 3: Send the context and original query to the LLM
    const llmResponse = await fetch(`${request.nextUrl.origin}/api/llm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `Based on the search results, please answer this question: ${query}. 
                Include citations to the sources ([Source 1], [Source 2], etc.) when referencing information.`,
        context: context
      })
    });

    const llmData = await llmResponse.json();
    console.log(llmData);

    // Step 4: Return the final response
    return NextResponse.json({
      answer: llmData.response,
      sources: searchData.organic_results?.slice(0, 3).map(result => ({
        title: result.title,
        link: result.link
      }))
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}