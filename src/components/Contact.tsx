import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="section-padding bg-secondary">
      <div className="container mx-auto container-padding">
        <div className="text-center mb-12">
          <h2 className="font-arabic text-3xl md:text-4xl font-bold mb-4">تواصل معنا</h2>
          <div className="w-24 h-1 bg-dates-amber mx-auto mb-6"></div>
          <p className="font-arabic text-lg text-muted-foreground max-w-2xl mx-auto">
            نسعد بتواصلكم معنا للاستفسار عن منتجاتنا أو طلب عروض الأسعار أو للتعاون التجاري
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <h3 className="font-arabic text-2xl font-bold mb-6 text-right">ارسل رسالة</h3>

            <form className="space-y-5">
              <div>
                <label htmlFor="name" className="font-arabic block text-sm font-medium text-right mb-1">
                  الاسم الكامل
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="أدخل اسمك الكامل"
                  className="font-arabic text-right"
                />
              </div>

              <div>
                <label htmlFor="email" className="font-arabic block text-sm font-medium text-right mb-1">
                  البريد الإلكتروني
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  className="font-arabic text-right"
                />
              </div>

              <div>
                <label htmlFor="phone" className="font-arabic block text-sm font-medium text-right mb-1">
                  رقم الهاتف
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="أدخل رقم الهاتف"
                  className="font-arabic text-right"
                />
              </div>

              <div>
                <label htmlFor="message" className="font-arabic block text-sm font-medium text-right mb-1">
                  الرسالة
                </label>
                <Textarea
                  id="message"
                  placeholder="اكتب رسالتك هنا..."
                  className="font-arabic text-right min-h-[120px]"
                />
              </div>

              <div className="text-right">
                <Button type="submit" className="font-arabic bg-dates-amber hover:bg-dates-gold">
                  إرسال الرسالة
                </Button>
              </div>
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-arabic text-2xl font-bold mb-6 text-right">معلومات التواصل</h3>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 text-dates-amber">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-arabic font-bold mb-1 text-right">الهاتف</h4>
                  <p className="font-arabic text-muted-foreground text-right" dir="ltr">
                    +218920911909 <br />
                    +218910911909
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 text-dates-amber">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-arabic font-bold mb-1 text-right">البريد الإلكتروني</h4>
                  <p className="font-arabic text-muted-foreground text-right">
                    info@albarakadates.com<br />
                    sales@albarakadates.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 text-dates-amber">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-arabic font-bold mb-1 text-right">العنوان</h4>
                  <p className="font-arabic text-muted-foreground text-right">
                  طرابلس ، سوق الجمعة ، بجوار جامع التركي<br />
                  الجفرة ، هون ، مقابل الجزيرة الخارجية
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 text-dates-amber">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-arabic font-bold mb-1 text-right">ساعات العمل</h4>
                  <p className="font-arabic text-muted-foreground text-right">
                  السبت - الخميس: 8:00 ص- 8:00 م<br />
                  الجمعة: 3:00 م - 8:00 م
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="font-arabic font-bold mb-4 text-right">تابعنا على</h4>
              <div className="flex justify-end gap-4">
                <a href="https://www.facebook.com/albaraka.dates.aljufra" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-dates-amber text-white flex items-center justify-center rounded-full hover:bg-dates-gold transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 512 512">
                    <path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z" fill="currentColor" />
                  </svg>
                </a>
                <a href="https://www.tiktok.com/@albaraka.dates.palm" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-dates-amber text-white flex items-center justify-center rounded-full hover:bg-dates-gold transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 448 512">
                    <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14Z" fill="currentColor" />
                  </svg>
                </a>
                <a href="https://wa.me/218910911909" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-dates-amber text-white flex items-center justify-center rounded-full hover:bg-dates-gold transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 448 512">
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" fill="currentColor" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
