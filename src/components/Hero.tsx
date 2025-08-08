import { Button } from '@/components/ui/button';

const Hero = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return <section id="hero" className="relative min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1482881497185-d4a9ddbe4151')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="font-arabic text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            البركة للتمور ومنتجات النخيل
          </h1>
          <p className="font-arabic text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto">أجود أنواع التمور والمنتجات المشتقة من النخيل، من قلب الجفرة إلى العالم</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="font-arabic text-lg bg-dates-amber hover:bg-dates-gold text-white"
              onClick={() => scrollToSection('products')}
            >
              تصفح منتجاتنا
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="font-arabic text-lg bg-white/10 border-white text-white"
              onClick={() => scrollToSection('contact')}
            >
              تواصل معنا
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce cursor-pointer"
        onClick={() => scrollToSection('about')}
      >
        <span className="text-white text-sm mb-2">استكشف المزيد</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>;
};
export default Hero;
