
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Palm, Bottle, Honey, Olive, Package, ShoppingBag } from "lucide-react";

// Categories and their products
const productCategories = [
  {
    id: "dates",
    name: "التمور بأنواعها",
    icon: <ShoppingBag className="h-5 w-5" />,
    products: [
      { name: "تمر دقلة رطب (فرز أول)", description: "تمور طازجة ذات مذاق حلو ورطوبة مثالية" },
      { name: "تمر دقلة نصف جافة", description: "تمور متوسطة الرطوبة بمذاق مركز" },
      { name: "تمر دقلة شمراخ", description: "تمور على العرجون بجودة عالية" },
      { name: "تمر آبل", description: "تمور منتقاة ذات حجم كبير ومذاق مميز" },
      { name: "تمر دقلة حمراء (عليق)", description: "تمور ذات لون مائل للحمرة ومذاق فريد" },
      { name: "تمر صعيدي", description: "تمور جنوبية ذات نكهة قوية ومميزة" },
      { name: "تمر تاليس", description: "تمور ذهبية اللون بطعم كراميل طبيعي" },
      { name: "عجوة المدينة النبوية", description: "تمور المدينة المنورة الأصلية، عبوات 0.50 كيلو" },
      { name: "تمر مجهول", description: "ملك التمور بحجمه الكبير ومذاقه الفاخر، عبوات 0.50 كيلو" },
      { name: "تمر حليمة", description: "تمور ناعمة ذات مذاق مميز، عبوات 0.50 كيلو" },
      { name: "تمر برميل", description: "تمور ذات قيمة غذائية عالية، عبوات 0.50 كيلو" },
      { name: "تمر دقلة فرز أول", description: "تمور منتقاة بعناية، متوفرة بأحجام مختلفة" },
      { name: "تمر معجون", description: "عجينة تمر طبيعية 100% بدون إضافات، متوفرة بأحجام مختلفة" },
      { name: "تمر معجون باللوز", description: "عجينة تمر فاخرة محشوة باللوز الطازج" },
      { name: "تمر معجون بالبندق", description: "عجينة تمر فاخرة محشوة بالبندق الطازج" },
      { name: "تمر معجون بالسمسم", description: "عجينة تمر فاخرة مع السمسم المحمص" },
      { name: "تمر معجون بالكاكاوية", description: "عجينة تمر فاخرة محشوة بالفول السوداني" },
    ]
  },
  {
    id: "palms",
    name: "فسائل النخيل",
    icon: <Palm className="h-5 w-5" />,
    products: [
      { name: "دقلة نور", description: "فسائل نخيل دقلة نور الأصلية عالية الجودة" },
      { name: "خضراي", description: "فسائل نخيل خضراي ذات إنتاجية عالية" },
      { name: "صعيدي", description: "فسائل نخيل صعيدي أصلية من جنوب المنطقة" },
      { name: "تغيات", description: "فسائل نخيل تغيات المعروفة بتحملها للظروف القاسية" },
      { name: "حليمة", description: "فسائل نخيل حليمة ذات ثمار طرية ولذيذة" },
      { name: "مجهول", description: "فسائل نخيل مجهول الفاخرة" },
      { name: "برحي", description: "فسائل نخيل برحي المعروفة بحلاوة تمورها وقيمتها الغذائية" },
      { name: "صقعي", description: "فسائل نخيل صقعي المقاومة للجفاف" },
      { name: "فحل غنامي", description: "فسائل نخيل فحل غنامي عالي الإنتاجية" },
    ]
  },
  {
    id: "honey",
    name: "أنواع العسل",
    icon: <Honey className="h-5 w-5" />,
    products: [
      { name: "عسل السدر", description: "عسل سدر أصلي 100% من أجود أنواع العسل العربي" },
      { name: "الخلط", description: "مزيج مختار من أنواع العسل المتعددة" },
      { name: "الزعتر", description: "عسل زعتر أصلي ذو فوائد صحية عالية" },
      { name: "الدرياس", description: "عسل الدرياس النادر بمذاقه المميز" },
      { name: "اللبد", description: "عسل لبد صافي بلون ذهبي" },
      { name: "الحنون", description: "عسل الحنون ذو الرائحة المميزة" },
      { name: "الشوكيات", description: "عسل من أزهار الشوكيات البرية" },
      { name: "الأثل", description: "عسل الأثل الأصلي والنادر" },
      { name: "الربيع", description: "عسل أزهار الربيع المتنوعة" },
      { name: "السرول", description: "عسل السرول النقي من الجبال" },
      { name: "البرسيم", description: "عسل البرسيم ذو اللون الفاتح والطعم الرقيق" },
      { name: "مغذى", description: "عسل مغذى طبيعي لتعزيز المناعة" },
      { name: "عسل مغذى بالمكسرات", description: "عسل طبيعي معزز بمزيج المكسرات المغذية" },
      { name: "عسل سدر بالمكسرات", description: "عسل سدر أصلي مع مكسرات منتقاة" },
      { name: "شمع النحل (الشهد)", description: "شمع نحل طبيعي 100% مع العسل" },
    ]
  },
  {
    id: "olive",
    name: "منتجات الزيتون",
    icon: <Olive className="h-5 w-5" />,
    products: [
      { name: "زيت زيتون بكر ممتاز", description: "زيت زيتون عضوي معصور على البارد" },
      { name: "زيتون أخضر", description: "زيتون أخضر طازج محفوظ بطريقة طبيعية" },
      { name: "زيتون أسود", description: "زيتون أسود ناضج بطعم غني" },
      { name: "زيتون متبل", description: "زيتون متبل بالأعشاب والتوابل الطبيعية" },
    ]
  },
  {
    id: "farm",
    name: "منتجات السانية",
    icon: <Package className="h-5 w-5" />,
    products: [
      { name: "منتجات السانية المتنوعة", description: "منتجات طبيعية مختارة من مزرعتنا الخاصة" },
    ]
  },
];

