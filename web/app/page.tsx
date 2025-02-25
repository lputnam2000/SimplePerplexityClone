"use client";
import React, { FC, useState } from "react";
import styled from "styled-components";

/**
 * Home Page - Clone of the described dark-themed search interface.
 * Features:
 * - Full-screen dark background
 * - Centered heading
 * - Search bar (input + button)
 * - Information cards below
 */
const Home: FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      setResults(null);
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
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
          <Answer>{results.answer}</Answer>
          {results.sources.length > 0 && (
            <SourcesSection>
              <SourcesTitle>Sources:</SourcesTitle>
              <SourcesList>
                {results.sources.map((source, index) => (
                  <SourceItem key={index}>
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

const Answer = styled.div`
  color: #fff;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  white-space: pre-wrap;
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
