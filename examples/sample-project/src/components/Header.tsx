import React from 'react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="header">
      <h1>{title}</h1>
      <nav>
        <a href="/home">Home</a>
        <a href="/about">About Us</a>
        <a href="/contact">Contact</a>
      </nav>
    </header>
  );
};

