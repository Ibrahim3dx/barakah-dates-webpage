import { Card, CardContent } from "@/components/ui/card";
import { History, Leaf, Award, Gift } from "lucide-react";
const About = () => {
  return <section id="about" className="section-padding bg-secondary">
      <div className="container mx-auto container-padding">
        <div className="text-center mb-12">
          <h2 className="font-arabic text-3xl md:text-4xl font-bold mb-4">من نحن</h2>
          <div className="w-24 h-1 bg-dates-amber mx-auto"></div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <p className="font-arabic text-lg leading-relaxed text-right">تأسست شركة البركة للتمور ومنتجات النخيل في عام 2018 في قلب ليبيا ، منطقة الجفرة المعروفة بجودة تمورها وأصالة نخيلها.</p>
            <p className="font-arabic text-lg leading-relaxed text-right">بدأنا رحلتنا بمزارع محدودة، وتوسعنا على مر السنين لنصبح من أكبر منتجي التمور في المنطقة، .</p>
            <p className="font-arabic text-lg leading-relaxed text-right">
              نفخر بتقديم تمور عالية الجودة وكذلك منتجات مشتقة من النخيل تحافظ على تراثنا العربي الأصيل مع مراعاة أعلى معايير الجودة والإنتاج المستدام.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-white border-dates-tan hover:border-dates-amber transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-dates-amber/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="h-8 w-8 text-dates-amber" />
                </div>
                <h3 className="font-arabic font-bold text-xl mb-2">تراث وأصالة</h3>
                <p className="font-arabic text-muted-foreground">أكثر من 10 سنوات من الخبرة في مجال التمور</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-dates-tan hover:border-dates-amber transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-dates-amber/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-dates-amber" />
                </div>
                <h3 className="font-arabic font-bold text-xl mb-2">منتجات طبيعية</h3>
                <p className="font-arabic text-muted-foreground">تمور عضوية خالية من المواد الحافظة</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-dates-tan hover:border-dates-amber transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-dates-amber/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-dates-amber" />
                </div>
                <h3 className="font-arabic font-bold text-xl mb-2">أعلى جودة</h3>
                <p className="font-arabic text-muted-foreground">حاصلون على شهادات الجودة العالمية</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-dates-tan hover:border-dates-amber transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-dates-amber/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="h-8 w-8 text-dates-amber" />
                </div>
                <h3 className="font-arabic font-bold text-xl mb-2">تنوع المنتجات</h3>
                <p className="font-arabic text-muted-foreground">أكثر من 20 صنفاً من التمور والمنتجات</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>;
};
export default About;