const Products = () => {
  const [activeCategory, setActiveCategory] = useState("dates");

  // Filter products based on active category
  const displayProducts = productCategories.find(cat => cat.id === activeCategory)?.products || [];

  return (
    <section id="products" className="section-padding bg-background">
      <div className="container mx-auto container-padding">
        <div className="text-center mb-12">
          <h2 className="font-arabic text-3xl md:text-4xl font-bold mb-4">منتجاتنا</h2>
          <div className="w-24 h-1 bg-dates-amber mx-auto mb-6"></div>
          <p className="font-arabic text-lg text-muted-foreground max-w-2xl mx-auto">
            نقدم مجموعة متنوعة من أجود أنواع التمور ومنتجات النخيل والعسل والزيتون، بعناية فائقة لضمان أعلى مستويات الجودة
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {productCategories.map((category) => (
            <Button 
              key={category.id} 
              variant={activeCategory === category.id ? "default" : "outline"} 
              className={`font-arabic text-sm md:text-base flex gap-2 items-center ${
                activeCategory === category.id 
                ? "bg-dates-amber hover:bg-dates-gold" 
                : "border-dates-brown text-dates-brown hover:bg-dates-brown/10"
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.icon}
              {category.name}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProducts.map((product, index) => (
            <Card key={index} className="overflow-hidden group hover:shadow-lg transition-shadow border-dates-tan">
              <div className="h-48 overflow-hidden bg-dates-cream/30 flex items-center justify-center">
                <div className="text-6xl text-dates-amber opacity-20 transform group-hover:scale-110 transition-transform duration-500">
                  {activeCategory === "dates" && <ShoppingBag />}
                  {activeCategory === "palms" && <Palm />}
                  {activeCategory === "honey" && <Honey />}
                  {activeCategory === "olive" && <Olive />}
                  {activeCategory === "farm" && <Package />}
                </div>
              </div>
              <CardContent className="p-6">
                <div className="mb-2">
                  <span className="text-xs font-arabic text-dates-amber bg-dates-amber/10 py-1 px-2 rounded-full">
                    {productCategories.find(cat => cat.id === activeCategory)?.name}
                  </span>
                </div>
                <h3 className="font-arabic text-xl font-bold mb-2 text-right">{product.name}</h3>
                <p className="font-arabic text-muted-foreground mb-4 text-right">{product.description}</p>
                <div className="text-right">
                  <Button variant="outline" className="font-arabic border-dates-brown text-dates-brown hover:bg-dates-brown hover:text-white">
                    طلب المنتج
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Button size="lg" className="font-arabic text-lg bg-dates-amber hover:bg-dates-gold">
            اطلب منتجاتنا الآن
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Products;
