# OZ Pilates - Teklif Yönetim ve PDF Sistemi

Bu sistem, **ÜRÜN TEKLİF FORMU 2026.xlsx** dosyanızdaki şablon, kurumsal kimlik, ürün kataloğu ve hesaplama mantığı temel alınarak geliştirilmiş modern, hızlı ve otomatik bir teklif hazırlama web uygulamasıdır.

Excel'de elle formül yazma, indirim hesaplama, hücre kayması gibi zahmetlerin tamamını ortadan kaldırır.

---

## 🚀 Hızlı Başlangıç

Sistemi kullanmak için herhangi bir kurulum veya sunucu çalıştırma zorunluluğu yoktur.

1. Klasördeki **`start.bat`** dosyasına çift tıklayın veya **`index.html`** dosyasını doğrudan tarayıcınızda (Chrome, Edge, vb.) açın.
2. Karşınıza sol tarafta kontrol paneli, sağ tarafta ise **birebir A4 baskı formatında canlı teklif belgesi** gelecektir.

---

## 🌟 Öne Çıkan Özellikler

### 1. Otomatik İskonto / İndirim Hesaplama
- **Hızlı Yüzde Butonları:** `%0`, `%5`, `%10`, `%15`, `%20`, `%25`, `%30` butonlarına tek tıkla basarak iskonto uygulayabilirsiniz.
- **Kaydırıcı (Slider) ve Sayı Girişi:** Dilediğiniz indirim oranını (%0 - %100) anında belirleyebilirsiniz.
- **Canlı Hesaplama:**
  - **Liste Toplamı (Brüt)**
  - **İskonto Tutarı** (Otomatik düşülür)
  - **İndirimli Net Tutar**
  - **KDV Tutarı** (%20, %10, %1 veya Muaf seçenekleri; KDV Hariç/Dahil desteği)
  - **GENEL TOPLAM TUTAR**
  - **Yazıyla Tutar:** Türk Lirası ve Kuruş cinsinden otomatik yazıya çevrilir.

### 2. Tek Tıkla PDF Çıktısı ve Yazdırma
- **"PDF İndir" Butonu:** Tek tıkla `OZ-2026-001_MusteriAdi.pdf` formatında doğrudan yüksek çözünürlüklü A4 PDF oluşturup indirir.
- **"Yazdır" Butonu:** Tarayıcının yerleşik baskı penceresini açar (A4 dikey formata özel optimize edilmiştir).

### 3. Hazır Ürün Kataloğu ve Özel Ürün Yönetimi
- Excel dosyanızdaki standart 5 ürün ve orijinal görselleri sisteme yüklenmiştir:
  - **OZ1001:** Cadillac Combo Reformer (65.500 ₺)
  - **OZ1002:** Tower Reformer (53.500 ₺)
  - **OZ1003:** Reformer (42.300 ₺)
  - **OZ1004:** Ladder Barrel (28.000 ₺)
  - **OZ1005:** Combo Chair (29.500 ₺)
- **Katalogdan Ekle:** İstediğiniz ekipmanı kataloğa tıklayarak tek tıkla teklife ekleyebilirsiniz.
- **Yeni Ürün:** Farklı ekipman veya aksesuar ekleyebilir, miktar ve fiyatını değiştirebilirsiniz.
- **Görsel Değiştirme / Yükleme:** Ürün görseline tıklayarak bilgisayarınızdan yeni bir ürün fotoğrafı seçebilirsiniz.
- **Görsel Gizle/Göster:** Teklifte görsellerin yer alıp almayacağını tek bir kutucukla seçebilirsiniz.

### 4. Müşteri ve Belge Bilgileri
- Kişi / Kurum Adı, Yetkili Hitabı, Tel/Faks, E-posta ve Adres bilgileri girildikçe sağdaki A4 belgesinde anında güncellenir.
- Teklif No (Örn: `OZ-2026-001`), Teklif Tarihi ve Satış Temsilcisi alanları.
- "Yeni Teklif" butonuna basıldığında teklif numarası otomatik bir sonraki sayıya (`OZ-2026-002`) artırılır.

### 5. Teklif Şartları ve Detaylar
- Standart nakliye, KDV ve ödeme şartları ("Sipariş ile birlikte %50, Teslimat öncesi %50") hazır gelir.
- İstenirse yeni şart maddesi eklenebilir, silinebilir veya metinleri düzenlenebilir.
- Kaşe / İmza alanı tercihe göre açılıp kapatılabilir.

### 6. Kaydetme ve Geçmiş Teklifler (Arşiv)
- **"Kaydet":** Hazırladığınız teklifi tarayıcınızın yerel hafızasına kaydeder.
- **"Kayıtlı Teklifler":** Geçmişte oluşturduğunuz teklifleri listeler, arama yapabilir ve tek tıkla yeniden açıp düzenleyebilirsiniz.
- **"Excel İndir":** Teklifin Excel (.xlsx) dosyasını da indirebilirsiniz.

---

## 📁 Dosya Yapısı
- **`start.bat`** : Tek tıkla uygulamayı tarayıcınızda başlatan Windows kısayolu.
- **`index.html`** : Ana sayfa ve canlı kullanıcı arayüzü.
- **`app.css`** : OZ Pilates kurumsal kimliğine uygun özel tasarım ve A4 baskı stilleri.
- **`app.js`** : İskonto motoru, otomatik hesaplamalar, PDF üretimi ve kayıt sistemi.
- **`assets/`** : 
  - `logo/` : Kurumsal logo (9404 OZ Pilates).
  - `products/` : Ekipman fotoğrafları.
  - `vendor/` : Çevrimdışı (internetsiz) çalışan PDF ve Excel kütüphaneleri.
