
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const products = [
  {
    id: 1,
    name: "تمر سكري فاخر",
    description: "من أجود أنواع التمور، يتميز بلونه الذهبي وحلاوته المعتدلة",
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9",
    category: "تمور"
  },
  {
    id: 2,
    name: "عجوة المدينة",
    description: "تمر أسود ذو قيمة غذائية عالية، يشتهر بفوائده الصحية المتعددة",
    image: "https://images.unsplash.com/photo-1504472478235-9bc48ba4d60f",
    category: "تمور"
  },
  {
    id: 3,
    name: "خلاص القصيم",
    description: "تمر مميز بحجمه المتوسط ولونه الكهرماني وطعمه الحلو اللذيذ",
    image: "https://images.unsplash.com/photo-1573735804441-8c93e13881a3",
    category: "تمور"
  },
  {
    id: 4,
    name: "دبس التمر",
    description: "عسل التمر الطبيعي المستخرج من أجود أنواع التمور بطريقة تقليدية",
    image: "https://images.unsplash.com/photo-1576697215142-3372fca4a204",
    category: "منتجات النخيل"
  },
  {
    id: 5,
    name: "معمول التمر",
    description: "حلوى تقليدية محشوة بعجينة التمر الفاخرة والمكسرات المميزة",
    image: "https://images.unsplash.com/photo-1595231412596-ab32b1185c45",
    category: "منتجات النخيل"
  },
  {
    id: 6,
    name: "سلال هدايا",
    description: "تشكيلة متنوعة من التمور الفاخرة والمنتجات في سلال أنيقة للهدايا",
    image: "https://images.unsplash.com/photo-1607769137764-bf4fd72ffa4e",
    category: "هدايا"
  }
];

const Products = () => {
  return (
    <section id="products" className="section-padding bg-background">
      <div className="container mx-auto container-padding">
        <div className="text-center mb-12">
          <h2 className="font-arabic text-3xl md:text-4xl font-bold mb-4">منتجاتنا</h2>
          <div className="w-24 h-1 bg-dates-amber mx-auto mb-6"></div>
          <p className="font-arabic text-lg text-muted-foreground max-w-2xl mx-auto">
            نقدم مجموعة متنوعة من أجود أنواع التمور ومنتجات النخيل، مزروعة ومصنعة بعناية فائقة لضمان أعلى مستويات الجودة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-shadow border-dates-tan">
              <div className="h-64 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <CardContent className="p-6">
                <div className="mb-2">
                  <span className="text-xs font-arabic text-dates-amber bg-dates-amber/10 py-1 px-2 rounded-full">{product.category}</span>
                </div>
                <h3 className="font-arabic text-xl font-bold mb-2 text-right">{product.name}</h3>
                <p className="font-arabic text-muted-foreground mb-4 text-right">{product.description}</p>
                <div className="text-right">
                  <Button variant="outline" className="font-arabic border-dates-brown text-dates-brown hover:bg-dates-brown hover:text-white">
                    عرض المزيد
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Button size="lg" className="font-arabic text-lg bg-dates-amber hover:bg-dates-gold">
            عرض جميع المنتجات
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Products;
