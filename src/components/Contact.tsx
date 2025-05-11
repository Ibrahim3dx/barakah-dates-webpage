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
                <a href="#" className="w-10 h-10 bg-dates-amber text-white flex items-center justify-center rounded-full hover:bg-dates-gold transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 448 512">
                    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" fill="currentColor" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-dates-amber text-white flex items-center justify-center rounded-full hover:bg-dates-gold transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 512 512">
                    <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" fill="currentColor" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-dates-amber text-white flex items-center justify-center rounded-full hover:bg-dates-gold transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 448 512">
                    <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" fill="currentColor" />
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
