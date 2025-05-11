
import { Button } from "@/components/ui/button";
import { Check, Shield, Award, Leaf } from "lucide-react";

const Quality = () => {
  return (
    <section id="quality" className="section-padding relative">
      {/* Background Image */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469041797191-50ace28483c3')] bg-cover bg-center">
        <div className="absolute inset-0 bg-dates-brown/90"></div>
      </div>
      
      <div className="container mx-auto container-padding relative z-10">
        <div className="text-center mb-14">
          <h2 className="font-arabic text-3xl md:text-4xl font-bold mb-4 text-white">التزامنا بالجودة</h2>
          <div className="w-24 h-1 bg-dates-amber mx-auto mb-6"></div>
          <p className="font-arabic text-lg text-white/90 max-w-2xl mx-auto">
            نلتزم في البركة للتمور بأعلى معايير الجودة بدءاً من زراعة النخيل وحتى تغليف المنتج النهائي
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-dates-amber rounded-full p-2 flex-shrink-0">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-arabic text-xl font-bold mb-2 text-white text-right">زراعة عضوية</h3>
                <p className="font-arabic text-white/80 text-right">
                  تتم زراعة نخيلنا باستخدام أساليب الزراعة العضوية، بعيداً عن المبيدات والأسمدة الكيماوية، لضمان منتج صحي وآمن
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-dates-amber rounded-full p-2 flex-shrink-0">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-arabic text-xl font-bold mb-2 text-white text-right">حصاد بعناية</h3>
                <p className="font-arabic text-white/80 text-right">
                  يتم جني التمور في أوقات نضجها المثالية، بأيدي خبراء متخصصين، مع مراعاة أعلى معايير النظافة والسلامة الغذائية
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-dates-amber rounded-full p-2 flex-shrink-0">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-arabic text-xl font-bold mb-2 text-white text-right">تصنيع حديث</h3>
                <p className="font-arabic text-white/80 text-right">
                  نستخدم أحدث التقنيات في معالجة وتعبئة التمور، مع الحفاظ على الطرق التقليدية التي تحافظ على نكهة وجودة المنتج
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-dates-amber rounded-full p-2 flex-shrink-0">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-arabic text-xl font-bold mb-2 text-white text-right">اختبارات الجودة</h3>
                <p className="font-arabic text-white/80 text-right">
                  تخضع جميع منتجاتنا لاختبارات جودة صارمة قبل طرحها في الأسواق، لنضمن لكم أفضل تجربة مع كل منتج من منتجاتنا
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-12 w-12 text-dates-amber" />
              </div>
              <h3 className="font-arabic text-xl font-bold text-white mb-2">شهادة الأيزو</h3>
              <p className="font-arabic text-sm text-white/80">ISO 22000:2018</p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-12 w-12 text-dates-amber" />
              </div>
              <h3 className="font-arabic text-xl font-bold text-white mb-2">جودة عالمية</h3>
              <p className="font-arabic text-sm text-white/80">معتمد من هيئات دولية</p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-12 w-12 text-dates-amber" />
              </div>
              <h3 className="font-arabic text-xl font-bold text-white mb-2">إنتاج مستدام</h3>
              <p className="font-arabic text-sm text-white/80">صديق للبيئة</p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-dates-amber" viewBox="0 0 512 512">
                  <path d="M288 192h17.1c22.1 38.3 63.5 64 110.9 64c11 0 21.8-1.4 32-4v4c0 17.7-14.3 32-32 32h-32v64c0 17.7-14.3 32-32 32s-32-14.3-32-32V288 272c0-17.7 14.3-32 32-32zM400 160c-44.2 0-80-35.8-80-80s35.8-80 80-80s80 35.8 80 80s-35.8 80-80 80zM224 256c70.7 0 128-57.3 128-128S294.7 0 224 0S96 57.3 96 128s57.3 128 128 128zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z" fill="currentColor" />
                </svg>
              </div>
              <h3 className="font-arabic text-xl font-bold text-white mb-2">خبراء التمور</h3>
              <p className="font-arabic text-sm text-white/80">فريق متخصص</p>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Button size="lg" className="font-arabic text-lg bg-dates-amber hover:bg-dates-gold">
            اكتشف عملية الإنتاج
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Quality;
