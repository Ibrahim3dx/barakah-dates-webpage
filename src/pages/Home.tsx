import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ShoppingBag, Leaf, Droplet, Coffee, Package } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const categories = [
  {
    id: 'dates',
    icon: <ShoppingBag className="h-5 w-5" />,
  },
  {
    id: 'palms',
    icon: <Leaf className="h-5 w-5" />,
  },
  {
    id: 'honey',
    icon: <Droplet className="h-5 w-5" />,
  },
  {
    id: 'olive',
    icon: <Coffee className="h-5 w-5" />,
  },
  {
    id: 'farm',
    icon: <Package className="h-5 w-5" />,
  },
];

const Home = () => {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          {t('home.hero.title')}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {t('home.hero.subtitle')}
        </p>
        <Button asChild size="lg">
          <Link to="/products">{t('home.hero.cta')}</Link>
        </Button>
      </section>

      {/* Categories Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">{t('home.categories.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold">{t(`home.categories.${category.id}.name`)}</h3>
              </div>
              <p className="text-gray-600">{t(`home.categories.${category.id}.description`)}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 rounded-lg p-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">{t('home.features.quality.title')}</h3>
            <p className="text-gray-600">
              {t('home.features.quality.description')}
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">{t('home.features.shipping.title')}</h3>
            <p className="text-gray-600">
              {t('home.features.shipping.description')}
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">{t('home.features.guarantee.title')}</h3>
            <p className="text-gray-600">
              {t('home.features.guarantee.description')}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center">
        <h2 className="text-3xl font-bold mb-4">{t('home.cta.title')}</h2>
        <p className="text-gray-600 mb-8">
          {t('home.cta.subtitle')}
        </p>
        <Button asChild size="lg">
          <Link to="/products">{t('home.cta.button')}</Link>
        </Button>
      </section>
    </div>
  );
};

export default Home; 