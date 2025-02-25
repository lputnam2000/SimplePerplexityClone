"use client";
import React, { FC } from "react";
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
  return (
    <PageContainer>
      <MainHeading>What do you want to know?</MainHeading>

      <SearchSection>
        <SearchInput placeholder="Ask anything..." />
        <SearchButton>Ask</SearchButton>
      </SearchSection>

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
const SearchSection = styled.div`
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
