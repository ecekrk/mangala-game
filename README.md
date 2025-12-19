# 🏆 Mangala Game — Modern Web Uygulaması

Bu proje, **Mangala** (Türk Mancala’sı) oyununun modern bir web arayüzü ile geliştirilmiş, algoritmik temellere dayanan bir uygulamasıdır.  
Amaç; hem **kullanıcı deneyimi yüksek**, hem de **oyun kuramı ve yapay zekâ algoritmaları** ile desteklenmiş bir Mangala simülasyonu sunmaktır.

🔗 **Canlı Demo:**  
👉 https://ecekrk.github.io/mangala-game/

---

## 🎯 Projenin Amacı

- Mangala oyununun **kurallarını eksiksiz** şekilde dijital ortama aktarmak  
- Oyunun **algoritmik yapısını** (hamle simülasyonu, kazanma koşulları, yakalama kuralları) açık ve sürdürülebilir bir kod yapısıyla modellemek  
- **Minimax + Alpha-Beta Pruning** yaklaşımı ile yapay zekâ temelli hamle analizine altyapı oluşturmak  
- Modern, sade ve göz yormayan bir **UI/UX tasarımı** sunmak  

---

## 🕹️ Oyun Özellikleri

- 2 oyunculu Mangala oynanışı  
- Tüm temel Mangala kuralları:
  - Taşların saat yönünün tersine dağıtılması
  - Son taşın hazineye düşmesi durumunda ekstra hamle
  - Boş kuyuya düşen son taşla karşı kuyu yakalama
  - Taşlar bittiğinde oyunun otomatik bitmesi
- Aktif oyuncu vurgusu
- Oyun sonu kazanan ekranı
- Tek tıkla **Yeni Oyun** başlatma

---

## 🧠 Algoritmik Yaklaşım

Bu projede Mangala oyunu, **durum-uzayı (state space)** yaklaşımı ile modellenmiştir.

Her oyun durumu şu bileşenlerden oluşur:

- `player1`: Oyuncu 1’in kuyularındaki taş sayıları  
- `player2`: Oyuncu 2’nin kuyularındaki taş sayıları  
- `treasure1`: Oyuncu 1 hazinesi  
- `treasure2`: Oyuncu 2 hazinesi  

### 🔹 Oyun Sonu Kontrolü
- Oyunculardan birinin tüm kuyuları boşaldığında oyun sona erer
- Karşı oyuncunun kuyularında kalan taşlar otomatik olarak hazinesine eklenir
- Hazine sayıları karşılaştırılarak kazanan belirlenir

---

## 🤖 Yapay Zekâ: Minimax + Alpha-Beta Pruning

Projede, yapay zekâ oyuncusu için **Minimax algoritması**, performans optimizasyonu için ise **Alpha-Beta Budama** tekniği kullanılmıştır.

### Kullanılan Yaklaşım

- **Maximizing Player:** Oyuncu 2 (AI)
- **Minimizing Player:** Oyuncu 1 (insan)
- Derinlik sınırlı arama (`depth`)
- Oyun sonu veya maksimum derinlikte **heuristic değerlendirme**

### Heuristic (Değerlendirme Fonksiyonu)

Değerlendirme şu kriterlere dayanır:

- **Hazine farkı** (en baskın faktör)
- Tahta üzerindeki **toplam taş farkı**
- Kuyuların **pozisyonel değeri** (ilerideki kuyular daha avantajlı)

```js
evaluateBoard = 
  (treasure2 - treasure1)
+ 0.3 * (player2 taşları - player1 taşları)
+ pozisyonel avantaj
````

Bu yaklaşım, Mangala’nın stratejik doğasına uygun **dengeleyici bir değerlendirme** sağlar.

---

## 📚 İlgili Medium Yazısı

Mangala’nın yalnızca bir oyun değil, aynı zamanda **kadim bir strateji ve oyun kuramı problemi** olduğunu ele aldığım Medium yazım:

🔗 **Mangala: Kadim Zekânın Algoritmik Oyun Kuramı (AGT) ile Analizi**
👉 [https://medium.com/@ecehatice2004/mangala-kadim-zekânın-algoritmik-oyun-kuramı-agt-ile-analizi-️-df3651457714](https://medium.com/@ecehatice2004/mangala-kadim-zekânın-algoritmik-oyun-kuramı-agt-ile-analizi-️-df3651457714)

Bu yazıda:

* Mangala’nın oyun kuramı perspektifi
* Deterministik oyunlar
* Minimax mantığı
* Stratejik hamle analizi
  detaylı şekilde ele alınmaktadır.

---

## 🛠️ Kullanılan Teknolojiler

* **React** (Vite)
* **Tailwind CSS**
* **JavaScript (ES6+)**
* **Lucide Icons**
* **GitHub Pages** (deploy)

---

## 🚀 Kurulum (Local)

```bash
git clone https://github.com/ecekrk/mangala-game.git
cd mangala-game
npm install
npm run dev
```
