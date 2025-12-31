import React from 'react';
import Hero from '../components/home/Hero';
import ProjectsGrid from '../components/home/ProjectsGrid';
import WhyChooseUs from '../components/home/WhyChooseUs';
import Statistics from '../components/home/Statistics';
import Testimonials from '../components/home/Testimonials';
import Team from '../components/home/Team';
import Contact from '../components/home/Contact';
import NewsBanner from '../components/home/NewsBanner';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <NewsBanner />
      <ProjectsGrid />
      <Statistics />
      <WhyChooseUs />
      <Testimonials />
      <Team />
      <Contact />
    </div>
  );
};

export default Home;