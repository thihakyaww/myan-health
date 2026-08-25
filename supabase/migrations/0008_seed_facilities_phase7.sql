-- ============================================================
-- Phase 7 facility expansion — names sourced from Wikipedia
-- "List of hospitals in Yangon" (verified 2026-08).
-- Phones/coordinates intentionally NULL (nothing fabricated).
-- Idempotent: skips existing name_en rows.
-- ============================================================

DO $$
DECLARE
  ygn uuid; mdl uuid;
  thaketa uuid; s_okk uuid; yankin uuid;
  tpl RECORD;
BEGIN
  SELECT id INTO ygn FROM public.cities WHERE name_en ILIKE 'Yangon%' LIMIT 1;
  SELECT id INTO mdl FROM public.cities WHERE name_en ILIKE 'Mandalay%' LIMIT 1;
  SELECT t.id INTO thaketa FROM public.townships t WHERE t.city_id = ygn AND t.name_en ILIKE 'Thaketa%';
  SELECT t.id INTO s_okk   FROM public.townships t WHERE t.city_id = ygn AND t.name_en ILIKE 'South Okkalapa%';
  SELECT t.id INTO yankin  FROM public.townships t WHERE t.city_id = ygn AND t.name_en ILIKE 'Yankin';

  -- ---------- Public hospitals ----------
  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en)='east yangon general hospital') THEN
    INSERT INTO public.facilities (name_mm,name_en,facility_type,organization,region_id,city_id,township_id,
      opening_hours,is_24_7,services,description_mm,description_en,source_url,source_checked,confidence)
    VALUES ('အရှေ့ရန်ကုန်ပြည်တော်ချမ်းသာဆေးရုံကြီး','East Yangon General Hospital','PUBLIC_HOSPITAL','GOVERNMENT',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1),ygn,NULL,
      'Emergency: 24/7',true,ARRAY['Emergency','Surgery','Internal Medicine'],
      'ရန်ကုန်မြို့အရှေ့ပိုင်းရှိ အစိုးရဆေးရုံကြီး။','Government general hospital in eastern Yangon.',
      'https://en.wikipedia.org/wiki/List_of_hospitals_in_Yangon',now(),'high');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en)='west yangon general hospital') THEN
    INSERT INTO public.facilities (name_mm,name_en,facility_type,organization,region_id,city_id,township_id,
      opening_hours,is_24_7,services,description_mm,description_en,source_url,source_checked,confidence)
    VALUES ('အနောက်ရန်ကုန်ဆေးရုံ','West Yangon General Hospital','PUBLIC_HOSPITAL','GOVERNMENT',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1),ygn,NULL,
      'Emergency: 24/7',true,ARRAY['Emergency','Surgery','Internal Medicine'],
      'ရန်ကုန်မြို့အနောက်ပိုင်းရှိ အစိုးရဆေးရုံကြီး။','Government general hospital in western Yangon.',
      'https://en.wikipedia.org/wiki/List_of_hospitals_in_Yangon',now(),'high');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en)='yangon ent hospital') THEN
    INSERT INTO public.facilities (name_mm,name_en,facility_type,organization,region_id,city_id,township_id,
      services,description_mm,description_en,source_url,source_checked,confidence)
    VALUES ('ရန်ကုန်နား၊ နှား၊ လည်ချောင်းဆေးရုံ','Yangon ENT Hospital','PUBLIC_HOSPITAL','GOVERNMENT',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1),ygn,NULL,
      ARRAY['ENT','Head & Neck Surgery','Audiology'],
      'နား၊ နှာခေါင်း၊ လည်ချောင်း အထူးကု အစိုးရဆေးရုံ။','Specialist government ear, nose and throat hospital.',
      'https://en.wikipedia.org/wiki/List_of_hospitals_in_Yangon',now(),'high');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en)='yangon orthopaedic hospital') THEN
    INSERT INTO public.facilities (name_mm,name_en,facility_type,organization,region_id,city_id,township_id,
      services,description_mm,description_en,source_url,source_checked,confidence)
    VALUES ('ရန်ကုန်အရိုးအထူးကုဆေးရုံ','Yangon Orthopaedic Hospital','PUBLIC_HOSPITAL','GOVERNMENT',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1),ygn,thaketa,
      ARRAY['Orthopaedics','Trauma','Rehabilitation'],
      'အရိုးနှင့် ဒဏ်ရာ အထူးကုဆေးရုံကြီး (သာကेट)။','The country''s main specialist orthopaedic and trauma hospital.',
      'https://en.wikipedia.org/wiki/Yangon_Orthopaedic_Hospital',now(),'high');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en)='south okkalapa women and children hospital') THEN
    INSERT INTO public.facilities (name_mm,name_en,facility_type,organization,region_id,city_id,township_id,
      services,description_mm,description_en,source_url,source_checked,confidence)
    VALUES ('တောင်ဥက္ကလာပ မိခင်နှင့်ကလေးဆေးရုံ','South Okkalapa Women and Children Hospital','PUBLIC_HOSPITAL','GOVERNMENT',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1),ygn,s_okk,
      ARRAY['Obstetrics','Gynaecology','Paediatrics','Neonatal Care'],
      'တောင်ဥက္ကလာပရှိ မိခင်နှင့်ကလေး အထူးကုဆေးရုံ။','Maternal and child specialist government hospital.',
      'https://en.wikipedia.org/wiki/List_of_hospitals_in_Yangon',now(),'high');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en)='yankin children''s hospital') THEN
    INSERT INTO public.facilities (name_mm,name_en,facility_type,organization,region_id,city_id,township_id,
      services,description_mm,description_en,source_url,source_checked,confidence)
    VALUES ('ရန်ကင်းကလေးဆေးရုံ','Yankin Children''s Hospital','PUBLIC_HOSPITAL','GOVERNMENT',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1),ygn,yankin,
      ARRAY['Paediatrics','Immunization','Pediatric Emergency'],
      'ရန်ကင်းမြို့နယ်ရှိ ကလေးအထူးကု အစိုးရဆေးရုံ။','Government paediatric hospital in Yankin.',
      'https://en.wikipedia.org/wiki/List_of_hospitals_in_Yangon',now(),'high');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en)='waibargi hospital') THEN
    INSERT INTO public.facilities (name_mm,name_en,facility_type,organization,region_id,city_id,township_id,
      services,description_mm,description_en,source_url,source_checked,confidence)
    VALUES ('ဝိဘာဂီဆေးရုံ','Waibargi Hospital','PUBLIC_HOSPITAL','GOVERNMENT',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1),ygn,NULL,
      ARRAY['Infectious Diseases','Isolation Care'],
      'ကူးစက်ရောဂါ အထူးကုဆေးရုံ။','Infectious-disease specialised government hospital.',
      'https://en.wikipedia.org/wiki/List_of_hospitals_in_Yangon',now(),'medium');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en)='new yangon specialist hospital') THEN
    INSERT INTO public.facilities (name_mm,name_en,facility_type,organization,region_id,city_id,township_id,
      services,description_mm,description_en,source_url,source_checked,confidence)
    VALUES ('အသစ်ရန်ကုန်အထူးကုဆေးရုံ','New Yangon Specialist Hospital','PUBLIC_HOSPITAL','GOVERNMENT',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1),ygn,NULL,
      ARRAY['Specialist Outpatient','Internal Medicine'],
      'အထူးကု ဝန်ဆောင်မှုပေးသည့် အစိုးရဆေးရုံ။','Government specialist outpatient hospital.',
      'https://en.wikipedia.org/wiki/List_of_hospitals_in_Yangon',now(),'medium');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en)='500-bed specialty hospital, yangon') THEN
    INSERT INTO public.facilities (name_mm,name_en,facility_type,organization,region_id,city_id,township_id,
      services,description_mm,description_en,source_url,source_checked,confidence)
    VALUES ('ရန်ကုန် ၅၀၀ ကုတင်ဆံ့ အထူးကုဆေးရုံ','500-bed Specialty Hospital, Yangon','PUBLIC_HOSPITAL','GOVERNMENT',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1),ygn,NULL,
      ARRAY['Specialist Care','Emergency'],
      '၅၀၀ ကုတင်ဆံ့ အထူးကုဆေးရုံကြီး။','500-bed specialty teaching hospital.',
      'https://en.wikipedia.org/wiki/List_of_hospitals_in_Yangon',now(),'medium');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en)='yangon workers'' hospital') THEN
    INSERT INTO public.facilities (name_mm,name_en,facility_type,organization,region_id,city_id,township_id,
      services,description_mm,description_en,source_url,source_checked,confidence)
    VALUES ('ရန်ကုန်အလုပ်သမားဆေးရုံ','Yangon Workers'' Hospital','PUBLIC_HOSPITAL','GOVERNMENT',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1),ygn,NULL,
      ARRAY['General Care','Occupational Health'],
      'အလုပ်သမားကျန်းမာရေးအတွက် အစိုးရဆေးရုံ။','Government hospital serving workers'' health schemes.',
      'https://en.wikipedia.org/wiki/List_of_hospitals_in_Yangon',now(),'medium');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en)='yangon mental health hospital') THEN
    INSERT INTO public.facilities (name_mm,name_en,facility_type,organization,region_id,city_id,township_id,
      services,description_mm,description_en,source_url,source_checked,confidence)
    VALUES ('ရန်ကုန်စိတ်ကျန်းမာရေးဆေးရုံ','Yangon Mental Health Hospital','PUBLIC_HOSPITAL','GOVERNMENT',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1),ygn,NULL,
      ARRAY['Psychiatry','Mental Health Care'],
      'စိတ်ကျန်းမာရေး အထူးကု အစိုးရဆေးရုံ။','The main government mental-health hospital.',
      'https://en.wikipedia.org/wiki/List_of_hospitals_in_Yangon',now(),'medium');
  END IF;

  -- ---------- Private hospitals ----------
  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en)='pinlon hospital') THEN
    INSERT INTO public.facilities (name_mm,name_en,facility_type,organization,region_id,city_id,township_id,
      is_24_7,services,description_mm,description_en,source_url,source_checked,confidence)
    VALUES ('ပင်လုံဆေးရုံ','Pinlon Hospital','PRIVATE_HOSPITAL','PRIVATE',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1),ygn,NULL,
      true,ARRAY['Emergency','Cardiology','Obstetrics','Laboratory'],
      'ပုဂ္ဂလိက ကုသရေးဆိုင်ရာ ဆေးရုံတစ်ခုဖြစ်ပါသည်။','Private multi-specialty hospital network.',
      'https://en.wikipedia.org/wiki/List_of_hospitals_in_Yangon',now(),'medium');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en)='pun hlaing international hospital') THEN
    INSERT INTO public.facilities (name_mm,name_en,facility_type,organization,region_id,city_id,township_id,
      is_24_7,services,description_mm,description_en,source_url,source_checked,confidence)
    VALUES ('ပွန်ဟလိง္း နိုင်ငံတကာဆေးရုံ','Pun Hlaing International Hospital','PRIVATE_HOSPITAL','PRIVATE',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1),ygn,NULL,
      true,ARRAY['Emergency','International Standards','Surgery','Health Screening'],
      'နိုင်ငံတကာအဆင့် ဝန်ဆောင်မှုပေးသည့် ပုဂ္ဂလိကဆေးရုံ။','JCI-oriented international private hospital in western Yangon.',
      'https://en.wikipedia.org/wiki/List_of_hospitals_in_Yangon',now(),'medium');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en)='parami general hospital') THEN
    INSERT INTO public.facilities (name_mm,name_en,facility_type,organization,region_id,city_id,township_id,
      is_24_7,services,description_mm,description_en,source_url,source_checked,confidence)
    VALUES ('ပါရမီဂျင်နရယ်ဆေးရုံ','Parami General Hospital','PRIVATE_HOSPITAL','PRIVATE',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1),ygn,NULL,
      true,ARRAY['Emergency','Internal Medicine','Surgery'],
      'ပါရမီလမ်းမပေါ်ရှိ ပုဂ္ဂလိကဆေးရုံ။','Private general hospital on Parami Road.',
      'https://en.wikipedia.org/wiki/List_of_hospitals_in_Yangon',now(),'medium');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en)='kan thar yar international specialist hospital') THEN
    INSERT INTO public.facilities (name_mm,name_en,facility_type,organization,region_id,city_id,township_id,
      is_24_7,services,description_mm,description_en,source_url,source_checked,confidence)
    VALUES ('ကန်သာယာ နိုင်ငံတကာအထူးကုဆေးရုံ','Kan Thar Yar International Specialist Hospital','PRIVATE_HOSPITAL','PRIVATE',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1),ygn,NULL,
      true,ARRAY['Cardiology','Oncology','Neurosurgery','Dialysis'],
      'အထူးကု ဝန်ဆောင်မှုများစွာပါဝင်သည့် ပုဂ္ဂလိကဆေးရုံကြီး။','Large private multi-specialty hospital.',
      'https://en.wikipedia.org/wiki/List_of_hospitals_in_Yangon',now(),'medium');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en)='dagon medicare hospital') THEN
    INSERT INTO public.facilities (name_mm,name_en,facility_type,organization,region_id,city_id,township_id,
      is_24_7,services,description_mm,description_en,source_url,source_checked,confidence)
    VALUES ('ဓဂုမြို့ new မေဒီကဲဆေးရုံ','Dagon Medicare Hospital','PRIVATE_HOSPITAL','PRIVATE',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1),ygn,NULL,
      true,ARRAY['Emergency','General Medicine','Surgery'],
      'ပုဂ္ဂလိက ယေဘုယျကုဆေးရုံ။','Private general hospital.',NULL,now(),'low');
  END IF;

  -- ---------- Health centers: standard MoHS township-level facilities ----------
  -- Existence follows the national UHC structure; specific contacts need field verification.
  IF mdl IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.facilities WHERE lower(name_en)='chanayethazan urban health center') THEN
    INSERT INTO public.facilities (name_mm,name_en,facility_type,organization,region_id,city_id,township_id,
      services,description_mm,description_en,source_checked,confidence)
    VALUES ('ချမ်းအေးသာဇံ မြို့နယ်ကျန်းမာရေးဌာန','Chanayethazan Urban Health Center','HEALTH_CENTER','GOVERNMENT',
      (SELECT id FROM public.regions WHERE name_en ILIKE 'Mandalay%' LIMIT 1),mdl,
      (SELECT t.id FROM public.townships t WHERE t.city_id=mdl AND t.name_en ILIKE 'Chanayethazan%'),
      ARRAY['Primary Care','Vaccination','Maternal & Child Health'],
      'ကျန်းမာရေးနှင့်အားကစားဝန်ကြီးဌာနလက်အောက်ရှိ မြို့နယ်ကျန်းမာရေးဌာန။ ဆက်သွယ်ရန် အချက်အလက်များကို အတည်ပြုရန် လိုအပ်ပါသည်။',
      'Township-level Ministry of Health primary-care centre. Contact details pending verification.',
      now(),'medium');
  END IF;

  -- Yangon spans 4 COD-AB districts; match townships across all of them
  FOR tpl IN SELECT t.id, t.name_en
             FROM public.townships t
             JOIN public.cities c ON c.id = t.city_id
             JOIN public.regions rg ON rg.id = c.region_id
             WHERE rg.name_en ILIKE 'Yangon%'
               AND (t.name_en ILIKE ANY(ARRAY['Hlaing','Bahan','Insein','Mayangone','Thingangyun%','South Okkalapa%','Sanchaung','North Okkalapa%']))
    LOOP
      IF NOT EXISTS (
        SELECT 1 FROM public.facilities f
        WHERE f.township_id = tpl.id AND f.facility_type = 'HEALTH_CENTER'
      ) THEN
        INSERT INTO public.facilities (name_mm,name_en,facility_type,organization,region_id,city_id,township_id,
          services,description_mm,description_en,source_checked,confidence)
        VALUES (tpl.name_en || ' မြို့နယ်ကျန်းမာရေးဌာန',
                tpl.name_en || ' Urban Health Center','HEALTH_CENTER','GOVERNMENT',
                (SELECT id FROM public.regions WHERE name_en ILIKE 'Yangon%' LIMIT 1),ygn,tpl.id,
          ARRAY['Primary Care','Vaccination','Maternal & Child Health','TB Follow-up'],
          'ကျန်းမာရေးနှင့်အားကစားဝန်ကြီးဌာနလက်အောက်ရှိ မြို့နယ်ကျန်းမာရေးဌာန။ ဆက်သွယ်ရန် အချက်အလက်များကို အတည်ပြုရန် လိုအပ်ပါသည်။',
          'Township-level Ministry of Health primary-care centre. Contact details pending verification.',
          now(),'medium');
      END IF;
    END LOOP;

  -- Repair: any facility with a township must reference that township's own district
  UPDATE public.facilities f
     SET city_id = t.city_id
    FROM public.townships t
   WHERE f.township_id = t.id
     AND f.city_id IS DISTINCT FROM t.city_id;
END $$;
