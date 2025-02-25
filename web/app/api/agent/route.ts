import { NextRequest, NextResponse } from 'next/server';
//How can I find out what the resistance of a copper wire with a diameter of 5mm and length of 13 meters would be at 30 degrees celsius
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

interface SubQuery {
  query: string;
  reason: string;
}

interface RequestBody {
  query: string;
  history?: Array<{
    query: string;
    results: {
      answer: string;
      sources: Array<{
        title: string;
        link: string;
        number: number;
      }>;
    };
    timestamp: number;
  }>;
}

async function parseJsonResponse(text: string, retryCount = 0): Promise<SubQuery[]> {
  console.log(`Attempting to parse JSON response (attempt ${retryCount + 1})`);
  try {
    // Try to find JSON content between ```json and ``` markers
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      console.log("Found JSON content within markdown code block");
      text = jsonMatch[1];
    } else {
      console.log("No markdown code block found, attempting to parse raw text");
    }
    
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      console.warn("Parsed JSON is not an array");
      throw new Error('Response is not an array');
    }
    
    const subQueries = parsed.map(item => {
      if (typeof item.query !== 'string' || typeof item.reason !== 'string') {
        console.warn("Invalid item format:", item);
        throw new Error('Invalid subquery format');
      }
      return { query: item.query, reason: item.reason };
    });

    console.log("Successfully parsed sub-queries:", subQueries);
    return subQueries;
  } catch (error) {
    console.error(`Parse error (attempt ${retryCount + 1}):`, error);
    if (retryCount >= 4) {
      console.error("Maximum retry attempts reached");
      throw new Error(`Failed to parse JSON after 4 retries: ${error}`);
    }
    console.log(`Retrying in 1 second... (attempt ${retryCount + 2})`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return parseJsonResponse(text, retryCount + 1);
  }
}

async function getSubQueries(query: string, baseUrl: string): Promise<SubQuery[]> {
  console.log("\n=== Starting Sub-Query Generation ===");
  console.log("Original query:", query);

  const response = await fetch(`${baseUrl}/api/llm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 
        `Break down this question into specific sub-queries that need to be searched to provide a complete answer. 
         Format the response as a JSON array of objects, each with 'query' and 'reason' fields.
         Example format:
         [
           {
             "query": "specific search query",
             "reason": "why this information is needed"
           }
         ]
         Question: ${query}`,
      context: ''
    })
  });

  console.log("LLM response received for sub-query generation");
  const data = await response.json();
  console.log("Raw LLM response:", data.response);
  
  const subQueries = await parseJsonResponse(data.response);
  console.log("=== Sub-Query Generation Complete ===\n");
  return subQueries;
}

async function searchForSubQuery(subQuery: SubQuery, baseUrl: string): Promise<SearchResult> {
  console.log(`\n--- Searching for: "${subQuery.query}" ---`);
  console.log("Reason:", subQuery.reason);
  
  const response = await fetch(
    `${baseUrl}/api/search?q=${encodeURIComponent(subQuery.query)}`
  );
  const results = await response.json() as SearchResult;
  
  console.log(`Found ${results.organic_results?.length || 0} results`);
  if (results.knowledge_graph?.description) {
    console.log("Knowledge graph information found");
  }
  console.log("--- Search Complete ---\n");
  
  return results;
}

export async function POST(request: NextRequest) {
  console.log("\n====== Agent Process Started ======");
  try {
    const body = await request.json() as RequestBody;
    const { query } = body;

    if (!query) {
      console.warn("Request received with no query");
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Get the base URL from the request
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    console.log("\nMain query:", query);

    // Step 1: Generate sub-queries
    console.log("\n=== Step 1: Generating Sub-Queries ===");
    const subQueries = await getSubQueries(query, baseUrl);
    console.log("Generated sub-queries:", JSON.stringify(subQueries, null, 2));

    // Step 2: Search for each sub-query
    console.log("\n=== Step 2: Searching for Each Sub-Query ===");
    let fullContext = '';
    for (const [index, subQuery] of subQueries.entries()) {
      console.log(`\nProcessing sub-query ${index + 1}/${subQueries.length}`);
      const searchData = await searchForSubQuery(subQuery, baseUrl);
      
      console.log("Building context for sub-query");
      fullContext += `Sub-question: ${subQuery.query}\n`;
      fullContext += `Reason: ${subQuery.reason}\n\n`;

      if (searchData.knowledge_graph?.description) {
        fullContext += `Knowledge Graph:\n${searchData.knowledge_graph.description}\n\n`;
      }

      fullContext += 'Search Results:\n';
      searchData.organic_results?.slice(0, 2).forEach((result, idx) => {
        fullContext += `[Source ${idx + 1}] ${result.title}\n`;
        fullContext += `${result.snippet}\n`;
        fullContext += `URL: ${result.link}\n\n`;
      });
      fullContext += '---\n\n';
    }

    // Step 3: Generate final answer
    console.log("\n=== Step 3: Generating Final Answer ===");
    console.log("Sending consolidated context to LLM");
    const llmResponse = await fetch(`${baseUrl}/api/llm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `Based on the search results for multiple sub-queries, please provide a comprehensive answer to this question: ${query}
               Format your response in markdown.
               When citing sources, use markdown links with the source number, like this: [[Source 1]](source1-url)
               Make important points and section headers bold using markdown (**text**).
               Use bullet points where appropriate.
               For mathematical formulas, use these formats:
               - Inline math: $formula$
               - Block math: $$formula$$
               Write formulas directly without \\text{} commands.
               
               Organize your response to address each sub-query's findings.`,
        context: fullContext
      })
    });

    const llmData = await llmResponse.json();
    console.log("Final answer received from LLM");

    // Step 4: Return response
    console.log("\n=== Step 4: Preparing Response ===");
    const response = {
      answer: llmData.response,
      sources: subQueries.map((sq, i) => ({
        title: `Sub-query: ${sq.query}`,
        link: '#',
        number: i + 1
      })),
      isMarkdown: true
    };
    console.log("Response prepared");
    console.log("====== Agent Process Complete ======\n");

    return NextResponse.json(response);

  } catch (error: unknown) {
    console.error("\n!!! Agent Process Error !!!");
    console.error("Error details:", error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    console.error("Returning error response:", errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}