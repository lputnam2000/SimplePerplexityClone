"use client";
import React, { FC, useState } from "react";
import styled from "styled-components";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Components } from 'react-markdown';

/**
 * Home Page - Clone of the described dark-themed search interface.
 * Features:
 * - Full-screen dark background
 * - Centered heading
 * - Search bar (input + button)
 * - Information cards below
 */

interface Source {
  title: string;
  link: string;
  number: number;
}

interface SearchResults {
  answer: string;
  sources: Source[];
  isMarkdown: boolean;
}

interface ConversationEntry {
  query: string;
  results: SearchResults;
  timestamp: number;
}

const Home: FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<ConversationEntry[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          history: history.slice(-3)
        })
      });
      
      const data = await response.json();
      
      // Add new entry to history
      const newEntry: ConversationEntry = {
        query,
        results: data,
        timestamp: Date.now()
      };
      
      setResults(data);
      setHistory(prev => [...prev, newEntry]);
    } catch (error) {
      setResults(null);
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const customRenderers: Components = {
    a: ({ href, children, ...props }) => {
      const sourceMatch = children?.toString().match(/\[Source (\d+)\]/);
      if (sourceMatch && results?.sources) {
        const sourceNumber = parseInt(sourceMatch[1]) - 1;
        const source = results.sources[sourceNumber];
        if (source) {
          return (
            <SourceLink href={source.link} target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </SourceLink>
          );
        }
      }
      return <SourceLink href={href || '#'} target="_blank" rel="noopener noreferrer" {...props}>{children}</SourceLink>;
    }
  };

  return (
    <PageContainer>
      <MainHeading>What do you want to know?</MainHeading>

      <SearchSection onSubmit={handleSearch}>
        <SearchInput 
          placeholder="Ask anything..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <SearchButton type="submit" disabled={isLoading}>
          {isLoading ? "Searching..." : "Ask"}
        </SearchButton>
      </SearchSection>

      {results && (
        <ResultsSection>
          <AnswerSection>
            <ReactMarkdown
              components={customRenderers}
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {results.answer}
            </ReactMarkdown>
          </AnswerSection>
          
          {results.sources?.length > 0 && (
            <SourcesSection>
              <SourcesTitle>Sources:</SourcesTitle>
              <SourcesList>
                {results.sources.map((source, index) => (
                  <SourceItem key={index}>
                    <SourceNumber>{index + 1}.</SourceNumber>
                    <SourceLink href={source.link} target="_blank" rel="noopener noreferrer">
                      {source.title}
                    </SourceLink>
                  </SourceItem>
                ))}
              </SourcesList>
            </SourcesSection>
          )}
        </ResultsSection>
      )}

      {history.length > 0 && (
        <HistorySection>
          <HistoryTitle>Previous Questions</HistoryTitle>
          {history.map((entry, index) => (
            <HistoryEntry key={index}>
              <HistoryQuery>Q: {entry.query}</HistoryQuery>
              <HistoryAnswer>
                <ReactMarkdown
                  components={customRenderers}
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {entry.results.answer}
                </ReactMarkdown>
              </HistoryAnswer>
              <HistoryTimestamp>
                {new Date(entry.timestamp).toLocaleString()}
              </HistoryTimestamp>
            </HistoryEntry>
          ))}
        </HistorySection>
      )}

      <CardsSection>
        <InfoCard>
          <CardTitle>Introducing deep research</CardTitle>
          <CardDescription>
            Delve into advanced topics effortlessly.
          </CardDescription>
        </InfoCard>

        <InfoCard>
          <CardTitle>Microsoft Connect</CardTitle>
          <CardDescription>
            Stay connected with the latest features.
          </CardDescription>
        </InfoCard>

        <InfoCard>
          <CardTitle>Finance</CardTitle>
          <CardDescription>
            Track your stocks and portfolio in real-time.
          </CardDescription>
        </InfoCard>
      </CardsSection>
    </PageContainer>
  );
};

export default Home;

// -------------------
// Styled Components
// -------------------

/** The main page wrapper. Centers content and applies a dark background. */
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #000;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

/** The main heading text at the top. */
const MainHeading = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

/** Container for the search input and button. */
const SearchSection = styled.form`
  display: flex;
  align-items: center;
  width: 80%;
  max-width: 600px;
  margin-bottom: 2rem;
`;

/** The text input for user queries. */
const SearchInput = styled.input`
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 8px 0 0 8px;
  background-color: #222;
  color: #fff;
  font-size: 1rem;

  &:focus {
    outline: none;
  }
`;

/** The button next to the text input. */
const SearchButton = styled.button`
  padding: 14px 20px;
  border: none;
  border-radius: 0 8px 8px 0;
  background-color: #0070f3;
  color: #fff;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;

  &:hover {
    background-color: #005bb5;
  }
`;

/** The section containing all informational cards. */
const CardsSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  max-width: 80%;
`;

/** Each individual info card. */
const InfoCard = styled.div`
  background-color: #1a1a1a;
  padding: 16px;
  border-radius: 8px;
  width: 220px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

/** The title inside each info card. */
const CardTitle = styled.h2`
  font-size: 1.2rem;
  margin-bottom: 8px;
`;

/** The description text inside each info card. */
const CardDescription = styled.p`
  font-size: 0.95rem;
  color: #ccc;
`;

const ResultsSection = styled.div`
  width: 80%;
  max-width: 800px;
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: #1a1a1a;
  border-radius: 8px;
  overflow-x: auto;
`;

const AnswerSection = styled.div`
  color: #fff;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;

  /* Style markdown elements */
  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }

  ul, ol {
    margin: 1em 0;
    padding-left: 2em;
  }

  li {
    margin: 0.5em 0;
  }

  strong {
    color: #0070f3;
  }

  p {
    margin: 1em 0;
  }

  /* Math formula styles */
  .katex {
    font-size: 1.1em;
    color: #fff;
  }

  .katex-display {
    margin: 1em 0;
    overflow-x: auto;
    overflow-y: hidden;
  }
`;

const SourcesSection = styled.div`
  border-top: 1px solid #333;
  padding-top: 1rem;
  margin-top: 1rem;
`;

const SourcesTitle = styled.h3`
  color: #fff;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const SourcesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SourceItem = styled.li`
  margin: 0.5rem 0;
`;

const SourceLink = styled.a`
  color: #0070f3;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SourceNumber = styled.span`
  color: #666;
  margin-right: 0.5rem;
  min-width: 1.5rem;
  display: inline-block;
`;

const HistorySection = styled.div`
  width: 80%;
  max-width: 800px;
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: #1a1a1a;
  border-radius: 8px;
`;

const HistoryTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #fff;
`;

const HistoryEntry = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #333;
  
  &:last-child {
    border-bottom: none;
  }
`;

const HistoryQuery = styled.div`
  font-weight: bold;
  color: #0070f3;
  margin-bottom: 0.5rem;
`;

const HistoryAnswer = styled.div`
  color: #ccc;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const HistoryTimestamp = styled.div`
  color: #666;
  font-size: 0.8rem;
  text-align: right;
`;
