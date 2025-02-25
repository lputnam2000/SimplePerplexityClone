"use client";
import React, { FC, useState } from "react";
import styled from "styled-components";

interface LLMResponse {
  response: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const LLMTest: FC = () => {
  const [query, setQuery] = useState("");
  const [context, setContext] = useState("");
  const [response, setResponse] = useState<LLMResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, context })
      });
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error('LLM request failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Title>LLM Test Interface</Title>
      
      <Form onSubmit={handleSubmit}>
        <Label>
          Query:
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your question..."
          />
        </Label>

        <Label>
          Context:
          <TextArea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Enter additional context..."
            rows={5}
          />
        </Label>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Processing..." : "Submit"}
        </Button>
      </Form>

      {response && (
        <ResultsSection>
          <ResponseText>{response.response}</ResponseText>
          {response.usage && (
            <MetaData>
              {response.model && <MetaItem>Model: {response.model}</MetaItem>}
              {response.usage.prompt_tokens !== undefined && (
                <MetaItem>Prompt Tokens: {response.usage.prompt_tokens}</MetaItem>
              )}
              {response.usage.completion_tokens !== undefined && (
                <MetaItem>Completion Tokens: {response.usage.completion_tokens}</MetaItem>
              )}
              {response.usage.total_tokens !== undefined && (
                <MetaItem>Total Tokens: {response.usage.total_tokens}</MetaItem>
              )}
            </MetaData>
          )}
        </ResultsSection>
      )}
    </Container>
  );
};

export default LLMTest;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background-color: #000;
  color: #fff;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 1.1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #333;
  background-color: #222;
  color: #fff;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #0070f3;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #333;
  background-color: #222;
  color: #fff;
  font-size: 1rem;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #0070f3;
  }
`;

const Button = styled.button`
  padding: 1rem;
  border: none;
  border-radius: 4px;
  background-color: #0070f3;
  color: #fff;
  font-size: 1.1rem;
  cursor: pointer;

  &:hover {
    background-color: #0051a2;
  }

  &:disabled {
    background-color: #666;
    cursor: not-allowed;
  }
`;

const ResultsSection = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #1a1a1a;
  border-radius: 8px;
`;

const ResponseText = styled.div`
  white-space: pre-wrap;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const MetaData = styled.div`
  border-top: 1px solid #333;
  padding-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const MetaItem = styled.div`
  font-size: 0.9rem;
  color: #888;
`;