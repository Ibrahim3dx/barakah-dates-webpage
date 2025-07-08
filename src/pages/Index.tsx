
import Hero from '../components/Hero';
import About from '../components/About';
import Products from '../components/Products';
import Quality from '../components/Quality';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <About />
      <Products />
      <Quality />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
