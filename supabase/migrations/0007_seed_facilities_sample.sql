-- ============================================================
-- Sample facility seed (Phase 3 testing) — REAL entries only.
-- No fabricated phones or coordinates (NULL until researched).
-- Idempotent: skips rows whose name_en already exists.
-- ============================================================

DO $$
DECLARE
  ygn uuid; mdl uuid;
  bahan uuid; lanmadaw uuid; insein_tsp uuid; nok uuid; tgy uuid; chanyethazan uuid;
BEGIN
  SELECT id INTO ygn FROM public.cities WHERE name_en ILIKE 'Yangon%' LIMIT 1;
  SELECT id INTO mdl FROM public.cities WHERE name_en ILIKE 'Mandalay%' LIMIT 1;
  SELECT t.id INTO bahan        FROM public.townships t WHERE t.city_id = ygn AND t.name_en ILIKE 'Bahan';
  SELECT t.id INTO lanmadaw     FROM public.townships t WHERE t.city_id = ygn AND t.name_en ILIKE 'Lanmadaw';
  SELECT t.id INTO insein_tsp   FROM public.townships t WHERE t.city_id = ygn AND t.name_en ILIKE 'Insein';
  SELECT t.id INTO nok          FROM public.townships t WHERE t.city_id = ygn AND t.name_en ILIKE 'North Okkalapa%';
  SELECT t.id INTO tgy          FROM public.townships t WHERE t.city_id = ygn AND t.name_en ILIKE 'Thingangyun%';
  SELECT t.id INTO chanyethazan FROM public.townships t WHERE t.city_id = mdl AND t.name_en ILIKE 'Chanayethazan%';

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en) = lower('Yangon General Hospital')) THEN
    INSERT INTO public.facilities (name_mm, name_en, facility_type, organization, region_id, city_id, township_id,
      opening_hours, is_24_7, services, description_mm, description_en, source_url, source_checked, confidence)
    VALUES ('ရန်ကုန်ပြည်တော်ဗိမာန်ဆေးရုံကြီး', 'Yangon General Hospital', 'PUBLIC_HOSPITAL', 'GOVERNMENT',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1), ygn, bahan,
      'Emergency: 24/7', true, ARRAY['Emergency','Surgery','Internal Medicine','ICU','Trauma'],
      'မြန်မာနိုင်ငံ၏ အဓိက ပြည်ထောင်စုဆေးရုံကြီးတစ်ခုဖြစ်ပြီး အရေးပေါ် ကုသမှုနှင့် သွန်သင်ဆေးရုံ ဝန်ဆောင်မှုများ ပေးပါသည်။',
      'One of Myanmar''s principal teaching hospitals, providing emergency and specialist care.',
      'https://en.wikipedia.org/wiki/Yangon_General_Hospital', now(), 'high');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en) = lower('New Yangon General Hospital')) THEN
    INSERT INTO public.facilities (name_mm, name_en, facility_type, organization, region_id, city_id, township_id,
      opening_hours, is_24_7, services, description_mm, description_en, source_url, source_checked, confidence)
    VALUES ('အသစ်ရန်ကုန်ပြည်တော်ဗိမာန်ဆေးရုံကြီး', 'New Yangon General Hospital', 'PUBLIC_HOSPITAL', 'GOVERNMENT',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1), ygn, NULL,
      'Emergency: 24/7', true, ARRAY['Emergency','Surgery','Internal Medicine'],
      'ရန်ကုန်မြို့ရှိ အစိုးရဆေးရုံကြီးတစ်ခုဖြစ်ပြီး အထူးကု ဝန်ဆောင်မှုများ ပါဝင်ပါသည်။',
      'A major government hospital in Yangon offering specialist services.', NULL, now(), 'medium');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en) = lower('North Okkalapa General Hospital')) THEN
    INSERT INTO public.facilities (name_mm, name_en, facility_type, organization, region_id, city_id, township_id,
      opening_hours, is_24_7, services, description_mm, description_en, source_url, source_checked, confidence)
    VALUES ('မြောက်ဥက္ကလာပဆေးရုံကြီး', 'North Okkalapa General Hospital', 'PUBLIC_HOSPITAL', 'GOVERNMENT',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1), ygn, nok,
      'Emergency: 24/7', true, ARRAY['Emergency','Surgery','Internal Medicine','Obstetrics'],
      'မြောက်ဥက္ကလာပမြို့နယ်ရှိ အစိုးရဆေးရုံကြီးဖြစ်ပြီး ဒေသခံများအတွက် အရေးပေါ်နှင့် ယေဘုယျ ကုသမှုများ ပေးပါသည်။',
      'A government general hospital serving North Okkalapa and surrounding townships.',
      'https://en.wikipedia.org/wiki/North_Okkalapa_General_Hospital', now(), 'high');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en) = lower('Insein General Hospital')) THEN
    INSERT INTO public.facilities (name_mm, name_en, facility_type, organization, region_id, city_id, township_id,
      opening_hours, is_24_7, services, description_mm, description_en, source_url, source_checked, confidence)
    VALUES ('အင်းစိန်ဆေးရုံကြီး', 'Insein General Hospital', 'PUBLIC_HOSPITAL', 'GOVERNMENT',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1), ygn, insein_tsp,
      'Emergency: 24/7', true, ARRAY['Emergency','Surgery','Internal Medicine'],
      'အင်းစိန်မြို့နယ်ရှိ အစိုးရဆေးရုံကြီးတစ်ခုဖြစ်ပါသည်။',
      'A government general hospital located in Insein Township.', NULL, now(), 'medium');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en) = lower('Yangon Children''s Hospital')) THEN
    INSERT INTO public.facilities (name_mm, name_en, facility_type, organization, region_id, city_id, township_id,
      opening_hours, is_24_7, services, description_mm, description_en, source_url, source_checked, confidence)
    VALUES ('ရန်ကုန်ကလေးဆေးရုံကြီး', 'Yangon Children''s Hospital', 'PUBLIC_HOSPITAL', 'GOVERNMENT',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1), ygn, bahan,
      'Pediatric emergency: 24/7', true, ARRAY['Pediatrics','Pediatric Surgery','Neonatal Care','Immunization'],
      'ကလေးများအတွက် အထူးပြု အစိုးရဆေးရုံကြီးဖြစ်ပြီး ကလေးဘက်တီရယ် အရေးပေါ် ကုသမှုများ ပေးပါသည်။',
      'A specialist government pediatric hospital providing emergency child care.',
      'https://en.wikipedia.org/wiki/Yangon_Children%27s_Hospital', now(), 'high');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en) = lower('Central Women''s Hospital, Yangon')) THEN
    INSERT INTO public.facilities (name_mm, name_en, facility_type, organization, region_id, city_id, township_id,
      opening_hours, is_24_7, services, description_mm, description_en, source_url, source_checked, confidence)
    VALUES ('ရန်ကုန်ဗဟိုအမျိုးသမီးဆေးရုံကြီး', 'Central Women''s Hospital, Yangon', 'PUBLIC_HOSPITAL', 'GOVERNMENT',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1), ygn, NULL,
      'Obstetric emergency: 24/7', true, ARRAY['Obstetrics','Gynaecology','Neonatal Care','Family Planning'],
      'မိခင်နှင့် ကိုယ်ဝန်ဆောင် အမျိုးသမီးများအတွက် အထူးပြု ဗဟိုဆေးရုံကြီးဖြစ်ပါသည်။',
      'A specialist women''s and maternity hospital for the Yangon region.', NULL, now(), 'medium');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en) = lower('Thingangyun Sanpya General Hospital')) THEN
    INSERT INTO public.facilities (name_mm, name_en, facility_type, organization, region_id, city_id, township_id,
      opening_hours, is_24_7, services, description_mm, description_en, source_url, source_checked, confidence)
    VALUES ('သင်္ဃန်ကျွန်းစံပြဆေးရုံကြီး', 'Thingangyun Sanpya General Hospital', 'PUBLIC_HOSPITAL', 'GOVERNMENT',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1), ygn, tgy,
      'Emergency: 24/7', true, ARRAY['Emergency','Orthopaedics','Surgery','Internal Medicine'],
      'သင်္ဃန်ကျွန်းမြို့နယ်ရှိ အစိုးရဆေးရုံကြီးဖြစ်ပြီး အရိုးအထူးကု ဝန်ဆောင်မှုလည်း ရှိပါသည်။',
      'A government general hospital in Thingangyun known for orthopaedic services.', NULL, now(), 'medium');
  END IF;

  IF mdl IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en) = lower('Mandalay General Hospital')) THEN
    INSERT INTO public.facilities (name_mm, name_en, facility_type, organization, region_id, city_id, township_id,
      opening_hours, is_24_7, services, description_mm, description_en, source_url, source_checked, confidence)
    VALUES ('မန္တလေးဆေးရုံကြီး', 'Mandalay General Hospital', 'PUBLIC_HOSPITAL', 'GOVERNMENT',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Mandalay%' LIMIT 1), mdl, chanyethazan,
      'Emergency: 24/7', true, ARRAY['Emergency','Surgery','Internal Medicine','ICU'],
      'မန္တလေးတိုင်းရှိ အဓိက သွန်သင်ဆေးရုံကြီးဖြစ်ပြီး အထက်မြန်မာပြည်၏ ဗဟို ကုသရေးဌာန ဖြစ်ပါသည်။',
      'Upper Myanmar''s principal teaching hospital.', 'https://en.wikipedia.org/wiki/Mandalay_General_Hospital', now(), 'high');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en) = lower('Asia Royal Hospital')) THEN
    INSERT INTO public.facilities (name_mm, name_en, facility_type, organization, region_id, city_id, township_id,
      opening_hours, is_24_7, services, description_mm, description_en, source_url, source_checked, confidence)
    VALUES ('အာရှရိုယယ်ဆေးရုံ', 'Asia Royal Hospital', 'PRIVATE_HOSPITAL', 'PRIVATE',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1), ygn, bahan,
      NULL, true, ARRAY['Emergency','Cardiology','Surgery','Radiology','Laboratory'],
      'ရန်ကုန်မြို့ရှိ ထင်ရှားသော ပုဂ္ဂလိကဆေးရုံတစ်ခုဖြစ်ပါသည်။',
      'A well-known private tertiary hospital in Yangon.', 'https://asiaroyal.com', now(), 'medium');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en) = lower('Bahosi Medical Centre')) THEN
    INSERT INTO public.facilities (name_mm, name_en, facility_type, organization, region_id, city_id, township_id,
      opening_hours, is_24_7, services, description_mm, description_en, source_url, source_checked, confidence)
    VALUES ('ဘာဟိုစီဆေးရုံ', 'Bahosi Medical Centre', 'PRIVATE_HOSPITAL', 'PRIVATE',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1), ygn, lanmadaw,
      NULL, true, ARRAY['Emergency','Internal Medicine','Surgery','Dialysis'],
      'လမ်းမတော်မြို့နယ်ရှိ ပုဂ္ဂလိကဆေးရုံဖြစ်ပါသည်။',
      'A private hospital located in Lanmadaw Township.', NULL, now(), 'medium');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en) = lower('Grand Hantha International Hospital')) THEN
    INSERT INTO public.facilities (name_mm, name_en, facility_type, organization, region_id, city_id, township_id,
      opening_hours, is_24_7, services, description_mm, description_en, source_url, source_checked, confidence)
    VALUES ('ဂရန်ဒ်ဟန်သာ နိုင်ငံတကာဆေးရုံ', 'Grand Hantha International Hospital', 'PRIVATE_HOSPITAL', 'PRIVATE',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1), ygn, NULL,
      NULL, true, ARRAY['Emergency','Cardiology','Oncology','Surgery','Health Screening'],
      'နိုင်ငံတကာ အဆင့်မီ ဝန်ဆောင်မှုများဖြင့် ဖွင့်လှစ်ထားသော ပုဂ္ဂလိကဆေးရုံကြီးဖြစ်ပါသည်။',
      'A large private international-standard hospital in Yangon.', 'https://granthontha.com.mm', now(), 'medium');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en) = lower('Myanmar Red Cross Society — Headquarters')) THEN
    INSERT INTO public.facilities (name_mm, name_en, facility_type, organization, region_id, city_id, township_id,
      services, description_mm, description_en, source_url, source_checked, confidence)
    VALUES ('မြန်မာနိုင်ငံ ကြက်ခြေနီအသင်း (ဗဟိုရုံးချုပ်)', 'Myanmar Red Cross Society — Headquarters', 'RED_CROSS_TEAM', 'MYANMAR_RED_CROSS',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1), ygn, NULL,
      ARRAY['Disaster Response','First Aid Training','Blood Donor Coordination','Community Health'],
      'မြန်မာနိုင်ငံ ကြက်ခြေနီအသင်း၏ ဗဟိုရုံးချုပ်ဖြစ်ပြီး သဘာဝဘေးအန္တရာယ် ကယ်ဆယ်ရေးနှင့် ကျန်းမာရေးပညာပေး လုပ်ငန်းများကို ဦးဆောင်ပါသည်။',
      'National headquarters of MRCS, coordinating disaster response and community health programmes.',
      'https://mrcs.org.mm', now(), 'high');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en) = lower('Myanmar Red Cross Society — Yangon Branch')) THEN
    INSERT INTO public.facilities (name_mm, name_en, facility_type, organization, region_id, city_id, township_id,
      services, description_mm, description_en, source_url, source_checked, confidence)
    VALUES ('မြန်မာနိုင်ငံ ကြက်ခြေနီအသင်း (ရန်ကုန်)', 'Myanmar Red Cross Society — Yangon Branch', 'RED_CROSS_TEAM', 'MYANMAR_RED_CROSS',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1), ygn, NULL,
      ARRAY['Disaster Response','First Aid','Volunteering'],
      'ရန်ကုန်တိုင်းဒေသကြီးရှိ ကြက်ခြေနီအသင်းခွဲဖြစ်ပြီး ဒေသတွင်း ကယ်ဆယ်ရေးနှင့် စေတနာ့ဝန်ထမ်း လုပ်ငန်းများ ဆောင်ရွက်ပါသည်။',
      'The Yangon-region branch of MRCS supporting local response and volunteering.',
      'https://mrcs.org.mm', now(), 'medium');
  END IF;
END $$;
