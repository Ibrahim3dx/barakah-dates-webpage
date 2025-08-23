import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-dates-brown text-white pt-16 pb-6">
      <div className="container mx-auto container-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-arabic text-xl font-bold mb-4 text-right">البركة للتمور</h3>
            <p className="font-arabic text-sm text-white/80 mb-4 text-right">
              شركة ليبية رائدة في مجال إنتاج وتصنيع وتسويق أجود أنواع التمور ومنتجات النخيل، تتميز بالجودة العالية والأصالة والابتكار.
            </p>
            <div className="flex gap-2 justify-end">
              <a href="https://www.facebook.com/albaraka.dates.aljufra" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-dates-amber transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 512 512">
                  <path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z" fill="currentColor" />
                </svg>
              </a>
              <a href="https://www.tiktok.com/@albaraka.dates.palm" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-dates-amber transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 448 512">
                  <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14Z" fill="currentColor" />
                </svg>
              </a>
              <a href="https://wa.me/218910911909" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-dates-amber transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 448 512">
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-arabic text-xl font-bold mb-4 text-right">روابط سريعة</h3>
            <ul className="space-y-2 text-right">
              <li>
                <a href="#hero" className="font-arabic text-white/80 hover:text-dates-amber transition-colors">الرئيسية</a>
              </li>
              <li>
                <a href="#about" className="font-arabic text-white/80 hover:text-dates-amber transition-colors">من نحن</a>
              </li>
              <li>
                <a href="#products" className="font-arabic text-white/80 hover:text-dates-amber transition-colors">منتجاتنا</a>
              </li>
              <li>
                <a href="#quality" className="font-arabic text-white/80 hover:text-dates-amber transition-colors">التزامنا بالجودة</a>
              </li>
              <li>
                <a href="#contact" className="font-arabic text-white/80 hover:text-dates-amber transition-colors">تواصل معنا</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-arabic text-xl font-bold mb-4 text-right">معلومات التواصل</h3>
            <ul className="space-y-3 text-right">
              <li className="font-arabic text-white/80">
                <span className="block">طرابلس ، سوق الجمعة ، بجوار جامع التركي</span>
                <span className="block">الجفرة ، هون ، مقابل الجزيرة الخارجية</span>
              </li>
              <li className="font-arabic text-white/80" dir="ltr">
                <span className="block">+218920911909</span>
                <span className="block">+218910911909</span>
              </li>
              <li className="font-arabic text-white/80">
                <span className="block">info@albarakadates.com</span>
                <span className="block">sales@albarakadates.com</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-white/20 my-8" />

        <div className="text-center">
          <p className="font-arabic text-sm text-white/80">
            © 2025 جميع الحقوق محفوظة لشركة البركة للتمور ومنتجات النخيل
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
