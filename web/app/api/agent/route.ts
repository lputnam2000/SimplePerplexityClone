import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
  organic_results: Array<{
    title: string;
    link: string;
    snippet: string;
    number: number;
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

    // Step 3: Send the context and original query to the LLM with improved instructions
    const llmResponse = await fetch(`${request.nextUrl.origin}/api/llm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `Based on the search results, please answer this question: ${query}
               Format your response in markdown.
               When citing sources, use markdown links with the source number, like this: [[Source 1]](source1-url)
               Make important points and section headers bold using markdown (**text**).
               Use bullet points where appropriate.
               For mathematical formulas, use these formats:
               - Inline math: $formula$
               - Block math: $$formula$$
               Write formulas directly without \\text{} commands.`,
        context: context
      })
    });

    const llmData = await llmResponse.json();
    console.log(llmData);

    // Step 4: Return the final response with markdown and linked sources
    return NextResponse.json({
      answer: llmData.response,
      sources: searchData.organic_results?.slice(0, 3).map(result => ({
        title: result.title,
        link: result.link,
        number: result.number
      })),
      isMarkdown: true
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}