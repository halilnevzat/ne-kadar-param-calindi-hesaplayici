# NE KADAR PARAM ÇALINDI ?

![Proje Başlığı Resmi - Örnek: Bir döviz grafiği veya para sembolleri](https://via.placeholder.com/800x300?text=NE+KADAR+PARAM+%C3%87ALINDI+%3F)
*(İsterseniz buraya projenizi temsil eden bir görsel ekleyebilirsiniz.)*

## Hakkında

"NE KADAR PARAM ÇALINDI ?" aracı, Türk Lirası cinsinden maaşınızın seçtiğiniz bir başlangıç tarihinden itibaren Amerikan Doları karşısında ne kadar değer kaybettiğini ve aylık bazda yaşadığı kayıpları hesaplamak için geliştirilmiştir. Bu araç, ceplerimizden eriyip giden paraların hesabını sorabilmek ve bu değer kaybını somut verilerle gözlemleyebilmek amacıyla <a href="https://twitter.com/halilnevzat07" target="_blank">halilnevzat</a> tarafından hazırlanmıştır.

## Nasıl Çalışır?

Uygulama, belirlediğiniz başlangıç tarihi ile güncel tarih arasındaki her ayın başlangıcı için Türkiye Cumhuriyeti Merkez Bankası (TCMB) resmi sitesinden döviz kurlarını (FOREX BUYING - DÖVİZ ALIŞ) çekerek çalışır.

1.  **Maaş Girişi:** Türk Lirası cinsinden maaşınızı girersiniz.
2.  **Tarih Seçimi:** Maaşınızın başlangıç tarihini seçersiniz.
3.  **Veri Çekimi:** Uygulama, seçilen tarihten günümüze kadar her ayın aynı gününe ait (veya en yakın önceki iş gününe ait) USD/TRY döviz kurlarını TCMB'den alır.
4.  **Hesaplama:**
    *   Maaşınızın seçilen başlangıç tarihindeki USD karşılığını hesaplar.
    *   Maaşınızın güncel tarihteki USD karşılığını hesaplayarak toplam USD cinsinden azalmayı gösterir.
    *   Maaşınızın başlangıç tarihindeki değerini, güncel kurla karşılaştırarak toplam TRY cinsinden azalmayı gösterir.
    *   **Aylık Kayıplar:** Her ay için, o ayın başındaki USD değerini bir sonraki ayın başındaki TRY değeri ile karşılaştırarak ay bazında ne kadar değer kaybettiğinizi detaylı olarak listeler.

## Özellikler

*   Türk Lirası cinsinden maaş girişi.
*   Özelleştirilebilir başlangıç tarihi seçimi.
*   Maaşınızın toplam USD ve TRY cinsinden azalmasının gösterimi.
*   Seçilen başlangıç tarihinden günümüze kadar **aylık bazda enflasyon kaynaklı değer kaybı** dökümü.
*   Toplam aylık kayıp özeti.
*   Veri kaynaklarını (TCMB XML linkleri) gösterme.
*   Resmi Türkiye Cumhuriyeti Merkez Bankası (TCMB) döviz kurlarını kullanır.
*   Seçilen gün için veri bulunamadığında otomatik olarak bir önceki iş gününün verilerini kullanma.
*   Modern ve kullanıcı dostu arayüz (Bootstrap ve Glassmorphism tasarımı).

## Kurulum ve Çalıştırma

Bu proje bir PHP backend'i gerektirdiğinden, yerel bir web sunucusunda (örneğin Apache, Nginx) PHP desteği ile çalıştırılmalıdır.

1.  **Dosyaları İndirin:** Proje dosyalarını (`index.html`, `script.js`, `styles.css`, `get_exchange_rates.php`) bilgisayarınıza indirin veya `git clone` ile klonlayın.
2.  **Web Sunucusuna Yerleştirin:** İndirdiğiniz dosyaları web sunucunuzun kök dizinine (örneğin `htdocs`, `www` veya `public_html`) kopyalayın.
3.  **Tarayıcıdan Erişin:** Tarayıcınızda `http://localhost/index.html` (veya sunucu yapılandırmanıza göre uygun URL) adresine giderek uygulamayı çalıştırabilirsiniz.

## Kullanım

1.  Uygulama açıldığında, "Türk Lirası Cinsinden Maaşınızı Girin:" alanına maaş miktarınızı girin.
2.  "Maaş Başlangıç Tarihi Seçin:" alanından maaşınızın başlangıç tarihini belirleyin.
3.  "Hesapla" butonuna tıklayın.
4.  Sonuçlar, maaşınızdaki toplam USD ve TRY azalması, kullanılan veri kaynakları ve detaylı aylık kayıplar şeklinde görüntülenecektir.

### Notlar:

*   Döviz verileri TCMB'nin yayınladığı "FOREX BUYING - DÖVİZ ALIŞ" kurundan çekilmektedir.
*   Örnek URL formatı: `https://www.tcmb.gov.tr/kurlar/YYYYMM/DDMMYYYY.xml`
*   Eğer seçilen gün için TCMB'de veri açıklanmamışsa (hafta sonu, resmi tatil vb.), sistem otomatik olarak bir önceki iş gününün verilerini çekmeye çalışır.
*   Seçtiğiniz tarih için hiçbir veri bulunamazsa, bir hata mesajı alırsınız.

## Geri Bildirim ve Katkı

Geri bildirimlerinize ve önerilerinize açığım! Her türlü iyileştirme fikri, hata raporu veya katkı çok değerlidir.

*   Hata raporları veya özellik istekleri için lütfen bir [GitHub Issue](https://github.com/KullaniciAdiniz/RepoAdiniz/issues) açın.
*   Koda doğrudan katkıda bulunmak isterseniz, lütfen bir [Pull Request](https://github.com/KullaniciAdiniz/RepoAdiniz/pulls) gönderin.

## Geliştirici

Bu araç <a href="https://twitter.com/halilnevzat07" target="_blank">halilnevzat</a> tarafından geliştirilmiştir.

## Lisans

Bu proje açık kaynaklıdır ve MIT Lisansı altında yayınlanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakınız.
