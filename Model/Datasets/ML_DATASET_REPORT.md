# ML-READY DATASET REPORT
Generated: 2025-11-12

## ✅ Final Unified Schema
```
text                      → object
label                     → object
source_dataset            → object
has_url                   → bool
url_count                 → int64
extracted_urls            → object
primary_domain            → object
text_length               → int64
word_count                → int64
special_char_ratio        → float64
digit_ratio               → float64
uppercase_ratio           → float64
url_length                → int64
suspicious_keywords       → int64
has_ip_address            → bool
tld                       → object
content_hash              → object
```

## 🧮 Feature Engineering Summary
### Engineered Features:
- **URL Features**: extracted_urls, url_count, has_url, primary_domain, tld, url_length, has_ip_address
- **Text Features**: text_length, word_count, special_char_ratio, digit_ratio, uppercase_ratio
- **Semantic Features**: suspicious_keywords (30+ phishing terms)
- **Deduplication**: content_hash (MD5)

## 🧹 Cleaning Summary
- Total rows loaded: 738,274
- Rows with missing text: 0
- Rows with invalid labels: 0
- Duplicate rows removed: 112,866
- **Final unique rows: 625,408**

## 💡 ML Readiness Report
### Class Distribution:
- spam: 315,267 (50.41%)
- ham: 310,141 (49.59%)

### URL Coverage:
- Messages with URLs: 536,591
- Spam with URLs: 273,601
- Ham with URLs: 262,990

### Data Leakage Check:
Feature-Label Correlations:
- text_length: -0.0139 ✅ OK
- word_count: -0.0344 ✅ OK
- url_count: -0.2731 ✅ OK
- suspicious_keywords: +0.0353 ✅ OK

## 📊 Dataset Preview
```
                                                                                   text label  source_dataset                                                                        extracted_urls  url_count  has_url                                                                primary_domain       tld  url_length  has_ip_address  text_length  word_count  special_char_ratio  digit_ratio  uppercase_ratio  suspicious_keywords                      content_hash  strat_key
0  https://bafkreibre4pwizu3d73y7at37ewy6nhklfhb4mb75tp256ot67qeezmf7u.ipfs.cf-ipfs.com  spam  stealthphisher  https://bafkreibre4pwizu3d73y7at37ewy6nhklfhb4mb75tp256ot67qeezmf7u.ipfs.cf-ipfs.com          1     True  bafkreibre4pwizu3d73y7at37ewy6nhklfhb4mb75tp256ot67qeezmf7u.ipfs.cf-ipfs.com       com          84           False           84           1            0.083333     0.202381              0.0                    0  a7749f7217306c3a271f481893caab02  spam_True
1                                              http://101.200.220.118:8090/ledshow2.exe  spam  stealthphisher                                              http://101.200.220.118:8090/ledshow2.exe          1     True                                                          101.200.220.118:8090  118:8090          40            True           40           1            0.225000     0.425000              0.0                    0  cf369423825bacffac79b2ab94687c48  spam_True
2                                                          https://1llc5nv.duckdns.org/  spam  stealthphisher                                                          https://1llc5nv.duckdns.org/          1     True                                                           1llc5nv.duckdns.org       org          28           False           28           1            0.214286     0.071429              0.0                    0  998a3b2392f3f92a66f1d47b964217dd  spam_True
3                                                       http://hrga.melonwoodhomes.com/  spam  stealthphisher                                                       http://hrga.melonwoodhomes.com/          1     True                                                       hrga.melonwoodhomes.com       com          31           False           31           1            0.193548     0.000000              0.0                    0  ef4e2d9c5ef0dd763d265e7065254215  spam_True
4                                                               https://www.aspb.gob.bo   ham  stealthphisher                                               https://www.aspb.gob.bo|www.aspb.gob.bo          2     True                                                               www.aspb.gob.bo        bo          23           False           23           1            0.260870     0.000000              0.0                    0  8aff79d0da89822e7901d4e271428d0a   ham_True
```